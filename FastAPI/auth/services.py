import uuid
from sqlalchemy.orm import Session
from models import User
from auth.utils import hash_password, verify_password, create_access_token
from auth.schemas import UserCreate, UserLogin, UserOut  # Dodaj UserOut
from fastapi import HTTPException, status
from datetime import timedelta

def create_user(db: Session, user_create: UserCreate):
    # Hashing the password
    hashed_password = hash_password(user_create.password)
    
    db_user = User(
        id=str(uuid.uuid4()),
        name=user_create.name,
        last_name=user_create.last_name,
        email=user_create.email,
        password=hashed_password,
        age=user_create.age,
        gender=user_create.gender
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserOut.from_orm(db_user)


def authenticate_user(db: Session, user_login: UserLogin):
    user = db.query(User).filter(User.email == user_login.email).first()
    if user and verify_password(user_login.password, user.password):
        return user
    return None

def create_token_for_user(user):
    user_data = {
        "sub": user.email,
        "id": user.id
    }
    token = create_access_token(data=user_data, expires_delta=timedelta(hours=1))
    return token
