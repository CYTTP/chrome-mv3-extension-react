import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import zip from 'vite-plugin-zip-pack'
import { copyFileSync, mkdirSync, existsSync, readdirSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import { name, version } from './package.json'

// 根据环境变量判断浏览器类型
const browser = process.env.VITE_BROWSER || 'chrome'
const isFirefox = browser === 'firefox'

// 设置环境变量，让 manifest.config.ts 知道当前浏览器类型
process.env.VITE_BROWSER = browser

// 复制 _locales 和生成 manifest 的插件（仅 Firefox 需要）
function firefoxBuildPlugin(): Plugin {
  return {
    name: 'firefox-build-plugin',
    async closeBundle() {
      const outDir = 'dist-firefox'
      
      // 生成 Firefox manifest，并修正路径
      const { default: manifestConfig } = await import('./manifest.config')
      
      // 修正 background scripts 路径（从 .ts 改为 .js）
      const manifest = JSON.parse(JSON.stringify(manifestConfig))
      if (manifest.background && manifest.background.scripts) {
        manifest.background.scripts = manifest.background.scripts.map((script: string) => 
          script.replace(/\.ts$/, '.js')
        )
      }
      
      // 修正 content_scripts 路径
      if (manifest.content_scripts) {
        manifest.content_scripts = manifest.content_scripts.map((cs: { matches: string[], js: string[], run_at: string, all_frames: boolean }) => ({
          ...cs,
          js: cs.js.map((script: string) => script.replace(/\.ts$/, '.js'))
        }))
      }
      
      const manifestPath = join(outDir, 'manifest.json')
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
      console.log('✓ 已生成 Firefox manifest.json')
      
      // 递归复制 _locales 目录
      const copyDir = (src: string, dest: string) => {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true })
        }
        
        const entries = readdirSync(src, { withFileTypes: true })
        
        for (const entry of entries) {
          const srcPath = join(src, entry.name)
          const destPath = join(dest, entry.name)
          
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
          } else {
            copyFileSync(srcPath, destPath)
          }
        }
      }
      
      if (existsSync('_locales')) {
        copyDir('_locales', join(outDir, '_locales'))
        console.log('✓ 已复制 _locales 目录到 dist-firefox/_locales')
      }
    }
  }
}

// 统一的构建配置
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const isDev = mode === 'development'
  
  // 输出目录
  const outDir = isFirefox ? 'dist-firefox' : 'dist'
  
  // Chrome 使用 CRXJS，Firefox 使用传统构建
  if (isFirefox) {
    // Firefox 传统构建配置
    return {
      root: '.',
      define: {
        'import.meta.env.VITE_IS_DEV': isDev,
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
        'import.meta.env.VITE_BROWSER': JSON.stringify('firefox'),
      },
      plugins: [
        react(),
        firefoxBuildPlugin(),
        zip({ 
          outDir: 'release', 
          outFileName: `firefox-${name}-${version}.zip` 
        }),
      ],
      resolve: {
        alias: {
          '@': '/src',
        },
      },
      build: {
        outDir,
        minify: isDev ? false : 'terser',
        rollupOptions: {
          input: {
            background: resolve(__dirname, 'src/background/background.ts'),
            content: resolve(__dirname, 'src/content/content.ts'),
            popup: resolve(__dirname, 'src/popup/index.html'),
            options: resolve(__dirname, 'src/options/index.html'),
            sidePanel: resolve(__dirname, 'src/sidePanel/index.html'),
          },
          output: {
            entryFileNames: (chunkInfo) => {
              if (chunkInfo.name === 'background') {
                return 'src/background/background.js'
              }
              if (chunkInfo.name === 'content') {
                return 'src/content/content.js'
              }
              return 'assets/[name]-[hash].js'
            },
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              const name = assetInfo.name || ''
              if (name.endsWith('.html')) {
                return '[name].[ext]'
              }
              return 'assets/[name]-[hash].[ext]'
            }
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
  } else {
    // Chrome CRXJS 构建配置
    // 导入 manifest
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const manifest = require('./manifest.config').default
    
    return {
      root: '.',
      define: {
        'import.meta.env.VITE_IS_DEV': isDev,
        'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
        'import.meta.env.VITE_BROWSER': JSON.stringify('chrome'),
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
      build: {
        outDir,
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
  }
})
