import uuid
import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from ..models import Incident, IncidentLog
from ..schemas import ComplaintSubmissionRequest, ComplaintSubmissionResponse, AgentPipelineStep, IncidentResponse
from .understanding_agent import run_understanding_agent
from .location_agent import run_location_agent
from .clustering_agent import find_duplicate_cluster, merge_into_cluster
from .severity_agent import calculate_priority_severity
from .routing_agent import route_department
from .sla_agent import assign_sla

def generate_ticket_number() -> str:
    # Generates a professional city ticket ID, e.g., CP-2026-7842
    short_id = uuid.uuid4().hex[:6].upper()
    return f"CP-2026-{short_id}"

def build_incident_response(inc: Incident) -> IncidentResponse:
    now = datetime.now(timezone.utc)
    
    # Handle timezone-naive vs timezone-aware comparisons cleanly
    deadline = inc.sla_deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    
    time_remaining_seconds = (deadline - now).total_seconds()
    is_sla_breached = (time_remaining_seconds < 0) and (inc.status != "RESOLVED")

    return IncidentResponse(
        id=inc.id,
        ticket_number=inc.ticket_number,
        title=inc.title,
        raw_description=inc.raw_description,
        issue_type=inc.issue_type,
        detected_risks=inc.detected_risks,
        urgency_hint=inc.urgency_hint,
        severity_score=inc.severity_score,
        severity_level=inc.severity_level,
        ward_id=inc.ward_id,
        ward_name=inc.ward_name,
        raw_location=inc.raw_location,
        latitude=inc.latitude,
        longitude=inc.longitude,
        assigned_department=inc.assigned_department,
        status=inc.status,
        escalation_level=inc.escalation_level,
        reported_by_count=inc.reported_by_count,
        citizen_contact=inc.citizen_contact,
        image_url=inc.image_url,
        sla_hours=inc.sla_hours,
        sla_deadline=inc.sla_deadline,
        created_at=inc.created_at,
        updated_at=inc.updated_at,
        resolved_at=inc.resolved_at,
        resolution_notes=inc.resolution_notes,
        resolved_by=inc.resolved_by,
        is_sla_breached=is_sla_breached,
        time_remaining_seconds=round(time_remaining_seconds, 1)
    )

