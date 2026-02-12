import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: '__MSG_extensionName__',
  version: pkg.version,
  description: '__MSG_extensionDescription__',
  default_locale: 'zh_CN',
  icons: {
    16: 'src/img/images.png',
    32: 'src/img/images.png',
    48: 'src/img/images.png',
    128: 'src/img/images.png',
  },
  action: {
    default_title: '__MSG_extensionName__',
    default_icon: {
      16: 'src/img/images.png',
      48: 'src/img/images.png',
      128: 'src/img/images.png',
    },
    default_popup: 'src/popup/index.html',
  },
  side_panel: {
    default_path: 'src/sidePanel/index.html',
  },
  devtools_page: 'src/devtools/index.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true,
  },
  permissions: ['activeTab', 'storage', 'tabs', 'sidePanel'],
  host_permissions: ['http://*/*', 'https://*/*'],
  content_scripts: [
    {
      matches: ['*://*/*'],
      js: ['src/content/content.ts'],
      run_at: 'document_idle' as const,
      all_frames: false,
    },
  ],
  web_accessible_resources: [
    {
      resources: ['src/assets/*', 'src/img/*'],
      matches: ['http://*/*', 'https://*/*'],
      use_dynamic_url: true,
    },
  ],
})
