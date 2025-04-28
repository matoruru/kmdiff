export interface K8sResource {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export type DiffType = 'added' | 'removed' | 'modified';

export interface ResourceDiff {
  kind: string;
  name: string;
  type: DiffType;
  diffText?: string; // Exists only when the type is 'modified'
}

export interface NamespaceDiff {
  namespace: string;
  diffs: ResourceDiff[];
}

export type DiffResult = NamespaceDiff[];

