const banner = `
         __      ___ ______
  __ _  / /_____/ (_) _/ _/
 /  ' \\/  '_/ _  / / _/ _/ 
/_/_/_/_/\\_\\\\_,_/_/_//_/   

kmdiff - Kubernetes Manifest Diff
`.replace(/^\n/, '');

export const printBanner = (): void => {
  console.log(banner);
};
