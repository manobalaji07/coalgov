import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api import auth, mines, compliance, inspections, capas, ai, reports, audit, ocr
from app.services.workflow_service import run_sla_escalation_job

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(mines.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(inspections.router, prefix=settings.API_V1_STR)
app.include_router(capas.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)
app.include_router(ocr.router, prefix=settings.API_V1_STR)

# Background scheduler for SLA Escalations
scheduler = BackgroundScheduler()

def scheduled_escalation_task():
    db = SessionLocal()
    try:
        run_sla_escalation_job(db)
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    scheduler.add_job(scheduled_escalation_task, 'interval', seconds=60)
    scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

# Serve Web Frontend Static Build if web/dist exists
WEB_DIST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "web", "dist"))

if os.path.exists(WEB_DIST_PATH):
    assets_path = os.path.join(WEB_DIST_PATH, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Don't intercept API routes or docs
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        
        # Serve static file if exists, else return SPA index.html
        target_file = os.path.join(WEB_DIST_PATH, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(WEB_DIST_PATH, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "status": "online",
            "docs": "/docs",
            "sih_ps": "SIH26024 - Ministry of Coal"
        }
