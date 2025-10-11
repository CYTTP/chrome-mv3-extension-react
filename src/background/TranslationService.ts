// 翻译服务
import { GLMTranslationService } from './GLMTranslationService';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  pronunciation?: string;
}

export class TranslationService {
  private glmService: GLMTranslationService;
  private readonly API_ENDPOINTS = {
    // 使用免费的翻译API
    google: 'https://translate.googleapis.com/translate_a/single',
    // 可以添加其他翻译服务
  };

  constructor() {
    this.glmService = new GLMTranslationService('', 'glm-4.6');
  }

  // 更新GLM配置
  updateGLMConfig(apiKey: string, model: string) {
    console.log(`[TranslationService] 更新GLM配置 - 模型: ${model}, API密钥: ${apiKey ? '已设置' : '未设置'}`);
    this.glmService.updateApiKey(apiKey);
    this.glmService.updateModel(model);
  }

  // 流式翻译（支持进度回调）
  async translateStream(
    text: string, 
    sourceLang: string = 'auto', 
    targetLang: string = 'zh-CN',
    service: 'google' | 'glm' | 'backup' = 'google',
    onProgress?: (chunk: string) => void
  ): Promise<TranslationResult> {
    console.log(`[TranslationService] 开始翻译 - 服务: ${service}, 文本: "${text}"`);
    
    try {
      switch (service) {
        case 'glm':
          console.log('[TranslationService] 使用GLM翻译服务');
          const result = await this.glmService.translateStream(text, sourceLang, targetLang, onProgress);
          console.log('[TranslationService] GLM翻译成功:', result);
          return result;
        case 'google':
          console.log('[TranslationService] 使用Google翻译服务');
          return await this.translateWithGoogle(text, sourceLang, targetLang);
        case 'backup':
        default:
          console.log('[TranslationService] 使用备用翻译服务');
          return await this.translateWithBackup(text, sourceLang, targetLang);
      }
    } catch (error) {
      console.error(`[TranslationService] ${service}翻译失败，尝试备用方案:`, error);
      
      // 如果主要服务失败，尝试备用方案
      if (service !== 'backup') {
        return await this.translateWithBackup(text, sourceLang, targetLang);
      }
      throw error;
    }
  }

  async translate(text: string, sourceLang: string = 'auto', targetLang: string = 'zh-CN', service: 'google' | 'glm' | 'backup' = 'google'): Promise<TranslationResult> {
    console.log(`[TranslationService] translate调用 - 服务: ${service}, 文本: "${text}"`);
    return this.translateStream(text, sourceLang, targetLang, service);
  }

  private async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang,
      tl: targetLang,
      dt: 't',
      dj: '1',
      q: text
    });

    const response = await fetch(`${this.API_ENDPOINTS.google}?${params}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.sentences || data.sentences.length === 0) {
      throw new Error('翻译结果为空');
    }

    const translatedText = data.sentences
      .map((sentence: any) => sentence.trans)
      .filter(Boolean)
      .join('');

    return {
      originalText: text,
      translatedText: translatedText || text,
      sourceLanguage: data.src || sourceLang,
      targetLanguage: targetLang,
      pronunciation: data.sentences[0]?.src_translit
    };
  }

  private async translateWithBackup(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
    // 简单的备用翻译逻辑
    // 在实际应用中，这里可以集成其他翻译服务
    
    // 检测是否为中文
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    
    if (isChinese && targetLang === 'en') {
      return {
        originalText: text,
        translatedText: '[备用翻译] ' + text,
        sourceLanguage: 'zh-CN',
        targetLanguage: 'en'
      };
    } else if (!isChinese && targetLang === 'zh-CN') {
      return {
        originalText: text,
        translatedText: '[备用翻译] ' + text,
        sourceLanguage: 'en',
        targetLanguage: 'zh-CN'
      };
    }

    return {
      originalText: text,
      translatedText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang
    };
  }

  // 检测语言
  async detectLanguage(text: string): Promise<string> {
    // 简单的语言检测
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return 'zh-CN';
    } else if (/[а-яё]/i.test(text)) {
      return 'ru';
    } else if (/[ひらがなカタカナ]/.test(text)) {
      return 'ja';
    } else if (/[가-힣]/.test(text)) {
      return 'ko';
    } else {
      return 'en';
    }
  }

  // 获取支持的语言列表
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'auto', name: '自动检测' },
      { code: 'zh-CN', name: '中文(简体)' },
      { code: 'zh-TW', name: '中文(繁体)' },
      { code: 'en', name: 'English' },
      { code: 'ja', name: '日本語' },
      { code: 'ko', name: '한국어' },
      { code: 'fr', name: 'Français' },
      { code: 'de', name: 'Deutsch' },
      { code: 'es', name: 'Español' },
      { code: 'ru', name: 'Русский' },
      { code: 'ar', name: 'العربية' },
      { code: 'pt', name: 'Português' },
      { code: 'it', name: 'Italiano' },
      { code: 'th', name: 'ไทย' },
      { code: 'vi', name: 'Tiếng Việt' }
    ];
  }

  // 获取支持的翻译服务
  getSupportedServices(): { code: string; name: string }[] {
    return [
      { code: 'google', name: 'Google翻译' },
      { code: 'glm', name: 'GLM AI翻译' },
      { code: 'backup', name: '备用翻译' }
    ];
  }

  // 获取GLM支持的模型
  getGLMModels(): { code: string; name: string }[] {
    return this.glmService.getSupportedModels();
  }

  // 验证GLM API密钥
  async validateGLMApiKey(apiKey: string): Promise<boolean> {
    const tempService = new GLMTranslationService(apiKey);
    return await tempService.validateApiKey();
  }
}