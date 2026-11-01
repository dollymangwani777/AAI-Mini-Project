import math
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from ..models import Incident, DuplicateReport, IncidentLog
from ..config import settings

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def find_duplicate_cluster(
    db: Session,
    issue_type: str,
    lat: float,
    lng: float,
    radius_meters: float = 100.0
) -> Optional[Tuple[Incident, float]]:
    """
    Agent 3: Duplicate & Incident Clustering Node
    Scans active (non-resolved) incidents with matching semantic issue type
    and checks if within radius_meters using Haversine formula.
    """
    # Active incidents that have not been resolved
    active_incidents = db.query(Incident).filter(
        Incident.status.in_(["SUBMITTED", "IN_PROGRESS", "ESCALATED"]),
        Incident.issue_type == issue_type
    ).all()

    best_match: Optional[Incident] = None
    min_dist: float = float("inf")

    for inc in active_incidents:
        dist = haversine_distance_meters(lat, lng, inc.latitude, inc.longitude)
        if dist <= radius_meters and dist < min_dist:
            min_dist = dist
            best_match = inc

    if best_match:
        return best_match, min_dist
    return None

def merge_into_cluster(
    db: Session,
    parent_incident: Incident,
    citizen_text: str,
    raw_location: str,
    citizen_contact: Optional[str],
    distance_meters: float
) -> Incident:
    """
    Appends the report to the parent incident, increments reported_by_count,
    re-evaluates severity, and logs the cluster merge.
    """
    # 1. Increment count
    parent_incident.reported_by_count += 1
    
    # 2. Bump severity score (each additional citizen report increases civic urgency by +8 up to 100)
    old_score = parent_incident.severity_score
    new_score = min(100.0, old_score + 8.0)
    parent_incident.severity_score = new_score
    
    # Re-evaluate severity level
    if new_score >= 80:
        parent_incident.severity_level = "CRITICAL"
    elif new_score >= 60:
        parent_incident.severity_level = "HIGH"
    elif new_score >= 35:
        parent_incident.severity_level = "MEDIUM"
    else:
        parent_incident.severity_level = "LOW"

    # 3. Create Duplicate Report record
    dup = DuplicateReport(
        parent_incident_id=parent_incident.id,
        ticket_number=parent_incident.ticket_number,
        description=citizen_text,
        raw_location=raw_location,
        citizen_contact=citizen_contact,
        distance_meters=round(distance_meters, 1)
    )
    db.add(dup)

    # 4. Create immutable audit log
    log = IncidentLog(
        incident_id=parent_incident.id,
        ticket_number=parent_incident.ticket_number,
        event_type="CLUSTER_MERGED",
        actor="Agent 3: Clustering Node",
        message=(
            f"Clustered repeated report from citizen within {round(distance_meters, 1)}m. "
            f"Reported count increased to {parent_incident.reported_by_count}. "
            f"Severity bumped from {old_score:.1f} to {new_score:.1f} ({parent_incident.severity_level})."
        )
    )
    db.add(log)
    db.commit()
    db.refresh(parent_incident)
    return parent_incident
