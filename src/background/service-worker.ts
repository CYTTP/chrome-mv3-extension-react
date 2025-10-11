
// 划词翻译插件 Service Worker
import { TranslationService } from './TranslationService';
import { SettingsManager } from './SettingsManager';

// 浏览器API类型定义
interface BrowserAPI {
  runtime: {
    onInstalled: {
      addListener: (callback: (details: { reason: string }) => void) => void;
    };
    onMessage: {
      addListener: (callback: (message: MessageRequest, sender: unknown, sendResponse: (response?: MessageResponse) => void) => void) => void;
    };
  };
  tabs: {
    query: (queryInfo: { active?: boolean; currentWindow?: boolean }) => Promise<Array<{ id?: number }>>;
    sendMessage: (tabId: number, message: MessageRequest) => Promise<void>;
  };
  storage: {
    sync: {
      get: (keys: string | string[] | null | undefined, callback: (result: Record<string, unknown>) => void) => void;
      set: (data: Record<string, unknown>, callback: () => void) => void;
    };
  };
  contextMenus?: {
    create: (createProperties: { id: string; title: string; contexts: string[] }) => void;
    onClicked: {
      addListener: (callback: (info: { menuItemId: string; selectionText?: string }, tab: { id?: number }) => void) => void;
    };
  };
  commands?: {
    onCommand: {
      addListener: (callback: (command: string) => void) => void;
    };
  };
}

interface MessageRequest {
  type: string;
  text?: string;
  source?: string;
  target?: string;
  service?: 'google' | 'glm' | 'backup';
  stream?: boolean;
  settings?: Record<string, unknown>;
  apiKey?: string;
  chunk?: string;
}

interface ExtensionSettings {
  enabled: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  showPronunciation: boolean;
  autoHideDelay: number;
  enableKeyboardShortcut: boolean;
  enableContextMenu: boolean;
  minSelectionLength: number;
  maxSelectionLength: number;
  translationService: 'google' | 'glm' | 'backup';
  glmApiKey: string;
  glmModel: string;
}

interface MessageResponse {
  success?: boolean;
  error?: string;
  translation?: unknown;
  tabInfo?: unknown;
  valid?: boolean;
  enabled?: boolean;
  sourceLanguage?: string;
  targetLanguage?: string;
  showPronunciation?: boolean;
  autoHideDelay?: number;
  enableKeyboardShortcut?: boolean;
  enableContextMenu?: boolean;
  minSelectionLength?: number;
  maxSelectionLength?: number;
  translationService?: 'google' | 'glm' | 'backup';
  glmApiKey?: string;
  glmModel?: string;
  [key: string]: unknown;
}

// 检测浏览器类型并使用polyfill
const isFirefox = typeof browser !== 'undefined';
const browserAPI = (isFirefox ? browser : chrome) as unknown as BrowserAPI;

// 初始化服务
const translationService = new TranslationService();
const settingsManager = new SettingsManager(browserAPI as any);

console.log('划词翻译插件 Service Worker 已启动');

// 扩展安装事件
browserAPI.runtime.onInstalled.addListener(async (details: { reason: string }) => {
  console.log('插件已安装:', details);

  // 初始化默认设置
  await settingsManager.initDefaultSettings();

  // 设置右键菜单
  setupContextMenus();
});

// 消息处理
browserAPI.runtime.onMessage.addListener((message: MessageRequest, sender: unknown, sendResponse: (response?: MessageResponse) => void) => {
  handleMessage(message, sender, sendResponse);
  return true; // 保持异步响应通道开放
});

