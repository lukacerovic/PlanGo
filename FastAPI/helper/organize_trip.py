from geopy.distance import geodesic
from datetime import datetime, timedelta
from helper.constants import type_to_time

def calculate_distance(point1, point2):
    """Izračunava udaljenost između dve tačke na osnovu geografskih koordinata."""
    return geodesic((point1["latitude"], point1["longitude"]), (point2["latitude"], point2["longitude"])).km

def estimate_visit_time(place_type):
    """Procena vremena potrebnog za obilazak na osnovu tipa atrakcije."""
    return type_to_time.get(place_type, 60)

def estimate_travel_time(distance_km, speed_kmh=5):
    """Procena vremena putovanja u minutama na osnovu udaljenosti i brzine kretanja."""
    return (distance_km / speed_kmh) * 60

def organize_trip(route, origin_point, num_days, date_from):
    """
    Optimizuje raspored obilaska tačaka tako da dnevne rute budu što sličnije po ukupnoj kilometraži,
    uz obavezan početak svakog dana sa početnom tačkom (isOrigin=True).

    Povratna vrednost:
    - Dict sa ključevima "dayOne", "dayTwo", ... i listama tačaka kao vrednostima.
    """
    date_from_parsed = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
    origin_point["isOrigin"] = True
    origin_point["distance"] = 0  

    non_origin_points = [p for p in route if not p.get("isOrigin", False)]

    for point in non_origin_points:
        point["estimated_visit_time"] = point.get("estimated_visit_time", estimate_visit_time(point.get("type", "undefined")))
        point["distance"] = calculate_distance(origin_point, point)

    sorted_route = sorted(non_origin_points, key=lambda x: x["distance"])
    daily_routes = {day: [] for day in range(1, num_days + 1)}

    for point in sorted_route:
        best_day = min(range(1, num_days + 1), key=lambda d: sum(p.get("distance", 0) for p in daily_routes[d]))
        daily_routes[best_day].append(point)

    final_route = {}
    for day, points in daily_routes.items():
        day_key = f"day{day}"
        formatted_day_key = f"day{day}".replace("1", "One").replace("2", "Two").replace("3", "Three").replace("4", "Four").replace("5", "Five")

        current_time = date_from_parsed + timedelta(days=day - 1, hours=8)

        for i, point in enumerate(points):
            point["arrival_time"] = current_time.isoformat()
            estimated_time = point.get("estimated_visit_time", 60)
            point["finish_time"] = (current_time + timedelta(minutes=estimated_time)).isoformat()

            if formatted_day_key not in final_route:
                final_route[formatted_day_key] = []
            final_route[formatted_day_key].append(point)

            if i < len(points) - 1:
                travel_time = estimate_travel_time(calculate_distance(point, points[i + 1]))
                current_time += timedelta(minutes=estimated_time + travel_time)

    print(final_route)
    return final_route


