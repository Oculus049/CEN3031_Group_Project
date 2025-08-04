from sqlalchemy import Table, Column, Integer, String
from database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(35), unique=True, nullable=False, index=True)
    hashed_password = Column(String)

User.metadata.create_all(bind=engine)
