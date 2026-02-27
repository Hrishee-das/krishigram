import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Storage from './asyncStorage';

const resources = {
  en: {
    translation: {
      stories: "Stories",
      diagnosis_complete: "Diagnosis Complete",
      detected: "Detected",
      what_is_this: "What is this?",
      info_pending: "Information pending...",
      causes: "Causes",
      organic_treatment: "Organic Treatment",
      consult_expert: "Please consult an agricultural expert for specific advice.",
      chemical_treatment: "Chemical Treatment",
      not_specified: "Not specified",
      assistant_welcome: "Hello! I am your Krishigram Agricultural Assistant. How can I help you today?",
      analyzing_health: "Analyzing plant health... Please wait.",
      internal_error: "Sorry, I encountered an internal error. Please try again.",
      diagnosis_failed: "Diagnosis Failed",
      trial_quota_reached: "Trial quota reached. Please try again later.",
      krishigram_doc: "Krishigram Doctor",
      online: "Online",
      ask_anything: "Ask anything about your crop...",
      tools: "Tools",
      select_language: "Select Language",
      profile: "Profile",
      farmer: "Farmer",
      log_out: "Log Out",
      failed_load_tutorials: "Failed to load tutorials",
      by: "By",
      unknown_tutor: "Unknown Tutor",
      retry: "Retry",
      no_tutorials: "No tutorials found"
    }
  },
  hi: {
    translation: {
      stories: "कहानियों",
      diagnosis_complete: "निदान पूर्ण",
      detected: "पता चला",
      what_is_this: "यह क्या है?",
      info_pending: "सूचना लंबित...",
      causes: "कारण",
      organic_treatment: "जैविक उपचार",
      consult_expert: "विशिष्ट सलाह के लिए कृपया कृषि विशेषज्ञ से परामर्श लें।",
      chemical_treatment: "रासायनिक उपचार",
      not_specified: "निर्दिष्ट नहीं है",
      assistant_welcome: "नमस्ते! मैं आपका ऋषिग्राम कृषि सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
      analyzing_health: "पौधों के स्वास्थ्य का विश्लेषण किया जा रहा है... कृपया प्रतीक्षा करें।",
      internal_error: "क्षमा करें, मुझे आंतरिक त्रुटि हुई। कृपया पुन: प्रयास करें।",
      diagnosis_failed: "निदान विफल",
      trial_quota_reached: "परीक्षण कोटा समाप्त। कृपया बाद में प्रयास करें।",
      krishigram_doc: "कृषिग्राम डॉक्टर",
      online: "ऑनलाइन",
      ask_anything: "अपनी फसल के बारे में कुछ भी पूछें...",
      tools: "उपकरण",
      select_language: "भाषा चुनें",
      profile: "प्रोफ़ाइल",
      farmer: "किसान",
      log_out: "लॉग आउट",
      failed_load_tutorials: "ट्यूटोरियल लोड करने में विफल",
      by: "द्वारा",
      unknown_tutor: "अज्ञात शिक्षक",
      retry: "पुनः प्रयास करें",
      no_tutorials: "कोई ट्यूटोरियल नहीं मिला"
    }
  },
  mr: {
    translation: {
      stories: "कथा",
      diagnosis_complete: "निदान पूर्ण",
      detected: "आढळले",
      what_is_this: "हे काय आहे?",
      info_pending: "माहिती प्रलंबित...",
      causes: "कारणे",
      organic_treatment: "सेंद्रिय उपचार",
      consult_expert: "विशिष्ट सल्ल्यासाठी कृपया कृषी तज्ञाचा सल्ला घ्या.",
      chemical_treatment: "रासायनिक उपचार",
      not_specified: "नमूद केलेले नाही",
      assistant_welcome: "नमस्कार! मी तुमचा कृषिग्राम कृषी सहाय्यक आहे. मी तुम्हाला आज कशी मदत करू शकतो?",
      analyzing_health: "रोपांच्या आरोग्याचे विश्लेषण करत आहे... कृपया प्रतीक्षा करा.",
      internal_error: "क्षमस्व, मला अंतर्गत त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
      diagnosis_failed: "निदान अयशस्वी",
      trial_quota_reached: "चाचणी कोटा संपला. कृपया नंतर प्रयत्न करा.",
      krishigram_doc: "कृषिग्राम डॉक्टर",
      online: "ऑनलाइन",
      ask_anything: "तुमच्या पिकाबद्दल काहीही विचारा...",
      tools: "साधने",
      select_language: "भाषा निवडा",
      profile: "प्रोफाइल",
      farmer: "शेतकरी",
      log_out: "लॉग आउट",
      failed_load_tutorials: "ट्यूटोरियल लोड करण्यात अयशस्वी",
      by: "द्वारे",
      unknown_tutor: "अज्ञात शिक्षक",
      retry: "पुन्हा प्रयत्न करा",
      no_tutorials: "एकही ट्यूटोरियल सापडले नाही"
    }
  }
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await Storage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
    } catch (error) {
      console.log('Error reading language from Storage:', error);
    }
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await Storage.setItem('user-language', lng);
    } catch (error) {
      console.log('Error saving language to Storage:', error);
    }
  }
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
