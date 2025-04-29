import { describe, it, expect } from 'bun:test';
import { $ } from 'bun';
import * as path from 'path';

describe('kmdiff CLI - Large Manifest Comparison', () => {
  const cliPath = path.resolve(__dirname, '../bin/kmdiff.ts');

  it('correctly detects adds, removes, and modifications across multiple resources', async () => {
    const oldYaml = path.resolve(__dirname, 'fixtures/large-old.yaml');
    const newYaml = path.resolve(__dirname, 'fixtures/large-new.yaml');

    const proc = await $`bun ${cliPath} ${oldYaml} ${newYaml}`.quiet();
    const stdout = proc.stdout.toString('utf8');

    // Check namespace header
    expect(stdout).toContain('# Namespace: staging');

    // Check Deployment modifications
    expect(stdout).toContain('- Modified: frontend');
    expect(stdout).toContain('- Modified: backend');

    // Check Deployment removal
    expect(stdout).toContain('- Removed: worker');

    // Check Deployment addition
    expect(stdout).toContain('- Added: cache');

    // Check Service modifications
    expect(stdout).toContain('- Modified: frontend');

    // Check Ingress modification
    expect(stdout).toContain('- Modified: app-ingress');

    // Check PodDisruptionBudget modification
    expect(stdout).toContain('- Modified: backend-pdb');

    // Check ConfigMap modification
    expect(stdout).toContain('- Modified: app-config');

    // Count the total number of Modified/Added/Removed resources
    // for making sure no unexpected diffs are reported.
    const modifiedCount = stdout.match(/Modified: /g)?.length ?? 0;
    const addedCount = stdout.match(/Added: /g)?.length ?? 0;
    const removedCount = stdout.match(/Removed: /g)?.length ?? 0;
    expect(modifiedCount + addedCount + removedCount).toBe(9);
  });
});
