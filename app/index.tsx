import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Droplets, Eye, Wind, Thermometer, Gauge, Sun, Moon } from 'lucide-react-native';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  name: string;
}

const API_KEY = 'a2d15851fae2010a4834e5ddd6b06b67';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const fetchWeather = async (city: string): Promise<WeatherData> => {
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return await response.json();
};

const calculateDewPoint = (temp: number, humidity: number): number => {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);
  return Math.round(dewPoint);
};

const formatTime = (timestamp: number, timezone: number): string => {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

export default function HomeScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      const data = await fetchWeather('Port-au-Prince');
      setWeather(data);
      setError(null);
    } catch (err) {
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'No data available'}</Text>
      </View>
    );
  }

  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeString = `As of ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm} EDT`;

  const dewPoint = calculateDewPoint(weather.main.feels_like, weather.main.humidity);
  const visibilityKm = (weather.visibility / 1000).toFixed(1);
  const sunriseTime = formatTime(weather.sys.sunrise, weather.timezone);
  const sunsetTime = formatTime(weather.sys.sunset, weather.timezone);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#5B4E8A', '#7B6BA8', '#9B88C6']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.cityName}>{weather.name}</Text>
          <Text style={styles.timestamp}>{timeString}</Text>
        </View>

        <View style={styles.mainTempSection}>
          <Text style={styles.mainTemp}>{Math.round(weather.main.temp)}°</Text>
          <Cloud color="#ffffff" size={80} style={styles.weatherIcon} />
        </View>

        <Text style={styles.weatherDescription}>{weather.weather[0].description}</Text>
        <Text style={styles.highLow}>
          Day {Math.round(weather.main.temp_max)}° • Night {Math.round(weather.main.temp_min)}°
        </Text>

        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>⚠ RIP CURRENT STATE...</Text>
          <Text style={styles.moreText}>+1 MORE</Text>
        </View>
      </LinearGradient>

      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Weather Today in {weather.name}</Text>

        <View style={styles.feelsLikeSection}>
          <View style={styles.feelsLikeLeft}>
            <Text style={styles.feelsLikeLabel}>Feels Like</Text>
            <Text style={styles.feelsLikeTemp}>{Math.round(weather.main.feels_like)}°</Text>
          </View>

          <View style={styles.sunArc}>
            <View style={styles.sunIndicator} />
            <View style={styles.sunTimes}>
              <View style={styles.sunTimeItem}>
                <Sun color="#FFA500" size={14} />
                <Text style={styles.sunTimeText}>{sunriseTime}</Text>
              </View>
              <View style={styles.sunTimeItem}>
                <Sun color="#FF6347" size={14} />
                <Text style={styles.sunTimeText}>{sunsetTime}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Thermometer color="#666" size={20} />
              <Text style={styles.detailLabel}>High / Low</Text>
              <Text style={styles.detailValue}>--/{Math.round(weather.main.temp_min)}°</Text>
            </View>
            <View style={styles.detailItem}>
              <Wind color="#666" size={20} />
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>↑ {Math.round(weather.wind.speed)} km/h</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Droplets color="#666" size={20} />
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{weather.main.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Droplets color="#666" size={20} />
              <Text style={styles.detailLabel}>Dew Point</Text>
              <Text style={styles.detailValue}>{dewPoint}°</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Gauge color="#666" size={20} />
              <Text style={styles.detailLabel}>Pressure</Text>
              <Text style={styles.detailValue}>↓ {weather.main.pressure} hPa</Text>
            </View>
            <View style={styles.detailItem}>
              <Sun color="#666" size={20} />
              <Text style={styles.detailLabel}>UV Index</Text>
              <Text style={styles.detailValue}>2 of 11</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Eye color="#666" size={20} />
              <Text style={styles.detailLabel}>Visibility</Text>
              <Text style={styles.detailValue}>{visibilityKm} km</Text>
            </View>
            <View style={styles.detailItem}>
              <Moon color="#666" size={20} />
              <Text style={styles.detailLabel}>Moon Phase</Text>
              <Text style={styles.detailValue}>Waning Gibbous</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5B4E8A',
  },
  headerGradient: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 14,
    color: '#ffffff',
  },
  mainTempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  mainTemp: {
    fontSize: 100,
    fontWeight: '200',
    color: '#ffffff',
  },
  weatherIcon: {
    marginLeft: 20,
  },
  weatherDescription: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  highLow: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 10,
  },
  alertContainer: {
    backgroundColor: 'rgba(255, 140, 0, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  moreText: {
    color: '#ffffff',
    fontSize: 12,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  feelsLikeSection: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  feelsLikeLeft: {
    flex: 1,
  },
  feelsLikeLabel: {
    fontSize: 14,
    color: '#666',
  },
  feelsLikeTemp: {
    fontSize: 60,
    fontWeight: '300',
    marginVertical: 10,
  },
  sunArc: {
    width: 120,
    alignItems: 'center',
  },
  sunIndicator: {
    width: 80,
    height: 40,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    borderWidth: 2,
    borderColor: '#FFA500',
    borderBottomWidth: 0,
  },
  sunTimes: {
    flexDirection: 'column',
    gap: 5,
    marginTop: 8,
  },
  sunTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sunTimeText: {
    fontSize: 12,
    color: '#666',
  },
  detailsGrid: {
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
