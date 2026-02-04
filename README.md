# 浏览器插件开发模板

一个开箱即用的浏览器插件开发模板，基于 **React 18 + TypeScript + Vite + Ant Design** 构建。

同时支持 **Chrome (Manifest V3)** 和 **Firefox (Manifest V2)** 浏览器。

## ✨ 特性

### 🛠️ 技术栈
- ⚡ **Vite** - 极速的开发构建工具
- ⚛️ **React 18** - 最新的React框架
- 📘 **TypeScript** - 类型安全的JavaScript
- 🎨 **Ant Design** - 企业级UI组件库
- 🌍 **i18next** - 国际化支持

### 🌟 功能特性
- 🌟 支持 Chrome MV3 和 Firefox MV2 架构
- 🦊 跨浏览器兼容，一套代码支持多个浏览器
- 📦 完整的插件页面结构（Popup、Options、Content、Background、SidePanel、DevTools）
- 📜 内置国际化支持（中文/英文）
- 🔧 自动浏览器检测和API兼容
- 💾 Chrome Storage API 封装
- 🎯 完整的 TypeScript 类型系统（基于 @types/webextension-polyfill）
- ✅ ESLint 代码规范检查
- 🔒 环境变量管理（.env）

## 📁 项目结构

```
browser-extension-template/
├── _locales/              # 国际化语言包
│   ├── en/               # 英文
│   └── zh_CN/            # 中文
├── src/
│   ├── assets/           # 静态资源
│   ├── background/       # 后台脚本
│   ├── content/          # 内容脚本
│   ├── devtools/         # 开发者工具面板
│   ├── helpers/          # 工具函数
│   ├── hooks/            # React Hooks
│   ├── img/              # 图片资源
│   ├── options/          # 选项页面
│   ├── popup/            # 弹出页面
│   ├── sidePanel/        # 侧边栏面板（Chrome）
│   ├── store/            # 状态管理
│   ├── types/            # TypeScript类型定义
│   └── constants.ts      # 常量定义
├── manifest.json         # Chrome插件配置
├── manifest.firefox.json # Firefox插件配置
├── vite.config.ts        # Vite配置（Chrome）
├── vite.config.firefox.ts # Vite配置（Firefox）
└── package.json          # 项目依赖
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
# 或
yarn install
```

### 开发模式

```bash
# Chrome开发
npm run dev

# Firefox开发
npm run dev:firefox
```

### 构建生产版本

```bash
# 构建Chrome版本
npm run build

# 构建Firefox版本
npm run build:firefox

# 构建所有版本
npm run build:all
```

## 🧩 加载插件

### Chrome
1. 打开 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `dist/` 文件夹

### Firefox
1. 打开 `about:debugging`
2. 点击「此Firefox」
3. 点击「临时载入附加组件」
4. 选择 `dist-firefox/` 目录中的 `manifest.json` 文件

## 📖 使用指南

### 1. Popup 页面
弹出窗口页面，点击插件图标时显示。

文件位置：`src/popup/`

### 2. Options 页面
选项设置页面，用于配置插件。

文件位置：`src/options/`

### 3. Content Script
注入到网页中的脚本，可以操作DOM。

文件位置：`src/content/`

### 4. Background Script
后台服务脚本，处理插件核心逻辑。

文件位置：`src/background/`

### 5. Side Panel（仅Chrome）
Chrome侧边栏面板。

文件位置：`src/sidePanel/`

### 6. DevTools
开发者工具面板。

文件位置：`src/devtools/`

## 🔧 配置说明

### 环境变量
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

### Manifest配置
- `manifest.json` - Chrome插件配置（MV3）
- `manifest.firefox.json` - Firefox插件配置（MV2）

### 权限说明
默认包含的权限：
- `activeTab` - 访问当前活动标签页
- `storage` - 使用存储API
- `tabs` - 访问标签页API
- `sidePanel` - 侧边栏（仅Chrome）

## 🦊 浏览器兼容性

| 功能 | Chrome | Firefox |
|------|--------|---------|
| Popup | ✅ | ✅ |
| Options | ✅ | ✅ |
| Background | ✅ | ✅ |
| Content Script | ✅ | ✅ |
| Side Panel | ✅ | ❌ |
| DevTools | ✅ | ✅ |
| Storage API | ✅ | ✅ |
| Tabs API | ✅ | ✅ |

## 📝 开发建议

1. **跨浏览器兼容**：使用 `src/helpers/browser-detection.ts` 中的 `getBrowserAPI()` 获取统一的浏览器 API
2. **类型安全**：查看 [类型使用指南](./TYPES_GUIDE.md) 了解如何使用 TypeScript 类型
3. **消息通信**：使用统一的消息格式在不同模块间通信
4. **状态管理**：使用 Zustand 进行状态管理
5. **样式开发**：支持 Less 和 CSS
6. **类型定义**：充分利用 TypeScript 类型系统，所有类型都在 `src/types/` 中定义

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关资源

- [快速开始指南](./QUICK_START.md)
- [完整构建指南](./BUILD_GUIDE.md)
- [功能特性详解](./FEATURES.md)
- [TypeScript 类型指南](./TYPES_GUIDE.md)
- [项目结构说明](./PROJECT_STRUCTURE.md)
- [贡献指南](./CONTRIBUTING.md)
- [Chrome Extension 文档](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension 文档](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
