// test/diff.test.ts

import { describe, it, expect } from 'vitest';
import { diffResources } from '../src/diff';
import type { K8sResource } from '../src/types';

describe('diffResources', () => {
  it('detects added resource', () => {
    const oldResources: K8sResource[] = [];
    const newResources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'my-config',
          namespace: 'default',
        },
        data: {
          key: 'value',
        },
      },
    ];

    const result = diffResources(oldResources, newResources);

    expect(result).toEqual([
      {
        namespace: 'default',
        diffs: [
          {
            kind: 'ConfigMap',
            name: 'my-config',
            type: 'added',
          },
        ],
      },
    ]);
  });

  it('detects removed resource', () => {
    const oldResources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'old-config',
          namespace: 'default',
        },
        data: {
          key: 'old',
        },
      },
    ];

    const newResources: K8sResource[] = [];

    const result = diffResources(oldResources, newResources);

    expect(result).toEqual([
      {
        namespace: 'default',
        diffs: [
          {
            kind: 'ConfigMap',
            name: 'old-config',
            type: 'removed',
          },
        ],
      },
    ]);
  });

  it('detects modified resource', () => {
    const oldResources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'my-config',
          namespace: 'default',
        },
        data: {
          key: 'old-value',
        },
      },
    ];
    const newResources: K8sResource[] = [
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'my-config',
          namespace: 'default',
        },
        data: {
          key: 'new-value',
        },
      },
    ];

    const result = diffResources(oldResources, newResources);

    expect(result).toEqual([
      {
        namespace: 'default',
        diffs: [
          {
            kind: 'ConfigMap',
            name: 'my-config',
            type: 'modified',
            diffText: expect.any(String), // Should contain the actual diff text
          },
        ],
      },
    ]);
  });

});
