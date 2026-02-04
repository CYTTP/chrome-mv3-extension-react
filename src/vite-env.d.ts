/// <reference types="vite/client" />
/// <reference types="chrome" />
/// <reference types="webextension-polyfill" />

// 环境变量类型定义
interface ImportMetaEnv {
  readonly VITE_ENV: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_DEBUG: string;
  // 添加更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 全局类型引用
/// <reference path="./types/global.d.ts" />

// 模块声明
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.less' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}
