import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PesticideCalculator({ onClose }) {
  const [area, setArea] = useState('1');
  const [infestationLevel, setInfestationLevel] = useState('Medium');
  const [result, setResult] = useState(null);

  const calculatePesticide = () => {
    const a = parseFloat(area);
    const amount = (a * 250).toFixed(0); // 250ml per acre dummy rule
    setResult({ amount });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Pesticide Calculator</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
           <Ionicons name="information-circle" size={20} color="#E65100" />
           <Text style={styles.infoText}>Calculate the exact volume of pesticide required for your field area.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Area (Acres)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={area} onChangeText={setArea} />
        </View>

        <TouchableOpacity onPress={calculatePesticide} activeOpacity={0.8} style={[styles.calcBtn, { backgroundColor: "#E65100" }]}>
          <Text style={styles.calcBtnText}>Calculate Dosage</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Spray Recommendation</Text>
            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Required Volume:</Text>
                <Text style={styles.resultValue}>{result.amount} ml</Text>
            </View>
            <Text style={styles.note}>Note: Mix with appropriate amount of water as per product label.</Text>
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
  infoBox: { flexDirection: 'row', backgroundColor: "#FFF3E0", padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  infoText: { color: "#E65100", fontSize: 13, marginLeft: 10, flex: 1 },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: "#666", marginBottom: 8 },
  input: { backgroundColor: "#FFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, elevation: 1 },
  calcBtn: { padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  calcBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 30, padding: 20, borderRadius: 20, backgroundColor: "#FFF", borderColor: '#FFF3E0', borderWidth: 1, elevation: 3 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: "#333", marginBottom: 15, textAlign: 'center' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultLabel: { fontSize: 15, color: "#666" },
  resultValue: { fontSize: 17, fontWeight: 'bold', color: "#E65100" },
  note: { marginTop: 15, fontSize: 12, color: "#999", fontStyle: 'italic', textAlign: 'center' }
});
