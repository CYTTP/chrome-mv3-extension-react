// 翻译结果显示面板
export interface TranslationData {
  text: string;
  position: {
    x: number;
    y: number;
  };
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  pronunciation?: string;
}

export class TranslationPanel {
  private panel: HTMLElement | null = null;
  private isVisible: boolean = false;
  private hideTimeout: number | null = null;
  private isStreaming: boolean = false;
  private streamContent: string = '';
  private typewriterQueue: string[] = [];
  private typewriterTimer: number | null = null;

  init() {
    this.createPanel();
    this.bindEvents();
  }

  private createPanel() {
    // 创建面板容器
    this.panel = document.createElement('div');
    this.panel.id = 'word-translation-panel';
    this.panel.className = 'word-translation-panel';

    // 设置样式
    this.panel.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      background: #ffffff;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      max-width: 350px;
      min-width: 220px;
      display: none;
      user-select: none;
      cursor: default;
      overflow: hidden;
    `;

    // 添加内部样式
    const style = document.createElement('style');
    style.textContent = `
      .word-translation-panel .translation-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #f0f0f0;
        background: #fafafa;
        border-radius: 8px 8px 0 0;
        min-height: 32px;
      }
      
      .word-translation-panel .close-btn {
        background: none;
        border: none;
        font-size: 16px;
        color: #8c8c8c;
        cursor: pointer;
        padding: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
        flex-shrink: 0;
        font-weight: bold;
      }
      
      .word-translation-panel .close-btn:hover {
        background: #ff4d4f;
        color: #ffffff;
        transform: scale(1.1);
      }
      
      .word-translation-panel .translation-content {
        padding: 12px 16px;
      }
      
      .word-translation-panel .loading {
        color: #1890ff;
        font-size: 12px;
        text-align: center;
        padding: 8px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .word-translation-panel .loading::before {
        content: '';
        width: 12px;
        height: 12px;
        border: 2px solid #f0f0f0;
        border-top: 2px solid #1890ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .word-translation-panel .translated-text {
        color: #262626;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        margin-bottom: 6px;
        word-break: break-word;
      }
      
      .word-translation-panel .translated-text.streaming {
        border-right: 2px solid #1890ff;
        animation: typing 0.5s ease-in-out;
      }
      
      .word-translation-panel .cursor {
        color: #1890ff;
        font-weight: bold;
        animation: blink 1s infinite;
      }
      
      .word-translation-panel .stream-status {
        color: #1890ff;
        font-size: 11px;
        font-style: italic;
        text-align: right;
        margin-top: 4px;
        opacity: 0.8;
      }
      
      .word-translation-panel .pronunciation {
        color: #8c8c8c;
        font-size: 12px;
        font-style: italic;
        margin-bottom: 6px;
      }
      
      .word-translation-panel .language-info {
        color: #8c8c8c;
        font-size: 11px;
        text-align: right;
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid #f5f5f5;
      }
      
      .word-translation-panel .error {
        color: #ff4d4f;
        font-size: 12px;
        text-align: center;
        padding: 8px 0;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      @keyframes typing {
        from { opacity: 0.7; }
        to { opacity: 1; }
      }
    `;

    // 添加样式到head
    if (!document.querySelector('#translation-panel-styles')) {
      style.id = 'translation-panel-styles';
      document.head.appendChild(style);
    }

    // 添加到页面
    document.body.appendChild(this.panel);
  }

  private bindEvents() {
    if (!this.panel) return;

    // 移除所有自动隐藏的事件监听器，只保留手动关闭
    // 不再监听鼠标进入/离开事件
    // 不再监听点击外部事件
    // 不再监听滚动事件
    // 只保留ESC键关闭（可选）

    // ESC键隐藏（可选，如果你想保留的话）
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  show(data: TranslationData) {
    if (!this.panel) return;

    this.isVisible = true;
    this.panel.style.display = 'block';

    // 设置初始内容，不显示原文，只有关闭按钮和翻译内容
    this.panel.innerHTML = `
      <div class="translation-header">
        <button class="close-btn" title="关闭">×</button>
      </div>
      <div class="translation-content">
        <div class="loading">翻译中...</div>
      </div>
    `;

    // 绑定关闭按钮事件
    const closeBtn = this.panel.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hide();
      });
    }

    // 设置位置
    this.setPosition(data.position);

    // 取消之前的隐藏计时器
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  hide() {
    if (!this.panel) return;

    this.isVisible = false;
    this.panel.style.display = 'none';

    // 清理所有定时器和状态
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    // 重置状态
    this.isStreaming = false;
    this.streamContent = '';
    this.typewriterQueue = [];
  }

  setLoading(loading: boolean, isStream: boolean = false) {
    if (!this.panel || !this.isVisible) return;

    const contentDiv = this.panel.querySelector('.translation-content');
    if (contentDiv) {
      if (loading) {
        this.isStreaming = isStream;
        this.streamContent = '';
        const loadingText = isStream ? 'AI翻译中...' : '翻译中...';
        contentDiv.innerHTML = `<div class="loading">${loadingText}</div>`;
      }
    }
  }

  // 流式更新翻译内容 - 打字机效果
  appendStreamContent(chunk: string) {
    console.log('[TranslationPanel] 追加流式内容:', chunk);

    if (!this.panel || !this.isVisible) {
      console.warn('[TranslationPanel] 面板不可见，忽略流式内容');
      return;
    }

    // 如果还没开始流式，先初始化
    if (!this.isStreaming) {
      console.log('[TranslationPanel] 开始流式显示');
      this.isStreaming = true;
      this.streamContent = '';
      this.typewriterQueue = [];

      // 初始化显示区域
      const contentDiv = this.panel.querySelector('.translation-content');
      if (contentDiv) {
        contentDiv.innerHTML = `
          <div class="translated-text streaming"><span class="cursor">|</span></div>
        `;
      }
    }

    // 将新内容按字符分割并添加到打字机队列
    const characters = Array.from(chunk); // 支持Unicode字符
    this.typewriterQueue.push(...characters);

    // 如果打字机没有在运行，启动它
    if (!this.typewriterTimer) {
      this.startTypewriter();
    }
  }

  // 启动打字机效果
  private startTypewriter() {
    if (!this.panel || !this.isVisible) return;

    this.typewriterTimer = window.setInterval(() => {
      if (this.typewriterQueue.length === 0) {
        // 队列为空，暂停打字机但不停止（可能还有更多内容）
        if (this.typewriterTimer) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
        }
        return;
      }

      // 取出一个字符并显示
      const char = this.typewriterQueue.shift();
      if (char) {
        this.streamContent += char;
        this.updateStreamDisplay();
      }
    }, 50); // 每50ms显示一个字符，可以调整速度
  }

  // 更新流式显示
  private updateStreamDisplay() {
    if (!this.panel || !this.isVisible) return;

    const contentDiv = this.panel.querySelector('.translation-content');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="translated-text streaming">${this.escapeHtml(this.streamContent)}<span class="cursor">|</span></div>
      `;
    }

    // 重新调整位置
    this.adjustPosition();
  }

