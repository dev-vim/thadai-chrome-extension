import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest.js'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/chunk-[hash].js',
        },
      },
    },
    plugins: [
      crx({ manifest }),
      viteStaticCopy({
        targets: [
          {
            src: 'src/popup/settings/settings.html',
            dest: 'src/popup',
          },
          {
            src: 'src/popup/settings/settings.js',
            dest: 'src/popup',
          },
          {
            src: 'src/popup/settings/settings.css',
            dest: 'src/popup',
          },
          {
            src: 'src/popup/popup.css',
            dest: 'src/popup',
          },
        ],
      }),
    ],
  }
})
