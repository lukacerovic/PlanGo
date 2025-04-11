
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from helper.voiceCommanRecogntion import process_voice_command
from helper.helperModels import TripBase, TripModel, UserUpdateRequest, VoiceCommandRequest
from helper.getDirections import get_directions
from helper.scrapeImage import scrape_images
from helper.getAttractions import google_scrape
import models
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from auth.schemas import UserCreate, UserLogin, UserOut
from auth.services import create_user, authenticate_user, create_token_for_user
from auth.utils import hash_password, verify_token
from helper.searchImage import scrape_image_url
from helper.organize_trip import organize_trip
import json
from sqlalchemy import func


import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://10.0.2.2:8000",  # Za Android emulator
    "http://127.0.0.1:8000",  # Za fizičke uređaje na istom WiFi-ju
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

models.Base.metadata.create_all(bind=engine)


@app.post("/users/", response_model=UserOut)
async def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        new_user = create_user(db, user)
        return new_user
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create user")

@app.get("/users/", response_model=List[UserOut])
async def get_all_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users


@app.post("/login/")
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_login)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token_for_user(user)

    return {
        "token": token,
        "token_type": "bearer",
        "user": UserOut.from_orm(user)
    }


@app.put("/users/{user_id}")
def update_user(user_id: str, user_data: UserUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    print(user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.email:
        user.email = user_data.email

    if user_data.password:
        user.password = hash_password(user_data.password)

    db.commit()
    db.refresh(user)

    return {"message": "User updated successfully", "user": user}

@app.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.query(models.Trip).filter(models.Trip.user_id == user_id).delete()

    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@app.post("/trips/", response_model=TripModel)
async def create_trip(trip: TripBase, db: Session = Depends(get_db)):
    date_from = datetime.fromisoformat(trip.date_from.replace("Z", ""))
    date_to = datetime.fromisoformat(trip.date_to.replace("Z", ""))

    num_days = max(1, (date_to - date_from).days)

    optimized_route = organize_trip(trip.route, trip.origin_point, num_days, trip.date_from)

    db_trip = models.Trip(
        id=str(uuid.uuid4()),
        city_coordinates=trip.city_coordinates,
        place_name=trip.place_name,
        place_img=trip.place_img if trip.place_img else None,
        date_from=trip.date_from,
        date_to=trip.date_to,
        route=optimized_route, 
        origin_point=trip.origin_point,
        user_id=trip.user_id
    )

    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)

    return db_trip


@app.get("/trips/", response_model=List[TripModel])
async def get_trips(user_id: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Trip)
    if user_id:
        query = query.filter(models.Trip.user_id == user_id)
    return query.all()


@app.put("/trips/{trip_id}")
async def update_trips(trip_id: str, trip_route: dict, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()

    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    route_data = json.loads(trip.route) if isinstance(trip.route, str) else trip.route
    route_keys = list(route_data.keys())

    if trip_route["dayIndex"] >= len(route_keys):
        raise HTTPException(status_code=400, detail="Invalid day index")

    day_key = route_keys[trip_route["dayIndex"]]

    updated_route = {**route_data} 
    updated_route[day_key] = trip_route["route"] 

    trip.route = updated_route

    db.commit()
    db.refresh(trip)


@app.delete("/trips/{trip_id}", response_model=TripModel)
async def delete_trip(trip_id: str, db: Session = Depends(get_db)):
    trip_to_delete = db.query(models.Trip).filter(models.Trip.id == trip_id).first()

    if not trip_to_delete:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(trip_to_delete)
    db.commit()

    return trip_to_delete





@app.get("/scrape-attractions-img/")
async def scrape_attractions(attractions: str):
    attractions_list = json.loads(attractions) 
    updated_attractions = []

    updated_attractions = scrape_images(attractions_list)
    
    return updated_attractions





@app.get("/getPlaceImage/{place_name}")
async def get_place_image(place_name: str):
    print(f"Searching image for: {place_name}")
    image_url = scrape_image_url(place_name)
    return {"place_name": place_name, "image_url": image_url}

@app.get("/getAttractions/{place_name}")
async def get_attraction_list(place_name: str):
    attractions = google_scrape(place_name)
    print("Rezultati iz Google Scrape:", attractions)
    return attractions

@app.get("/protected/")
def protected_route(token: str = Depends(oauth2_scheme)):
    user_data = verify_token(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"message": "Access granted!", "user_data": user_data}


@app.get("/getDirections")
async def get_route_from_api(start_lat: float, start_lon: float, end_lat: float, end_lon: float):
    return get_directions(start_lat, start_lon, end_lat, end_lon)


@app.post("/voiceCommand/")
async def process_command(request: VoiceCommandRequest, db: Session = Depends(get_db)):
    action = process_voice_command(request.command)
    if action.get("delete"):
        place_name = action.get('place')
        date_str = action.get('from')

        try:
            date_from = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return {"error": "Neispravan datum"}

        trips = db.query(models.Trip).filter(
            models.Trip.place_name == place_name,
            func.date(models.Trip.date_from) == date_from.date()
        ).all()

        db.close()

        if trips:
            action["trips"] = [trip for trip in trips]
        else:
            action["message"] = "Sorry, there is no trip that you are wanting to delete"
    elif action.get("create"):
        place_name = action.get('place')
        image_url = scrape_image_url(place_name)
        tripToCreate = {
            "place_name": place_name,
            "date_from": action.get('from'),
            "date_to": action.get('until'),
            "place_img": image_url,
        }
        action["trip"] = tripToCreate


    return {"action": action}

