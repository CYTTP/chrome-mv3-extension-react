# 网页划词翻译插件

一个功能强大的浏览器插件，支持网页文本的快速划词翻译。选中任意文本即可获得即时翻译结果。

基于 **React 18 + TypeScript + Vite + Antd** 构建，同时支持 **Chrome (Manifest V3)** 和 **Firefox (Manifest V2)**。

## 📦 特性

### 🌟 翻译功能
- 🖱️ **划词翻译**: 选中文本即可快速翻译
- 🤖 **AI翻译**: 集成GLM大语言模型，提供高质量翻译
- 🌍 **多语言支持**: 支持中英日韩法德俄等15种语言
- ⚡ **即时显示**: 翻译结果实时显示在选择位置附近
- 🔄 **流式翻译**: GLM AI支持流式输出，翻译过程可见
- 🎯 **智能检测**: 自动检测源语言类型
- ⌨️ **快捷键支持**: Ctrl+Shift+T 快速翻译选中文本
- 🖱️ **右键菜单**: 右键菜单快速翻译

### 🛠️ 技术特性
- 🌟 支持 Chrome MV3 和 Firefox MV2 架构
- 🦊 跨浏览器兼容，一套代码支持多个浏览器
- ⚡ 使用 Vite 构建，极速开发
- 💡 使用 React + TypeScript 编写各页面
- 📜 支持国际化（_locales）
- 📁 项目结构清晰，模块职责明确
- 🛠️ 支持 SidePanel、DevTools 面板开发（Chrome）
- 🔒 使用 `.env` 管理多环境配置
- ✅ 内置 ESLint + TypeScript 校验
- 🔧 自动浏览器检测和API兼容

## 📁 项目结构

详见项目文档：[文件结构说明](##📁-项目目录结构说明react--vite--chrome-mv3)

## 🧪 本地开发

```bash
# 安装依赖
pnpm install

# Chrome开发
pnpm dev

# Firefox开发  
pnpm dev:firefox

# 构建Chrome版本
pnpm build

# 构建Firefox版本
pnpm build:firefox

# 构建所有版本
pnpm build:all
```

## 🧩 加载插件

### Chrome
1. 打开 `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」，选择 `dist/` 文件夹

### Firefox
1. 打开 `about:debugging`
2. 点击「此Firefox」
3. 点击「临时载入附加组件」
4. 选择 `dist-firefox/` 目录中的 `manifest.json` 文件

## 🦊 浏览器兼容性

| 功能 | Chrome | Firefox | 说明 |
|------|--------|---------|------|
| Popup | ✅ | ✅ | 弹出窗口 |
| Options | ✅ | ✅ | 选项页面 |
| Background | ✅ | ✅ | 背景脚本 |
| Content Script | ✅ | ✅ | 内容脚本 |
| Side Panel | ✅ | ❌ | Chrome专有功能 |
| DevTools | ✅ | ✅ | 开发者工具 |
| Storage API | ✅ | ✅ | 存储API |
| Tabs API | ✅ | ✅ | 标签页API |

详细构建说明请查看 [BUILD_GUIDE.md](./BUILD_GUIDE.md)

## 📁 项目目录结构说明（React + Vite + Chrome MV3）

```text
CHROME-MV3-EXTENSION-REACT/
├── _locales/
├── dist/
├── node_modules/
├── src/
│   ├── assets/
│   ├── background/
│   ├── component/
│   ├── content/
│   ├── devtools/
│   ├── helpers/
│   ├── hooks/
│   ├── img/
│   ├── options/
│   ├── page/
│   ├── popup/
│   ├── sidePanel/
│   ├── stroe/
│   ├── types/
│   ├── constants.ts
│   └── vite-env.d.ts
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .gitignore
├── manifest.json
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### 📁 顶层目录

| 目录名称         | 说明                                                                 |
|------------------|----------------------------------------------------------------------|
| `_locales/`      | 国际化语言包目录，Chrome 插件支持多语言展示（如 `en/messages.json`）。 |
| `dist/`          | Vite 构建后的输出目录，打包生成的插件文件将存放于此。                    |
| `node_modules/`  | 项目的依赖模块，由 `npm` 或 `pnpm` 安装生成。                           |


### 📁 src/ 目录

| 子目录 / 文件        | 说明                                                                 |
|----------------------|----------------------------------------------------------------------|
| `assets/`            | 存放静态资源（图标、样式等）。                                        |
| `background/`        | MV3 的 Background Service Worker 脚本（事件监听、消息处理、初始化逻辑等）。|
| `component/`         | 通用的 React UI 组件封装。                                             |
| `content/`           | Content Scripts，注入网页执行的脚本。                                 |
| `devtools/`          | 插件自定义 DevTools 面板的逻辑。                                       |
| `helpers/`           | 工具函数、通用逻辑模块。                                               |
| `hooks/`             | 自定义 React Hooks。                                                  |
| `img/`               | 插件使用的图像资源（非构建依赖图）。                                   |
| `options/`           | 插件“选项页”逻辑，MV3 manifest 中定义的 options 页面。                |
| `page/`              | 页面视图文件，例如用于展示在 options 或 popup 中的 React 页面。       |
| `popup/`             | 弹出页（Popup）脚本和视图。                                           |
| `sidePanel/`         | Chrome MV3 新特性 Side Panel 页面及其逻辑。                           |
| `store/`             | 用于存放状态管理相关逻辑（如 Redux/Pinia/Zustand 等）。|
| `types/`             | TypeScript 类型定义文件夹。                                            |
| `constants.ts`       | 全局常量定义。                                                        |
| `vite-env.d.ts`      | Vite 提供的类型环境声明文件。                                         |

### ⚙️ 配置文件说明
| 文件名                 | 说明                                                                 |
|------------------------|----------------------------------------------------------------------|
| `.env.development`     | 开发环境环境变量。                                                    |
| `.env.production`      | 生产环境环境变量。                                                    |
| `.eslintrc.cjs`        | ESLint 配置，控制代码风格和静态检查规则。                             |
| `.gitignore`           | Git 忽略文件配置。                                                     |
| `manifest.json`        | Chrome 插件核心配置文件，定义权限、入口、背景页、content script 等。 |
| `package.json`         | 项目依赖管理及构建脚本配置。                                           |
| `package-lock.json`    | 依赖锁定文件（npm）。                                                  |
| `pnpm-lock.yaml`       | 依赖锁定文件（pnpm）。                                                 |
| `README.md`            | 项目说明文档。                                                         |
| `tsconfig.json`        | TypeScript 基础配置。                                                  |
| `tsconfig.app.json`    | App 的 TS 配置（可用于细分构建目标）。                                 |
| `tsconfig.node.json`   | Node 环境下的 TS 配置（如 `vite.config.ts` 所用）。                   |
| `vite.config.ts`       | Vite 构建配置文件，包含插件打包逻辑、模块路径别名等设置。              |
