/** @type {import('lint-staged').Config} */
const config = {
  '**/*.ts': ['bunx eslint --fix', 'bunx prettier --write'],
};

export default config;
