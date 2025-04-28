import type{ DiffResult } from './types';

/**
 * Format DiffResult into a human-readable Markdown string.
 */
export const formatMarkdown = (diffResult: DiffResult): string => {
  return diffResult
    .map(({ namespace, diffs }) => {
      const kinds = diffs.reduce<Record<string, { type: string; name: string }[]>>((acc, diff) => ({
        ...acc,
        [diff.kind]: [...(acc[diff.kind] || []), { type: diff.type, name: diff.name }],
      }), {});

      const kindSections = Object.entries(kinds)
        .map(([kind, resources]) => {
          const items = resources
            .map((res) => `- ${capitalize(res.type)}: ${res.name}`)
            .join('\n');
          return `## ${kind}\n\n${items}`;
        })
        .join('\n\n');

      return `# Namespace: ${namespace}\n\n${kindSections}`;
    })
    .join('\n\n') + '\n';
};

const capitalize = (word: string): string =>
  word.charAt(0).toUpperCase() + word.slice(1);
