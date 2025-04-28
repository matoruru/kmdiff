
import type { K8sResource, DiffResult, ResourceDiff } from './types';

const getResourceKey = (resource: K8sResource): string => {
  const namespace = resource.metadata.namespace || 'default';
  return `${namespace}/${resource.kind}/${resource.metadata.name}`;
};

export const diffResources = (oldResources: K8sResource[], newResources: K8sResource[]): DiffResult => {
  const oldKeySet = new Set(oldResources.map(getResourceKey));

  const addedDiffs: ResourceDiff[] = newResources
    .filter((res) => !oldKeySet.has(getResourceKey(res)))
    .map((res) => ({
      kind: res.kind,
      name: res.metadata.name,
      type: 'added' as const,
    }));

  const namespaceGroups = addedDiffs.reduce<Record<string, ResourceDiff[]>>((acc, diff) => {
    const namespace = findNamespace(diff.kind, diff.name, newResources) || 'default';
    return { 
      ...acc, 
      [namespace]: [...(acc[namespace] || []), diff]
    };
  }, {});

  return Object.entries(namespaceGroups).map(([namespace, diffs]) => ({ namespace, diffs }));
};

const findNamespace = (kind: string, name: string, resources: K8sResource[]): string | undefined => {
  return resources.find((r) => r.kind === kind && r.metadata.name === name)?.metadata.namespace;
};
