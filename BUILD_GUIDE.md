# 多浏览器扩展构建指南

本项目现在支持Chrome和Firefox两种浏览器。

## 安装依赖

```bash
npm install
```

## 开发模式

### Chrome开发
```bash
npm run dev
```

### Firefox开发
```bash
npm run dev:firefox
```

## 生产构建

### 构建Chrome版本
```bash
npm run build
```
构建输出目录: `dist/`

### 构建Firefox版本
```bash
npm run build:firefox
```
构建输出目录: `dist-firefox/`

### 构建所有版本
```bash
npm run build:all
```

## 浏览器差异说明

### Chrome (Manifest V3)
- 使用Service Worker作为背景脚本
- 支持sidePanel API
- 使用chrome.*命名空间

### Firefox (Manifest V2)
- 使用传统的background scripts
- 不支持sidePanel，使用popup替代
- 使用browser.*命名空间
- 需要browser_specific_settings配置

## 安装扩展

### Chrome
1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 目录

### Firefox
1. 打开 `about:debugging`
2. 点击"此Firefox"
3. 点击"临时载入附加组件"
4. 选择 `dist-firefox` 目录中的 `manifest.json` 文件

## 代码兼容性

项目使用了跨浏览器兼容层：
- `src/helpers/browser-detection.ts` - 浏览器检测和API兼容
- 自动检测浏览器类型并使用相应的API
- 统一的存储和标签页API接口

## 注意事项

1. Firefox不支持某些Chrome特有的API（如sidePanel）
2. 两个浏览器的权限系统略有不同
3. Firefox需要额外的browser_specific_settings配置
4. 开发时注意检查浏览器控制台的错误信息