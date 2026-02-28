import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Color from '@/constants/color';

// New API: weatherapi.com
const API_KEY = '0503057c28cd4e2e8b621149262802';

export default function WeatherWidget() {
  const { t, i18n } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('location_access_denied') || 'Permission denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // weatherapi.com endpoint
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`
      );
      const data = await response.json();

      if (response.ok) {
        setWeather(data);
      } else {
        setError(data.error?.message || 'Error fetching weather');
      }
    } catch (err) {
      setError('Error fetching weather');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [i18n.language]); // Refetch if language changes (though weatherapi might need a lang param)

  if (loading) return <ActivityIndicator size="small" color="#2E7D32" style={{ marginVertical: 20 }} />;
  
  if (error) return (
    <View style={styles.errorBox}>
      <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#D32F2F" />
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  if (!weather || !weather.current) return null;

  const { location, current } = weather;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('weather')}</Text>
      <View style={styles.weatherCard}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.locationName}>{location.name}, {location.region}</Text>
            <Text style={styles.temp}>{Math.round(current.temp_c)}°C</Text>
            <Text style={styles.condition}>{current.condition.text}</Text>
          </View>
          <Image 
            source={{ uri: `https:${current.condition.icon}` }} 
            style={styles.weatherIcon} 
          />
        </View>
        <View style={styles.spacer} />
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="water-percent" size={20} color="#00BCD4" />
            <Text style={styles.statLabel}>{t('humidity')}</Text>
            <Text style={styles.statValue}>{current.humidity}%</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="weather-windy" size={20} color="#78909C" />
            <Text style={styles.statLabel}>{t('wind')}</Text>
            <Text style={styles.statValue}>{Math.round(current.wind_kph)} km/h</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="white-balance-sunny" size={20} color="#FFB300" />
            <Text style={styles.statLabel}>UV</Text>
            <Text style={styles.statValue}>{current.uv}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1c1e21",
    marginBottom: 12,
  },
  weatherCard: {
    backgroundColor: '#1E3C72', // Gradient fallback
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
    width: '70%',
  },
  temp: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  condition: {
    color: '#FFF',
    fontSize: 14,
    textTransform: 'capitalize',
    opacity: 0.9,
  },
  weatherIcon: {
    width: 64,
    height: 64,
  },
  spacer: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#E0E0E0',
    fontSize: 11,
    marginTop: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  errorBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    marginHorizontal: 15,
    marginTop: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  }
});
