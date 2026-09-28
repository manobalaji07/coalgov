from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import CAPA, Observation, Notification, User
from app.services.audit_service import record_audit_log

SLA_HOURS = {
    "CRITICAL": 24,
    "HIGH": 48,
    "MEDIUM": 168,  # 7 days
    "LOW": 336      # 14 days
}

def calculate_sla_due_date(severity: str, start_time: datetime = None) -> datetime:
    start_time = start_time or datetime.utcnow()
    hours = SLA_HOURS.get(severity.upper(), 48)
    return start_time + timedelta(hours=hours)

def auto_create_capa_for_violation(db: Session, observation: Observation, actor_email: str) -> CAPA:
    sla_due = calculate_sla_due_date(observation.severity, observation.server_timestamp)
    
    # Assign to mine manager or default user
    assigned_user = db.query(User).filter(User.mine_id == observation.mine_id, User.role == "MINE_MANAGER").first()
    assigned_id = assigned_user.id if assigned_user else None
    assigned_name = assigned_user.full_name if assigned_user else "Mine Safety Officer"

    capa = CAPA(
        observation_id=observation.id,
        mine_id=observation.mine_id,
        title=f"CAPA: {observation.category} ({observation.severity} Severity)",
        description=f"Auto-generated CAPA for violation observed at lat: {observation.latitude}, lon: {observation.longitude}. Issue: {observation.description}",
        severity=observation.severity,
        assigned_to_id=assigned_id,
        assigned_to_name=assigned_name,
        sla_due_date=sla_due,
        status="OPEN",
        escalation_level=0
    )
    db.add(capa)
    db.commit()
    db.refresh(capa)

    # Log notification
    notif = Notification(
        user_id=assigned_id,
        title=f"New CAPA Assigned [{capa.severity}]",
        message=f"CAPA #{capa.id[:8]} created for {observation.category}. SLA Due: {sla_due.strftime('%Y-%m-%d %H:%M')}",
        notification_type="NEW_CAPA"
    )
    db.add(notif)
    db.commit()

    # Record audit entry
    record_audit_log(
        db=db,
        actor_email=actor_email,
        action="AUTO_CREATE_CAPA",
        entity_type="CAPA",
        entity_id=capa.id,
        payload={
            "capa_id": capa.id,
            "observation_id": observation.id,
            "severity": capa.severity,
            "sla_due_date": sla_due.isoformat(),
            "assigned_to": assigned_name
        }
    )
    return capa

def run_sla_escalation_job(db: Session):
    now = datetime.utcnow()
    overdue_capas = db.query(CAPA).filter(
        CAPA.status.in_(["OPEN", "IN_PROGRESS"]),
        CAPA.sla_due_date < now
    ).all()

    for capa in overdue_capas:
        hours_overdue = (now - capa.sla_due_date).total_seconds() / 3600.0
        old_level = capa.escalation_level

        if hours_overdue > 48 and capa.escalation_level < 3:
            capa.escalation_level = 3
            capa.status = "ESCALATED"
        elif hours_overdue > 24 and capa.escalation_level < 2:
            capa.escalation_level = 2
            capa.status = "ESCALATED"
        elif hours_overdue > 0 and capa.escalation_level < 1:
            capa.escalation_level = 1
            capa.status = "ESCALATED"

        if capa.escalation_level != old_level:
            db.commit()
            
            # Send notification
            escalation_roles = {1: "Mine Manager", 2: "General Manager", 3: "Corporate Director"}
            target_role_name = escalation_roles.get(capa.escalation_level, "Management")

            notif = Notification(
                title=f"🚨 CAPA ESCALATED to {target_role_name}",
                message=f"CAPA '{capa.title}' breached SLA by {int(hours_overdue)} hours. Escalated to Level {capa.escalation_level}.",
                notification_type="ESCALATION"
            )
            db.add(notif)
            db.commit()

            record_audit_log(
                db=db,
                actor_email="system.scheduler@coalgov.in",
                action="ESCALATE_CAPA",
                entity_type="CAPA",
                entity_id=capa.id,
                payload={
                    "capa_id": capa.id,
                    "previous_level": old_level,
                    "new_level": capa.escalation_level,
                    "hours_overdue": hours_overdue
                }
            )
