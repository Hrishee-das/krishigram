import * as SecureStore from 'expo-secure-store';

/**
 * Drop-in polyfill for AsyncStorage using Expo's SecureStore.
 * This fixes the "Native module is null" error in SDK 54 while 
 * preserving the exact same interface for the rest of the app.
 */
const AsyncStoragePolyfill = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error("Storage error:", e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      // SecureStore only accepts strings
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error("Storage error:", e);
    }
  },
  clear: async () => {
    // Note: SecureStore doesn't have a direct 'clear all' but for small apps this is fine.
    console.warn("AsyncStorage.clear() called on SecureStore polyfill (not fully implemented)");
  }
};

export default AsyncStoragePolyfill;