async def execute_ingestion_pipeline(
    db: Session,
    request: ComplaintSubmissionRequest
) -> ComplaintSubmissionResponse:
    pipeline_trace = []
    
    # --- Agent 1: Complaint Understanding Agent ---
    understanding = await run_understanding_agent(request.description)
    pipeline_trace.append(AgentPipelineStep(
        agent_name="Complaint Understanding Agent",
        action="Extracted semantic issue category, risks, and urgency level",
        status="COMPLETED",
        output={
            "issue_type": understanding.issue_type,
            "detected_risks": understanding.detected_risks,
            "urgency_hint": understanding.urgency_hint,
            "clean_title": understanding.clean_title
        }
    ))
    
    # --- Agent 2: Location Intelligence Agent ---
    location_info = run_location_agent(
        raw_location=request.location,
        gps_lat=request.latitude,
        gps_lng=request.longitude
    )
    pipeline_trace.append(AgentPipelineStep(
        agent_name="Location Intelligence Agent",
        action="Parsed location string & normalized ward geofence coordinates",
        status="COMPLETED",
        output={
            "ward_id": location_info.ward_id,
            "ward_name": location_info.ward_name,
            "latitude": location_info.latitude,
            "longitude": location_info.longitude,
            "confidence": location_info.confidence_score
        }
    ))
    
    # --- Agent 3: Duplicate & Incident Clustering Node ---
    cluster_match = find_duplicate_cluster(
        db=db,
        issue_type=understanding.issue_type,
        lat=location_info.latitude,
        lng=location_info.longitude,
        radius_meters=100.0
    )
    
    if cluster_match is not None:
        parent_incident, dist_m = cluster_match
        updated_parent = merge_into_cluster(
            db=db,
            parent_incident=parent_incident,
            citizen_text=request.description,
            raw_location=location_info.normalized_address,
            citizen_contact=request.citizen_contact,
            distance_meters=dist_m
        )
        
        pipeline_trace.append(AgentPipelineStep(
            agent_name="Duplicate & Clustering Node",
            action="Matched active existing incident within 100m radius",
            status="MERGED_DUPLICATE",
            output={
                "parent_ticket": parent_incident.ticket_number,
                "distance_meters": round(dist_m, 1),
                "new_report_count": updated_parent.reported_by_count,
                "bumped_severity": updated_parent.severity_score
            }
        ))
        
        return ComplaintSubmissionResponse(
            ticket_number=parent_incident.ticket_number,
            is_duplicate=True,
            parent_ticket=parent_incident.ticket_number,
            message=f"Your complaint was matched with an active report ({parent_incident.ticket_number}) within {round(dist_m, 1)}m. Your report has reinforced its priority!",
            incident=build_incident_response(updated_parent),
            pipeline_trace=pipeline_trace
        )
    
    pipeline_trace.append(AgentPipelineStep(
        agent_name="Duplicate & Clustering Node",
        action="No spatial/semantic duplicate found within 100m. Creating new parent incident.",
        status="NEW_INCIDENT",
        output={"status": "UNIQUE_LOCATION_VERIFIED"}
    ))

    # --- Agent 4: Priority & Severity Agent ---
    severity_score, severity_level = calculate_priority_severity(
        issue_type=understanding.issue_type,
        detected_risks=understanding.detected_risks,
        urgency_hint=understanding.urgency_hint,
        reported_by_count=1
    )
    pipeline_trace.append(AgentPipelineStep(
        agent_name="Priority & Severity Agent",
        action="Computed dynamic danger score and priority classification",
        status="COMPLETED",
        output={
            "severity_score": severity_score,
            "severity_level": severity_level
        }
    ))

    # --- Agent 5: Department Routing Agent ---
    department = route_department(
        issue_type=understanding.issue_type,
        detected_risks=understanding.detected_risks
    )
    pipeline_trace.append(AgentPipelineStep(
        agent_name="Department Routing Agent",
        action="Assigned accountable municipal division based on issue jurisdiction",
        status="COMPLETED",
        output={"assigned_department": department}
    ))

    # --- Agent 6: SLA & Deadline Assignment Agent ---
    now = datetime.now(timezone.utc)
    sla_hours, sla_deadline = assign_sla(severity_level, base_time=now)
    pipeline_trace.append(AgentPipelineStep(
        agent_name="SLA & Deadline Assignment Agent",
        action=f"Target SLA of {sla_hours}h assigned based on {severity_level} priority",
        status="COMPLETED",
        output={
            "sla_hours": sla_hours,
            "sla_deadline": sla_deadline.isoformat()
        }
    ))

    # Persist Incident
    ticket_num = generate_ticket_number()
    new_incident = Incident(
        ticket_number=ticket_num,
        title=understanding.clean_title,
        raw_description=request.description,
        issue_type=understanding.issue_type,
        detected_risks_json=json.dumps(understanding.detected_risks),
        urgency_hint=understanding.urgency_hint,
        severity_score=severity_score,
        severity_level=severity_level,
        ward_id=location_info.ward_id,
        ward_name=location_info.ward_name,
        raw_location=location_info.normalized_address,
        latitude=location_info.latitude,
        longitude=location_info.longitude,
        assigned_department=department,
        status="SUBMITTED",
        escalation_level=0,
        reported_by_count=1,
        citizen_contact=request.citizen_contact,
        image_url=request.image_url,
        sla_hours=sla_hours,
        sla_deadline=sla_deadline,
        created_at=now,
        updated_at=now
    )
    db.add(new_incident)
    db.flush()

    # Initial Audit Log
    initial_log = IncidentLog(
        incident_id=new_incident.id,
        ticket_number=new_incident.ticket_number,
        event_type="CREATED",
        actor="CivicPulse Multi-Agent Pipeline",
        message=(
            f"Ticket {new_incident.ticket_number} created and dispatched to {department}. "
            f"Priority: {severity_level} ({severity_score:.1f}/100). SLA: {sla_hours} hours."
        ),
        metadata_json=json.dumps({
            "detected_risks": understanding.detected_risks,
            "ward": location_info.ward_id
        }),
        timestamp=now
    )
    db.add(initial_log)
    db.commit()
    db.refresh(new_incident)

    return ComplaintSubmissionResponse(
        ticket_number=new_incident.ticket_number,
        is_duplicate=False,
        parent_ticket=None,
        message=f"Grievance successfully registered with Ticket #{new_incident.ticket_number}",
        incident=build_incident_response(new_incident),
        pipeline_trace=pipeline_trace
    )
