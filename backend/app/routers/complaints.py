import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Incident, IncidentLog
from ..schemas import (
    ComplaintSubmissionRequest,
    ComplaintSubmissionResponse,
    TrackResponse,
    IncidentLogResponse
)
from ..agents.pipeline import execute_ingestion_pipeline, build_incident_response

router = APIRouter(prefix="/complaints", tags=["Citizen Complaints"])

@router.post("/submit", response_model=ComplaintSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    request: ComplaintSubmissionRequest,
    db: Session = Depends(get_db)
):
    """
    POST /api/complaints/submit
    Executes the 6-agent ingestion pipeline:
    1. Understanding Agent -> extracts category, risks, urgency
    2. Location Agent -> normalizes informal address or binds GPS
    3. Clustering Node -> checks 100m proximity & merges duplicates
    4. Priority & Severity Agent -> dynamic 0-100 score & level
    5. Department Routing Agent -> routes to municipal authority
    6. SLA Agent -> assigns strict deadline
    """
    return await execute_ingestion_pipeline(db, request)

@router.get("/track/{ticket_number}", response_model=TrackResponse)
def track_complaint(
    ticket_number: str,
    db: Session = Depends(get_db)
):
    """
    GET /api/complaints/track/{ticket_number}
    Returns lifecycle status, SLA countdown, assigned department,
    and complete immutable audit history for a citizen ticket.
    """
    inc = db.query(Incident).filter(Incident.ticket_number == ticket_number.upper().strip()).first()
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No civic incident found with ticket number '{ticket_number}'."
        )

    logs = db.query(IncidentLog).filter(IncidentLog.incident_id == inc.id).order_by(IncidentLog.timestamp.desc()).all()
    
    log_responses = []
    for l in logs:
        meta = {}
        try:
            if l.metadata_json:
                meta = json.loads(l.metadata_json)
        except Exception:
            pass
        log_responses.append(IncidentLogResponse(
            id=l.id,
            ticket_number=l.ticket_number,
            event_type=l.event_type,
            actor=l.actor,
            message=l.message,
            timestamp=l.timestamp,
            metadata=meta
        ))

    return TrackResponse(
        incident=build_incident_response(inc),
        logs=log_responses,
        duplicate_count=inc.reported_by_count - 1
    )
