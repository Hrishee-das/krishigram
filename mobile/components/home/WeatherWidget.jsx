import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Dimensions } from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
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
  }, [i18n.language]);

  if (loading) return (
    <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60ba8a" />
    </View>
  );
  
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
        <BlurView intensity={30} tint="light" style={styles.blurContainer}>
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.regionName}>{location.region}</Text>
                        <View style={styles.tempRow}>
                            <Text style={styles.temp}>{Math.round(current.temp_c)}°</Text>
                            <View style={styles.conditionBox}>
                                <Text style={styles.conditionText}>{current.condition.text}</Text>
                                <Text style={styles.feelsLike}>{t('feels_like')}: {Math.round(current.feelslike_c)}°C</Text>
                            </View>
                        </View>
                    </View>
                    <Image 
                        source={{ uri: `https:${current.condition.icon}` }} 
                        style={styles.weatherIcon} 
                    />
                </View>

                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <MaterialCommunityIcons name="water-percent" size={22} color="#2e7d32" />
                        <Text style={styles.gridValue}>{current.humidity}%</Text>
                        <Text style={styles.gridLabel}>{t('humidity')}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <MaterialCommunityIcons name="weather-windy" size={22} color="#2e7d32" />
                        <Text style={styles.gridValue}>{Math.round(current.wind_kph)} <Text style={{fontSize: 10}}>km/h</Text></Text>
                        <Text style={styles.gridLabel}>{t('wind')}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <MaterialCommunityIcons name="white-balance-sunny" size={22} color="#f57c00" />
                        <Text style={styles.gridValue}>{current.uv}</Text>
                        <Text style={styles.gridLabel}>{t('uv_index')}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <MaterialCommunityIcons name="eye-outline" size={22} color="#1976d2" />
                        <Text style={styles.gridValue}>{current.vis_km} <Text style={{fontSize: 10}}>km</Text></Text>
                        <Text style={styles.gridLabel}>{t('visibility')}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <MaterialCommunityIcons name="gauge" size={22} color="#7b1fa2" />
                        <Text style={styles.gridValue}>{current.pressure_mb} <Text style={{fontSize: 10}}>mb</Text></Text>
                        <Text style={styles.gridLabel}>{t('pressure')}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <MaterialCommunityIcons name="clock-outline" size={22} color="#455a64" />
                        <Text style={styles.gridValue}>{location.localtime.split(' ')[1]}</Text>
                        <Text style={styles.gridLabel}>{t('time') || 'Time'}</Text>
                    </View>
                </View>
            </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a2027",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  weatherCard: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Very subtle white tint
    borderWidth: 1.5,
    borderColor: 'rgba(96, 186, 138, 0.2)', // Subtle green border
    elevation: 0, // Flat look
  },
  blurContainer: {
    padding: 24,
  },
  content: {
    zIndex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  locationName: {
    color: '#1a2027',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  regionName: {
    color: '#4a5568',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  temp: {
    color: '#2e7d32',
    fontSize: 56,
    fontWeight: '300',
    letterSpacing: -2,
  },
  conditionBox: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  conditionText: {
    color: '#1a2027',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  feelsLike: {
    color: '#4a5568',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  gridItem: {
    width: (width - 64 - 48 - 24) / 3,
    alignItems: 'center',
    paddingVertical: 8,
  },
  gridValue: {
    color: '#1a2027',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  gridLabel: {
    color: '#718096',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  errorBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 24,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#feb2b2',
  },
  errorText: {
    color: '#c53030',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  }
});