// 处理消息
async function handleMessage(message: MessageRequest, sender: unknown, sendResponse: (response?: MessageResponse) => void) {
  try {
    switch (message.type) {
      case 'TRANSLATE_TEXT':
        console.log('[ServiceWorker] 收到翻译请求:', message);

        // 获取当前设置以确定使用哪个翻译服务
        const currentSettings = await settingsManager.getSettings();
        console.log('[ServiceWorker] 当前设置:', currentSettings);

        const selectedService = message.service || currentSettings.translationService;
        console.log('[ServiceWorker] 选择的翻译服务:', selectedService);

        // 更新GLM配置
        if (selectedService === 'glm') {
          console.log('[ServiceWorker] 配置GLM服务');
          translationService.updateGLMConfig(currentSettings.glmApiKey, currentSettings.glmModel);
        }

        // 如果是GLM服务且支持流式，则使用流式翻译
        if (selectedService === 'glm' && message.stream !== false) {
          console.log('[ServiceWorker] 开始流式翻译');

          // 获取发送者的tab信息
          const senderTab = (sender as any)?.tab;

          try {
            const translation = await translationService.translateStream(
              message.text || '',
              message.source || 'auto',
              message.target || 'zh-CN',
              selectedService,
              // 流式进度回调
              (chunk: string) => {
                console.log('[ServiceWorker] 收到流式内容:', chunk);
                // 发送流式内容到content script
                if (senderTab?.id) {
                  browserAPI.tabs.sendMessage(senderTab.id, {
                    type: 'TRANSLATION_STREAM_CHUNK',
                    chunk: chunk
                  }).catch(err => console.log('发送流式内容失败:', err));
                }
              }
            );

            console.log('[ServiceWorker] 流式翻译完成:', translation);
            sendResponse({ success: true, translation, isStream: true });
          } catch (error) {
            console.error('[ServiceWorker] 流式翻译失败:', error);
            sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
          }
        } else {
          // 普通翻译
          const translation = await translationService.translate(
            message.text || '',
            message.source || 'auto',
            message.target || 'zh-CN',
            selectedService
          );
          console.log('[ServiceWorker] 翻译完成:', translation);
          sendResponse({ success: true, translation });
        }
        break;

      case 'TRANSLATE_TEXT_STREAM':
        // 流式翻译处理
        const streamSettings = await settingsManager.getSettings();

        if (streamSettings.translationService === 'glm') {
          translationService.updateGLMConfig(streamSettings.glmApiKey, streamSettings.glmModel);
        }

        // 由于Chrome扩展的限制，我们不能直接流式传输
        // 但可以分块发送结果
        const streamTranslation = await translationService.translateStream(
          message.text || '',
          message.source || 'auto',
          message.target || 'zh-CN',
          message.service || streamSettings.translationService
        );
        sendResponse({ success: true, translation: streamTranslation });
        break;

      case 'VALIDATE_GLM_API_KEY':
        const isValid = await translationService.validateGLMApiKey(message.apiKey || '');
        sendResponse({ success: true, valid: isValid });
        break;

      case 'GET_SETTINGS':
        const settings = await settingsManager.getSettings();
        sendResponse({ success: true, ...settings });
        break;

      case 'UPDATE_SETTINGS':
        if (message.settings) {
          await settingsManager.updateSettings(message.settings as Partial<ExtensionSettings>);
        }
        sendResponse({ success: true });
        break;

      case 'GET_TAB_INFO':
        const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
        sendResponse({ tabInfo: tabs[0] });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('处理消息时出错:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}

// 设置右键菜单
function setupContextMenus() {
  browserAPI.contextMenus?.create({
    id: 'translate-selection',
    title: '翻译选中文本',
    contexts: ['selection']
  });
}

// 右键菜单点击事件
browserAPI.contextMenus?.onClicked.addListener(async (info: { menuItemId: string; selectionText?: string }, tab: { id?: number }) => {
  if (info.menuItemId === 'translate-selection' && info.selectionText && tab.id) {
    // 向内容脚本发送翻译请求
    try {
      await browserAPI.tabs.sendMessage(tab.id, {
        type: 'TRANSLATE_SELECTION',
        text: info.selectionText
      });
    } catch (error) {
      console.error('发送翻译消息失败:', error);
    }
  }
});

// 快捷键支持
browserAPI.commands?.onCommand.addListener(async (command: string) => {
  if (command === 'translate-selection') {
    const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browserAPI.tabs.sendMessage(tabs[0].id, {
        type: 'TRANSLATE_SELECTION'
      });
    }
  }
});
