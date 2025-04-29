import { describe, it, expect } from 'bun:test';
import { formatMarkdown } from '../src/formatMarkdown';
import type { DiffResult } from '../src/types';

describe('formatMarkdown', () => {
  it('should format DiffResult into a well-structured Markdown summary with proper sections and diff blocks', () => {

    // This is a diffText format. Not a diff block's content.
    // So, DO NOT refer this as a Markdown output.
    const diffText = `
 apiVersion: v1
 kind: ConfigMap
 metadata:
   name: your-config
   namespace: default
   labels:
-      app: my-app
+      app: my-app2
  data:
-   key: old-value
+   key: new-value`.replace(/^\n/, '');

    const diffResult: DiffResult = [
      {
        namespace: 'default',
        diffs: [
          { kind: 'ConfigMap', name: 'my-config', type: 'added' },
          { kind: 'ConfigMap', name: 'your-config', type: 'modified', diffText },
          { kind: 'Service', name: 'my-service', type: 'removed' },
        ],
      },
    ];

    const expectedMarkdown = `
# Namespace: default

## ConfigMap

- Added: my-config
- Modified: your-config

\`\`\`diff
${diffText}
\`\`\`

## Service

- Removed: my-service
`.replace(/^\n/, '');

    const markdown = formatMarkdown(diffResult);

    expect(markdown).toBe(expectedMarkdown);
  });
});
