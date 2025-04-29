import { z } from 'zod';

/**
 * Kubernetes resource schema
 *
 * NOTE: .passthrough() is used because Kubernetes resources can have arbitrary additional fields
 * (e.g., spec, data, status, template, etc.), and we want to allow those extensions
 * without having to enumerate all possible properties here.
 */
export const K8sResourceSchema = z
  .object({
    apiVersion: z.string(),
    kind: z.string(),
    metadata: z
      .object({
        name: z.string(),
        namespace: z.string().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type K8sResource = z.infer<typeof K8sResourceSchema>;

const BaseResourceDiffSchema = z.object({
  kind: z.string(),
  name: z.string(),
});

/**
 * Resource diff schema
 */
export const ResourceDiffSchema = z.discriminatedUnion('type', [
  BaseResourceDiffSchema.extend({
    type: z.literal('added'),
  }),
  BaseResourceDiffSchema.extend({
    type: z.literal('removed'),
  }),
  BaseResourceDiffSchema.extend({
    type: z.literal('modified'),
    diffText: z.string(),
  }),
]);

export type ResourceDiff = z.infer<typeof ResourceDiffSchema>;

/**
 * Diff result item schema
 */
export const DiffResultItemSchema = z.object({
  namespace: z.string(),
  diffs: z.array(ResourceDiffSchema),
});

export type DiffResultItem = z.infer<typeof DiffResultItemSchema>;

/**
 * Full diff result schema
 */
export const DiffResultSchema = z.array(DiffResultItemSchema);

export type DiffResult = z.infer<typeof DiffResultSchema>;
