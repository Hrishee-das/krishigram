import Color from "@/constants/color";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FertilizerCalculator from './calculators/FertilizerCalculator';
import PesticideCalculator from './calculators/PesticideCalculator';
import YieldCalculator from './calculators/YieldCalculator';
import CultivationTips from './library/CultivationTips';
import PestDiseaseWiki from './library/PestDiseaseWiki';
import MarketAnalysis from './MarketAnalysis';
import AgroIoTMonitor from './AgroIoTMonitor';
import { useTranslation } from 'react-i18next';

export default function ToolsWidget() {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState(null);

  const FEATURES = [
    { id: 'f1', title: t('fertilizer_calculator'), icon: 'flask', color: '#2E7D32' },
    { id: 'f2', title: t('pests_diseases'), icon: 'bug', color: '#E65100' },
    { id: 'f3', title: t('cultivation_tips'), icon: 'sprout', color: '#1565C0' },
    { id: 'f4', title: t('crop_yield'), icon: 'chart-line', color: '#6A1B9A' },
    { id: 'f5', title: t('pesticide_calculator'), icon: 'bottle-tonic-plus', color: '#E65100' },
    { id: 'f6', title: t('market_analysis'), icon: 'finance', color: '#2E7D32' },
    { id: 'f7', title: t('iot_monitor'), icon: 'router-wireless', color: '#1565C0' },
  ];

  const renderToolModal = () => {
    if (!activeTool) return null;

    return (
      <Modal visible={true} animationType="slide" onRequestClose={() => setActiveTool(null)}>
        {activeTool === 'f1' && <FertilizerCalculator onClose={() => setActiveTool(null)} />}
        {activeTool === 'f2' && <PestDiseaseWiki onClose={() => setActiveTool(null)} />}
        {activeTool === 'f3' && <CultivationTips onClose={() => setActiveTool(null)} />}
        {activeTool === 'f4' && <YieldCalculator onClose={() => setActiveTool(null)} />}
        {activeTool === 'f5' && <PesticideCalculator onClose={() => setActiveTool(null)} />}
        {activeTool === 'f6' && <MarketAnalysis onClose={() => setActiveTool(null)} />}
        {activeTool === 'f7' && <AgroIoTMonitor onClose={() => setActiveTool(null)} />}
        {['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'].indexOf(activeTool) === -1 && (
            <View style={styles.placeholderModal}>
                <TouchableOpacity onPress={() => setActiveTool(null)} style={styles.closeBtn}>
                    <MaterialCommunityIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <MaterialCommunityIcons name="cog" size={60} color="#60ba8a" />
                <Text style={styles.placeholderText}>{FEATURES.find(f => f.id === activeTool)?.title} coming soon!</Text>
            </View>
        )}
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Farming Tools & Calculators</Text>
      <View style={styles.featureGrid}>
        {FEATURES.map((feature) => (
            <TouchableOpacity 
            key={feature.id} 
            style={styles.featureCard}
            activeOpacity={0.7}
            onPress={() => setActiveTool(feature.id)}
            >
            <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                <MaterialCommunityIcons name={feature.icon} size={28} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
        ))}
      </View>
      {renderToolModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1e21",
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: Color.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3
  },
  featureIconContainer: {
    width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  featureTitle: { 
    color: '#333', 
    fontSize: 13, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  placeholderModal: {
    flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  placeholderTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 20, marginBottom: 10 },
  placeholderText: { fontSize: 18, fontWeight: '500', color: '#666', marginTop: 5 },
  closeBtn: { position: 'absolute', top: 50, left: 20, padding: 10, backgroundColor: '#FFF', borderRadius: 20, elevation: 2 }
});
