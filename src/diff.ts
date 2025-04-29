import { diffLines } from 'diff';
import type { Change } from 'diff';
import * as YAML from 'yaml';

import type { K8sResource, DiffResult, ResourceDiff } from './types';
import { sortKeysDeep } from './utils';

/**
 * Safely get namespace from a K8sResource, defaulting to 'default' if missing.
 */
const getNamespace = (resource: K8sResource): string => {
  return resource.metadata.namespace ?? 'default';
};

/**
 * Create a Map from an array of K8sResource, keyed by namespace/kind/name.
 */
export const createResourceMap = (resources: K8sResource[]): Map<string, K8sResource> => {
  return new Map(resources.map((res) => [getResourceKey(res), res]));
};

/**
 * Handle a removed resource
 */
const handleRemovedResource = (
  resource: K8sResource,
  namespaceMap: Map<string, ResourceDiff[]>
): void => {
  const ns = getNamespace(resource);
  namespaceMap.set(ns, [
    ...(namespaceMap.get(ns) ?? []),
    {
      kind: resource.kind,
      name: resource.metadata.name,
      type: 'removed',
    },
  ]);
};

/**
 * Handle an added resource
 */
const handleAddedResource = (
  resource: K8sResource,
  namespaceMap: Map<string, ResourceDiff[]>
): void => {
  const ns = getNamespace(resource);
  namespaceMap.set(ns, [
    ...(namespaceMap.get(ns) ?? []),
    {
      kind: resource.kind,
      name: resource.metadata.name,
      type: 'added',
    },
  ]);
};

/**
 * Handle a modified resource
 */
const handleModifiedResource = (
  oldRes: K8sResource,
  newRes: K8sResource,
  namespaceMap: Map<string, ResourceDiff[]>
): void => {
  const oldYaml = YAML.stringify(sortKeysDeep(oldRes));
  const newYaml = YAML.stringify(sortKeysDeep(newRes));

  if (oldYaml === newYaml) return;

  const ns = getNamespace(newRes);
  const diffText = generateDiffText(oldYaml, newYaml);

  namespaceMap.set(ns, [
    ...(namespaceMap.get(ns) ?? []),
    {
      kind: newRes.kind,
      name: newRes.metadata.name,
      type: 'modified',
      diffText,
    },
  ]);
};

/**
 * Generate unified diff text between two YAML strings
 */
const generateDiffText = (oldYaml: string, newYaml: string): string => {
  return diffLines(oldYaml, newYaml)
    .map((part: Change) => {
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      return part.value
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => `${prefix}${line}`)
        .join('\n');
    })
    .join('\n');
};

/**
 * Main diff generation function
 */
export const generateResourceDiff = (
  oldMap: Map<string, K8sResource>,
  newMap: Map<string, K8sResource>
): DiffResult => {
  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
  const namespaceMap = new Map<string, ResourceDiff[]>();

  for (const key of allKeys) {
    const oldRes = oldMap.get(key);
    const newRes = newMap.get(key);

    if (oldRes && !newRes) {
      handleRemovedResource(oldRes, namespaceMap);
    } else if (!oldRes && newRes) {
      handleAddedResource(newRes, namespaceMap);
    } else if (oldRes && newRes) {
      handleModifiedResource(oldRes, newRes, namespaceMap);
    }
  }

  return Array.from(namespaceMap.entries()).map(([namespace, diffs]) => ({ namespace, diffs }));
};

const getResourceKey = (resource: K8sResource): string => {
  return `${getNamespace(resource)}/${resource.kind}/${resource.metadata.name}`;
};

/**
 * Sort DiffResult by namespace, kind, and resource name.
 */
export const sortDiffResult = (diffResult: DiffResult): DiffResult => {
  return diffResult
    .slice()
    .sort((a, b) => a.namespace.localeCompare(b.namespace))
    .map(({ namespace, diffs }) => ({
      namespace,
      diffs: diffs.slice().sort((a, b) => {
        if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
        return a.name.localeCompare(b.name);
      }),
    }));
};

/**
 * Main function to generate sorted diff results from old and new resource arrays.
 */
export const diffResources = (
  oldResources: K8sResource[],
  newResources: K8sResource[]
): DiffResult => {
  const oldMap = createResourceMap(oldResources);
  const newMap = createResourceMap(newResources);

  const unsorted = generateResourceDiff(oldMap, newMap);
  return sortDiffResult(unsorted);
};
