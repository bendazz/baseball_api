from fastapi import FastAPI
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Team
from fastapi.staticfiles import StaticFiles

app = FastAPI()

create_db_and_tables()

@app.get("/teams")
def get_teams(yearID):
    with Session(engine) as session:
        statement = (
            select(Team.name, Team.lgID, Team.divID, Team.W, Team.L)
            .where(Team.yearID == yearID)
            .order_by(Team.lgID, Team.divID, Team.W.desc())
        )
        records = session.exec(statement).all()
        return [{"name": name, "lgID": lgID, "divID": divID, "W": W, "L": L} for name, lgID, divID, W, L in records]


app.mount("/", StaticFiles(directory="static", html=True), name="static")