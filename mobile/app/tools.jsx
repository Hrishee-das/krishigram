import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AppText from '@/components/AppText';
import Color from '@/constants/color';
import ToolsWidget from '@/components/home/ToolsWidget';
import LibraryWidget from '@/components/home/LibraryWidget';
import { useTranslation } from 'react-i18next';

const ToolsScreen = () => {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <AppText variant="h3" style={styles.title}>{t('tools_and_calculators')}</AppText>
        <ToolsWidget />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    color: '#1c1e21',
    fontWeight: '700',
  },
});

export default ToolsScreen;
