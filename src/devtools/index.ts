// DevTools 面板入口
// 用于创建自定义的开发者工具面板

// 跨浏览器兼容
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

console.log('DevTools 脚本已加载');

// 创建自定义面板
if (browserAPI.devtools && browserAPI.devtools.panels) {
  browserAPI.devtools.panels.create(
    '插件面板',  // 面板标题
    'src/img/images.png',  // 面板图标
    'src/devtools/index.html',  // 面板HTML页面
    (panel) => {
      console.log('DevTools 面板已创建', panel);
    }
  );
}
