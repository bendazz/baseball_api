from typing import Optional
from sqlmodel import SQLModel, Field

class Team(SQLModel, table=True):
    __tablename__ = "teams"

    teamID: str = Field(primary_key=True)
    yearID: int = Field(primary_key=True)
    lgID: Optional[str] = None
    divID: Optional[str] = None
    W: Optional[int] = None
    L: Optional[int] = None
    name: Optional[str] = None
    HR: Optional[int] = None
