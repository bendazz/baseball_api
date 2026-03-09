from typing import Optional
from sqlmodel import SQLModel, Field


class Team(SQLModel, table=True):
    __tablename__ = "teams"

    teamID: str = Field(primary_key=True)
    yearID: int = Field(primary_key=True)
    name: Optional[str] = None

class People(SQLModel, table=True):
    __tablename__ = "people"

    ID: int = Field(primary_key=True)
    playerID: str
    nameFirst: Optional[str] = None
    nameLast: Optional[str] = None
    birthYear: Optional[int] = None
    birthCity: Optional[str] = None
    birthState: Optional[str] = None
    bats: Optional[str] = None
    throws: Optional[str] = None
    debut: Optional[str] = None
    finalGame: Optional[str] = None

class Batting(SQLModel, table=True):
    __tablename__ = "batting"

    playerID: str = Field(primary_key = True)
    yearID: str = Field(primary_key=True, foreign_key="teams.yearID")
    stint: int = Field(primary_key=True)
    teamID: str = Field(default=None, primary_key=True, foreign_key="teams.teamID")
    G: Optional[int] = None
    AB: Optional[int] = None
    H: Optional[int] = None
    HR: Optional[int] = None
    RBI: Optional[int] = None
    BB: Optional[int] = None
    SO: Optional[int] = None

