import os
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")

def get_live_weather(location: str = "New Delhi, IN") -> str:
    """
    Fetches live weather telemetry for the user's location using OpenWeatherMap.
    Returns a formatted string describing the current conditions.
    """
    if not WEATHER_API_KEY:
        return "Weather API Key not configured. Relying on general seasonal advice."
        
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={WEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=3)
        
        if response.status_code == 200:
            data = response.json()
            temp = data['main']['temp']
            humidity = data['main']['humidity']
            description = data['weather'][0]['description']
            wind_speed = data['wind']['speed']
            
            return (f"Live Local Weather ({location}): "
                    f"{temp}°C, {humidity}% humidity, "
                    f"conditions are '{description}' with wind at {wind_speed} m/s.")
        else:
             return f"Weather data unavailable for {location} (API HTTP {response.status_code})."
    except Exception as e:
        print(f"Weather Fetch Error: {e}")
        return "Weather data unavailable due to network timeout."
