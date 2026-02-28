import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export default function AgroIoTMonitor({ onClose }) {
  const { t } = useTranslation();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulated live data
  const SENSORS = [
    { name: 'Soil Moisture', value: '38%', status: 'Optimal', icon: 'water-percent', color: '#1565C0' },
    { name: 'Air Temp', value: '28°C', status: 'Normal', icon: 'thermometer', color: '#E65100' },
    { name: 'Humidity', value: '62%', status: 'Optimal', icon: 'cloud-percent', color: '#00838F' },
    { name: 'Light Level', value: '450 lx', status: 'Good', icon: 'white-balance-sunny', color: '#F9A825' },
    { name: 'Soil pH', value: '6.4', status: 'Perfect', icon: 'beaker-check', color: '#2E7D32' },
    { name: 'N-P-K (Ratio)', value: '14:14:14', status: 'High', icon: 'molecule', color: '#6A1B9A' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('iot_monitor')}</Text>
        <View style={styles.liveIndicator}>
            <View style={styles.redDot} />
            <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.fieldStatus}>
            <Text style={styles.fieldLabel}>Field Unit: #K01-South</Text>
            <Text style={styles.lastUpdate}>Last update: {lastUpdated.toLocaleTimeString()}</Text>
        </View>

        <View style={styles.grid}>
          {SENSORS.map((sensor, index) => (
            <View key={index} style={styles.sensorCard}>
              <View style={[styles.iconBox, { backgroundColor: sensor.color + '15' }]}>
                <MaterialCommunityIcons name={sensor.icon} size={32} color={sensor.color} />
              </View>
              <Text style={styles.sensorValue}>{sensor.value}</Text>
              <Text style={styles.sensorName}>{sensor.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: sensor.status === 'High' ? '#FFF3E0' : '#E8F5E9' }]}>
                <Text style={[styles.statusText, { color: sensor.status === 'High' ? '#EF6C00' : '#2E7D32' }]}>{sensor.status}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>System recommendation</Text>
            <Text style={styles.actionText}>Soil moisture is decreasing. Automated drip irrigation scheduled for 6:00 PM today.</Text>
            <TouchableOpacity style={styles.manualBtn}>
                <Text style={styles.manualBtnText}>Manual Override</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D32F2F', marginRight: 5 },
  liveText: { fontSize: 10, fontWeight: 'bold', color: '#D32F2F' },
  content: { padding: 20 },
  fieldStatus: { marginBottom: 25 },
  fieldLabel: { fontSize: 18, fontWeight: '800', color: '#1B5E20' },
  lastUpdate: { fontSize: 12, color: '#999', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sensorCard: { width: '48%', backgroundColor: '#F8F9FA', borderRadius: 24, padding: 20, marginBottom: 15, alignItems: 'center' },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sensorValue: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  sensorName: { fontSize: 12, color: '#666', marginVertical: 6 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  actionCard: { backgroundColor: '#F1F8E9', padding: 20, borderRadius: 24, marginTop: 10, borderLeftWidth: 4, borderLeftColor: '#2E7D32' },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 },
  actionText: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 15 },
  manualBtn: { backgroundColor: '#2E7D32', padding: 12, borderRadius: 12, alignItems: 'center' },
  manualBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
