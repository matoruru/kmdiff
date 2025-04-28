
import { printBanner } from './banner';
import { diffResources } from './diff';
import { formatMarkdown } from './formatMarkdown';
import { K8sResourceSchema, type K8sResource } from './types';
import * as fs from 'fs/promises';
import * as YAML from 'yaml';

const main = async (): Promise<void> => {
  printBanner();

  const [, , oldPath, newPath] = process.argv;

  if (!oldPath || !newPath) {
    console.error('Usage: kmdiff <old.yaml> <new.yaml>');
    process.exit(1);
  }

  const [oldContent, newContent] = await Promise.all([
    fs.readFile(oldPath, 'utf-8'),
    fs.readFile(newPath, 'utf-8'),
  ]);

  const oldResources = parseYaml(oldContent);
  const newResources = parseYaml(newContent);

  const diffResult = diffResources(oldResources, newResources);

  const output = formatMarkdown(diffResult);

  console.log(output);
};

const parseYaml = (content: string): K8sResource[] => {
  return YAML.parseAllDocuments(content)
    .map((doc) => doc.toJSON())
    .filter((doc): doc is unknown => !!doc) // First ensure it's not null
    .map((doc) => K8sResourceSchema.safeParse(doc))
    .filter((result): result is { success: true; data: K8sResource } => result.success)
    .map((result) => result.data);
};

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
