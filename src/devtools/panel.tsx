import '../assets/styles.css';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

export const DevToolsPanel = () => {
  const [tabId] = useState(chrome.devtools.inspectedWindow.tabId);
  const [pageUrl, setPageUrl] = useState<string>('-');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    chrome.devtools.inspectedWindow.eval(
      'window.location.href',
      (result, isException) => {
        if (!isException) {
          setPageUrl(result as unknown as string);
        }
      }
    );

    addLog('DevTools 面板已加载');
    addLog(`正在检查标签页 ${tabId}`);
  }, [tabId]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
  };

  const handleReload = () => {
    chrome.devtools.inspectedWindow.reload();
    addLog('页面已重新加载');
  };

  const handleEval = () => {
    chrome.devtools.inspectedWindow.eval(
      'console.log("来自 DevTools 面板的消息"); document.title',
      (result, isException) => {
        if (isException) {
          addLog(`错误: ${JSON.stringify(result)}`);
        } else {
          addLog(`页面标题: ${result}`);
        }
      }
    );
  };

  const handleClear = () => {
    setLogs(['日志已清空']);
  };

  return (
    <div className="flex flex-col h-screen bg-white">

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gray-50 rounded-lg p-5 mb-4 border border-gray-200">
          <h2 className="text-base font-semibold text-purple-600 mb-3">页面信息</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-600">标签页 ID:</span>
              <span className="font-mono text-gray-900">{tabId}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-600">页面 URL:</span>
              <span className="font-mono text-gray-900 text-sm truncate max-w-md">{pageUrl}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 mb-4 border border-gray-200">
          <h2 className="text-base font-semibold text-purple-600 mb-3">操作</h2>
          <div className="flex gap-2">
            <button
              onClick={handleReload}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
            >
              重新加载页面
            </button>
            <button
              onClick={handleEval}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
            >
              执行脚本
            </button>
            <button
              onClick={handleClear}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors"
            >
              清空日志
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <h2 className="text-base font-semibold text-purple-600 mb-3">控制台日志</h2>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-md font-mono text-xs max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="border-b border-gray-700 py-1">等待日志...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-b border-gray-700 py-1 last:border-b-0">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('app-container')!).render(<DevToolsPanel />);
