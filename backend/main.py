from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import User, Meeting, UserAvailability
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from fastapi.responses import HTMLResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the current user
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    password: str

class AvailabilityCreate(BaseModel):
    username: str
    date: str
    start_time: str
    end_time: str

class MeetingCreate(BaseModel):
    title: str
    date: str
    time: str
    url: str


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user, hashed_password

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


"""@app.get("/" or "/login", response_class=HTMLResponse)
async def root():
    with open("../login.html", "r") as file:
        return file.read()

@app.get("/home", response_class=HTMLResponse)
async def home():
    with open("../home.html", "r") as file:
        return file.read()

@app.get("/AdminDash", response_class=HTMLResponse)
async def admin_dash():
    with open("../Admin_Dashboard.html", "r") as file:
        return file.read()"""

@app.post("/availability")
def save_availability(data: AvailabilityCreate, db: Session = Depends(get_db)):
    availability = UserAvailability(
        username=data.username,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return {"message": "Availability saved successfully."}

@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists.")
    return create_user(db, user)
'''
    if db_user.find(" ") != -1 or user.password.find(" ") != -1 or db_user.find("\"") != -1 or user.password.find("\"") != -1:
        raise HTTPException(status_code=400, detail="Do not include spaces or quotes in your username/password")
    query = users.select().where(users.c.username == db_user)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken.")
    query = users.insert().values(username=user.username, password=hashed_password)
    await database.execute(query)
    return {"message": "User registered successfully."}'''

"""@app.post("/login")
async def login(user: UserLogin):
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if not existing_user:
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    if not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    return {"message": "Login successful."}"""

@app.post("/meetings")
def save_meetings(data: MeetingCreate, db: Session = Depends(get_db)):
    # Ensure date is in YYYY-MM-DD format with leading zeros
    try:
        parts = data.date.split('-')
        year = parts[0]
        month = str(parts[1]).zfill(2)
        day = str(parts[2]).zfill(2)
        formatted_date = f"{year}-{month}-{day}"
    except Exception:
        raise HTTPException(status_code=400, detail="Date must be in YYYY-MM-DD format")

    meeting = Meeting(
        title=data.title,
        date=formatted_date,
        time=data.time,
        url=data.url,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return {"message": "Meeting saved successfully.", "meeting_id": meeting.id}

@app.get("/meetings")
def get_meetings(year: int = Query(...), month: int = Query(...), db: Session = Depends(get_db)):
    # month is 1-based (January=1)
    month_str = str(month).zfill(2)
    year_str = str(year)
    # Dates are stored as "YYYY-MM-DD"
    meetings = db.query(Meeting).all() #.filter(Meeting.date.like(f"{year_str}-{month_str}-%")).all()
    # Convert SQLAlchemy objects to dicts
    print(f"Retrieved {len(meetings)} meetings for {year_str}-{month_str}")
    return [ 
        {
            "id": m.id,
            "title": m.title,
            "date": m.date,
            "time": m.time,
            "url": m.url
        } for m in meetings
    ]

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password.")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Invalid or expired authentication credentials")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid or expired authentication credentials")

@app.get("/verify-token/{token}")
async def verify_user_token(token: str):
    verify_token(token)
    return {"message": "Token is valid."}

@app.post("/register-direct")
def register_user_direct(username: str = Query(...), password: str = Query(...), db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, username=username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists.")
    if " " in username or " " in password or "\"" in username or "\"" in password:
        raise HTTPException(status_code=400, detail="Do not include spaces or quotes in your username/password")
    hashed_password = pwd_context.hash(password)
    db_user = User(username=username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully.", "username": username}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)