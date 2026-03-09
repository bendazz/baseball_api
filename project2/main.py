from fastapi import FastAPI
from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import Team, Batting, People
from fastapi.staticfiles import StaticFiles


app = FastAPI()

create_db_and_tables()

@app.get("/teams")
def get_teams(yearID):
    with Session(engine) as session:
        statement = (
            select(Team.teamID, Team.name)
            .where(Team.yearID == yearID)
        )
        records = session.exec(statement).all()
        return [dict(r._mapping) for r in records]

@app.get("/stats")
def get_stats(teamID,yearID):
    with Session(engine) as session:
        statement = (
            select(
                Batting.playerID,
                Batting.G, Batting.AB, Batting.H, Batting.HR,
                Batting.RBI, Batting.BB, Batting.SO,
                People.nameFirst, People.nameLast
            )
            .join(People, Batting.playerID == People.playerID)
            .where((Batting.yearID == yearID) & (Batting.teamID == teamID))
        )
        results = session.exec(statement).all()
        return [dict(r._mapping) for r in results]

@app.get("/player")
def get_player(playerID):
    with Session(engine) as session:
        bio_statement = (
            select(
                People.nameFirst, People.nameLast, People.birthYear,
                People.birthCity, People.birthState, People.bats,
                People.throws, People.debut, People.finalGame
            )
            .where(People.playerID == playerID)
        )
        bio = session.exec(bio_statement).first()
        if not bio:
            return None

        stats_statement = (
            select(
                Batting.yearID, Batting.teamID, Batting.G, Batting.AB,
                Batting.H, Batting.HR, Batting.RBI, Batting.BB, Batting.SO
            )
            .where(Batting.playerID == playerID)
            .order_by(Batting.yearID)
        )
        stats = session.exec(stats_statement).all()

        return {
            **dict(bio._mapping),
            "stats": [dict(r._mapping) for r in stats]
        }
        




app.mount("/", StaticFiles(directory="static", html=True), name="static")
