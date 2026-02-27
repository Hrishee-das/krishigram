import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TIPS = [
  { id: '1', title: 'Smart Irrigation', content: 'Watering in the early morning or late evening reduces evaporation loss by up to 30%.' },
  { id: '2', title: 'Crop Rotation', content: 'Alternating legumes with cereals helps naturally replenish soil nitrogen levels.' },
  { id: '3', title: 'Organic Mulching', content: 'Using straw or dry leaves around crops maintains soil moisture and prevents weed growth.' },
  { id: '4', title: 'Soil Testing', content: 'Testing soil every 2 years ensures you only apply the fertilizers your land actually needs.' },
];

export default function CultivationTips({ onClose }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Cultivation Tips</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {TIPS.map(tip => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color="#D97706" />
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
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tipTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 },
  tipContent: { fontSize: 15, color: '#555', lineHeight: 22 },
});
