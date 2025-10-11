// GLM AI 翻译服务
export interface GLMTranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  pronunciation?: string;
}

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMRequest {
  model: string;
  messages: GLMMessage[];
  temperature?: number;
  stream?: boolean;
}

export interface GLMStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export class GLMTranslationService {
  private readonly API_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'glm-4.6') {
    this.apiKey = apiKey;
    this.model = model;
  }

  // 更新API密钥
  updateApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 更新模型
  updateModel(model: string) {
    this.model = model;
  }

  // 流式翻译
  async translateStream(
    text: string,
    sourceLang: string = 'auto',
    targetLang: string = 'zh-CN',
    onProgress?: (chunk: string) => void
  ): Promise<GLMTranslationResult> {
    console.log(`[GLMService] 开始翻译 - 文本: "${text}", 源语言: ${sourceLang}, 目标语言: ${targetLang}`);
    
    if (!this.apiKey) {
      console.error('[GLMService] API密钥未设置');
      throw new Error('GLM API密钥未设置');
    }

    console.log(`[GLMService] 使用模型: ${this.model}, API密钥: ${this.apiKey.substring(0, 10)}...`);

    const systemPrompt = this.buildSystemPrompt(sourceLang, targetLang);
    const userPrompt = `${text}`;

    const requestBody: GLMRequest = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      stream: true
    };

    console.log('[GLMService] 请求体:', JSON.stringify(requestBody, null, 2));

    try {
      console.log(`[GLMService] 发送请求到: ${this.API_ENDPOINT}`);
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`[GLMService] 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[GLMService] API错误响应:', errorData);
        throw new Error(`GLM API错误 ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let translatedText = '';
      const decoder = new TextDecoder();
      let chunkCount = 0;

      console.log('[GLMService] 开始读取流式响应');

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[GLMService] 流式响应读取完成');
            break;
          }

          chunkCount++;
          const chunk = decoder.decode(value, { stream: true });
          console.log(`[GLMService] 收到数据块 ${chunkCount}:`, chunk);

          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                console.log('[GLMService] 收到结束标记');
                break;
              }

              try {
                const parsed: GLMStreamResponse = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  console.log(`[GLMService] 收到内容:`, content);
                  translatedText += content;
                  // 立即调用进度回调
                  if (onProgress) {
                    try {
                      onProgress(content);
                    } catch (callbackError) {
                      console.warn('[GLMService] 进度回调执行失败:', callbackError);
                    }
                  }
                }
              } catch (parseError) {
                console.warn('[GLMService] 解析GLM响应失败:', parseError, '原始数据:', data);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      console.log(`[GLMService] 最终翻译结果: "${translatedText}"`);

      if (!translatedText.trim()) {
        console.error('[GLMService] GLM返回空翻译结果');
        throw new Error('GLM返回空翻译结果');
      }

      const result = {
        originalText: text,
        translatedText: translatedText.trim(),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang
      };

      console.log('[GLMService] 翻译成功完成:', result);
      return result;

    } catch (error) {
      console.error('GLM翻译失败:', error);
      throw error instanceof Error ? error : new Error('GLM翻译服务异常');
    }
  }

  // 非流式翻译（兼容性）
  async translate(
    text: string,
    sourceLang: string = 'auto',
    targetLang: string = 'zh-CN'
  ): Promise<GLMTranslationResult> {
    return this.translateStream(text, sourceLang, targetLang);
  }

  // 构建系统提示词
  private buildSystemPrompt(sourceLang: string, targetLang: string): string {
    const langMap: Record<string, string> = {
      'auto': '自动检测',
      'zh-CN': '中文(简体)',
      'zh-TW': '中文(繁体)',
      'en': '英语',
      'ja': '日语',
      'ko': '韩语',
      'fr': '法语',
      'de': '德语',
      'es': '西班牙语',
      'ru': '俄语',
      'ar': '阿拉伯语',
      'pt': '葡萄牙语',
      'it': '意大利语',
      'th': '泰语',
      'vi': '越南语'
    };

    const sourceLanguage = langMap[sourceLang] || sourceLang;
    const targetLanguage = langMap[targetLang] || targetLang;

    return `你是一个专业的翻译助手。你的任务是将用户提供的文本翻译成${targetLanguage}。请严格遵循以下要求：

- 保持原文的意思、语调和风格。
- 译文必须自然、流畅，符合${targetLanguage}的表达习惯。
- 专业术语需准确翻译。
- **最重要的一点：除了翻译结果之外，不要输出任何其他文字、说明或格式。**
- 如果原文本身就是${targetLanguage}，则将其翻译成英语。

**请只输出翻译后的文本。**

示例：
输入：今天天气真好。
输出：The weather is so nice today.`;
  }

  // 检测语言
  async detectLanguage(text: string): Promise<string> {
    // 简单的语言检测逻辑
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

  // 获取支持的模型列表
  getSupportedModels(): Array<{ code: string; name: string }> {
    return [
      { code: 'glm-4.6', name: 'GLM-4.6' },
      { code: 'glm-4', name: 'GLM-4' },
      { code: 'glm-4-flash', name: 'GLM-4-Flash' }
    ];
  }

  // 验证API密钥
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const testRequest: GLMRequest = {
        model: this.model,
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        temperature: 0.1,
        stream: false
      };

      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(testRequest)
      });

      return response.ok;
    } catch (error) {
      console.error('验证GLM API密钥失败:', error);
      return false;
    }
  }
}