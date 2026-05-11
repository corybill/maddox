import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'react-router',
    'vitest',
    '@testing-library/react',
    '@testing-library/user-event',
    '@scenario-testing/core',
  ],
});
