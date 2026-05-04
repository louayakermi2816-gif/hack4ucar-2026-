from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.upload import router as upload_router
from app.api.data import router as data_router
from app.api.auth import router as auth_router
from app.api.aggregation import router as aggregation_router
from app.api.chat import router as chat_router
from app.ml.routes import router as ml_router
from app.api.reports import router as reports_router
import traceback


app = FastAPI(title="HACK4UCAR 2026 API", version="0.1.0")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": str(exc)})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(data_router)
app.include_router(auth_router)
app.include_router(aggregation_router)
app.include_router(chat_router)
app.include_router(ml_router)
app.include_router(reports_router)



@app.get("/health")
def health():
    return {"status": "ok"}
