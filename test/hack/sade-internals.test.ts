import { describe, it, expect } from 'bun:test';
import sade from 'sade';

describe('Sade internal structure', () => {
  it('tree.__all__.options should exist and have correct format', () => {
    const prog = sade('kmdiff [oldFile] [newFile]')
      .option('--json', 'Output diff in JSON format');

    const tree = (prog as any).tree;

    expect(tree).toHaveProperty('__all__');
    expect(tree.__all__).toHaveProperty('options');
    expect(Array.isArray(tree.__all__.options)).toBe(true);

    const options = tree.__all__.options as [string, string][];
    expect(options.some(([flag]) => flag === '--json')).toBe(true);
  });
});
