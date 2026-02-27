import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FertilizerCalculator from './calculators/FertilizerCalculator';
import PesticideCalculator from './calculators/PesticideCalculator';
import YieldCalculator from './calculators/YieldCalculator';
import CultivationTips from './library/CultivationTips';
import PestDiseaseWiki from './library/PestDiseaseWiki';

const TOOLS = [
  { id: 'f1', title: 'Fertilizer Calculator', icon: 'flask', color: '#2E7D32' },
  { id: 'f5', title: 'Pesticide Calculator', icon: 'bottle-tonic-plus', color: '#E65100' },
  { id: 'f4', title: 'Crop Yield', icon: 'chart-line', color: '#6A1B9A' },
];

const GUIDES = [
  { id: 'f2', title: 'Pests & Diseases', icon: 'bug', color: '#E65100' },
  { id: 'f3', title: 'Cultivation Tips', icon: 'sprout', color: '#1565C0' },
];

export default function HeaderToolsMenu() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTool, setActiveTool] = useState(null);

  const handleToolPress = (id) => {
    setActiveTool(id);
  };

  const renderTool = ({ item }) => (
    <TouchableOpacity 
      style={styles.toolItem} 
      onPress={() => handleToolPress(item.id)}
    >
      <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
        <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.toolLabel}>{item.title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        style={styles.headerBtn}
      >
        <MaterialCommunityIcons name="dots-vertical" size={26} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdown}>
            <Text style={styles.menuTitle}>Farming Tools</Text>
            {TOOLS.map(item => (
                <TouchableOpacity key={item.id} style={styles.toolItem} onPress={() => handleToolPress(item.id)}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} style={{marginRight: 10}} />
                    <Text style={styles.toolLabel}>{item.title}</Text>
                </TouchableOpacity>
            ))}
            <View style={styles.divider} />
            <Text style={styles.menuTitle}>Expert Guides</Text>
            {GUIDES.map(item => (
                <TouchableOpacity key={item.id} style={styles.toolItem} onPress={() => handleToolPress(item.id)}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} style={{marginRight: 10}} />
                    <Text style={styles.toolLabel}>{item.title}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {activeTool && (
        <Modal visible={true} animationType="slide" onRequestClose={() => setActiveTool(null)}>
          {activeTool === 'f1' && <FertilizerCalculator onClose={() => setActiveTool(null)} />}
          {activeTool === 'f2' && <PestDiseaseWiki onClose={() => setActiveTool(null)} />}
          {activeTool === 'f3' && <CultivationTips onClose={() => setActiveTool(null)} />}
          {activeTool === 'f4' && <YieldCalculator onClose={() => setActiveTool(null)} />}
          {activeTool === 'f5' && <PesticideCalculator onClose={() => setActiveTool(null)} />}
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  headerBtn: {
    padding: 10,
    marginRight: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdown: {
    width: 220,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    paddingHorizontal: 15,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  toolLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 5,
  },
});
