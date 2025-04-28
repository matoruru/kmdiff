import sade from 'sade';

/**
 * (HACK) Get the options from the sade program.
 * Based on https://github.com/lukeed/sade/blob/8aa4a69e95fbfba88cf49082713900ecbe27f183/src/index.js#L46
 */
export const getSadeOptions = (prog: sade.Sade): [string, string][] => {
  const tree = (prog as any).tree;
  return tree.__all__.options;
};

export const getUnknownOptions = (prog: sade.Sade, opts: Record<string, any>): string[] => {
  const allowed = new Set(
    getSadeOptions(prog).map(([flag]) => flag.replace(/^--/, ''))
  );

  return Object.keys(opts)
    .filter((key) => key !== '_')
    .filter((key) => !allowed.has(key));
};
