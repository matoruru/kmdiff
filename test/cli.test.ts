import { describe, it, expect } from 'bun:test';
import { $ } from 'bun';
import * as path from 'path';

describe('kmdiff CLI', () => {
  it('prints correct Markdown diff when comparing old and new YAML files', async () => {
    const cliPath = path.resolve(__dirname, '../src/cli.ts');
    const oldYaml = path.resolve(__dirname, 'fixtures/old.yaml');
    const newYaml = path.resolve(__dirname, 'fixtures/new.yaml');

    // Run the CLI with fixture YAML files
    const proc = await $`bun ${cliPath} ${oldYaml} ${newYaml}`.quiet();

    const stdout = proc.stdout.toString('utf8'); // Convert Buffer to string

    // Verify that the output contains the expected diffs
    expect(stdout).toContain('# Namespace: default');
    expect(stdout).toContain('- Modified: modified-config');
    expect(stdout).toContain('## Service');
    expect(stdout).toContain('- Removed: deleted-service');
    expect(stdout).toContain('- Added: added-service');
  });

  it('shows usage message when arguments are missing', async () => {
    const cliPath = path.resolve(__dirname, '../src/cli.ts');

    // Run the CLI without arguments
    const proc = await $`bun ${cliPath}`.nothrow().quiet();

    const stderr = proc.stderr.toString('utf8'); // Convert Buffer to string

    // Check for usage error message
    expect(stderr).toContain('Usage: kmdiff <old.yaml> <new.yaml>');
    expect(proc.exitCode).toBe(1);
  });
});
