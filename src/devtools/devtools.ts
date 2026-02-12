// DevTools 页面 - 用于创建面板
chrome.devtools.panels.create(
  '我的面板',
  '',
  'src/devtools/panel.html',
  (panel) => {
    console.log('DevTools 面板已创建',panel);
  }
);
