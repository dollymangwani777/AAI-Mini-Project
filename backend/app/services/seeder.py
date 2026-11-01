import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from ..models import Incident, IncidentLog, DuplicateReport
from ..agents.location_agent import WARD_REGISTRY

MOCK_INCIDENTS_DATA = [
    {
        "ticket_number": "CP-2026-1001",
        "title": "Hazardous Open Manhole Near School Crossing",
        "description": "Deep open manhole without cover right near the pedestrian crossing of Sector 14 primary school. Extremely dangerous for children and motorists at night.",
        "issue_type": "open_manhole",
        "risks": ["pedestrian_hazard", "traffic_safety", "vulnerable_population_impact"],
        "urgency": "high",
        "severity_score": 92.0,
        "severity_level": "CRITICAL",
        "ward_idx": 3,  # Ward-04
        "location_suffix": "Gate 1, Sector 14 Market Crossing",
        "dept": "Public Works Department (PWD)",
        "status": "ESCALATED",
        "escalation_level": 2,
        "reported_count": 4,
        "sla_hours": 6,
        "hours_ago": 26.0,  # 20 hours overdue!
    },
    {
        "ticket_number": "CP-2026-1002",
        "title": "Major Drinking Water Main Pipe Burst",
        "description": "Underground potable water main line ruptured. High pressure water flooding the entire commercial avenue. Drinking water wastage for hundreds of households.",
        "issue_type": "water_leak",
        "risks": ["resource_wastage", "flooding", "traffic_safety"],
        "urgency": "high",
        "severity_score": 86.0,
        "severity_level": "CRITICAL",
        "ward_idx": 0,  # Ward-01
        "location_suffix": "Inner Circle, Regal Building Outer Lane",
        "dept": "Water Supply & Sewerage Board",
        "status": "ESCALATED",
        "escalation_level": 1,
        "reported_count": 3,
        "sla_hours": 6,
        "hours_ago": 9.0,  # 3 hours overdue!
    },
    {
        "ticket_number": "CP-2026-1003",
        "title": "Severe Pothole Cluster on Bus Transit Lane",
        "description": "Massive 2-foot deep potholes causing two-wheeler riders to fall. Traffic backup extending 1 km during morning office commute.",
        "issue_type": "pothole",
        "risks": ["traffic_safety"],
        "urgency": "high",
        "severity_score": 74.0,
        "severity_level": "HIGH",
        "ward_idx": 4,  # Ward-05
        "location_suffix": "Sector 21 Metro Station Approach Road",
        "dept": "Public Works Department (PWD)",
        "status": "IN_PROGRESS",
        "escalation_level": 0,
        "reported_count": 5,
        "sla_hours": 24,
        "hours_ago": 14.0,
    },
    {
        "ticket_number": "CP-2026-1004",
        "title": "Rotting Garbage Overflow Stifling Market Area",
        "description": "Municipal dustbin uncollected for over 5 days. Foul smell, stray animals, and waste scattering into local grocery shops.",
        "issue_type": "garbage_overflow",
        "risks": ["public_health", "contamination"],
        "urgency": "medium",
        "severity_score": 62.0,
        "severity_level": "HIGH",
        "ward_idx": 2,  # Ward-03
        "location_suffix": "Heritage Bazaar Lane 4, Chawk",
        "dept": "Municipal Sanitation Unit",
        "status": "IN_PROGRESS",
        "escalation_level": 0,
        "reported_count": 2,
        "sla_hours": 24,
        "hours_ago": 18.0,
    },
    {
        "ticket_number": "CP-2026-1005",
        "title": "Fallen Banyan Tree Branch Blocking Emergency Lane",
        "description": "Heavy storm knocked down a thick banyan branch across the main residential avenue. Ambulances unable to take shortcut.",
        "issue_type": "fallen_tree",
        "risks": ["traffic_safety", "civic_obstruction"],
        "urgency": "medium",
        "severity_score": 58.0,
        "severity_level": "MEDIUM",
        "ward_idx": 5,  # Ward-06
        "location_suffix": "Green Park Main Boulevard, Near Community Hall",
        "dept": "Horticulture & Parks Wing",
        "status": "SUBMITTED",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 48,
        "hours_ago": 4.0,
    },
    {
        "ticket_number": "CP-2026-1006",
        "title": "Hanging Live Electrical Wire Near Bus Stop",
        "description": "High voltage wire snapped from utility pole and hanging 4 feet above sidewalk. Sparks observed during evening drizzle.",
        "issue_type": "street_light_defect",
        "risks": ["electrical_hazard", "public_safety"],
        "urgency": "high",
        "severity_score": 88.0,
        "severity_level": "CRITICAL",
        "ward_idx": 7,  # Ward-08
        "location_suffix": "Industrial Phase 1 Gate 3 Bus Stop",
        "dept": "Power Utility Board",
        "status": "IN_PROGRESS",
        "escalation_level": 0,
        "reported_count": 2,
        "sla_hours": 6,
        "hours_ago": 2.5,
    },
    {
        "ticket_number": "CP-2026-1007",
        "title": "Stagnant Stormwater Clogging Intersection",
        "description": "Drainage grid choked with silt and plastic bottles. 6 inches of contaminated water standing in front of hospital entrance.",
        "issue_type": "drainage_overflow",
        "risks": ["public_health", "flooding", "vulnerable_population_impact"],
        "urgency": "high",
        "severity_score": 78.0,
        "severity_level": "HIGH",
        "ward_idx": 1,  # Ward-02
        "location_suffix": "Civil Lines District Hospital Ring",
        "dept": "Water Supply & Sewerage Board",
        "status": "SUBMITTED",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 24,
        "hours_ago": 8.0,
    },
    {
        "ticket_number": "CP-2026-1008",
        "title": "Series of 8 Streetlights Non-Functional",
        "description": "Entire 400m stretch of residential road is pitch dark every evening, raising safety concerns for women and elderly residents.",
        "issue_type": "street_light_defect",
        "risks": ["public_safety"],
        "urgency": "low",
        "severity_score": 34.0,
        "severity_level": "LOW",
        "ward_idx": 6,  # Ward-07
        "location_suffix": "Cyber City South Link Road",
        "dept": "Power Utility Board",
        "status": "SUBMITTED",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 72,
        "hours_ago": 12.0,
    },
    {
        "ticket_number": "CP-2026-1009",
        "title": "Construction Debris Dumped on Cycle Track",
        "description": "Unidentified truck dumped concrete slabs and gravel across the designated cycling and walking track.",
        "issue_type": "road_hazard",
        "risks": ["civic_obstruction"],
        "urgency": "medium",
        "severity_score": 45.0,
        "severity_level": "MEDIUM",
        "ward_idx": 8,  # Ward-09
        "location_suffix": "East Riverfront Promenade Track 2",
        "dept": "Public Works Department (PWD)",
        "status": "RESOLVED",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 48,
        "hours_ago": 52.0,
        "resolved_hours_after": 22.0,
        "notes": "Debris cleared by JCB and track swept clean. Warning notice issued to adjacent contractor.",
        "resolver": "Engineer A. Sharma (PWD Ward 9)"
    },
    {
        "ticket_number": "CP-2026-1010",
        "title": "Broken Sewer Line Flooding Alleyway",
        "description": "Sewage water backflowing onto street pavement. Heavy odor causing distress to residents.",
        "issue_type": "drainage_overflow",
        "risks": ["public_health", "contamination"],
        "urgency": "high",
        "severity_score": 82.0,
        "severity_level": "CRITICAL",
        "ward_idx": 2,  # Ward-03
        "location_suffix": "Old City Gali No. 8, Chawk",
        "dept": "Water Supply & Sewerage Board",
        "status": "RESOLVED",
        "escalation_level": 0,
        "reported_count": 3,
        "sla_hours": 6,
        "hours_ago": 30.0,
        "resolved_hours_after": 4.5,
        "notes": "Sewer blockage dislodged using jetting machine. Disinfectant spray applied across alley.",
        "resolver": "Inspector R. Verma (Water Board)"
    },
    {
        "ticket_number": "CP-2026-1011",
        "title": "Cracked Asphalt Near University Entrance",
        "description": "Sunken road surface developing into deep ruts near main gate where university transit buses turn.",
        "issue_type": "pothole",
        "risks": ["traffic_safety"],
        "urgency": "medium",
        "severity_score": 52.0,
        "severity_level": "MEDIUM",
        "ward_idx": 9,  # Ward-10
        "location_suffix": "North Campus Main Transit Gate",
        "dept": "Public Works Department (PWD)",
        "status": "RESOLVED",
        "escalation_level": 0,
        "reported_count": 2,
        "sla_hours": 48,
        "hours_ago": 60.0,
        "resolved_hours_after": 28.0,
        "notes": "Cold mix asphalt patching completed and leveled with roller.",
        "resolver": "PWD Rapid Repair Squad 4"
    },
    {
        "ticket_number": "CP-2026-1012",
        "title": "Dead Animal Carcass on Median",
        "description": "Large canine carcass lying on median causing severe health hazard and foul odor.",
        "issue_type": "garbage_overflow",
        "risks": ["public_health", "contamination"],
        "urgency": "high",
        "severity_score": 68.0,
        "severity_level": "HIGH",
        "ward_idx": 3,  # Ward-04
        "location_suffix": "Sector 14 Vyapar Kendra Road",
        "dept": "Municipal Sanitation Unit",
        "status": "RESOLVED",
        "escalation_level": 0,
        "reported_count": 2,
        "sla_hours": 24,
        "hours_ago": 16.0,
        "resolved_hours_after": 3.0,
        "notes": "Animal carcass sanitized, removed, and safely buried by Municipal Veterinary Team.",
        "resolver": "Sanitation Officer K. Rao"
    },
    {
        "ticket_number": "CP-2026-1013",
        "title": "Overdue Garbage Heap Outside Commercial Complex",
        "description": "Biomedical and restaurant waste piling up behind food plaza. Breached response deadline.",
        "issue_type": "garbage_overflow",
        "risks": ["public_health", "contamination"],
        "urgency": "high",
        "severity_score": 75.0,
        "severity_level": "HIGH",
        "ward_idx": 6,  # Ward-07
        "location_suffix": "Cyber Hub Commercial Complex Rear Gate",
        "dept": "Municipal Sanitation Unit",
        "status": "ESCALATED",
        "escalation_level": 1,
        "reported_count": 3,
        "sla_hours": 24,
        "hours_ago": 28.0,  # 4 hours overdue!
    },
    {
        "ticket_number": "CP-2026-1014",
        "title": "Water Gushing from Fire Hydrant Defect",
        "description": "Damaged fire hydrant valve spraying water 10 feet into air. Road partially submerged.",
        "issue_type": "water_leak",
        "risks": ["resource_wastage", "flooding"],
        "urgency": "medium",
        "severity_score": 54.0,
        "severity_level": "MEDIUM",
        "ward_idx": 4,  # Ward-05
        "location_suffix": "Sector 21 Metro Pillar 88",
        "dept": "Water Supply & Sewerage Board",
        "status": "IN_PROGRESS",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 48,
        "hours_ago": 10.0,
    },
    {
        "ticket_number": "CP-2026-1015",
        "title": "Dim Streetlight Sodium Lamps Failing",
        "description": "Flickering low output lamps in outer park perimeter. Visibility down to 5 meters.",
        "issue_type": "street_light_defect",
        "risks": ["public_safety"],
        "urgency": "low",
        "severity_score": 30.0,
        "severity_level": "LOW",
        "ward_idx": 5,  # Ward-06
        "location_suffix": "Green Park Outer Ring Jogging Lane",
        "dept": "Power Utility Board",
        "status": "SUBMITTED",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 72,
        "hours_ago": 5.0,
    },
    {
        "ticket_number": "CP-2026-1016",
        "title": "Missing Drain Grate on Bike Lane",
        "description": "Cast iron stormwater grate stolen overnight leaving a dangerous 1.5 foot hole in cycling lane.",
        "issue_type": "open_manhole",
        "risks": ["pedestrian_hazard", "traffic_safety"],
        "urgency": "high",
        "severity_score": 85.0,
        "severity_level": "CRITICAL",
        "ward_idx": 1,  # Ward-02
        "location_suffix": "Civil Lines Judicial Complex Bike Lane",
        "dept": "Public Works Department (PWD)",
        "status": "IN_PROGRESS",
        "escalation_level": 0,
        "reported_count": 2,
        "sla_hours": 6,
        "hours_ago": 3.0,
    },
    {
        "ticket_number": "CP-2026-1017",
        "title": "Overhanging Heavy Branches Touching High Tension Line",
        "description": "Tree limbs touching 11kV distribution line during windy conditions. Frequent sparking.",
        "issue_type": "fallen_tree",
        "risks": ["electrical_hazard", "public_safety"],
        "urgency": "high",
        "severity_score": 79.0,
        "severity_level": "HIGH",
        "ward_idx": 7,  # Ward-08
        "location_suffix": "Okhla Industrial Phase 1 Main Substation Approach",
        "dept": "Power Utility Board",
        "status": "SUBMITTED",
        "escalation_level": 0,
        "reported_count": 1,
        "sla_hours": 24,
        "hours_ago": 7.0,
    },
    {
        "ticket_number": "CP-2026-1018",
        "title": "Illegal Dumping of Chemical Drums in Canal",
        "description": "Suspicious liquid leaking from 3 metal containers dumped along the east riverfront embankment.",
        "issue_type": "garbage_overflow",
        "risks": ["public_health", "contamination"],
        "urgency": "high",
        "severity_score": 89.0,
        "severity_level": "CRITICAL",
        "ward_idx": 8,  # Ward-09
        "location_suffix": "Yamuna East Canal Ghat No. 4",
        "dept": "Municipal Sanitation Unit",
        "status": "IN_PROGRESS",
        "escalation_level": 0,
        "reported_count": 3,
        "sla_hours": 6,
        "hours_ago": 4.0,
    }
]

