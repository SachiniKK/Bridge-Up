from fastapi import FastAPI


app = FastAPI(
    title="Bridge-Up NLP Service"
)


@app.get("/")
def home():
    return {
        "message":"NLP Service Running"
    }


@app.get("/health")
def health():
    return {
        "status":"ok"
    }