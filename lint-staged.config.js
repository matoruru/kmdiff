/** @type {import('lint-staged').Config} */
const config = {
  '**/*.ts': [
    'bun run lint --fix',
    'bun run format --write',
  ],
};

export default config;
