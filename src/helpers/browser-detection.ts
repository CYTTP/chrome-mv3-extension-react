// 浏览器检测和API兼容性工具

export interface BrowserInfo {
  isFirefox: boolean;
  isChrome: boolean;
  browserAPI: any;
  manifestVersion: number;
}

/**
 * 检测当前浏览器类型并返回相应的API
 */
export function detectBrowser(): BrowserInfo {
  const isFirefox = typeof browser !== 'undefined';
  const isChrome = typeof chrome !== 'undefined' && !isFirefox;
  
  return {
    isFirefox,
    isChrome,
    browserAPI: isFirefox ? browser : chrome,
    manifestVersion: isFirefox ? 2 : 3
  };
}

/**
 * 跨浏览器的存储API
 */
export class CrossBrowserStorage {
  private browserAPI: any;
  
  constructor() {
    this.browserAPI = detectBrowser().browserAPI;
  }
  
  async get(keys?: string | string[] | object): Promise<any> {
    return new Promise((resolve, reject) => {
      this.browserAPI.storage.sync.get(keys, (result: any) => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  async set(items: object): Promise<void> {
    return new Promise((resolve, reject) => {
      this.browserAPI.storage.sync.set(items, () => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
  
  async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.browserAPI.storage.sync.remove(keys, () => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * 跨浏览器的标签页API
 */
export class CrossBrowserTabs {
  private browserAPI: any;
  
  constructor() {
    this.browserAPI = detectBrowser().browserAPI;
  }
  
  async query(queryInfo: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.browserAPI.tabs.query(queryInfo, (tabs: any[]) => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });
  }
  
  async create(createProperties: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.browserAPI.tabs.create(createProperties, (tab: any) => {
        if (this.browserAPI.runtime.lastError) {
          reject(this.browserAPI.runtime.lastError);
        } else {
          resolve(tab);
        }
      });
    });
  }
}