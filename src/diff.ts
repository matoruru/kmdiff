import type { K8sResource, DiffResult, ResourceDiff } from './types';
import { diffLines } from 'diff';
import * as YAML from 'yaml';

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
 * Generate a list of resource diffs (added, removed, modified) from old and new resource maps.
 */
export const generateResourceDiff = (oldMap: Map<string, K8sResource>, newMap: Map<string, K8sResource>): ResourceDiff[] => {
  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);

  return Array.from(allKeys).flatMap<ResourceDiff>((key) => {
    const oldRes = oldMap.get(key);
    const newRes = newMap.get(key);

    if (oldRes && !newRes) {
      return [{
        namespace: getNamespace(oldRes),
        kind: oldRes.kind,
        name: oldRes.metadata.name,
        type: 'removed' as const,
      }];
    }

    if (!oldRes && newRes) {
      return [{
        namespace: getNamespace(newRes),
        kind: newRes.kind,
        name: newRes.metadata.name,
        type: 'added' as const,
      }];
    }

    if (oldRes && newRes) {
      const oldYaml = YAML.stringify(oldRes);
      const newYaml = YAML.stringify(newRes);

      if (oldYaml !== newYaml) {
        const diff = diffLines(oldYaml, newYaml)
          .map((part) => {
            const prefix = part.added ? '+' : part.removed ? '-' : ' ';
            return part.value.split('\n').map(line => line && `${prefix} ${line}`).join('\n');
          })
          .join('\n');

        return [{
          namespace: getNamespace(newRes),
          kind: newRes.kind,
          name: newRes.metadata.name,
          type: 'modified' as const,
          diffText: diff,
        }];
      }
    }

    return [];
  });
};

const getResourceKey = (resource: K8sResource): string => {
  return `${getNamespace(resource)}/${resource.kind}/${resource.metadata.name}`;
};

/**
 * Group resource diffs by their namespace.
 */
export const groupByNamespace = (diffs: ResourceDiff[]): DiffResult => {
  const namespaceMap = diffs.reduce<Record<string, ResourceDiff[]>>((acc, diff) => {
    return {
      ...acc,
      [diff.namespace]: [...(acc[diff.namespace] || []), diff],
    };
  }, {});

  return Object.entries(namespaceMap).map(([namespace, diffs]) => ({
    namespace,
    diffs,
  }));
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
      diffs: diffs
        .slice()
        .sort((a, b) => {
          if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
          return a.name.localeCompare(b.name);
        }),
    }));
};

/**
 * Main function to generate sorted diff results from old and new resource arrays.
 */
export const diffResources = (oldResources: K8sResource[], newResources: K8sResource[]): DiffResult => {
  const oldMap = createResourceMap(oldResources);
  const newMap = createResourceMap(newResources);

  const allDiffs = generateResourceDiff(oldMap, newMap);

  const grouped = groupByNamespace(allDiffs);

  return sortDiffResult(grouped);
};
