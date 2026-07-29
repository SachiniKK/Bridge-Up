from fastapi import FastAPI
from app.database import init_db
from app.collector import router as collector_router

app = FastAPI(title="BridgeUp NLP Service")

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(collector_router)

@app.get("/")
def root():
    return {"message": "BridgeUp NLP service is running"}