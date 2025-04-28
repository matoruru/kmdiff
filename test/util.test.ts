import { describe, it, expect } from 'bun:test';
import { parseYaml } from '../src/utils';

describe('parseYaml', () => {
  it('does NOT eliminate properties that are not defined in the schema', () => {
    const content = `
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
  namespace: default
  labels:
    app: my-app
  annotations:
    my-annotation: my-value
data:
  key: value
`.replace(/^\n/, '');
    const resources = parseYaml(content);
    expect(resources).toEqual([
      {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: 'my-config',
          namespace: 'default',
          labels: {
            app: 'my-app',
          },
          annotations: {
            "my-annotation": 'my-value',
          },
        },
        data: {
          key: 'value',
        },
      },
    ]);
  });
});
