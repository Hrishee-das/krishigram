import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Animated, Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAgroChat, usePlantDetection } from '../services/aiQueries';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  bottomSheet: { backgroundColor: '#EFEAE2', flex: 1, height: '90%', borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  header: { backgroundColor: '#075E54', paddingVertical: 12, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#128C7E', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  headerName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  chatArea: { flex: 1 },
  chatList: { padding: 15, paddingBottom: 20 },
  
  // Bubbles
  bubbleWrapper: { marginBottom: 10, maxWidth: '85%' },
  bubble: { padding: 8, paddingBottom: 4, borderRadius: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
  userBubble: { backgroundColor: '#D9FDD3', borderTopRightRadius: 0 },
  botBubble: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 0 },
  diagnosisBubble: { width: 260 },
  bubbleImage: { width: '100%', height: 160, borderRadius: 4, marginBottom: 5 },
  messageText: { fontSize: 15, color: '#111B21' },
  bubbleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 },
  timestamp: { fontSize: 10, color: '#667781' },
  
  // Tails
  tail: { position: 'absolute', top: 0, width: 8, height: 10 },
  userTail: { right: -6, borderBottomLeftRadius: 10 },
  botTail: { left: -6, borderBottomRightRadius: 10 },
  
  // Diagnosis specifics
  diagnosisTitle: { fontWeight: 'bold', fontSize: 16, color: '#111B21', marginBottom: 4 },
  diagnosisText: { fontSize: 14, color: '#111B21' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 8 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#128C7E', marginBottom: 2 },
  subText: { fontSize: 13, color: '#333' },

  // Input
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center', backgroundColor: 'transparent' },
  inputRow: { flex: 1, flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 5, alignItems: 'center', height: 44 },
  textInput: { flex: 1, fontSize: 16, paddingHorizontal: 10 },
  iconButton: { padding: 8 },
  micButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#128C7E', justifyContent: 'center', alignItems: 'center', marginLeft: 5 },
  
  // Advanced Camera Overlay
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  scanner: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#25D366', shadowBlur: 10, shadowColor: '#25D366', elevation: 5 },
});

/** 
 * WhatsApp Style Chat Bubbles 
 */
const ChatBubble = ({ isUser, text, image, data, isDiagnosis }) => {
  const { t } = useTranslation();
  return (
    <View style={[styles.bubbleWrapper, { alignSelf: isUser ? 'flex-end' : 'flex-start' }]}>
      <View style={[
        styles.bubble, 
        isUser ? styles.userBubble : styles.botBubble,
        isDiagnosis && styles.diagnosisBubble
      ]}>
        {image && <Image source={{ uri: image }} style={styles.bubbleImage} resizeMode="cover" />}
        
        {isDiagnosis ? (
          <View>
            <Text style={styles.diagnosisTitle}>{t('diagnosis_complete')} ✨</Text>
            <Text style={styles.diagnosisText}>
              {t('detected')} <Text style={{fontWeight: 'bold', color: "#D32F2F"}}>{data?.disease_name || 'Issue'}</Text>
            </Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.label}>{t('what_is_this')}:</Text>
            <Text style={styles.subText}>{data?.what_is_this_disease || t('info_pending')}</Text>
            
            <Text style={styles.label}>{t('causes')}:</Text>
            <Text style={styles.subText}>{data?.causes || "N/A"}</Text>

            <View style={styles.divider} />
            <Text style={styles.label}>{t('organic_treatment')}:</Text>
            <Text style={styles.subText}>{data?.organic_treatment || t('consult_expert')}</Text>
            
            <Text style={styles.label}>{t('chemical_treatment')}:</Text>
            <Text style={styles.subText}>{data?.chemical_treatment || t('not_specified')}</Text>
          </View>
        ) : (
          <Text style={[styles.messageText, { color: isUser ? '#111B21' : '#111B21' }]}>{text}</Text>
        )}
        
        <View style={styles.bubbleFooter}>
          <Text style={styles.timestamp}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          {isUser && <Ionicons name="checkmark-done" size={16} color="#53BDEB" style={{marginLeft: 4}} />}
        </View>

        {/* Bubble Tails */}
        <View style={[
          styles.tail, 
          isUser ? styles.userTail : styles.botTail,
          { backgroundColor: isUser ? '#D9FDD3' : '#FFF' }
        ]} />
      </View>
    </View>
  );
};

