from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    last_name: str
    email: str
    password: str
    age: str
    gender: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: str 
    name: str
    last_name: str
    password: str
    email: str
    age: str
    gender: str

    class Config:
        orm_mode = True
        from_attributes = True

