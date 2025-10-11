import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// Chrome 专用构建配置（使用CRXJS）
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isDev = mode === 'development';

  return {
    root: '.',
    define: {
      'import.meta.env.VITE_IS_DEV': isDev,
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_BROWSER': JSON.stringify('chrome'),
    },
    plugins: [
      react(), 
      crx({ 
        manifest: manifest
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    build: {
      outDir: 'dist',
      minify: isDev ? false : 'terser',
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

