import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PEST_DATA = [
  { id: '1', name: 'Stem Borer', crop: 'Rice', treatment: 'Use Carbofuran 3G or Chlorpyriphos.' },
  { id: '2', name: 'Aphids', crop: 'Vegetables', treatment: 'Spray Neem oil or Imidacloprid.' },
  { id: '3', name: 'Powdery Mildew', crop: 'Mango', treatment: 'Apply Sulphur dust or Dinocap.' },
  { id: '4', name: 'Leaf Hopper', crop: 'Cotton', treatment: 'Use Acetamiprid or Fipronil.' },
];

export default function PestDiseaseWiki({ onClose }) {
  const [search, setSearch] = useState('');
  const filtered = PEST_DATA.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.crop.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Pests & Disease Wiki</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search pest or crop..." 
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{item.crop}</Text></View>
            <Text style={styles.treatmentLabel}>Recommended Treatment:</Text>
            <Text style={styles.treatmentText}>{item.treatment}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: "#333" },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 15, paddingHorizontal: 15, borderRadius: 12, elevation: 1 },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 16 },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  badge: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 10 },
  badgeText: { color: '#2E7D32', fontSize: 11, fontWeight: 'bold' },
  treatmentLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginTop: 5 },
  treatmentText: { fontSize: 14, color: '#333', marginTop: 2 },
});
