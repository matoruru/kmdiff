import { describe, it, expect } from 'bun:test';
import { formatMarkdown } from '../src/formatMarkdown';
import type { DiffResult } from '../src/types';

describe('formatMarkdown', () => {
  it('formats DiffResult into Markdown summary', () => {
    const diffResult: DiffResult = [
      {
        namespace: 'default',
        diffs: [
          { namespace: 'default', kind: 'ConfigMap', name: 'my-config', type: 'added' },
          { namespace: 'default', kind: 'ConfigMap', name: 'your-config', type: 'modified' },
          { namespace: 'default', kind: 'Service', name: 'my-service', type: 'removed' },
        ],
      },
    ];

    const expectedMarkdown = `
# Namespace: default

## ConfigMap

- Added: my-config
- Modified: your-config

## Service

- Removed: my-service
`.replace(/^\n/, '');

    const markdown = formatMarkdown(diffResult);

    expect(markdown).toBe(expectedMarkdown);
  });
});