  // 完成流式翻译
  finishStream(result: TranslationResult) {
    console.log('[TranslationPanel] 完成流式翻译:', result);

    if (!this.panel || !this.isVisible) return;

    // 等待打字机效果完成
    const waitForTypewriter = () => {
      if (this.typewriterQueue.length > 0) {
        // 还有字符在队列中，等待100ms后再检查
        setTimeout(waitForTypewriter, 100);
        return;
      }

      // 打字机效果完成，停止定时器
      if (this.typewriterTimer) {
        clearInterval(this.typewriterTimer);
        this.typewriterTimer = null;
      }

      this.isStreaming = false;

      // 显示最终结果，移除光标
      const contentDiv = this.panel?.querySelector('.translation-content');
      if (contentDiv) {
        contentDiv.innerHTML = `
          <div class="translated-text">${this.escapeHtml(result.translatedText)}</div>
        `;
      }

      // 重新调整位置
      this.adjustPosition();

      // 不再自动隐藏，只能手动关闭
    };

    waitForTypewriter();
  }

  setTranslation(result: TranslationResult) {
    if (!this.panel || !this.isVisible) return;

    const contentDiv = this.panel.querySelector('.translation-content');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="translated-text">${this.escapeHtml(result.translatedText)}</div>
      `;
    }

    // 重新调整位置
    this.adjustPosition();

    // 不再自动隐藏，只能手动关闭
  }

  setError(error: string) {
    if (!this.panel || !this.isVisible) return;

    const contentDiv = this.panel.querySelector('.translation-content');
    if (contentDiv) {
      contentDiv.innerHTML = `<div class="error">❌ ${this.escapeHtml(error)}</div>`;
    }

    // 错误信息也不自动隐藏，只能手动关闭
  }

  private setPosition(position: { x: number; y: number }) {
    if (!this.panel) return;

    const panelRect = this.panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y - panelRect.height - 10;

    // 水平边界检查
    if (x + panelRect.width > viewportWidth - 10) {
      x = viewportWidth - panelRect.width - 10;
    }
    if (x < 10) {
      x = 10;
    }

    // 垂直边界检查
    if (y < 10) {
      y = position.y + 20; // 显示在选择文本下方
    }

    this.panel.style.left = `${x}px`;
    this.panel.style.top = `${y}px`;
  }

  private adjustPosition() {
    if (!this.panel) return;

    const rect = this.panel.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let needsAdjustment = false;
    let newLeft = rect.left;
    let newTop = rect.top;

    // 检查是否超出右边界
    if (rect.right > viewportWidth - 10) {
      newLeft = viewportWidth - rect.width - 10;
      needsAdjustment = true;
    }

    // 检查是否超出下边界
    if (rect.bottom > viewportHeight - 10) {
      newTop = viewportHeight - rect.height - 10;
      needsAdjustment = true;
    }

    if (needsAdjustment) {
      this.panel.style.left = `${Math.max(10, newLeft)}px`;
      this.panel.style.top = `${Math.max(10, newTop)}px`;
    }
  }

  // 移除自动隐藏功能，只能手动关闭

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}