def seed_database(db: Session, force: bool = False):
    existing_count = db.query(Incident).count()
    if existing_count > 0 and not force:
        return

    now = datetime.now(timezone.utc)

    for item in MOCK_INCIDENTS_DATA:
        ward = WARD_REGISTRY[item["ward_idx"]]
        created_at = now - timedelta(hours=item["hours_ago"])
        sla_deadline = created_at + timedelta(hours=item["sla_hours"])
        
        resolved_at = None
        if item.get("status") == "RESOLVED":
            resolved_at = created_at + timedelta(hours=item.get("resolved_hours_after", 12.0))

        # Add slight jitter to coordinate so multiple pins in same ward don't stack exactly
        jitter_lat = ((hash(item["ticket_number"]) % 100) - 50) * 0.0001
        jitter_lng = ((hash(item["ticket_number"][::-1]) % 100) - 50) * 0.0001

        inc = Incident(
            ticket_number=item["ticket_number"],
            title=item["title"],
            raw_description=item["description"],
            issue_type=item["issue_type"],
            detected_risks_json=json.dumps(item["risks"]),
            urgency_hint=item["urgency"],
            severity_score=item["severity_score"],
            severity_level=item["severity_level"],
            ward_id=ward["ward_id"],
            ward_name=ward["ward_name"],
            raw_location=f"{item['location_suffix']}, {ward['ward_name']}",
            latitude=ward["center_lat"] + jitter_lat,
            longitude=ward["center_lng"] + jitter_lng,
            assigned_department=item["dept"],
            status=item["status"],
            escalation_level=item["escalation_level"],
            reported_by_count=item["reported_count"],
            citizen_contact="citizen.demo@civicpulse.org",
            image_url=None,
            sla_hours=item["sla_hours"],
            sla_deadline=sla_deadline,
            created_at=created_at,
            updated_at=now,
            resolved_at=resolved_at,
            resolution_notes=item.get("notes"),
            resolved_by=item.get("resolver")
        )
        db.add(inc)
        db.flush()

        # Add initial CREATED log
        created_log = IncidentLog(
            incident_id=inc.id,
            ticket_number=inc.ticket_number,
            event_type="CREATED",
            actor="CivicPulse Ingestion Pipeline",
            message=f"Ticket {inc.ticket_number} created and routed to {inc.assigned_department}. SLA: {inc.sla_hours}h.",
            timestamp=created_at
        )
        db.add(created_log)

        # Add duplicate logs if reported_count > 1
        if item["reported_count"] > 1:
            for rep_idx in range(1, item["reported_count"]):
                dup_time = created_at + timedelta(hours=rep_idx * 1.5)
                dup_log = IncidentLog(
                    incident_id=inc.id,
                    ticket_number=inc.ticket_number,
                    event_type="CLUSTER_MERGED",
                    actor="Agent 3: Clustering Node",
                    message=f"Duplicate report #{rep_idx + 1} clustered from citizen nearby. Priority increased.",
                    timestamp=dup_time
                )
                db.add(dup_log)
                dup_rep = DuplicateReport(
                    parent_incident_id=inc.id,
                    ticket_number=inc.ticket_number,
                    description=f"Follow-up grievance reported regarding {inc.title}",
                    raw_location=inc.raw_location,
                    citizen_contact="resident@smartcity.net",
                    distance_meters=round(rep_idx * 18.5, 1),
                    created_at=dup_time
                )
                db.add(dup_rep)

        # Add escalation logs if escalated
        if item["escalation_level"] >= 1:
            esc_time = sla_deadline + timedelta(minutes=5)
            esc_log1 = IncidentLog(
                incident_id=inc.id,
                ticket_number=inc.ticket_number,
                event_type="ESCALATED",
                actor="Autonomous Escalation Engine",
                message=f"Ticket #{inc.ticket_number} breached SLA of {inc.sla_hours} hours. Automatically escalated to District Supervisor.",
                timestamp=esc_time
            )
            db.add(esc_log1)

        if item["escalation_level"] >= 2:
            esc2_time = sla_deadline + timedelta(hours=12, minutes=10)
            esc_log2 = IncidentLog(
                incident_id=inc.id,
                ticket_number=inc.ticket_number,
                event_type="ESCALATED",
                actor="Autonomous Escalation Engine",
                message=f"Ticket #{inc.ticket_number} overdue by >12 hours past deadline. Automatically escalated to City Commissioner.",
                timestamp=esc2_time
            )
            db.add(esc_log2)

        # Add resolution log if resolved
        if item.get("status") == "RESOLVED":
            res_log = IncidentLog(
                incident_id=inc.id,
                ticket_number=inc.ticket_number,
                event_type="RESOLVED",
                actor=item.get("resolver", "Field Officer"),
                message=f"Incident marked RESOLVED: {item.get('notes', 'Remediation completed.')}",
                timestamp=resolved_at
            )
            db.add(res_log)

    db.commit()
