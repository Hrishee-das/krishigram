import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "0503057c28cd4e2e8b621149262802")

def get_live_weather(location: str = "New Delhi, IN") -> str:
    """
    Fetches live weather telemetry for the user's location using WeatherAPI.com.
    Returns a formatted string describing the current conditions.
    """
    if not WEATHER_API_KEY:
        return "Weather API Key not configured. Relying on general seasonal advice."
        
    try:
        # weatherapi.com endpoint
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHER_API_KEY}&q={location}&aqi=no"
        response = requests.get(url, timeout=3)
        
        if response.status_code == 200:
            data = response.json()
            temp = data['current']['temp_c']
            humidity = data['current']['humidity']
            description = data['current']['condition']['text']
            wind_speed = data['current']['wind_kph']
            
            return (f"Live Local Weather ({location}): "
                    f"{temp}°C, {humidity}% humidity, "
                    f"conditions are '{description}' with wind at {wind_speed} km/h.")
        else:
             return f"Weather data unavailable for {location} (API HTTP {response.status_code})."
    except Exception as e:
        print(f"Weather Fetch Error: {e}")
        return "Weather data unavailable due to network timeout."
