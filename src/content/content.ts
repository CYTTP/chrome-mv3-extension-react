// 网页划词翻译内容脚本
import { TranslationPanel } from './TranslationPanel';
import { SelectionHandler } from './SelectionHandler';
import { MessageHandler } from './MessageHandler';

// 跨浏览器兼容
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

console.log(`划词翻译插件已加载 - 浏览器: ${isFirefox ? 'Firefox' : 'Chrome'}`);

class WordTranslationExtension {
  private selectionHandler: SelectionHandler;
  private translationPanel: TranslationPanel;
  private messageHandler: MessageHandler;
  private isEnabled: boolean = true;

  constructor() {
    this.messageHandler = new MessageHandler(browserAPI as any);
    this.translationPanel = new TranslationPanel();
    this.selectionHandler = new SelectionHandler(
      this.translationPanel,
      this.messageHandler
    );

    this.init();
  }

  private async init() {
    // 获取插件设置
    await this.loadSettings();

    // 初始化各个模块
    this.selectionHandler.init();
    this.translationPanel.init();

    // 监听来自背景脚本的消息
    this.messageHandler.onMessage((message: Record<string, unknown>, sender: unknown, sendResponse: (response?: unknown) => void) => {
      this.handleMessage(message as { type: string; enabled?: boolean }, sender, sendResponse as (response?: { success: boolean; error?: string }) => void);
    });

    console.log('划词翻译插件初始化完成');
  }

  private async loadSettings() {
    try {
      const settings = await this.messageHandler.sendMessage({
        type: 'GET_SETTINGS'
      }) as unknown;
      this.isEnabled = (settings as any)?.enabled ?? true;
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  private handleMessage(message: { type: string; enabled?: boolean; chunk?: string }, sender: unknown, sendResponse: (response?: { success: boolean; error?: string }) => void) {
    switch (message.type) {
      case 'TOGGLE_EXTENSION':
        this.isEnabled = message.enabled ?? true;
        if (!this.isEnabled) {
          this.translationPanel.hide();
        }
        sendResponse({ success: true });
        break;

      case 'TRANSLATE_SELECTION':
        if (this.isEnabled) {
          this.selectionHandler.translateCurrentSelection();
        }
        sendResponse({ success: true });
        break;

      case 'TRANSLATION_STREAM_CHUNK':
        // 处理流式翻译内容
        if (message.chunk && this.isEnabled) {
          console.log('[Content] 收到流式内容:', message.chunk);
          this.translationPanel.appendStreamContent(message.chunk);
        }
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }
}

// 启动插件
new WordTranslationExtension();