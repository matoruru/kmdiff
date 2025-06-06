import sade from 'sade';
import { z } from 'zod';

export const SadeUserDefinedOptionsSchema = z
  .object({
    _: z.any().optional(),
    json: z.boolean().optional(),
  })
  .passthrough();

export type SadeUserDefinedOptions = z.infer<typeof SadeUserDefinedOptionsSchema>;

/**
 * (HACK) Get the options from the sade program.
 * Based on https://github.com/lukeed/sade/blob/8aa4a69e95fbfba88cf49082713900ecbe27f183/src/index.js#L46
 */
export const getSadeOptions = (prog: sade.Sade): [string, string][] => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const tree = (prog as any).tree;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return tree.__all__.options;
};

export const getUnknownOptions = (
  prog: sade.Sade,
  userDefinedOptions: SadeUserDefinedOptions
): string[] => {
  const allowed = new Set(getSadeOptions(prog).map(([flag]) => flag.replace(/^--/, '')));

  return Object.keys(userDefinedOptions)
    .filter((key) => key !== '_')
    .filter((key) => !allowed.has(key));
};
