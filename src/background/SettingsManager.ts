// 设置管理器
export interface ExtensionSettings {
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

interface SettingsBrowserAPI {
  tabs: {
    query: (queryInfo: Record<string, unknown>) => Promise<Array<{ id?: number }>>;
    sendMessage: (tabId: number, message: Record<string, unknown>) => Promise<void>;
  };
  storage: {
    sync: {
      get: (keys: string | string[] | null | undefined, callback: (result: Record<string, unknown>) => void) => void;
      set: (data: Record<string, unknown>, callback: () => void) => void;
    };
  };
  runtime: {
    lastError?: { message: string };
  };
}

export class SettingsManager {
  private browserAPI: SettingsBrowserAPI;
  private defaultSettings: ExtensionSettings = {
    enabled: true,
    sourceLanguage: 'auto',
    targetLanguage: 'en', // 默认目标语言改为英语
    showPronunciation: true,
    autoHideDelay: 5000,
    enableKeyboardShortcut: true,
    enableContextMenu: true,
    minSelectionLength: 1,
    maxSelectionLength: 500,
    translationService: 'google',
    glmApiKey: '',
    glmModel: 'glm-4.6'
  };

  constructor(browserAPI: SettingsBrowserAPI) {
    this.browserAPI = browserAPI;
  }

  // 初始化默认设置
  async initDefaultSettings(): Promise<void> {
    try {
      const existingSettings = await this.getStorageData('settings');
      if (!existingSettings.settings) {
        await this.setStorageData({ settings: this.defaultSettings });
        console.log('已初始化默认设置');
      }
    } catch (error) {
      console.error('初始化设置失败:', error);
    }
  }

  // 获取设置
  async getSettings(): Promise<ExtensionSettings> {
    try {
      const result = await this.getStorageData('settings');
      const settings = result.settings as Partial<ExtensionSettings> | undefined;
      return { ...this.defaultSettings, ...(settings || {}) };
    } catch (error) {
      console.error('获取设置失败:', error);
      return this.defaultSettings;
    }
  }

  // 更新设置
  async updateSettings(newSettings: Partial<ExtensionSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await this.setStorageData({ settings: updatedSettings });
      
      // 通知所有标签页设置已更新
      this.notifySettingsChange(updatedSettings);
    } catch (error) {
      console.error('更新设置失败:', error);
      throw error;
    }
  }

  // 重置为默认设置
  async resetSettings(): Promise<void> {
    try {
      await this.setStorageData({ settings: this.defaultSettings });
      this.notifySettingsChange(this.defaultSettings);
    } catch (error) {
      console.error('重置设置失败:', error);
      throw error;
    }
  }

  // 获取特定设置项
  async getSetting<K extends keyof ExtensionSettings>(key: K): Promise<ExtensionSettings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  // 更新特定设置项
  async updateSetting<K extends keyof ExtensionSettings>(
    key: K, 
    value: ExtensionSettings[K]
  ): Promise<void> {
    await this.updateSettings({ [key]: value } as Partial<ExtensionSettings>);
  }

  // 通知所有标签页设置变更
  private async notifySettingsChange(settings: ExtensionSettings): Promise<void> {
    try {
      const tabs = await this.browserAPI.tabs.query({});
      const message = {
        type: 'SETTINGS_UPDATED',
        settings: settings
      };

      for (const tab of tabs) {
        try {
          if (tab.id) {
            await this.browserAPI.tabs.sendMessage(tab.id, message);
          }
        } catch (error) {
          // 忽略无法发送消息的标签页（如chrome://页面）
        }
      }
    } catch (error) {
      console.error('通知设置变更失败:', error);
    }
  }

  // 存储数据
  private async getStorageData(keys?: string | string[] | null): Promise<Record<string, unknown>> {
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

  // 获取存储数据
  private async setStorageData(data: Record<string, unknown>): Promise<void> {
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

  // 导出设置
  async exportSettings(): Promise<string> {
    const settings = await this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  // 导入设置
  async importSettings(settingsJson: string): Promise<void> {
    try {
      const settings = JSON.parse(settingsJson);
      
      // 验证设置格式
      if (this.validateSettings(settings)) {
        await this.updateSettings(settings);
      } else {
        throw new Error('设置格式无效');
      }
    } catch (error) {
      console.error('导入设置失败:', error);
      throw new Error('导入设置失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  // 验证设置格式
  private validateSettings(settings: unknown): boolean {
    if (typeof settings !== 'object' || settings === null) {
      return false;
    }

    // 检查必要的字段
    const requiredFields: (keyof ExtensionSettings)[] = [
      'enabled', 'sourceLanguage', 'targetLanguage'
    ];

    for (const field of requiredFields) {
      if (!(field in settings)) {
        return false;
      }
    }

    return true;
  }
}