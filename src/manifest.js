import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  action: {
    default_popup: 'src/popup/popup.html',
    default_icon: 'icons/icon-48.png',
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
  web_accessible_resources: [
    {
      resources: ['img/logo_transparent_bg_1000px.png'],
      matches: ['<all_urls>'],
    },
  ],
})
