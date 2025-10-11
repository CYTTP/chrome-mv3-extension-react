import { useState, useEffect, useCallback } from 'react';
import { 
  Select, 
  Switch, 
  Slider, 
  Card, 
  Space, 
  Divider, 
  message,
  Typography,
  Row,
  Col,
  Input,
  Button,
  Alert
} from 'antd';
import { 
  TranslationOutlined, 
  SettingOutlined, 
  PoweroffOutlined,
  GlobalOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

// 消息类型定义
interface MessageRequest {
  type: string;
  settings?: Partial<ExtensionSettings>;
  enabled?: boolean;
  apiKey?: string;
}

interface MessageResponse {
  success?: boolean;
  error?: string;
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
import './index.less';

const { Option } = Select;
const { Title, Text } = Typography;

// 检测浏览器类型
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

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

const Pop = () => {
  const { i18n } = useTranslation();
  const [settings, setSettings] = useState<ExtensionSettings>({
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
  });
  const [loading, setLoading] = useState(false);
  const [validatingApiKey, setValidatingApiKey] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  // 支持的语言列表
  const languages = [
    // { code: 'auto', name: '自动检测' },
    { code: 'zh-CN', name: '中文(简体)' },
    { code: 'zh-TW', name: '中文(繁体)' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'ru', name: 'Русский' }
  ];

  // 翻译服务列表
  const translationServices = [
    { code: 'google', name: 'Google翻译' },
    { code: 'glm', name: 'GLM AI翻译' },
    { code: 'backup', name: '备用翻译' }
  ];

  // GLM模型列表
  const glmModels = [
    { code: 'glm-4.6', name: 'GLM-4.6' },
    { code: 'glm-4', name: 'GLM-4' },
    { code: 'glm-4-flash', name: 'GLM-4-Flash' }
  ];

  // 发送消息到背景脚本
  const sendMessage = useCallback((message: MessageRequest): Promise<MessageResponse> => {
    return new Promise((resolve, reject) => {
      const api = browserAPI as any;
      if (typeof api?.runtime?.sendMessage === 'function') {
        api.runtime.sendMessage(message, (response: MessageResponse) => {
          if (api.runtime?.lastError) {
            reject(api.runtime.lastError);
          } else {
            resolve(response || {});
          }
        });
      } else {
        reject(new Error('Browser API not available'));
      }
    });
  }, []);

  // 加载设置
  const loadSettings = useCallback(async () => {
    try {
      const response = await sendMessage({ type: 'GET_SETTINGS' });
      if (response && typeof response === 'object') {
        const newSettings: ExtensionSettings = {
          enabled: response.enabled ?? true,
          sourceLanguage: response.sourceLanguage ?? 'auto',
          targetLanguage: response.targetLanguage ?? 'en', // 默认目标语言改为英语
          showPronunciation: response.showPronunciation ?? true,
          autoHideDelay: response.autoHideDelay ?? 5000,
          enableKeyboardShortcut: response.enableKeyboardShortcut ?? true,
          enableContextMenu: response.enableContextMenu ?? true,
          minSelectionLength: response.minSelectionLength ?? 1,
          maxSelectionLength: response.maxSelectionLength ?? 500,
          translationService: response.translationService ?? 'google',
          glmApiKey: response.glmApiKey ?? '',
          glmModel: response.glmModel ?? 'glm-4.6'
        };
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      message.error('加载设置失败');
    }
  }, [sendMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 更新设置
  const updateSettings = async (newSettings: Partial<ExtensionSettings>) => {
    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: updatedSettings
      });
      setSettings(updatedSettings);
      message.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换插件启用状态
  const toggleExtension = async (enabled: boolean) => {
    await updateSettings({ enabled });
    
    // 通知所有标签页
    try {
      const api = browserAPI as unknown;
      if (typeof api?.tabs?.query === 'function') {
        const tabs = await api.tabs.query({});
        for (const tab of tabs) {
          try {
            if (tab.id && typeof api.tabs.sendMessage === 'function') {
              await api.tabs.sendMessage(tab.id, {
                type: 'TOGGLE_EXTENSION',
                enabled
              });
            }
          } catch (error) {
            // 忽略无法发送消息的标签页
          }
        }
      }
    } catch (error) {
      console.error('通知标签页失败:', error);
    }
  };

  // 切换界面语言
  const handleLanguageChange = (value: string) => i18n.changeLanguage(value);

  // 验证GLM API密钥
  const validateApiKey = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setApiKeyValid(null);
      return;
    }

    setValidatingApiKey(true);
    try {
      const response = await sendMessage({
        type: 'VALIDATE_GLM_API_KEY',
        apiKey: apiKey.trim()
      });
      
      setApiKeyValid(response.valid === true);
      if (response.valid) {
        message.success('API密钥验证成功');
      } else {
        message.error('API密钥验证失败');
      }
    } catch (error) {
      console.error('验证API密钥失败:', error);
      setApiKeyValid(false);
      message.error('验证API密钥时出错');
    } finally {
      setValidatingApiKey(false);
    }
  };

  // 处理API密钥变化
  const handleApiKeyChange = (value: string) => {
    updateSettings({ glmApiKey: value });
    setApiKeyValid(null); // 重置验证状态
  };

  return (
    <div className="translation-popup">
      <div className="popup-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <TranslationOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <Title level={4} style={{ margin: 0 }}>划词翻译</Title>
            </Space>
          </Col>
          <Col>
            <Select
              value={i18n.language}
              style={{ width: 60 }}
              size="small"
              onChange={handleLanguageChange}
            >
              <Option value="en">En</Option>
              <Option value="zh">中</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 主开关 */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <PoweroffOutlined />
              <Text strong>启用翻译</Text>
            </Space>
          </Col>
          <Col>
            <Switch
              checked={settings.enabled}
              onChange={toggleExtension}
              loading={loading}
            />
          </Col>
        </Row>
      </Card>

      {/* 翻译服务设置 */}
      <Card size="small" style={{ marginBottom: 12 }} title={
        <Space>
          <ApiOutlined />
          <span>翻译服务</span>
        </Space>
      }>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col span={8}>
              <Text>翻译引擎:</Text>
            </Col>
            <Col span={16}>
              <Select
                value={settings.translationService}
                style={{ width: '100%' }}
                size="small"
                onChange={(value) => updateSettings({ translationService: value })}
              >
                {translationServices.map(service => (
                  <Option key={service.code} value={service.code}>
                    {service.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {/* GLM配置 */}
          {settings.translationService === 'glm' && (
            <>
              <Row justify="space-between" align="middle">
                <Col span={8}>
                  <Text>GLM模型:</Text>
                </Col>
                <Col span={16}>
                  <Select
                    value={settings.glmModel}
                    style={{ width: '100%' }}
                    size="small"
                    onChange={(value) => updateSettings({ glmModel: value })}
                  >
                    {glmModels.map(model => (
                      <Option key={model.code} value={model.code}>
                        {model.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </Row>

              <div>
                <Text>API密钥:</Text>
                <Input.Password
                  value={settings.glmApiKey}
                  placeholder="请输入GLM API密钥"
                  size="small"
                  style={{ marginTop: 4 }}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  suffix={
                    <Button
                      type="text"
                      size="small"
                      loading={validatingApiKey}
                      icon={
                        validatingApiKey ? <LoadingOutlined /> :
                        apiKeyValid === true ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                        apiKeyValid === false ? <CheckCircleOutlined style={{ color: '#ff4d4f' }} /> :
                        null
                      }
                      onClick={() => validateApiKey(settings.glmApiKey)}
                      disabled={!settings.glmApiKey.trim()}
                    >
                      验证
                    </Button>
                  }
                />
                {settings.translationService === 'glm' && !settings.glmApiKey && (
                  <Alert
                    message="请配置GLM API密钥以使用AI翻译功能"
                    type="warning"
                    style={{ marginTop: 8, fontSize: '12px' }}
                    showIcon
                  />
                )}
              </div>
            </>
          )}
        </Space>
      </Card>

      {/* 语言设置 */}
      <Card size="small" style={{ marginBottom: 12 }} title={
        <Space>
          <GlobalOutlined />
          <span>语言设置</span>
        </Space>
      }>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col span={8}>
              <Text>源语言:</Text>
            </Col>
            <Col span={16}>
              <Select
                value={settings.sourceLanguage}
                style={{ width: '100%' }}
                size="small"
                onChange={(value) => updateSettings({ sourceLanguage: value })}
              >
                {languages.map(lang => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
          
          <Row justify="space-between" align="middle">
            <Col span={8}>
              <Text>目标语言:</Text>
            </Col>
            <Col span={16}>
              <Select
                value={settings.targetLanguage}
                style={{ width: '100%' }}
                size="small"
                onChange={(value) => updateSettings({ targetLanguage: value })}
              >
                {languages.filter(lang => lang.code !== 'auto').map(lang => (
                  <Option key={lang.code} value={lang.code}>
                    {lang.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* 显示设置 */}
      <Card size="small" style={{ marginBottom: 12 }} title={
        <Space>
          <SettingOutlined />
          <span>显示设置</span>
        </Space>
      }>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text>显示发音</Text>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={settings.showPronunciation}
                onChange={(checked) => updateSettings({ showPronunciation: checked })}
              />
            </Col>
          </Row>

          <div>
            <Text>自动隐藏延迟: {settings.autoHideDelay / 1000}秒</Text>
            <Slider
              min={1000}
              max={10000}
              step={1000}
              value={settings.autoHideDelay}
              onChange={(value) => updateSettings({ autoHideDelay: value })}
              tooltip={{ formatter: (value) => `${value! / 1000}秒` }}
            />
          </div>
        </Space>
      </Card>

      {/* 功能设置 */}
      <Card size="small" title="功能设置">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Text>启用快捷键 (Ctrl+Shift+T)</Text>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={settings.enableKeyboardShortcut}
                onChange={(checked) => updateSettings({ enableKeyboardShortcut: checked })}
              />
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Text>启用右键菜单</Text>
            </Col>
            <Col>
              <Switch
                size="small"
                checked={settings.enableContextMenu}
                onChange={(checked) => updateSettings({ enableContextMenu: checked })}
              />
            </Col>
          </Row>
        </Space>
      </Card>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          选中文本即可翻译 | 版本 0.1.0
        </Text>
      </div>
    </div>
  );
};

export default Pop;