import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const PEST_PRESETS = {
  'Aphids/Thrips': { dose: 2, unit: 'ml/L', waterPerAcre: 200, pricePerUnit: 1.5, type: 'Liquid' },
  'Stem Borer': { dose: 5, unit: 'ml/L', waterPerAcre: 250, pricePerUnit: 2.0, type: 'Liquid' },
  'Fungal Blight': { dose: 3, unit: 'g/L', waterPerAcre: 200, pricePerUnit: 0.8, type: 'Powder' },
  'Mealybugs': { dose: 4, unit: 'ml/L', waterPerAcre: 300, pricePerUnit: 2.5, type: 'Liquid' }
};

export default function PesticideCalculator({ onClose }) {
  const { t } = useTranslation();
  const [area, setArea] = useState('1');
  const [selectedPest, setSelectedPest] = useState('Aphids/Thrips');
  const [result, setResult] = useState(null);

  const calculatePesticide = () => {
    const a = parseFloat(area);
    const preset = PEST_PRESETS[selectedPest];
    
    const totalWater = a * preset.waterPerAcre; // Liters
    const totalPesticide = totalWater * preset.dose; // ml or g
    const totalCost = totalPesticide * preset.pricePerUnit;

    setResult({
      water: totalWater.toFixed(0),
      pesticide: (preset.type === 'Liquid' ? (totalPesticide / 1000).toFixed(2) : (totalPesticide / 1000).toFixed(2)),
      unit: preset.type === 'Liquid' ? 'L' : 'kg',
      cost: totalCost.toFixed(0),
      doseInfo: `${preset.dose} ${preset.unit}`
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('pesticide_calculator')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
           <Ionicons name="information-circle" size={20} color="#E65100" />
           <Text style={styles.infoText}>Calculate exact pesticide and water requirements based on target pest and area.</Text>
        </View>

        <Text style={styles.label}>Select Target Pest/Condition</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
            {Object.keys(PEST_PRESETS).map(pest => (
                <TouchableOpacity 
                    key={pest} 
                    style={[styles.presetBtn, selectedPest === pest && styles.activePestBtn]}
                    onPress={() => setSelectedPest(pest)}
                >
                    <Text style={[styles.presetText, selectedPest === pest && styles.activePestText]}>{pest}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Area (Acres)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={area} onChangeText={setArea} />
        </View>

        <TouchableOpacity onPress={() => calculatePesticide()} activeOpacity={0.8} style={[styles.calcBtn, { backgroundColor: "#E65100" }]}>
          <Text style={styles.calcBtnText}>Calculate Requirement</Text>
        </TouchableOpacity>

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Spray Recommendation</Text>
            
            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Pesticide Quantity:</Text>
                <Text style={styles.resultValue}>{result.pesticide} {result.unit}</Text>
            </View>

            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Water Requirement:</Text>
                <Text style={styles.resultValue}>{result.water} Liters</Text>
            </View>

            <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>Application Rate:</Text>
                <Text style={styles.resultValue}>{result.doseInfo}</Text>
            </View>

            <View style={[styles.resultItem, { borderBottomWidth: 0, marginTop: 10 }]}>
                <Text style={[styles.resultLabel, { fontWeight: 'bold', color: '#333' }]}>Estimated Cost:</Text>
                <Text style={[styles.resultValue, { fontSize: 22, color: '#075E54' }]}>₹{result.cost}</Text>
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
  note: { marginTop: 15, fontSize: 12, color: "#999", fontStyle: 'italic', textAlign: 'center' },
  presetsRow: { flexDirection: 'row', marginBottom: 20 },
  presetBtn: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: '#DDD', minWidth: 100, alignItems: 'center' },
  activePestBtn: { backgroundColor: '#E65100', borderColor: '#E65100' },
  presetText: { fontSize: 13, color: '#666', fontWeight: 'bold' },
  activePestText: { color: '#FFF' },
});
