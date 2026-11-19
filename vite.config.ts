import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^sql\.js$/,
        replacement: fileURLToPath(
          new URL('./node_modules/sql.js/dist/sql-wasm-inline.js', import.meta.url)
        ),
      },
    ],
  },
  optimizeDeps: {
    include: ['sql.js'],
  },
});
