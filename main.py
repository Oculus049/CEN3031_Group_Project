from fastapi import FastAPI, HTTPException
from passlib.context import CryptContext
from db import database, metadata, engine
from models import users, userAvailabilities
from schemas import UserLogin, UserCreate, AvailabilityCreate


app = FastAPI()
metadata.create_all(engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

from fastapi.responses import HTMLResponse

@app.get("/" or "/login", response_class=HTMLResponse)
async def root():
    with open("login.html", "r") as file:
        return file.read()

@app.get("/home", response_class=HTMLResponse)
async def home():
    with open("home.html", "r") as file:
        return file.read()

@app.get("/AdminDash", response_class=HTMLResponse)
async def admin_dash():
    with open("Admin_Dashboard.html", "r") as file:
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
    print(user.username, user.password)
    if user.username.find(" ") != -1 or user.password.find(" ") != -1:
        raise HTTPException(status_code=400, detail="Do not include spaces in your username/password")
    if user.username.find("\"") != -1 or user.password.find("\"") != -1:
        raise HTTPException(status_code=400, detail="Do not include quotes in your username/password")
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken.")
    hashed_password = pwd_context.hash(user.password)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)