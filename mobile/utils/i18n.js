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
      no_tutorials: "No tutorials found",
      krishigram_library: "KrishiGram Library",
      ai_ask: "AI Ask",
      tools_and_calculators: "Tools & Calculators",
      library_and_guides: "Library & Guides",
      permission_denied: "Permission Denied",
      mic_permission_required: "Microphone permission is required for voice queries.",
      no_items_found: "No items found",
      assistant_status: "Ask anything about crops, pests or market",
      soil_health: "Soil Health",
      summer_crops: "Summer Crops",
      rice_pests: "Rice Pests",
      market_analysis: "Market Analysis",
      iot_monitor: "Agro-IoT Monitor",
      cultivation_tips: "Cultivation Tips",
      pests_diseases: "Pests & Diseases",
      crop_yield: "Crop Yield",
      pesticide_calculator: "Pesticide Calculator",
      fertilizer_calculator: "Fertilizer Calculator",
      home: "Home",
      ask_ai: "Ask AI",
      tutorial: "Tutorial",
      search_placeholder: "Search pest or crop...",
      recent_detections: "Recent Detections",
      see_all: "See All",
      weather: "Weather",
      humidity: "Humidity",
      wind: "Wind",
      location_access_denied: "Location access denied",
      app_name: "KrishiGram",
      settings: "Settings",
      error_occurred: "An error occurred",
      voice_message: "Voice message",
      ok: "OK",
      issue: "Issue",
      not_available: "N/A"
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
      no_tutorials: "कोई ट्यूटोरियल नहीं मिला",
      krishigram_library: "कृषिग्राम लाइब्रेरी",
      ai_ask: "एआई पूछें",
      tools_and_calculators: "उपकरण और कैलकुलेटर",
      library_and_guides: "लाइब्रेरी और गाइड",
      permission_denied: "अनुमति अस्वीकृत",
      mic_permission_required: "ध्वनि प्रश्नों के लिए माइक्रोफ़ोन अनुमति आवश्यक है।",
      no_items_found: "कोई आइटम नहीं मिला",
      assistant_status: "फसलों, कीटों या बाजार के बारे में कुछ भी पूछें",
      soil_health: "मिट्टी का स्वास्थ्य",
      summer_crops: "गर्मी की फसलें",
      rice_pests: "चावल के कीट",
      market_analysis: "बाजार विश्लेषण",
      iot_monitor: "एग्रो-IoT मॉनिटर",
      cultivation_tips: "खेती के सुझाव",
      pests_diseases: "कीट और रोग",
      crop_yield: "फसल की पैदावार",
      pesticide_calculator: "कीटनाशक कैलकुलेटर",
      fertilizer_calculator: "उर्वरक कैलकुलेटर",
      home: "होम",
      ask_ai: "एआई पूछें",
      tutorial: "ट्यूटोरियल",
      search_placeholder: "कीट या फसल खोजें...",
      recent_detections: "हाल के पहचान",
      see_all: "सभी देखें",
      weather: "मौसम",
      humidity: "नमी",
      wind: "हवा",
      location_access_denied: "स्थान पहुंच अस्वीकृत",
      app_name: "कृषिग्राम",
      settings: "सेटिंग्स",
      error_occurred: "एक त्रुटि हुई",
      voice_message: "आवाज संदेश",
      ok: "ठीक है",
      issue: "मुद्दा",
      not_available: "उपलब्ध नहीं है"
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
      no_tutorials: "एकही ट्यूटोरियल सापडले नाही",
      krishigram_library: "कृषिग्राम लायब्ररी",
      ai_ask: "एआय विचारा",
      tools_and_calculators: "साधने आणि कॅल्क्युलेटर",
      library_and_guides: "लायब्ररी आणि मार्गदर्शक",
      permission_denied: "परवानगी नाकारली",
      mic_permission_required: "व्हॉइस प्रश्नांसाठी मायक्रोफोन परवानगी आवश्यक आहे.",
      no_items_found: "काहीही आढळले नाही",
      assistant_status: "पिके, कीटक किंवा बाजाराबद्दल काहीही विचारा",
      soil_health: "मातीचे आरोग्य",
      summer_crops: "उन्हाळी पिके",
      rice_pests: "तांदूळ कीटक",
      market_analysis: "बाजार विश्लेषण",
      iot_monitor: "एग्रो-IoT मॉनिटर",
      cultivation_tips: "लागवडीच्या टिप्स",
      pests_diseases: "कीटक आणि रोग",
      crop_yield: "पिकाचे उत्पन्न",
      pesticide_calculator: "कीटकनाशक कॅल्क्युलेटर",
      fertilizer_calculator: "खत कॅल्क्युलेटर",
      home: "होम",
      ask_ai: "एआय विचारा",
      tutorial: "ट्यूटोरियल",
      search_placeholder: "कीटक किंवा पीक शोधा...",
      recent_detections: "अलीकडील ओळख",
      see_all: "सर्व पहा",
      weather: "हवामान",
      humidity: "आद्रता",
      wind: "वाऱ्याचा वेग",
      location_access_denied: "स्थान प्रवेश नाकारला",
      app_name: "कृषिग्राम",
      settings: "सेटिंग्ज",
      error_occurred: "एक त्रुटी आली",
      voice_message: "आवाज संदेश",
      ok: "ठीक आहे",
      issue: "समस्या",
      not_available: "उपलब्ध नाही"
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
