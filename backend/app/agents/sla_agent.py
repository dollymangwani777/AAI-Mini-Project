from datetime import datetime, timedelta, timezone
from typing import Tuple

SLA_HOURS_MAP = {
    "CRITICAL": 6,
    "HIGH": 24,
    "MEDIUM": 48,
    "LOW": 72
}

def assign_sla(severity_level: str, base_time: datetime = None) -> Tuple[int, datetime]:
    """
    Agent 6: SLA & Deadline Assignment Agent
    Computes SLA target hours and explicit deadline timestamp based on severity tier.
    """
    if base_time is None:
        base_time = datetime.now(timezone.utc)
        
    sla_hours = SLA_HOURS_MAP.get(severity_level.upper(), 48)
    sla_deadline = base_time + timedelta(hours=sla_hours)
    
    return sla_hours, sla_deadline
