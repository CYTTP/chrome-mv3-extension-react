import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import zip from 'vite-plugin-zip-pack'
import { name, version } from './package.json'

// 导入 manifest
// eslint-disable-next-line @typescript-eslint/no-var-requires
const manifest = require('./manifest.config').default

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isDev = mode === 'development'
  
  return {
    root: '.',
    define: {
      'import.meta.env.VITE_IS_DEV': isDev,
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    },
    plugins: [
      react(),
      crx({ manifest }),
      zip({ 
        outDir: 'release', 
        outFileName: `${name}-${version}.zip` 
      }),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    css: {
      postcss: './postcss.config.js',
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
