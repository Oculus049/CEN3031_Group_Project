from sqlalchemy import Table, Column, Integer, String
from db import metadata

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String(35), unique=True, nullable=False, index=True),
    Column("password", String),
    # Column("authority", String)
)

meetings = Table(
    "meetings",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("title", String),
    Column("time", String),
)

userAvailabilities = Table(
    "userAvailabilities",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("username", String, nullable=False),
    Column("date", String, nullable=False),
    Column("start_time", String, nullable=False),
    Column("end_time", String, nullable=False),
)