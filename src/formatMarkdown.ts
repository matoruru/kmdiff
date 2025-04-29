import type { DiffResult } from './types';

const formatResourceItem = (res: { type: string; name: string; diffText?: string }): string => {
  const header = `- ${capitalize(res.type)}: ${res.name}`;
  if (res.type === 'modified' && res.diffText) {
    return `${header}\n\n  \`\`\`diff\n${res.diffText
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n  \`\`\``;
  }
  return header;
};

/**
 * Format DiffResult into a human-readable Markdown string.
 */
export const formatMarkdown = (diffResult: DiffResult): string => {
  return (
    diffResult
      .map(({ namespace, diffs }) => {
        const kinds = diffs.reduce<Record<string, typeof diffs>>(
          (acc, diff) => ({
            ...acc,
            [diff.kind]: [...(acc[diff.kind] || []), diff],
          }),
          {}
        );

        const kindSections = Object.entries(kinds)
          .map(([kind, resources]) => {
            const items = resources.map(formatResourceItem).join('\n');
            return `## ${kind}\n\n${items}`;
          })
          .join('\n\n');

        return `# Namespace: ${namespace}\n\n${kindSections}`;
      })
      .join('\n\n') + '\n'
  );
};

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);
