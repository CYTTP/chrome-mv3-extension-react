// 翻译相关类型定义

export interface TranslationRequest {
  type: 'TRANSLATE_TEXT';
  text: string;
  source?: string;
  target?: string;
}

export interface TranslationResponse {
  success: boolean;
  translation?: TranslationResult;
  error?: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  pronunciation?: string;
}

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
  translationService: 'google' | 'backup';
}

export interface MessageTypes {
  TRANSLATE_TEXT: TranslationRequest;
  GET_SETTINGS: { type: 'GET_SETTINGS' };
  UPDATE_SETTINGS: { type: 'UPDATE_SETTINGS'; settings: Partial<ExtensionSettings> };
  TOGGLE_EXTENSION: { type: 'TOGGLE_EXTENSION'; enabled: boolean };
  TRANSLATE_SELECTION: { type: 'TRANSLATE_SELECTION'; text?: string };
  SETTINGS_UPDATED: { type: 'SETTINGS_UPDATED'; settings: ExtensionSettings };
  GET_TAB_INFO: { type: 'GET_TAB_INFO' };
}

export interface Language {
  code: string;
  name: string;
}

export interface SelectionData {
  text: string;
  position: {
    x: number;
    y: number;
  };
}

// 浏览器API类型
export interface BrowserAPI {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void) => void;
    };
    lastError?: { message: string };
  };
  storage: {
    sync: {
      get: (keys: string | string[] | null, callback: (result: any) => void) => void;
      set: (data: any, callback?: () => void) => void;
    };
  };
  tabs: {
    query: (queryInfo: any, callback?: (tabs: any[]) => void) => Promise<any[]>;
    sendMessage: (tabId: number, message: any, callback?: (response: any) => void) => void;
  };
  contextMenus?: {
    create: (createProperties: any) => void;
    onClicked: {
      addListener: (callback: (info: any, tab: any) => void) => void;
    };
  };
  commands?: {
    onCommand: {
      addListener: (callback: (command: string) => void) => void;
    };
  };
}