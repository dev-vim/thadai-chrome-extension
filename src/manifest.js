import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/icon-16.png',
    32: 'img/icon-32.png',
    48: 'img/icon-48.png',
    128: 'img/icon-128.png',
  },
  action: {
    default_popup: 'src/popup/popup.html',
    default_icon: 'img/icon-48.png',
  },
  background: {
    service_worker: 'src/background/worker.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['http://*/*', 'https://*/*'],
      js: ['src/content/script.js'],
    },
  ],
  permissions: ['tabs', 'storage'],
})
