import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FertilizerCalculator({ onClose }) {
  const [area, setArea] = useState('1');
  const [nReq, setNReq] = useState('120'); // kg/hectare target
  const [pReq, setPReq] = useState('60');
  const [kReq, setKReq] = useState('40');

  const [result, setResult] = useState(null);

  const calculateFertilizer = () => {
    const a = parseFloat(area); // in hectares
    const n = parseFloat(nReq) * a;
    const p = parseFloat(pReq) * a;
    const k = parseFloat(kReq) * a;

    const dapRequired = p / 0.46;
    const nFromDap = dapRequired * 0.18;
    const remainingN = Math.max(0, n - nFromDap);
    const ureaRequired = remainingN / 0.46;
    const mopRequired = k / 0.60;

    setResult({
      urea: ureaRequired.toFixed(1),
      dap: dapRequired.toFixed(1),
      mop: mopRequired.toFixed(1)
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Fertilizer Calculator</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
           <Ionicons name="information-circle" size={20} color="#E65100" />
           <Text style={styles.infoText}>Calculates Urea, DAP & MOP needed based on your soil N-P-K recommendation.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Area (Hectares)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={area} onChangeText={setArea} />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>N (kg/ha)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={nReq} onChangeText={setNReq} />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>P (kg/ha)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={pReq} onChangeText={setPReq} />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>K (kg/ha)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={kReq} onChangeText={setKReq} />
          </View>
        </View>

        <TouchableOpacity onPress={calculateFertilizer} activeOpacity={0.8} style={styles.calcBtn}>
          <Text style={styles.calcBtnText}>Calculate Requirement</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Required Formulation</Text>
            
            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Urea (46% N):</Text>
                <Text style={styles.resultValue}>{result.urea} kg</Text>
            </View>
            
            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>DAP (18% N, 46% P):</Text>
                <Text style={styles.resultValue}>{result.dap} kg</Text>
            </View>
            
            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>MOP (60% K):</Text>
                <Text style={styles.resultValue}>{result.mop} kg</Text>
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
  infoBox: { flexDirection: 'row', backgroundColor: "#FFF3E0", padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  infoText: { color: "#E65100", fontSize: 13, marginLeft: 10, flex: 1 },
  content: { padding: 20 },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: "#666", marginBottom: 8 },
  input: { backgroundColor: "#FFF", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 16, elevation: 1 },
  calcBtn: { backgroundColor: "#60ba8a", padding: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  calcBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 30, padding: 20, borderRadius: 20, backgroundColor: "#FFF", borderColor: '#E8F5E9', borderWidth: 1, elevation: 3 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: "#333", marginBottom: 15, textAlign: 'center' },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resultLabel: { fontSize: 15, color: "#666" },
  resultValue: { fontSize: 17, fontWeight: 'bold', color: "#2E7D32" },
});
