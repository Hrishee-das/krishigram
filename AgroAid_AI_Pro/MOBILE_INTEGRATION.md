# React Native Integration Guide for AgroAid AI Pro

This document explains how to natively connect a React Native / Expo mobile application to the `/api/analyze` unified Multimodal AI endpoint.

## 📱 Mobile Architecture & Latency
**Is this model suitable for mobile integration?**
Yes! However, running a massive TensorFlow model, Langchain, and Pinecone RAG entirely *on-device* would bloat your app to 1GB+ and destroy battery life.
Instead, we process **Inference on the Server** using the FastAPI backend we just built. The mobile app acts purely as a lightweight UI client (Thin Client logic).

**How to reduce upload latency?**
Raw 12MP camera images are 5MB-10MB. Uploading this over a 3G/4G farm network will lag out. 
You **must** use an image compressor (like `expo-image-manipulator` or `react-native-image-resizer`) on the mobile side to resize the image to `500x500` and compress it to `<200KB` *before* sending the payload to our API.

---

## 💻 React Native Implementation

The backend accepts `multipart/form-data`. Here is a complete function to upload voice, image, and text concurrently using `fetch`.

### 1. The API Call

```javascript
// Function to hit the AgroAid AI Pro Backend
export const analyzeContent = async (imageUri, audioUri, textMessage, language = "English") => {
  try {
      const formData = new FormData();

      // 1. Attach Compressed Image (Optional)
      if (imageUri) {
          formData.append('image', {
              uri: imageUri,
              type: 'image/jpeg',
              name: 'plant.jpg',
          });
      }

      // 2. Attach Voice Recording (Optional)
      if (audioUri) {
          formData.append('voice', {
              uri: audioUri,
              type: 'audio/webm', // Or audio/wav depending on your recorder
              name: 'voice.webm',
          });
      }

      // 3. Attach Text & Language (Optional)
      if (textMessage) formData.append('text', textMessage);
      formData.append('language', language);

      // 4. Fire the Request
      const response = await fetch('https://your-backend-url.onrender.com/api/analyze', {
          method: 'POST',
          body: formData,
          headers: {
              'Content-Type': 'multipart/form-data',
          },
      });

      const data = await response.json();
      
      // Handle Image Quality Rejections
      if (!response.ok) {
          console.error("Validation Error:", data.error);
          return null;
      }

      console.log("AI Answer:", data.analysis.response);
      return data;
      
  } catch (error) {
      console.error("API Fetch Error:", error);
  }
};
```

### 2. State & UI Component (Snippet)

```javascript
import React, { useState } from 'react';
import { View, Button, Text, Image } from 'react-native';

export default function AgroAidChat() {
    const [aiResponse, setAiResponse] = useState("");
    const [imageUri, setImageUri] = useState(null);

    const handleDiagnosis = async () => {
        // Assume you used Expo Camera to get an imageUri
        const data = await analyzeContent(
            imageUri, 
            null, 
            "What should I do about this?", 
            "Hindi"
        );
        
        if (data && data.success) {
            // It parses the JSON unified response automatically!
            setAiResponse(data.analysis.response || data.analysis.disease_name);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
            <Button title="Analyze Plant" onPress={handleDiagnosis} />
            <Text>AI: {aiResponse}</Text>
        </View>
    );
}
```

## 🔄 The Data Flow
1. **User takes picture/records audio** inside React Native.
2. App compresses the payload and `POST`s it to `/api/analyze`.
3. Backend **Validates** the image (Rejecting blurry/finger photos).
4. Backend **Transcribes** the audio to text via SpeechRecognition.
5. Backend pulls RAG context regarding the image diagnosis + transcribed text.
6. Backend generates JSON advisory and auto-translates to Hindi/Tamil/etc.
7. Mobile app receives the unified parsed JSON in < 3 seconds.
