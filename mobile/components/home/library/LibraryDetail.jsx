import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LibraryDetail({ item, onClose }) {
  if (!item) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{item.title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
           <Ionicons name="document-text" size={60} color={item.color} />
        </View>
        <Text style={styles.mainTitle}>{item.title}</Text>
        <Text style={styles.description}>{item.content}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Knowledge</Text>
          <Text style={styles.sectionText}>• Modern farming techniques ported from KrishiGram database.</Text>
          <Text style={styles.sectionText}>• Climate adapted strategies for Indian agriculture.</Text>
          <Text style={styles.sectionText}>• Resource optimization and yield enhancement.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 40 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F8F9FA", justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: "#666" },
  content: { padding: 20 },
  iconBox: { width: '100%', height: 200, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  description: { fontSize: 16, color: '#555', lineHeight: 24, marginBottom: 20 },
  section: { marginTop: 10, padding: 20, backgroundColor: '#F8F9FA', borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  sectionText: { fontSize: 14, color: '#666', marginBottom: 8 },
});
