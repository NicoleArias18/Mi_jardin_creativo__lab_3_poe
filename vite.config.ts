import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // Excluir sql.js de la optimización para que cargue el .wasm correctamente
    exclude: ['sql.js']
  },
  server: {
    headers: {
      // Necesario para SharedArrayBuffer (algunas versiones de sql.js)
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
});