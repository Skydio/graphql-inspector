import { join } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
  const tsconfigPaths = (await import('vite-tsconfig-paths')).default;

  return {
    test: {
      globals: true,
      alias: {
        '@graphql-inspector/commands': 'packages/commands/commands/src/index.ts',
        '@graphql-inspector/loaders': 'packages/loaders/loaders/src/index.ts',
        '@graphql-inspector/logger': 'packages/logger/src/index.ts',
        '@graphql-inspector/url-loader': 'packages/loaders/url/src/index.ts',
        '@graphql-inspector/testing': 'packages/testing/src/index.ts',
        '@graphql-inspector/core': 'packages/core/src/index.ts',
        'graphql/language/parser.js': 'graphql/language/parser.js',
        graphql: 'graphql/index.js',
      },
      deps: {
        fallbackCJS: true,
      },
      setupFiles: ['./packages/testing/src/setup-file.ts'],
    },
    plugins: [
      tsconfigPaths({
        projects: [join(__dirname, 'tsconfig.test.json')],
      }),
    ],
  };
});
