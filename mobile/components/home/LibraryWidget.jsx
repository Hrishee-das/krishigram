import Color from "@/constants/color";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LibraryDetail from './library/LibraryDetail';

const ITEMS = [
    { title: 'Mango Cultivation Guide', icon: 'fruit-cherries', color: '#E65100', content: 'Mangoes thrive in tropical and subtropical climates. Proper soil preparation and regular pruning are essential for high yield. Mango malformation and bacterial canker are common diseases to watch for.' },
    { title: 'Cashew Pests Overview', icon: 'bug', color: '#2E7D32', content: 'Tea mosquito bug and stem borer are the most devastating cashew pests. Use recommended biological and chemical controls. Regular monitoring during flowering is crucial.' },
    { title: 'Rice Soil Preparation', icon: 'sprout', color: '#1565C0', content: 'Rice requires well-puddled leveled fields with good water retention. Optimal pH is 5.5 to 7.0. Proper NPK balance (120:60:40) ensures healthy stem and grain growth.' },
    { title: 'Organic Pesticides', icon: 'leaf', color: '#6A1B9A', content: 'Neem-based sprays and garlic-chili extracts are effective organic alternatives to synthetic pesticides. They are safer for soil health and beneficial insects.' },
];

export default function LibraryWidget() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>KrishiGram Library</Text>
        <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.list}>
        {ITEMS.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => setSelectedItem(item)}
          >
            <View style={[styles.iconWrapper, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
            </View>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 20 }} />
      </ScrollView>

      <Modal visible={!!selectedItem} animationType="slide" onRequestClose={() => setSelectedItem(null)}>
        <LibraryDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 50,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1e21",
  },
  seeAll: { color: '#2E7D32', fontWeight: 'bold' },
  list: { paddingHorizontal: 15 },
  card: {
    width: 140,
    backgroundColor: Color.white,
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  }
});
