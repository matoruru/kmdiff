import { describe, it, expect } from 'bun:test';
import sade from 'sade';
import { getSadeOptions } from '../../src/hack/sade-internals';
describe('Sade internal structure', () => {
  it('tree.__all__.options should exist and have correct format', () => {
    const prog = sade('kmdiff [oldFile] [newFile]')
      .option('--json', 'Output diff in JSON format');

    const options = getSadeOptions(prog);
    expect(options.some(([flag]: [string, string]) => flag === '--json')).toBe(true);
  });

  it('opts has `_` property', () => {
    const prog = sade('kmdiff [oldFile] [newFile]')
      .option('--json', 'Output diff in JSON format')
      .action(async (oldFile, newFile, opts) => {
        expect((opts as any)._).toEqual([]);
      });

    prog.parse(['--json']);
  });
});
