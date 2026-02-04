// 状态管理示例 - 使用 Zustand
import { create } from 'zustand';

interface AppState {
  count: number;
  isLoading: boolean;
  increment: () => void;
  decrement: () => void;
  setLoading: (loading: boolean) => void;
}

// 创建store
export const useAppStore = create<AppState>((set) => ({
  count: 0,
  isLoading: false,
  
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setLoading: (loading) => set({ isLoading: loading })
}));
