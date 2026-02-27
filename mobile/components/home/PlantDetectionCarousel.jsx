import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppCarousel from '../AppCarousel';

export default function PlantDetectionCarousel({ onImageSelected }) {
  const [history, setHistory] = useState([]);

  const handlePickImage = async (useCamera) => {
    try {
      const permissionResult = useCamera 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Permission to access camera/gallery is required!");
        return;
      }

      const pickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selected = result.assets[0];
        setHistory(prev => [{
          id: Date.now().toString(),
          uri: selected.uri,
          date: new Date().toLocaleDateString()
        }, ...prev].slice(0, 5));
        
        onImageSelected(selected);
      }
    } catch (error) {
      console.error("ImagePicker Error:", error);
      Alert.alert("Error", "Failed to open camera/gallery. Please try again.");
    }
  };

  const showImageSourceSelector = () => {
    Alert.alert(
      "Select Source",
      "How would you like to provide the image?",
      [
        { text: "Camera", onPress: () => handlePickImage(true) },
        { text: "Gallery", onPress: () => handlePickImage(false) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const ActionButton = () => (
    <TouchableOpacity 
      style={styles.actionButton} 
      onPress={showImageSourceSelector}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="camera-plus" size={20} color="#FFF" />
      <Text style={styles.actionButtonText}>Take Picture</Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} activeOpacity={0.7}>
      <Image source={{ uri: item.uri }} style={styles.historyImage} />
      <View style={styles.historyInfo}>
        <Text style={styles.historyDate}>{item.date}</Text>
        <Text style={styles.historyStatus}>Diagnosis Saved</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Plant Disease AI</Text>
      <AppCarousel slideWidth={350} interval={5000}>
        <View style={[styles.slide, { backgroundColor: "#E8F5E9" }]}>
          <MaterialCommunityIcons name="camera" size={32} color="#2E7D32" style={styles.icon} />
          <Text style={styles.slideTitle}>Scan Plant 📸</Text>
          <Text style={styles.slideSubtitle}>Identify diseases instantly</Text>
          <ActionButton />
        </View>
        
        <View style={[styles.slide, { backgroundColor: "#FFF3E0" }]}>
          <MaterialCommunityIcons name="image-multiple" size={32} color="#E65100" style={styles.icon} />
          <Text style={styles.slideTitle}>Upload Photo 📂</Text>
          <Text style={styles.slideSubtitle}>Select from your gallery</Text>
          <ActionButton />
        </View>
        
        <View style={[styles.slide, { backgroundColor: "#E3F2FD" }]}>
          <MaterialCommunityIcons name="robot" size={32} color="#1565C0" style={styles.icon} />
          <Text style={styles.slideTitle}>AI Analysis 🔬</Text>
          <Text style={styles.slideSubtitle}>Get treatment & advice</Text>
          <ActionButton />
        </View>
      </AppCarousel>

      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Detections</Text>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    marginLeft: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1e21",
  },
  slide: {
    height: 220,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  slideSubtitle: {
    marginTop: 4,
    marginBottom: 15,
    color: "#666",
    textAlign: "center"
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  historySection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 12,
    color: '#888',
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
