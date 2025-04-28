import { describe, it, expect } from 'bun:test';
import { formatMarkdown } from '../src/formatMarkdown';
import type { DiffResult } from '../src/types';

describe('formatMarkdown', () => {
  it('formats DiffResult into Markdown summary', () => {
    const diffResult: DiffResult = [
      {
        namespace: 'default',
        diffs: [
          { kind: 'ConfigMap', name: 'my-config', type: 'added' },
          { kind: 'ConfigMap', name: 'your-config', type: 'modified' },
          { kind: 'Service', name: 'my-service', type: 'removed' },
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
