import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LANGUAGES = [
  { code: 'en', label: 'English', icon: 'alphabetical' },
  { code: 'hi', label: 'हिन्दी', icon: 'alphabet-hindi' },
  { code: 'mr', label: 'मराठी', icon: 'alphabet-marathi' },
];

export default function HeaderToolsMenu() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => setLangModalVisible(true)} 
        style={styles.headerBtn}
      >
        <MaterialCommunityIcons name="translate" size={24} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.headerBtn}
      >
        <MaterialCommunityIcons name="dots-vertical" size={26} color="#333" />
      </TouchableOpacity>

      {/* Main Tools Dropdown */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdown}>
            <TouchableOpacity 
              style={styles.toolItem} 
              onPress={() => {
                setModalVisible(false);
                router.push('/tools');
              }}
            >
              <MaterialCommunityIcons name="toolbox-outline" size={22} color="#2E7D32" style={{marginRight: 12}} />
              <Text style={styles.toolLabel}>{t('tools')}</Text>
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.toolItem} 
              onPress={() => {
                setModalVisible(false);
                router.push('/(tabs)/profile');
              }}
            >
              <MaterialCommunityIcons name="account-outline" size={22} color="#1565C0" style={{marginRight: 12}} />
              <Text style={styles.toolLabel}>{t('profile')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.langModalContent}>
            <Text style={styles.modalTitle}>{t('select_language')}</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity 
                key={lang.code} 
                style={[
                  styles.langOption,
                  i18n.language === lang.code && styles.selectedLangOption
                ]} 
                onPress={() => switchLanguage(lang.code)}
              >
                <MaterialCommunityIcons 
                  name={lang.icon || 'translate'} 
                  size={24} 
                  color={i18n.language === lang.code ? '#2E7D32' : '#333'} 
                />
                <Text style={[
                  styles.langLabel,
                  i18n.language === lang.code && styles.selectedLangLabel
                ]}>
                  {lang.label}
                </Text>
                {i18n.language === lang.code && (
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
    flexDirection: 'row',
  },
  headerBtn: {
    padding: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  dropdown: {
    width: 200,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toolLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  langModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  selectedLangOption: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
    borderWidth: 1,
  },
  langLabel: {
    flex: 1,
    fontSize: 18,
    marginLeft: 16,
    color: '#333',
  },
  selectedLangLabel: {
    color: '#2E7D32',
    fontWeight: '600',
  },
});