export default function AIAssistantBottomSheet({ visible, onClose, initialData, initialImage, initialQuery }) {
  const { t, i18n } = useTranslation();
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0)).current;
  
  const [sessionId, setSessionId] = useState(null);
  const lastProcessedData = useRef(null);
  const { mutate: analyzeImage, isPending: isAnalyzing } = usePlantDetection();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 12
      }).start();

      if (initialImage && initialImage !== lastProcessedData.current) {
        lastProcessedData.current = initialImage;
        handleInitialAnalysis(initialImage.uri);
      } else if (messages.length === 0) {
        setMessages([
          { id: '1', text: t('assistant_welcome'), isUser: false },
        ]);
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialImage]);

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [isAnalyzing]);

  const closeBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleInitialAnalysis = async (imageUri) => {
    const userMessage = { id: Date.now().toString(), text: t('analyzing_health'), isUser: true, image: imageUri };
    setMessages(prev => [...prev, userMessage]);

    analyzeImage({ imageUri, language: i18n.language, sessionId }, {
      onSuccess: (response) => {
          if (response && response.status === "success") {
            if (response.session) setSessionId(response.session);
            
            const raw = response.data.pythonRaw || response.data;
            const report = raw.report || response.data.message?.aiResponse;

            if (report) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    isUser: false,
                    isDiagnosis: typeof report === 'object',
                    data: typeof report === 'object' ? report : null,
                    text: typeof report === 'string' ? report : null,
                    image: imageUri
                }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), text: t("internal_error"), isUser: false }]);
            }
          } else {
             setMessages(prev => [...prev, { id: Date.now().toString(), text: t("internal_error"), isUser: false }]);
          }
      },
      onError: (error) => {
          const msg = error.message;
          if (msg.includes("plant") || msg.includes("clear image") || msg.includes("blurry")) {
              Alert.alert(t("diagnosis_failed"), msg, [{ text: "OK" }]);
              setMessages(prev => prev.filter(m => m.text !== t("analyzing_health")));
          } else {
              setMessages(prev => [...prev, { id: Date.now().toString(), text: `⚠️ ${msg}`, isUser: false }]);
          }
      }
    });
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) handleInitialAnalysis(result.assets[0].uri);
  };

  const handleCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) handleInitialAnalysis(result.assets[0].uri);
  };

  const { mutate: agroChat, isPending: isChatting } = useAgroChat();

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMessage = { id: Date.now().toString(), text: inputText.trim(), isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    setInputText("");
    const currentQuery = inputText.trim();

    agroChat({ query: currentQuery, language: i18n.language, sessionId }, {
      onSuccess: (response) => {
        if (response.session) setSessionId(response.session);
        
        let responseText = t("internal_error");
        if (response && response.status === "success") {
            // Check both possible levels of nesting
            responseText = response.data.message?.aiResponse || 
                           response.data.pythonRaw?.response || 
                           response.data.response;
        }

        if (responseText?.includes("RESOURCE_EXHAUSTED") || responseText?.includes("429")) {
            responseText = t("trial_quota_reached");
        }

        setMessages(prev => [...prev, { id: Date.now().toString(), text: responseText, isUser: false }]);
      },
      onError: (error) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: `Error: ${error.message}`, isUser: false }]);
      }
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={closeBottomSheet}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeBottomSheet} />
        
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            {/* WhatsApp Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={closeBottomSheet}>
                  <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.avatarContainer}>
                  <MaterialCommunityIcons name="doctor" size={24} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.headerName}>{t('krishigram_doc')}</Text>
                  <Text style={styles.headerSub}>{t('online')}</Text>
                </View>
              </View>
            </View>

            {/* Chat Content */}
            <View style={styles.chatArea}>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({item}) => <ChatBubble {...item} />}
                contentContainerStyle={styles.chatList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
              />
              
              {isAnalyzing && (
                <View style={styles.scanningOverlay}>
                   <Animated.View style={[styles.scanner, { transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) }] } ]} />
                   <ActivityIndicator size="large" color="#FFF" />
                </View>
              )}
            </View>

            {/* WhatsApp Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.iconButton} onPress={handleImagePick}>
                  <Ionicons name="add" size={28} color="#007AFF" />
                </TouchableOpacity>
                <TextInput
                  style={styles.textInput}
                  placeholder={t('ask_anything')}
                  value={inputText}
                  onChangeText={setInputText}
                />
                <TouchableOpacity style={styles.iconButton} onPress={handleCamera}>
                  <Ionicons name="camera-outline" size={26} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.micButton, (isAnalyzing || isChatting) && { opacity: 0.6 }]} 
                onPress={handleSend}
                disabled={isAnalyzing || isChatting}
              >
                {isChatting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <MaterialCommunityIcons name={inputText ? "send" : "microphone"} size={22} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

