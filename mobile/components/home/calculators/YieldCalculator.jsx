import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function YieldCalculator({ onClose }) {
  const [area, setArea] = useState('1');
  const [seeds, setSeeds] = useState('100');
  const [expectedYield, setExpectedYield] = useState(null);

  const calculateYield = () => {
    const a = parseFloat(area);
    const s = parseFloat(seeds);
    // Dummy calculation for yield estimation
    const estimate = (a * s * 15.5).toFixed(2);
    setExpectedYield(estimate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Crop Yield Calculator</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
           <Ionicons name="information-circle" size={20} color="#6A1B9A" />
           <Text style={styles.infoText}>Estimate your total harvest based on field size and seed quantity.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Field Area (Acres)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={area} onChangeText={setArea} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Seeds Used (kg)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={seeds} onChangeText={setSeeds} />
        </View>

        <TouchableOpacity onPress={calculateYield} activeOpacity={0.8} style={[styles.calcBtn, { backgroundColor: "#6A1B9A" }]}>
          <Text style={styles.calcBtnText}>Calculate Yield</Text>
        </TouchableOpacity>

        {expectedYield && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Estimated Harvest</Text>
            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Total Yield:</Text>
                <Text style={styles.resultValue}>{expectedYield} Quintals</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: "#333" },
  infoBox: { flexDirection: 'row', backgroundColor: "#F3E5F5", padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  infoText: { color: "#6A1B9A", fontSize: 13, marginLeft: 10, flex: 1 },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: "#666", marginBottom: 8 },
  input: { backgroundColor: "#FFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, elevation: 1 },
  calcBtn: { padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  calcBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 30, padding: 20, borderRadius: 20, backgroundColor: "#FFF", borderColor: '#F3E5F5', borderWidth: 1, elevation: 3 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: "#333", marginBottom: 15, textAlign: 'center' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultLabel: { fontSize: 15, color: "#666" },
  resultValue: { fontSize: 17, fontWeight: 'bold', color: "#6A1B9A" },
});
