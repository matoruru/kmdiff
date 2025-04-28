import { describe, it, expect } from 'bun:test';
import { $ } from 'bun';
import * as path from 'path';

describe('kmdiff CLI', () => {
  const cliPath = path.resolve(__dirname, '../bin/kmdiff.ts');

  it('prints correct diff when resources are changed, added, and removed', async () => {
    const oldYaml = path.resolve(__dirname, 'fixtures/change-add-remove-old.yaml');
    const newYaml = path.resolve(__dirname, 'fixtures/change-add-remove-new.yaml');

    const proc = await $`bun ${cliPath} ${oldYaml} ${newYaml}`.quiet();
    const stdout = proc.stdout.toString('utf8');

    expect(stdout).toContain('# Namespace: default');
    expect(stdout).toContain('- Modified: modified-config');
    expect(stdout).toContain('- Removed: deleted-service');
    expect(stdout).toContain('- Added: added-service');
  });

  it('prints no diff when resources are identical', async () => {
    const oldYaml = path.resolve(__dirname, 'fixtures/identical-old.yaml');
    const newYaml = path.resolve(__dirname, 'fixtures/identical-new.yaml');

    const proc = await $`bun ${cliPath} ${oldYaml} ${newYaml}`.quiet();
    const stdout = proc.stdout.toString('utf8');

    // Should not contain any diff items
    expect(stdout).not.toContain('- Added:');
    expect(stdout).not.toContain('- Modified:');
    expect(stdout).not.toContain('- Removed:');
  });

  it('detects namespace-only differences correctly', async () => {
    const oldYaml = path.resolve(__dirname, 'fixtures/namespace-diff-old.yaml');
    const newYaml = path.resolve(__dirname, 'fixtures/namespace-diff-new.yaml');

    const proc = await $`bun ${cliPath} ${oldYaml} ${newYaml}`.quiet();
    const stdout = proc.stdout.toString('utf8');

    // Should treat namespace difference as two separate resources
    expect(stdout).toContain('# Namespace: default');
    expect(stdout).toContain('- Removed: ns-config');

    expect(stdout).toContain('# Namespace: prod');
    expect(stdout).toContain('- Added: ns-config');
  });

  it('shows usage message when arguments are missing', async () => {
    const proc = await $`bun ${cliPath}`.nothrow().quiet();
    const stdout = proc.stdout.toString('utf8');

    expect(stdout).toContain('Description');
    expect(stdout).toContain('Usage');
    expect(stdout).toContain('Options');
    expect(stdout).toContain('Examples');
    expect(proc.exitCode).toBe(1);
  });

});
