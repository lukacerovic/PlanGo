import openrouteservice
from fastapi import HTTPException

API_KEY = "5b3ce3597851110001cf6248adc7013a685e46a59f0bba305be49c2e"

client = openrouteservice.Client(key=API_KEY)

def get_directions(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    try:
        route = client.directions(
            coordinates=[(start_lon, start_lat), (end_lon, end_lat)],
            profile="driving-car",  
            format="geojson"
        )
        return route
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting route: {str(e)}")
