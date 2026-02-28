import { useUniversalChat } from "@/services/aiQueries";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function UniversalAIScreen() {
  const { chatHistory, addMessage, clearHistory } = useChatStore();
  const [inputText, setInputText] = useState("");
  const { t, i18n } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  
  const { mutate: sendChat, isPending } = useUniversalChat();
  
  // Sync with global i18n language
  const currentLanguageCode = i18n.language || 'en';
  const displayLanguage = currentLanguageCode === 'hi' ? 'Hindi' : currentLanguageCode === 'mr' ? 'Marathi' : 'English';

  const LANGUAGE_MAP = {
    'English': 'en-US',
    'Marathi': 'mr',
    'Hindi': 'hi-IN'
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (chatHistory.length === 0) {
      addMessage({
        id: '1',
        text: t('assistant_welcome'),
        isUser: false,
      });
    }

    // Stop speech when leaving the screen
    return () => {
      Speech.stop();
    };
  }, []);

  const handleSend = (textOverride = null) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim()) return;

    setInputText("");
    const userMessage = { id: Date.now().toString(), text: textToSend.trim(), isUser: true };
    addMessage(userMessage);

    sendChat(
      { text: textToSend.trim(), language: i18n.language }, 
      {
        onSuccess: (data) => {
          let responseText = t("error_occurred");
          
          if (data) {
            const nestedData = data.data || data;
            responseText = nestedData.message?.aiResponse || 
                           nestedData.pythonRaw?.response || 
                           nestedData.response || 
                           t("error_occurred");

            if (responseText.includes("RESOURCE_EXHAUSTED") || responseText.includes("429")) {
                responseText = t("trial_quota_reached");
            }
          }
          
          const botMessage = { id: (Date.now() + 1).toString(), text: responseText, isUser: false };
          addMessage(botMessage);

          // Graceful handling of ExpoSpeech
          try {
            if (data?.tts_friendly) {
              Speech.speak(data.tts_friendly, { 
                language: LANGUAGE_MAP[displayLanguage] || 'en-US' 
              });
            } else if (responseText && typeof responseText === 'string') {
              // Fallback to speaking the response text if tts_friendly missing
              Speech.speak(responseText, { 
                language: LANGUAGE_MAP[displayLanguage] || 'en-US' 
              });
            }
          } catch (e) {
            console.log("Speech module not available");
          }
        },
        onError: (error) => {
          const botMessage = { id: (Date.now() + 1).toString(), text: `Error: ${error.message}`, isUser: false };
          addMessage(botMessage);
        }
      }
    );
  };

  const renderMessage = ({ item }) => {
    const isBot = !item.isUser;
    return (
      <View style={[styles.messageWrapper, { alignSelf: item.isUser ? 'flex-end' : 'flex-start' }]}>
        {isBot && (
          <View style={styles.botIconContainer}>
            <MaterialCommunityIcons name="robot" size={18} color="#FFF" />
          </View>
        )}
        <View style={item.isUser ? styles.userMessage : styles.botMessage}>
          <Text style={[styles.messageText, { color: item.isUser ? '#FFF' : '#333' }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mainPanel, { opacity: fadeAnim }]}>
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>{t('app_name')} AI</Text>
                <Text style={styles.headerStatus}>{t('assistant_status')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => { Speech.stop(); clearHistory(); }} style={styles.clearBtn}>
                  <Ionicons name="sparkles" size={20} color="#60ba8a" />
                </TouchableOpacity>
            </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
            <View style={styles.chipsRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity style={styles.chip} onPress={() => handleSend(t('soil_health'))}>
                        <Text style={styles.chipText}>{t('soil_health')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chip} onPress={() => handleSend(t('summer_crops'))}>
                        <Text style={styles.chipText}>{t('summer_crops')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chip} onPress={() => handleSend(t('rice_pests'))}>
                        <Text style={styles.chipText}>{t('rice_pests')}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.textInput}
                    placeholder={t('ask_anything')}
                    placeholderTextColor="#999"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={() => handleSend()}
                    disabled={!inputText.trim() || isPending}
                >
                    {isPending ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <MaterialCommunityIcons name="arrow-up" size={24} color="#FFF" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  mainPanel: { flex: 1 },
  header: { padding: 20, paddingTop: 60, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1B5E20' },
  headerStatus: { fontSize: 12, color: '#666' },
  clearBtn: { padding: 8 },
  chatList: { padding: 15, paddingBottom: 20 },
  messageWrapper: { marginBottom: 15, flexDirection: 'row', alignItems: 'flex-end', maxWidth: '85%' },
  botIconContainer: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#60ba8a', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  userMessage: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 20, borderBottomRightRadius: 2 },
  botMessage: { backgroundColor: '#F0F2F5', padding: 12, borderRadius: 20, borderBottomLeftRadius: 2 },
  messageText: { fontSize: 16, lineHeight: 22 },
  footer: { padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  chipsRow: { marginBottom: 10 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#E8F5E9', borderRadius: 20, marginRight: 8 },
  chipText: { color: '#2E7D32', fontSize: 13, fontWeight: '600' },
  inputArea: { flexDirection: 'row', alignItems: 'center' },
  textInput: { flex: 1, backgroundColor: '#F0F2F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  sendButtonDisabled: { backgroundColor: '#CCC' }
});