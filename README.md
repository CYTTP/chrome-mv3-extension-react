一个开箱即用的 Chrome 浏览器 V3 插件开发模板，基于 **React 18 + TypeScript + Vite + Tailwind CSS + Ant Design** 构建。

###  ✨ 特性

#### 🛠️ 技术栈
- ⚡ **Vite** - 极速的开发构建工具
- ⚛️ **React 18** - 最新的 React 框架
- 📘 **TypeScript** - 类型安全的 JavaScript
- 🎨 **Tailwind CSS** - 实用优先的 CSS 框架
- 🎯 **Ant Design** - 企业级 UI 组件库
- 🌍 **i18next** - 国际化支持
- 🗃️ **Zustand** - 轻量级状态管理

#### 📁 项目结构

```
chrome-mv3-extension-react/
├── _locales/                 # 国际化语言包
│   ├── en/                  # 英文
│   │   └── messages.json
│   └── zh_CN/               # 中文
│       └── messages.json
├── src/
│   ├── assets/              # 静态资源
│   │   └── styles.css       # Tailwind CSS 入口
│   ├── background/          # 后台服务脚本
│   │   └── index.ts
│   ├── content/             # 内容脚本
│   │   └── content.ts
│   ├── devtools/            # 开发者工具面板
│   │   ├── index.html
│   │   ├── panel.html
│   │   ├── panel.tsx
│   │   └── devtools.ts
│   ├── helpers/             # 工具函数
│   │   └── i18n.ts          # 国际化配置
│   ├── hooks/               # React Hooks
│   ├── img/                 # 图片资源
│   │   └── images.png
│   ├── options/             # 选项页面
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── Options.tsx
│   ├── popup/               # 弹出页面
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── Pop.tsx
│   ├── sidePanel/           # 侧边栏面板
│   │   ├── index.html
│   │   ├── index.tsx
│   │   └── SidePanel.tsx
│   ├── store/               # 状态管理（Zustand）
│   │   └── task.ts
│   ├── types/               # TypeScript 类型定义
│   │   └── global.d.ts
│   ├── constants.ts         # 常量定义
│   └── vite-env.d.ts        # Vite 环境类型
├── .env.development         # 开发环境变量
├── .env.example             # 环境变量示例
├── .env.production          # 生产环境变量
├── .eslintrc.cjs            # ESLint 配置
├── .gitignore               # Git 忽略文件
├── manifest.config.ts       # Manifest 配置
├── postcss.config.js        # PostCSS 配置
├── tailwind.config.js       # Tailwind CSS 配置
├── tsconfig.json            # TypeScript 配置
├── tsconfig.app.json        # 应用 TypeScript 配置
├── tsconfig.node.json       # Node TypeScript 配置
├── vite.config.ts           # Vite 配置
└── package.json             # 项目依赖
```

###  🚀 快速开始

####  安装依赖

```bash
npm install
# 或
pnpm install
```

####  开发模式

```bash
pnpm dev
```

####  构建生产版本

```bash
pnpm build
```

####  🧩 加载插件到 Chrome

1. 打开 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择项目根目录的 `dist/` 文件夹

#### 🌐 浏览器支持

本模板专为 **Chrome Manifest V3** 设计，支持以下功能：

| 功能 | 支持状态 |
|------|---------|
| Popup | ✅ |
| Options | ✅ |
| Background Service Worker | ✅ |
| Content Script | ✅ |
| Side Panel | ✅ |
| DevTools | ✅ |
| 国际化 (i18n) | ✅ |

### 📄 许可证

MIT License

### 🔗 相关资源

- [Chrome Extension 文档](https://developer.chrome.com/docs/extensions/)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/)
- [Ant Design 文档](https://ant.design/)
- [i18next 文档](https://www.i18next.com/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin/)
