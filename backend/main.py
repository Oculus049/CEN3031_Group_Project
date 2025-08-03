from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from db import database, metadata, engine, SessionLocal
from schemas import *
from models import users, userAvailabilities


app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["origins"],
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


metadata.create_all(engine)


@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

from fastapi.responses import HTMLResponse

@app.get("/" or "/login", response_class=HTMLResponse)
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
        return file.read()

@app.post("/availability")
async def save_availability(data: AvailabilityCreate):
    query = userAvailabilities.insert().values(
        username=data.username,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time
    )
    await database.execute(query)
    return {"message": "Availability saved successfully."}

@app.post("/register")
async def register(user: UserCreate):
    db_user, hashed_password = await get_user_by_username(database, username=user.username)
    if db_user.find(" ") != -1 or user.password.find(" ") != -1 or db_user.find("\"") != -1 or user.password.find("\"") != -1:
        raise HTTPException(status_code=400, detail="Do not include spaces or quotes in your username/password")
    query = users.select().where(users.c.username == db_user)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken.")
    query = users.insert().values(username=user.username, password=hashed_password)
    await database.execute(query)
    return {"message": "User registered successfully."}

@app.post("/login")
async def login(user: UserLogin):
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if not existing_user:
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    if not pwd_context.verify(user.password, existing_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    return {"message": "Login successful."}

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
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