import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Ionicons } from '@expo/vector-icons';

export default function CultivationTips({ onClose }) {
  const { t } = useTranslation();
  
  const LOCAL_TIPS = [
    { title: t('soil_health'), content: 'Test soil every 2 years. Proper NPK balance can save up to 15% on fertilizer costs.' },
    { title: t('summer_crops'), content: 'Vegetables like Okra and Gaur are best for high-temp months. Ensure mulching to retain moisture.' },
    { title: 'Drip Irrigation', content: 'Reduces water usage by 40% and prevents fungal growth on leaves by keeping them dry.' },
    { title: 'Organic Manure', content: 'Vermicompost should be applied in the rainy season for maximum nutrient absorption.' },
    { title: 'Sticky Traps', content: 'Yellow traps catch whiteflies and aphids, while blue traps are best for thrips.' },
    { title: 'Pruning Mango', content: 'Prune dead wood and crossing branches in Oct-Nov to encourage better flowering in Jan.' },
    { title: 'Seed Treatment', content: 'Always treat seeds with Trichoderma viride to prevent soil-borne diseases.' },
    { title: 'Intercropping', content: 'Growing Marigolds alongside Tomato helps reduce nematode problems in the soil.' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('cultivation_tips')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {LOCAL_TIPS.map((tip, index) => (
          <View key={index} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.bulbContainer}>
                <Ionicons name="bulb" size={20} color="#FFF" />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
            </View>
            <Text style={styles.tipContent}>{tip.content}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: "#333" },
  content: { padding: 15 },
  tipCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 2 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bulbContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D97706', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tipTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  tipContent: { fontSize: 15, color: '#555', lineHeight: 22 },
});
