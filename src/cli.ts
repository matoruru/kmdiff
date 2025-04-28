import { banner } from "./banner";

export const printBanner = (): void => {
  console.log(banner);
};

const main = () => {
  printBanner();
};

main();
