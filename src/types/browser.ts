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

export interface BrowserAPI {
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