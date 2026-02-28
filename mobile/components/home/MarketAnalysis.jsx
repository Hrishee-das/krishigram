import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function MarketAnalysis({ onClose }) {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  const CROPS_DATA = [
    { name: 'Wheat', price: '₹2,275', change: '+2.4%', trend: 'up', forecast: 'Bullish' },
    { name: 'Rice (Paddy)', price: '₹2,183', change: '+1.8%', trend: 'up', forecast: 'Stable' },
    { name: 'Onion', price: '₹1,850', change: '-5.2%', trend: 'down', forecast: 'Bearish' },
    { name: 'Tomato', price: '₹2,400', change: '+12.5%', trend: 'up', forecast: 'Bullish' },
    { name: 'Cotton', price: '₹7,120', change: '-0.8%', trend: 'down', forecast: 'Stable' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('market_analysis')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Market Overview - 2026</Text>
          <Text style={styles.summaryText}>The agricultural market is showing strong growth in cereals but volatility in perishables due to seasonal shifts.</Text>
        </View>

        <Text style={styles.sectionLabel}>Top Commodities</Text>
        {CROPS_DATA.map((crop, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.cropCard, selectedCrop === crop.name && styles.selectedCard]}
            onPress={() => setSelectedCrop(crop.name)}
          >
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.cropForecast}>{crop.forecast} Outlook</Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.priceText}>{crop.price}/q</Text>
              <View style={styles.trendRow}>
                <MaterialCommunityIcons 
                  name={crop.trend === 'up' ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  color={crop.trend === 'up' ? '#2E7D32' : '#D32F2F'} 
                />
                <Text style={[styles.changeText, { color: crop.trend === 'up' ? '#2E7D32' : '#D32F2F' }]}>
                  {crop.change}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.insightBox}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color="#E65100" />
          <Text style={styles.insightText}>
            Quick Tip: Farmers in the Konkan region are seeing higher returns on Alfonzo mangoes this week. Consider holding inventory for another 5 days.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20' },
  content: { padding: 20 },
  summaryCard: { backgroundColor: '#2E7D32', padding: 20, borderRadius: 20, marginBottom: 25 },
  summaryTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  summaryText: { color: '#E8F5E9', fontSize: 14, lineHeight: 20 },
  sectionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  cropCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1
  },
  selectedCard: { borderColor: '#2E7D32', backgroundColor: '#F1F8E9' },
  cropName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cropForecast: { fontSize: 12, color: '#666', marginTop: 2 },
  priceInfo: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20' },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  changeText: { fontSize: 12, fontWeight: '600', marginLeft: 4 },
  insightBox: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF3E0', 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 20,
    alignItems: 'center'
  },
  insightText: { flex: 1, color: '#E65100', fontSize: 13, marginLeft: 10, lineHeight: 18 }
});
