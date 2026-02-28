import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { IP_ADDRESS } from '../../constants/ip';
import { useAuthStore } from '../../utils/authStore';

export default function RecentDetectionsWidget() {
  const { t } = useTranslation();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore.getState().token;

  const fetchDetections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://${IP_ADDRESS}:3000/api/v1/aichat/recent-detections`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setDetections(data.data);
      }
    } catch (error) {
      console.error("Detections fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, []);

  if (detections.length === 0 && !loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('recent_detections') || "Recent Detections"}</Text>
        <TouchableOpacity onPress={fetchDetections}>
            <Ionicons name="refresh" size={18} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {detections.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card}>
            <Image source={{ uri: item.mediaUrls?.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.diseaseName} numberOfLines={1}>{item.diseaseDetected}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{Math.round(item.confidence * 100)}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 15, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1c1e21' },
  list: { paddingLeft: 15 },
  card: { width: 130, backgroundColor: '#FFF', borderRadius: 16, marginRight: 15, elevation: 2, overflow: 'hidden', marginBottom: 5 },
  image: { width: '100%', height: 90 },
  info: { padding: 10 },
  diseaseName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 10, color: '#666', marginTop: 2 },
  badge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(46, 125, 50, 0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' }
});
