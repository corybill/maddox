import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve workspace package to TypeScript sources during tests (dist/ optional).
      '@scenario-testing/core': path.resolve(dir, '../core/src/index.ts'),
    },
  },
  test: {
    setupFiles: ['./test/setup.ts'],
    environment: 'happy-dom',
    server: {
      deps: {
        inline: ['@scenario-testing/core'],
      },
    },
  },
});
