import { useMutation } from '@tanstack/react-query';

// Generic local IPs for Android emulator
import { IP_ADDRESS } from '../constants/ip';

const UNIVERSAL_AI_URL = `http://${IP_ADDRESS}:8001`;
const AGRO_AI_URL = `http://${IP_ADDRESS}:10000`;

// A general fetcher with timeout
const fetchWithTimeout = async (url, options, timeout = 60000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
};

export const useUniversalChat = () => {
  return useMutation({
    mutationFn: async ({ text, language }) => {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('language', language || 'English');

      const response = await fetchWithTimeout(`${UNIVERSAL_AI_URL}/api/universal_chat`, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Universal AI');
      }
      return response.json();
    },
  });
};

export const usePlantDetection = () => {
    return useMutation({
        mutationFn: async ({ imageUri }) => {
            const formData = new FormData();
            
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('file', {
                uri: imageUri,
                name: filename,
                type,
            });

            const response = await fetchWithTimeout(`${AGRO_AI_URL}/diagnose_image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });

            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error("Server returned an invalid response. Please try again later.");
            }

            if (!response.ok) {
                const errorMsg = data.report?.error || data.message || data.error || 'Failed to diagnose image';
                throw new Error(errorMsg);
            }
            return data;
        }
    })
};

export const useAgroChat = () => {
    return useMutation({
      mutationFn: async ({ query, language }) => {
        const formData = new FormData();
        formData.append('query', query);
        formData.append('language', language || 'English');
  
        const response = await fetchWithTimeout(`${AGRO_AI_URL}/chat_query`, {
          method: 'POST',
          body: formData,
          headers: {
              'Accept': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch from Agro AI');
        }
        return response.json();
      },
    });
};
