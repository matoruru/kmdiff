export const banner = `
 _                  _ _  __  __ 
| | ___ __ ___   __| (_)/ _|/ _|
| |/ / '_ \` _ \\ / _\` | | |_| |_ 
|   <| | | | | | (_| | |  _|  _|
|_|\\_\\_| |_| |_|\\__,_|_|_| |_|  

kmdiff - Kubernetes Manifest Diff
`.replace(/^\n/, '');

export const printBanner = (): void => {
  console.log(banner);
};
