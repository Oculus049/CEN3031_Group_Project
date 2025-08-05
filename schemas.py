from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class AvailabilityCreate(BaseModel):
    username: str
    date: str
    start_time: str
    end_time: str

class MeetingCreate(BaseModel):
    title: str
    url: str
    date: str
    time: str

