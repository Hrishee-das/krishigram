import { useUniversalChat } from "@/services/aiQueries";
import { useChatStore } from "@/store/useChatStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

export default function UniversalAIScreen() {
  const { chatHistory, addMessage, clearHistory } = useChatStore();
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { mutate: sendChat, isPending } = useUniversalChat();

  const LANGUAGE_MAP = {
    English: "en-US",
    Marathi: "mr",
    Hindi: "hi-IN",
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (chatHistory.length === 0) {
      addMessage({
        id: "1",
        text: "Hi there! I am your KrishiGram Assistant. How can I help you grow today?",
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
    const userMessage = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      isUser: true,
    };
    addMessage(userMessage);

    sendChat(
      { text: textToSend.trim(), language: selectedLanguage },
      {
        onSuccess: (data) => {
          let responseText = "I encountered an error.";

          if (data) {
            if (data.response) {
              if (typeof data.response === "string") {
                responseText = data.response;
              } else if (
                data.response.response &&
                typeof data.response.response === "string"
              ) {
                responseText = data.response.response;
              } else if (data.response.error) {
                const errorStr =
                  typeof data.response.error === "string"
                    ? data.response.error
                    : JSON.stringify(data.response.error);

                if (
                  errorStr.includes("RESOURCE_EXHAUSTED") ||
                  errorStr.includes("429")
                ) {
                  responseText =
                    "Trial quota exceeded. Please wait 1 minute and try again.";
                } else {
                  responseText = errorStr;
                }
              } else {
                responseText = JSON.stringify(data.response);
              }
            } else if (data.error) {
              const errorStr =
                typeof data.error === "string"
                  ? data.error
                  : JSON.stringify(data.error);
              if (
                errorStr.includes("RESOURCE_EXHAUSTED") ||
                errorStr.includes("429")
              ) {
                responseText =
                  "Trial quota exceeded. Please wait 1 minute and try again.";
              } else {
                responseText = errorStr;
              }
            }
          }

          const botMessage = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            isUser: false,
          };
          addMessage(botMessage);

          // Graceful handling of ExpoSpeech
          try {
            if (data?.tts_friendly) {
              Speech.speak(data.tts_friendly, {
                language: LANGUAGE_MAP[selectedLanguage] || "en-US",
              });
            } else if (responseText && typeof responseText === "string") {
              // Fallback to speaking the response text if tts_friendly missing
              Speech.speak(responseText, {
                language: LANGUAGE_MAP[selectedLanguage] || "en-US",
              });
            }
          } catch (e) {
            console.log("Speech module not available");
          }
        },
        onError: (error) => {
          const botMessage = {
            id: (Date.now() + 1).toString(),
            text: `Error: ${error.message}`,
            isUser: false,
          };
          addMessage(botMessage);
        },
      },
    );
  };

  const renderMessage = ({ item }) => {
    const isBot = !item.isUser;
    return (
      <View
        style={[
          styles.messageWrapper,
          { alignSelf: item.isUser ? "flex-end" : "flex-start" },
        ]}
      >
        {isBot && (
          <View style={styles.botIconContainer}>
            <MaterialCommunityIcons name="robot" size={18} color="#FFF" />
          </View>
        )}
        <View style={item.isUser ? styles.userMessage : styles.botMessage}>
          <Text
            style={[
              styles.messageText,
              { color: item.isUser ? "#FFF" : "#333" },
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mainPanel, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>KrishiGram AI</Text>
            <Text style={styles.headerStatus}>Online & Ready</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.languageContainer}>
              {["English", "Marathi", "Hindi"].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => {
                    Speech.stop();
                    setSelectedLanguage(lang);
                  }}
                  style={[
                    styles.langBtn,
                    selectedLanguage === lang && styles.langBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.langText,
                      selectedLanguage === lang && styles.langTextActive,
                    ]}
                  >
                    {lang[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => {
                Speech.stop();
                clearHistory();
              }}
              style={styles.clearBtn}
            >
              <Ionicons name="sparkles" size={20} color="#60ba8a" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.chipsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleSend("Tell me about Soil Health")}
              >
                <Text style={styles.chipText}>Soil Health</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleSend("Best crops for summer")}
              >
                <Text style={styles.chipText}>Summer Crops</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => handleSend("Pest control for Rice")}
              >
                <Text style={styles.chipText}>Rice Pests</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <MaterialCommunityIcons
                  name="arrow-up"
                  size={24}
                  color="#FFF"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  mainPanel: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerStatus: {
    fontSize: 12,
    color: "#60ba8a",
    fontWeight: "600",
    marginTop: 2,
  },
  clearBtn: {
    padding: 10,
    backgroundColor: "#F0FAF4",
    borderRadius: 12,
  },
  languageContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F3F4",
    padding: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  langText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  langTextActive: {
    color: "#60ba8a",
  },
  chatList: {
    padding: 20,
    paddingBottom: 40,
  },
  messageWrapper: {
    marginBottom: 20,
    maxWidth: "80%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  botIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#60ba8a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
  },
  userMessage: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderBottomRightRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  botMessage: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
  },
  footer: {
    backgroundColor: "#FFF",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  chipsRow: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  chipText: {
    color: "#444",
    fontSize: 13,
    fontWeight: "500",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  textInput: {
    flex: 1,
    minHeight: 50,
    maxHeight: 120,
    backgroundColor: "#F1F3F4",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#60ba8a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
    elevation: 0,
  },
});
