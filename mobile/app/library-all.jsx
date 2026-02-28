import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { HARDCODED_LIBRARY } from '../components/home/LibraryWidget';
import Color from '@/constants/color';
import { useState } from 'react';
import LibraryDetail from '../components/home/library/LibraryDetail';

export default function LibraryAllScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const items = HARDCODED_LIBRARY[i18n.language] || HARDCODED_LIBRARY['en'];
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('krishigram_library')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.itemCard}
            onPress={() => setSelectedItem(item)}
          >
            <View style={[styles.iconBox, { backgroundColor: (item.color || '#2E7D32') + '15' }]}>
              <MaterialCommunityIcons name={item.icon || 'leaf'} size={28} color={item.color || '#2E7D32'} />
            </View>
            <View style={styles.textBox}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSnippet} numberOfLines={2}>{item.content}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedItem && (
        <LibraryDetail 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  scrollContent: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textBox: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  itemSnippet: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
