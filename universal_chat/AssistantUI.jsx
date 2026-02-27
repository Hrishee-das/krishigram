import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Easing, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Voice from '@react-native-voice/voice';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

// API ENDPOINT - Change this to your deployed Node.js backend URL
const BACKEND_URL = "http://YOUR_LOCAL_IP:3000/api/v1/aichat/analyze";

export default function AssistantUI({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [aiResponseText, setAiResponseText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sound, setSound] = useState(null);

  // Animation values
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Setup React Native Voice events
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = (e) => setSpokenText(e.value[0]);
    Voice.onSpeechError = (e) => {
        console.log("Voice Error", e);
        setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isListening) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startListening = async () => {
    try {
      setSpokenText("");
      setAiResponseText("");
      if (sound) await sound.unloadAsync();
      
      // Request permissions (Ensure you have requested RECORD_AUDIO permissions in app.json)
      await Voice.start('mr-IN'); // Set to Marathi (mr-IN), Hindi (hi-IN), or English (en-IN)
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      if (spokenText) {
          sendToBackend(spokenText);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendToBackend = async (query) => {
      setIsProcessing(true);
      try {
          // You must pass 'language' for your Python backend translator and TTS
          const response = await axios.post(BACKEND_URL, {
              text: query,
              language: "Marathi" // Change dynamically based on user setting
          });
          
          const responseData = response.data;
          
          // Show the text response from the AI
          if (responseData.data && responseData.data.message) {
              setAiResponseText(responseData.data.message.aiResponse);
          }
          
          // Play the Audio
          if (responseData.data && responseData.data.pythonRaw && responseData.data.pythonRaw.audio_base64) {
              await playBase64Audio(responseData.data.pythonRaw.audio_base64);
          }

      } catch (error) {
          console.error("Backend Error: ", error);
          setAiResponseText("Sorry, I could not connect to the server.");
      } finally {
          setIsProcessing(false);
      }
  };

  const playBase64Audio = async (base64String) => {
    try {
      const audioUri = `${FileSystem.cacheDirectory}assistant_audio.mp3`;
      await FileSystem.writeAsStringAsync(audioUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.log('Error playing audio', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header / Close Button */}
      <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={32} color="#fff" />
          </TouchableOpacity>
      </View>

      {/* Main Chat / Text Area */}
      <View style={styles.chatArea}>
         {spokenText !== "" && (
             <View style={styles.userBubble}>
                 <Text style={styles.userText}>"{spokenText}"</Text>
             </View>
         )}

         {isProcessing && (
             <View style={styles.processingContainer}>
                 <ActivityIndicator size="large" color="#00E676" />
                 <Text style={styles.processingText}>Thinking deeply about Konkan agriculture...</Text>
             </View>
         )}

         {aiResponseText !== "" && !isProcessing && (
             <View style={styles.aiBubble}>
                 <Text style={styles.aiText}>{aiResponseText}</Text>
             </View>
         )}
      </View>

      {/* Microphone / Bottom Area */}
      <View style={styles.bottomArea}>
          <Text style={styles.helperText}>
              {isListening ? "Listening..." : "Tap the mic to speak in Marathi"}
          </Text>

          <TouchableOpacity 
             onPressIn={startListening} 
             onPressOut={stopListening}
             activeOpacity={0.8}>
             <Animated.View style={[
                 styles.micButtonContainer,
                 { transform: [{ scale: pulseAnim }],
                   backgroundColor: isListening ? "rgba(0, 230, 118, 0.4)" : "transparent"
                 }
              ]}>
                 <View style={styles.micButton}>
                    <Ionicons name="mic" size={40} color="#fff" />
                 </View>
             </Animated.View>
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  closeButton: {
      padding: 10,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: '#333',
      padding: 15,
      borderRadius: 20,
      marginBottom: 20,
      maxWidth: '80%',
  },
  userText: {
      color: '#fff',
      fontSize: 18,
      fontStyle: 'italic',
  },
  aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: 'transparent',
      padding: 15,
      marginBottom: 20,
  },
  aiText: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '500',
      lineHeight: 32,
  },
  processingContainer: {
      alignItems: 'center',
      marginTop: 20,
  },
  processingText: {
      color: '#00E676',
      marginTop: 10,
      fontSize: 16,
  },
  bottomArea: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  helperText: {
      color: '#aaa',
      fontSize: 16,
      marginBottom: 20,
  },
  micButtonContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
  },
  micButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#00E676',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#00E676',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 10,
  }
});


// import AssistantUI from './components/AssistantUI';

// // Inside your main render:
// {showAssistant && (
//    <Modal visible={true} animationType="slide" transparent={true}>
//        <AssistantUI onClose={() => setShowAssistant(false)} />
//    </Modal>
// )}
