/**
 * (HACK) Get the options from the sade program.
 * Based on https://github.com/lukeed/sade/blob/8aa4a69e95fbfba88cf49082713900ecbe27f183/src/index.js#L46
 */
export const getSadeOptions = (prog: any) => {
  const tree = (prog as any).tree;
  return tree.__all__.options;
};
