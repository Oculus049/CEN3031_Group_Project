from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
from models import User
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

class UserLogin(BaseModel):
    username: str
    password: str

class AvailabilityCreate(BaseModel):
    username: str
    date: str
    start_time: str
    end_time: str


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

'''@app.post("/availability")
async def save_availability(data: AvailabilityCreate):
    query = userAvailabilities.insert().values(
        username=data.username,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time
    )
    await database.execute(query)
    return {"message": "Availability saved successfully."}'''

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)