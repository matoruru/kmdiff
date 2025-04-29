// test/diff.test.ts

import { describe, it, expect } from 'bun:test';
import { diffResources } from '../src/diff';
import type { K8sResource } from '../src/types';

describe('diffResources', () => {
  describe('Basic Diff Detection', () => {
    it('should detect added resources', () => {
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

    it('should detect removed resources', () => {
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

    it('should detect modified resources', () => {
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
              diffText: expect.any(String),
            },
          ],
        },
      ]);

      if (result[0]?.diffs[0]?.type !== 'modified') {
        throw new Error('modified resource was expected here.');
      }

      const diffText = result[0]?.diffs[0]?.diffText;
      expect(diffText).toBeDefined();
      expect(diffText).not.toEqual('');
      expect(diffText).toContain('key');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort diffs by namespace, kind, and name', () => {
      const oldResources: K8sResource[] = [];
      const newResources: K8sResource[] = [
        {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'b-service', namespace: 'bbb' },
        },
        {
          apiVersion: 'v1',
          kind: 'Service',
          metadata: { name: 'a-service', namespace: 'aaa' },
        },
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'z-config', namespace: 'aaa' },
        },
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: { name: 'a-config', namespace: 'aaa' },
        },
      ];
    
      // Expect the diffs to be sorted:
      // - first by namespace (aaa, then bbb)
      // - then by kind (ConfigMap before Service)
      // - then by name (a-config before z-config)
      const result = diffResources(oldResources, newResources);
    
      expect(result).toEqual([
        {
          namespace: 'aaa',
          diffs: [
            { kind: 'ConfigMap', name: 'a-config', type: 'added' },
            { kind: 'ConfigMap', name: 'z-config', type: 'added' },
            { kind: 'Service', name: 'a-service', type: 'added' },
          ],
        },
        {
          namespace: 'bbb',
          diffs: [
            { kind: 'Service', name: 'b-service', type: 'added' },
          ],
        },
      ]);
    });
  });

  describe('Order Insensitive Comparison', () => {
    it('should not detect diff when only property order differs', () => {
      const oldResources: K8sResource[] = [
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            name: 'my-config',
            namespace: 'ns1',
          },
          data: {
            key1: 'value1',
            key2: 'value2',
          },
        },
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            name: 'my-config',
            namespace: 'default',
          },
          data: {
            key1: 'value1',
            key2: 'value2',
          },
        },
      ];

      const newResources: K8sResource[] = [
        {
          metadata: {
            namespace: 'default',
            name: 'my-config',
          },
          apiVersion: 'v1',
          data: {
            key2: 'value2',
            key1: 'value1',
          },
          kind: 'ConfigMap',
        },
        {
          metadata: {
            name: 'my-config',
            namespace: 'ns1',
          },
          kind: 'ConfigMap',
          apiVersion: 'v1',
          data: {
            key1: 'value1',
            key2: 'value2',
          },
        },
      ];

      // should compare after sorting by namespace, kind, and name
      const result = diffResources(oldResources, newResources);

      expect(result).toEqual([]);
    });

    it('should detect diff when array order differs', () => {
      const oldResources: K8sResource[] = [
        {
          apiVersion: 'v1',
          kind: 'ConfigMap',
          metadata: {
            name: 'my-config',
            namespace: 'default',
          },
          data: {
            key1: 'value1',
            key2: 'value2',
            myarray: ['a', 'b', 'c'],
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
            key1: 'value1',
            key2: 'value2',
            myarray: ['b', 'c', 'a'],
          },
        },
      ];

      const result = diffResources(oldResources, newResources);

      if (result[0]?.diffs[0]?.type !== 'modified') {
        throw new Error('modified resource was expected here.');
      }

      const diffText = result[0]?.diffs[0]?.diffText;
      expect(diffText).toContain('\n   myarray:\n-    - a\n     - b\n     - c\n+    - a');
    });
  });
});
