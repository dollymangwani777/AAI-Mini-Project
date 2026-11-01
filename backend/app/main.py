import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base, SessionLocal
from .models import Incident
from .routers import complaints_router, admin_router
from .services import start_escalation_scheduler, stop_escalation_scheduler, seed_database

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("CivicPulse.Main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize Database Tables
    logger.info("Initializing SQLite database tables...")
    Base.metadata.create_all(bind=engine)
    
    # 2. Seed Mock Incidents if empty
    db = SessionLocal()
    try:
        seed_database(db, force=False)
        logger.info("Database verification / seeding complete.")
    except Exception as e:
        logger.error(f"Error during database seeding: {e}", exc_info=True)
    finally:
        db.close()

    # 3. Start APScheduler Autonomous Escalation Engine
    logger.info("Starting Autonomous Escalation Engine background service...")
    start_escalation_scheduler()

    yield

    # Teardown
    logger.info("Shutting down background services...")
    stop_escalation_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="PS-10: Smart City Grievance & Civic Issue Resolution System (CivicPulse AI)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(complaints_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "system": "CivicPulse AI",
        "tagline": "Smart City Grievance & Civic Issue Resolution System",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_PREFIX
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "agents": [
            "Complaint Understanding Agent (LLM / Structured)",
            "Location Intelligence Agent (Spatial Geofencing)",
            "Duplicate & Incident Clustering Node (100m Haversine)",
            "Priority & Severity Agent (Dynamic 0-100)",
            "Department Routing Agent (Municipal Jurisdictions)",
            "SLA & Deadline Assignment Agent (Autonomous)"
        ],
        "escalation_engine": "RUNNING (APScheduler interval: 60s)"
    }
