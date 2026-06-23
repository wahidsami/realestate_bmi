import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@bina/types': path.resolve(__dirname, 'packages/types/src'),
        '@bina/utils': path.resolve(__dirname, 'packages/utils/src'),
        '@bina/shared': path.resolve(__dirname, 'packages/shared/src'),
        '@bina/ui': path.resolve(__dirname, 'packages/ui/src'),
        '@web': path.resolve(__dirname, 'apps/web/src'),
        '@admin': path.resolve(__dirname, 'apps/admin/src'),
      },
    },
    server: {
      // HMR can be disabled via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
