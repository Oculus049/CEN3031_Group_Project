from sqlalchemy import Table, Column, Integer, String
from database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(35), unique=True, nullable=False, index=True)
    hashed_password = Column(String)

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    time = Column(String, nullable=False)
    date = Column(String, nullable=False)
    url = Column(String, nullable=False)


class UserAvailability(Base):
    __tablename__ = "userAvailabilities"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)

User.metadata.create_all(bind=engine)
UserAvailability.metadata.create_all(bind=engine)
Meeting.metadata.create_all(bind=engine)
