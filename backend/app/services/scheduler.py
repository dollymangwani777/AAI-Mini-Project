import logging
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Incident, IncidentLog

logger = logging.getLogger("CivicPulse.EscalationEngine")

scheduler = AsyncIOScheduler()

def check_sla_and_escalate():
    """
    Autonomous Escalation Engine:
    Runs every 60 seconds to inspect active (non-resolved) incidents.
    Escalation Level 1: Overdue past SLA deadline -> Escalated to District Supervisor.
    Escalation Level 2: Overdue by >12 hours past SLA deadline -> Escalated to City Commissioner.
    """
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        
        # Query active incidents
        active_incidents = db.query(Incident).filter(
            Incident.status.in_(["SUBMITTED", "IN_PROGRESS", "ESCALATED"])
        ).all()

        escalated_count = 0
        for inc in active_incidents:
            deadline = inc.sla_deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)

            # Check if overdue
            if now > deadline:
                overdue_seconds = (now - deadline).total_seconds()
                overdue_hours = overdue_seconds / 3600.0

                # Level 0 -> Level 1 (Supervisor)
                if inc.escalation_level == 0:
                    inc.escalation_level = 1
                    inc.status = "ESCALATED"
                    inc.updated_at = now
                    
                    log = IncidentLog(
                        incident_id=inc.id,
                        ticket_number=inc.ticket_number,
                        event_type="ESCALATED",
                        actor="Autonomous Escalation Engine (APScheduler)",
                        message=(
                            f"Ticket #{inc.ticket_number} breached SLA of {inc.sla_hours} hours. "
                            f"Automatically escalated to District Supervisor."
                        ),
                        timestamp=now
                    )
                    db.add(log)
                    escalated_count += 1
                    logger.warning(f"[SLA BREACH] {inc.ticket_number} escalated to Level 1 (Supervisor)")

                # Level 1 -> Level 2 (City Commissioner) if overdue by >12 additional hours
                elif inc.escalation_level == 1 and overdue_hours >= 12.0:
                    inc.escalation_level = 2
                    inc.status = "ESCALATED"
                    inc.updated_at = now
                    
                    log = IncidentLog(
                        incident_id=inc.id,
                        ticket_number=inc.ticket_number,
                        event_type="ESCALATED",
                        actor="Autonomous Escalation Engine (APScheduler)",
                        message=(
                            f"Ticket #{inc.ticket_number} is critically overdue by {overdue_hours:.1f} hours past SLA! "
                            f"Automatically escalated to City Commissioner."
                        ),
                        timestamp=now
                    )
                    db.add(log)
                    escalated_count += 1
                    logger.critical(f"[CRITICAL SLA BREACH] {inc.ticket_number} escalated to Level 2 (Commissioner)")

        if escalated_count > 0:
            db.commit()
            logger.info(f"Escalation check complete. {escalated_count} incident(s) escalated.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error in Autonomous Escalation Engine: {e}", exc_info=True)
    finally:
        db.close()

def start_escalation_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            check_sla_and_escalate,
            "interval",
            seconds=60,
            id="sla_escalation_job",
            replace_existing=True
        )
        scheduler.start()
        logger.info("Autonomous Escalation Engine background service started (interval: 60s).")

def stop_escalation_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Autonomous Escalation Engine background service stopped.")
