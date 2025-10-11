// 消息通信处理器
interface BrowserAPI {
  runtime: {
    sendMessage: (message: Record<string, unknown>, callback: (response: unknown) => void) => void;
    onMessage: {
      addListener: (callback: (message: Record<string, unknown>, sender: unknown, sendResponse: (response?: unknown) => void) => void) => void;
    };
    lastError?: { message: string };
  };
  storage: {
    sync: {
      get: (keys: string | string[] | null | undefined, callback: (result: Record<string, unknown>) => void) => void;
      set: (data: Record<string, unknown>, callback: () => void) => void;
    };
  };
}

export class MessageHandler {
  private browserAPI: BrowserAPI;

  constructor(browserAPI: BrowserAPI) {
    this.browserAPI = browserAPI;
  }

  // 发送消息到背景脚本
  sendMessage(message: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.browserAPI.runtime.sendMessage(message, (response: unknown) => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  // 监听来自背景脚本的消息
  onMessage(callback: (message: Record<string, unknown>, sender: unknown, sendResponse: (response?: unknown) => void) => void) {
    this.browserAPI.runtime.onMessage.addListener(callback);
  }

  // 获取存储的设置
  async getStorageData(keys?: string | string[] | null): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      this.browserAPI.storage.sync.get(keys, (result: Record<string, unknown>) => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }

  // 保存设置到存储
  async setStorageData(data: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.browserAPI.storage.sync.set(data, () => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}