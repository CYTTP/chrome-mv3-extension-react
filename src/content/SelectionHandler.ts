// 文本选择处理器
import { TranslationPanel } from './TranslationPanel';
import { MessageHandler } from './MessageHandler';

export class SelectionHandler {
  private translationPanel: TranslationPanel;
  private messageHandler: MessageHandler;
  private selectionTimeout: number | null = null;
  private lastSelection: string = '';
  private isMouseDown: boolean = false;

  constructor(translationPanel: TranslationPanel, messageHandler: MessageHandler) {
    this.translationPanel = translationPanel;
    this.messageHandler = messageHandler;
  }

  init() {
    // 移除自动划词翻译功能
    // 只保留手动翻译方法供快捷键和右键菜单调用
    console.log('[SelectionHandler] 初始化完成，已禁用自动划词翻译');
  }

  // 移除自动划词相关的事件处理方法

  // 手动翻译选中的文本（供快捷键和右键菜单调用）
  private async processManualTranslation() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('[SelectionHandler] 没有选中的文本');
      return;
    }

    const selectedText = selection.toString().trim();
    
    // 检查选择的文本
    if (!selectedText) {
      console.log('[SelectionHandler] 选中文本为空');
      return;
    }

    // 过滤无效选择
    if (!this.isValidSelection(selectedText)) {
      console.log('[SelectionHandler] 选中文本无效:', selectedText);
      return;
    }

    console.log('[SelectionHandler] 开始手动翻译:', selectedText);

    // 获取选择位置
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 显示翻译面板
    this.translationPanel.show({
      text: selectedText,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });

    // 请求翻译
    this.requestTranslation(selectedText);
  }

  private isValidSelection(text: string): boolean {
    // 最小长度检查
    if (text.length < 1 || text.length > 500) {
      return false;
    }

    // 过滤纯数字、纯符号等
    const hasLetter = /[a-zA-Z\u4e00-\u9fa5]/.test(text);
    if (!hasLetter) {
      return false;
    }

    // 过滤换行过多的文本
    const lineCount = text.split('\n').length;
    if (lineCount > 3) {
      return false;
    }

    return true;
  }

  private async requestTranslation(text: string) {
    try {
      console.log('[SelectionHandler] 开始翻译请求，文本:', text);
      
      // 首先获取设置以确定翻译服务
      const settings = await this.messageHandler.sendMessage({
        type: 'GET_SETTINGS'
      }) as any;

      console.log('[SelectionHandler] 获取到的设置:', settings);

      const translationService = settings?.translationService || 'google';
      const isGLMService = translationService === 'glm';

      console.log('[SelectionHandler] 选择的翻译服务:', translationService, '是否为GLM:', isGLMService);

      this.translationPanel.setLoading(true, isGLMService);
      
      const translateRequest = {
        type: 'TRANSLATE_TEXT',
        text: text,
        source: settings?.sourceLanguage || 'auto',
        target: settings?.targetLanguage || 'en', // 默认目标语言改为英语
        service: translationService,
        stream: isGLMService // 只有GLM服务才启用流式
      };

      console.log('[SelectionHandler] 发送翻译请求:', translateRequest);
      
      const result = await this.messageHandler.sendMessage(translateRequest) as unknown;

      console.log('[SelectionHandler] 收到翻译结果:', result);

      const typedResult = result as any;
      if (typedResult?.success && typedResult?.translation) {
        if (typedResult.isStream) {
          // 流式翻译完成
          console.log('[SelectionHandler] 流式翻译完成');
          this.translationPanel.finishStream(typedResult.translation);
        } else {
          // 普通翻译
          this.translationPanel.setTranslation(typedResult.translation);
        }
      } else {
        console.error('[SelectionHandler] 翻译失败:', typedResult?.error);
        this.translationPanel.setError(typedResult?.error || '翻译失败');
      }
    } catch (error) {
      console.error('[SelectionHandler] 翻译请求异常:', error);
      this.translationPanel.setError('网络错误，请重试');
    } finally {
      this.translationPanel.setLoading(false);
    }
  }

  // 公共方法：翻译当前选择（供快捷键和右键菜单调用）
  public translateCurrentSelection() {
    this.processManualTranslation();
  }
}