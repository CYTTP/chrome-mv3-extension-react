import { logDebug } from "@/helpers/logger";


/**
 * 如果需要侧边栏，则需要打开以下代码
 * 如果你在 manifest.json 中配置了 "default_popup": "popup.html"，那么 action.onClicked 事件将不会触发。你需要二选一。
 */
// chrome.action.onClicked.addListener((tab) => {
//   // 打开当前窗口的侧边栏
//   chrome.sidePanel.open({ windowId: tab.windowId });
// });


logDebug('background.ts is running!');

