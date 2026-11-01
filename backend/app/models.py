import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from .database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(32), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    raw_description = Column(Text, nullable=False)
    
    # Ingestion agent extractions
    issue_type = Column(String(64), nullable=False, index=True)
    detected_risks_json = Column(Text, default="[]")  # Serialized list of strings
    urgency_hint = Column(String(32), default="medium")
    
    # Priority & Severity
    severity_score = Column(Float, default=25.0)  # 0 to 100
    severity_level = Column(String(32), default="LOW", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    
    # Location Intelligence
    ward_id = Column(String(32), nullable=False, index=True)
    ward_name = Column(String(128), nullable=False)
    raw_location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Department & Workflow
    assigned_department = Column(String(128), nullable=False, index=True)
    status = Column(String(32), default="SUBMITTED", index=True)  # SUBMITTED, IN_PROGRESS, ESCALATED, RESOLVED
    escalation_level = Column(Integer, default=0, index=True)  # 0: Normal, 1: Supervisor, 2: Commissioner
    reported_by_count = Column(Integer, default=1)
    
    # Contact & Media
    citizen_contact = Column(String(128), nullable=True)
    image_url = Column(String(512), nullable=True)
    
    # SLA Management
    sla_hours = Column(Integer, default=48)
    sla_deadline = Column(DateTime, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=utcnow, index=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Resolution details
    resolution_notes = Column(Text, nullable=True)
    resolved_by = Column(String(128), nullable=True)
    
    # Relationships
    logs = relationship("IncidentLog", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentLog.timestamp.desc()")
    duplicate_reports = relationship("DuplicateReport", back_populates="parent_incident", cascade="all, delete-orphan")

    @property
    def detected_risks(self):
        try:
            return json.loads(self.detected_risks_json) if self.detected_risks_json else []
        except Exception:
            return []

    @detected_risks.setter
    def detected_risks(self, value):
        self.detected_risks_json = json.dumps(value if isinstance(value, list) else [])


class IncidentLog(Base):
    __tablename__ = "incident_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_number = Column(String(32), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)  # CREATED, CLUSTER_MERGED, STATUS_CHANGE, ESCALATED, RESOLVED, AUDIT
    actor = Column(String(128), nullable=False)
    message = Column(Text, nullable=False)
    metadata_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=utcnow, index=True)

    incident = relationship("Incident", back_populates="logs")


class DuplicateReport(Base):
    __tablename__ = "duplicate_reports"

    id = Column(Integer, primary_key=True, index=True)
    parent_incident_id = Column(Integer, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_number = Column(String(32), nullable=False)
    description = Column(Text, nullable=False)
    raw_location = Column(String(255), nullable=True)
    citizen_contact = Column(String(128), nullable=True)
    distance_meters = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utcnow)

    parent_incident = relationship("Incident", back_populates="duplicate_reports")
