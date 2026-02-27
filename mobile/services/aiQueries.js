import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../utils/authStore';

// Generic local IPs for Android emulator
import { IP_ADDRESS } from '../constants/ip';

const BACKEND_URL = `http://${IP_ADDRESS}:3000/api/v1`;

const fetchWithTimeout = async (url, options, timeout = 60000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

const getBackendLanguage = (lang) => {
  const mapping = {
    'hi': 'Hindi',
    'mr': 'Marathi',
    'en': 'English'
  };
  return mapping[lang] || 'English';
};

export const useUniversalChat = () => {
  return useMutation({
    mutationFn: async ({ text, language, sessionId }) => {
      const formData = new FormData();
      if (text) formData.append('text', text);
      if (sessionId) formData.append('sessionId', sessionId);
      formData.append('language', getBackendLanguage(language));

      const token = useAuthStore.getState().token;

      const response = await fetchWithTimeout(`${BACKEND_URL}/universalchat/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch from Universal AI');
      }
      return data;
    },
  });
};

export const usePlantDetection = () => {
    return useMutation({
        mutationFn: async ({ imageUri, language, sessionId }) => {
            const formData = new FormData();
            formData.append('language', getBackendLanguage(language));
            if (sessionId) formData.append('sessionId', sessionId);
            
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', { // Backend expects "image"
                uri: imageUri,
                name: filename,
                type,
            });

            const token = useAuthStore.getState().token;

            const response = await fetchWithTimeout(`${BACKEND_URL}/aichat/analyze`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errorMsg = data.message || data.error || 'Failed to diagnose image';
                throw new Error(errorMsg);
            }
            return data;
        }
    })
};

export const useAgroChat = () => {
    return useMutation({
      mutationFn: async ({ query, language, sessionId }) => {
        const formData = new FormData();
        formData.append('text', query); // Backend expects "text"
        if (sessionId) formData.append('sessionId', sessionId);
        formData.append('language', getBackendLanguage(language));
  
        const token = useAuthStore.getState().token;
  
        const response = await fetchWithTimeout(`${BACKEND_URL}/aichat/analyze`, {
          method: 'POST',
          body: formData,
          headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
          },
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch from Agro AI');
        }
        return data;
      },
    });
};
