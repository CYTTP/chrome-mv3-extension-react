import { useState, useEffect, useCallback } from 'react';
import { logDebug, logInfo, logError } from '@/helpers/logger';

/**
 * Chrome Storage Hook
 * 用于在 React 组件中方便地使用 Chrome Storage API
 * 
 * @param key - Storage 键名
 * @param initialValue - 初始值
 * @param storageArea - 存储区域，默认为 'local'，可选 'sync' 或 'session'
 * 
 * @example
 * ```tsx
 * const [name, setName] = useChromeStorage('userName', 'Guest');
 * const [settings, setSettings] = useChromeStorage('settings', { theme: 'light' }, 'sync');
 * ```
 */
export function useChromeStorage<T>(
  key: string,
  initialValue: T,
  storageArea: 'local' | 'sync' | 'session' = 'local'
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 从 Chrome Storage 读取初始值
  useEffect(() => {
    const loadStoredValue = async () => {
      logDebug(`[Storage] Loading "${key}" from ${storageArea}`);
      
      try {
        const storage = chrome.storage[storageArea];
        const result = await storage.get(key);
        
        if (result[key] !== undefined) {
          setStoredValue(result[key] as T);
          logInfo(`[Storage] Loaded "${key}":`, result[key]);
        } else {
          logDebug(`[Storage] "${key}" not found, using initial value`);
        }
      } catch (error) {
        logError(`[Storage] Failed to load "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key, storageArea]);

  // 监听 Storage 变化
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === storageArea && changes[key]) {
        logDebug(`[Storage] "${key}" changed:`, changes[key].newValue);
        setStoredValue(changes[key].newValue as T);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [key, storageArea]);

  // 设置值到 Chrome Storage
  const setValue = useCallback(
    async (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        logDebug(`[Storage] Setting "${key}":`, valueToStore);
        setStoredValue(valueToStore);
        
        const storage = chrome.storage[storageArea];
        await storage.set({ [key]: valueToStore });
        
        logInfo(`[Storage] Saved "${key}"`);
      } catch (error) {
        logError(`[Storage] Failed to save "${key}":`, error);
      }
    },
    [key, storageArea, storedValue]
  );

  return [storedValue, setValue, isLoading];
}

/**
 * 批量读取 Chrome Storage
 * 
 * @param keys - 要读取的键名数组
 * @param storageArea - 存储区域
 * 
 * @example
 * ```tsx
 * const [data, isLoading] = useChromeStorageBatch(['name', 'age', 'email']);
 * ```
 */
export function useChromeStorageBatch(
  keys: string[],
  storageArea: 'local' | 'sync' | 'session' = 'local'
): [Record<string, any>, boolean] {
  const [data, setData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // 将 keys 转换为字符串用于依赖比较
  const keysString = keys.join(',');

  useEffect(() => {
    const loadData = async () => {
      logDebug(`[Storage] Batch loading from ${storageArea}:`, keys);
      
      try {
        const storage = chrome.storage[storageArea];
        const result = await storage.get(keys);
        setData(result);
        logInfo(`[Storage] Batch loaded ${Object.keys(result).length} items`);
      } catch (error) {
        logError(`[Storage] Batch load failed:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [keysString, storageArea]);

  // 监听变化
  useEffect(() => {
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === storageArea) {
        const updatedData: Record<string, any> = {};
        let hasChanges = false;

        for (const key of keys) {
          if (changes[key]) {
            updatedData[key] = changes[key].newValue;
            hasChanges = true;
          }
        }

        if (hasChanges) {
          logDebug('[Storage] Batch changed:', updatedData);
          setData((prev) => ({ ...prev, ...updatedData }));
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, [keysString, storageArea]);

  return [data, isLoading];
}

/**
 * 清除 Chrome Storage 中的指定键
 * 
 * @param storageArea - 存储区域
 * 
 * @example
 * ```tsx
 * const removeItem = useChromeStorageRemove();
 * await removeItem('userName');
 * ```
 */
export function useChromeStorageRemove(
  storageArea: 'local' | 'sync' | 'session' = 'local'
) {
  return useCallback(
    async (key: string | string[]) => {
      logDebug(`[Storage] Removing:`, key);
      
      try {
        const storage = chrome.storage[storageArea];
        await storage.remove(key);
        logInfo(`[Storage] Removed:`, key);
      } catch (error) {
        logError(`[Storage] Remove failed:`, error);
      }
    },
    [storageArea]
  );
}

/**
 * 清空整个 Chrome Storage
 * 
 * @param storageArea - 存储区域
 * 
 * @example
 * ```tsx
 * const clearStorage = useChromeStorageClear();
 * await clearStorage();
 * ```
 */
export function useChromeStorageClear(
  storageArea: 'local' | 'sync' | 'session' = 'local'
) {
  return useCallback(async () => {
    logDebug(`[Storage] Clearing ${storageArea}`);
    
    try {
      const storage = chrome.storage[storageArea];
      await storage.clear();
      logInfo(`[Storage] Cleared ${storageArea}`);
    } catch (error) {
      logError(`[Storage] Clear failed:`, error);
    }
  }, [storageArea]);
}
