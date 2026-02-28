import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Color from '@/constants/color';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
];

export default function HeaderLanguagePicker() {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setModalVisible(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.trigger}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="translate" size={24} color="#2E7D32" />
        <Text style={styles.langCode}>{currentLang.code.toUpperCase()}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language / भाषा चुनें</Text>
            {LANGUAGES.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langItem,
                  i18n.language === item.code && styles.activeLangItem
                ]}
                onPress={() => changeLanguage(item.code)}
              >
                <Text style={styles.langFlag}>{item.flag}</Text>
                <Text style={[
                  styles.langLabel,
                  i18n.language === item.code && styles.activeLangLabel
                ]}>
                  {item.label}
                </Text>
                {i18n.language === item.code && (
                  <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 15,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  langCode: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  activeLangItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  langFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  langLabel: {
    flex: 1,
    fontSize: 16,
    color: '#444',
  },
  activeLangLabel: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
