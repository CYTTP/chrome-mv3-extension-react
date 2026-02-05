import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

// 获取浏览器类型
const browser = process.env.VITE_BROWSER || 'chrome'
const isFirefox = browser === 'firefox'

// 公共配置
const commonConfig = {
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
  options_ui: {
    page: 'src/options/index.html',
    open_in_tab: true,
  },
  permissions: ['activeTab', 'storage', 'tabs'],
  host_permissions: ['http://*/*', 'https://*/*'],
  content_scripts: [
    {
      matches: ['*://*/*'],
      js: ['src/content/content.ts'],
      run_at: 'document_idle' as const,
      all_frames: false,
    },
  ],
}

// 公共的 action/browser_action 配置
const popupConfig = {
  default_title: '__MSG_extensionName__',
  default_icon: {
    16: 'src/img/images.png',
    48: 'src/img/images.png',
    128: 'src/img/images.png',
  },
  default_popup: 'src/popup/index.html',
}

// Chrome MV3 配置
const chromeManifest = defineManifest({
  manifest_version: 3,
  ...commonConfig,
  action: popupConfig,
  side_panel: {
    default_path: 'src/sidePanel/index.html',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
  },
  permissions: [...commonConfig.permissions, 'sidePanel'],
  web_accessible_resources: [
    {
      resources: ['src/assets/*', 'src/img/*'],
      matches: ['http://*/*', 'https://*/*'],
      use_dynamic_url: true,
    },
  ],
})

// Firefox MV2 配置
const firefoxManifest = defineManifest({
  manifest_version: 2,
  ...commonConfig,
  browser_action: popupConfig,
  background: {
    scripts: ['src/background/background.ts'],
    persistent: false,
  },
  content_scripts: [
    {
      matches: ['*://*/*'],
      js: ['src/content/content.ts'],
      run_at: 'document_idle' as const,
      all_frames: false,
    },
  ],
  web_accessible_resources: ['src/assets/*', 'src/img/*'],
  browser_specific_settings: {
    gecko: {
      id: 'firefox-mv3-extension-react@example.com',
      strict_min_version: '109.0',
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)

// 根据浏览器类型导出对应的配置
export default isFirefox ? firefoxManifest : chromeManifest
