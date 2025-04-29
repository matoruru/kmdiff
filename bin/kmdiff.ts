#!/usr/bin/env bun

import sade from 'sade';
import pkg from '../package.json' assert { type: 'json' };
import { diffResources } from '../src/diff';
import { formatMarkdown } from '../src/formatMarkdown';
import * as fs from 'fs/promises';
import { printBanner } from '../src/banner';
import { parseYaml } from '../src/utils';
import { getUnknownOptions } from '../src/hack/sade-internals';

const prog = sade('kmdiff [oldFile] [newFile]')
  .version(pkg.version)
  .describe('Compare two Kubernetes manifest YAML files.')
  .option('--json', 'Output diff result in JSON format')
  .example('kmdiff old.yaml new.yaml')
  .example('kmdiff old.yaml new.yaml --json')
  .action(async (oldFile, newFile, opts) => {
    const unknownOptions = getUnknownOptions(prog, opts);

    if ((!oldFile || !newFile) || unknownOptions.length > 0) {
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

      // Exit with 1 if there are any diffs
      if (diffResult.length > 0) {
        process.exit(1);
      }
    } catch (err) {
      console.error(`Failed to read or parse files: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

prog.parse(process.argv);
