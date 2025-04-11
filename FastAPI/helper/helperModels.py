from typing import Any, Optional
from pydantic import BaseModel


class Attraction(BaseModel):
    name: str
    latitude: float
    longitude: float

class TripBase(BaseModel):
    place_name: str
    place_img: Optional[str] = None
    date_from: str
    date_to: str
    route: Any
    origin_point: dict
    city_coordinates: dict
    user_id: str

class TripModel(TripBase):
    id: str

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None


class DirectionsRequest(BaseModel):
    start_lat: float
    start_lon: float
    end_lat: float
    end_lon: float


class VoiceCommandRequest(BaseModel):
    command: str