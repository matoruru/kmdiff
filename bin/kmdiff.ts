#!/usr/bin/env bun

import sade from 'sade';
import pkg from '../package.json' assert { type: 'json' };
import { diffResources } from '../src/diff';
import { formatMarkdown } from '../src/formatMarkdown';
import { K8sResourceSchema } from '../src/types';
import * as fs from 'fs/promises';
import * as YAML from 'yaml';
import { printBanner } from '../src/banner';

/**
 * Parse YAML content into K8sResource array
 */
const parseYaml = (content: string) => {
  const docs = content.split(/^---\s*$/gm)
    .map(doc => doc.trim())
    .filter(doc => doc.length > 0)
    .map(doc => YAML.parse(doc));
  
  return K8sResourceSchema.array().parse(docs);
};

const prog = sade('kmdiff [oldFile] [newFile]')
  .version(pkg.version)
  .describe('Compare two Kubernetes manifest YAML files.')
  .option('--json', 'Output diff result in JSON format')
  .example('kmdiff old.yaml new.yaml')
  .example('kmdiff old.yaml new.yaml --json')
  .action(async (oldFile, newFile, opts) => {
    if (!oldFile || !newFile) {
      prog.help();
      process.exit(1);
    }

    printBanner();

    try {
      const oldContent = await fs.readFile(oldFile, 'utf8');
      const newContent = await fs.readFile(newFile, 'utf8');

      const oldResources = parseYaml(oldContent);
      const newResources = parseYaml(newContent);

      const diffResult = diffResources(oldResources, newResources);

      if (opts.json) {
        console.log(JSON.stringify(diffResult, null, 2));
      } else {
        console.log(formatMarkdown(diffResult));
      }
    } catch (err) {
      console.error(`Failed to read or parse files: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

prog.parse(process.argv);
