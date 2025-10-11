import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// Firefox 专用构建配置（不使用CRXJS）
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isDev = mode === 'development';

  return {
    root: '.',
    define: {
      'import.meta.env.VITE_IS_DEV': isDev,
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_BROWSER': JSON.stringify('firefox'),
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      outDir: 'dist-firefox',
      minify: isDev ? false : 'terser',
      rollupOptions: {
        input: {
          // 定义多个入口点
          'background': resolve(__dirname, 'src/background/background.ts'),
          'content': resolve(__dirname, 'src/content/content.ts'),
          'popup': resolve(__dirname, 'src/popup/index.html'),
          'options': resolve(__dirname, 'src/options/index.html'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            // 为不同的入口文件指定输出路径
            if (chunkInfo.name === 'background') {
              return 'src/background/background.js';
            }
            if (chunkInfo.name === 'content') {
              return 'src/content/content.js';
            }
            return 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 5,
        },
        format: {
          comments: false,
        },
        toplevel: true,
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  }
})