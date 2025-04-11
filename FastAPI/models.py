import uuid
from sqlalchemy import Column, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base): 
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True, index=True)
    age = Column(String)
    gender = Column(String)
    password = Column(String)

    trips = relationship("Trip", back_populates="user")


class Trip(Base):
    __tablename__ = 'trips'

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    city_coordinates = Column(JSON, nullable=False) 
    place_name = Column(String, nullable=False)
    place_img = Column(String, nullable=True)
    date_from = Column(String, nullable=False)
    date_to = Column(String, nullable=False)
    route = Column(JSON, nullable=False)
    origin_point = Column(JSON, nullable=False) 
    user_id = Column(String, ForeignKey('users.id'), nullable=False)

    user = relationship("User", back_populates="trips")