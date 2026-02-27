import { create } from "zustand";

export const useChatStore = create((set) => ({
  chatHistory: [],
  addMessage: (message) =>
    set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  clearHistory: () => set({ chatHistory: [] }),
}));
