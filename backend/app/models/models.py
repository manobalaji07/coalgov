import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    subsidiaries = relationship("Subsidiary", back_populates="organization", cascade="all, delete-orphan")

class Subsidiary(Base):
    __tablename__ = "subsidiaries"

    id = Column(String, primary_key=True, default=generate_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)  # e.g., ECL, BCCL, CCL, SECL, NCL, WCL, MCL
    code = Column(String, unique=True, nullable=False)
    state = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="subsidiaries")
    mines = relationship("Mine", back_populates="subsidiary", cascade="all, delete-orphan")

class Mine(Base):
    __tablename__ = "mines"

    id = Column(String, primary_key=True, default=generate_uuid)
    subsidiary_id = Column(String, ForeignKey("subsidiaries.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    mine_type = Column(String, nullable=False, default="Opencast") # Opencast / Underground
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String, nullable=False)
    production_capacity_mt = Column(Float, default=5.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    subsidiary = relationship("Subsidiary", back_populates="mines")
    sections = relationship("Section", back_populates="mine", cascade="all, delete-orphan")
    users = relationship("User", back_populates="mine")
    compliance_obligations = relationship("ComplianceObligation", back_populates="mine")
    inspections = relationship("Inspection", back_populates="mine")
    capas = relationship("CAPA", back_populates="mine")

class Section(Base):
    __tablename__ = "sections"

    id = Column(String, primary_key=True, default=generate_uuid)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    section_type = Column(String, nullable=False) # Excavation, Haul Road, CHPV, Substation, Coal Face, Pit Area

    mine = relationship("Mine", back_populates="sections")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False) # INSPECTOR, MINE_MANAGER, CONTRACTOR, CORPORATE, REGULATOR, ADMIN
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    subsidiary_id = Column(String, ForeignKey("subsidiaries.id"), nullable=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="users")

class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(String, primary_key=True, default=generate_uuid)
    company_name = Column(String, nullable=False)
    license_no = Column(String, unique=True, nullable=False)
    contact_email = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    compliance_rating = Column(Float, default=85.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    workers = relationship("Worker", back_populates="contractor")

class Worker(Base):
    __tablename__ = "workers"

    id = Column(String, primary_key=True, default=generate_uuid)
    contractor_id = Column(String, ForeignKey("contractors.id"), nullable=False)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    full_name = Column(String, nullable=False)
    worker_card_id = Column(String, unique=True, nullable=False)
    trade = Column(String, nullable=False) # Heavy Equipment Driver, Electrician, Loader, Safety Technician
    is_active = Column(Boolean, default=True)

    contractor = relationship("Contractor", back_populates="workers")

class ComplianceObligation(Base):
    __tablename__ = "compliance_obligations"

    id = Column(String, primary_key=True, default=generate_uuid)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    section_id = Column(String, ForeignKey("sections.id"), nullable=True)
    title = Column(String, nullable=False)
    statutory_ref = Column(String, nullable=False) # e.g. DGMS Circular 4/2021, Mines Act 1952 Sec 28, CPCB Air Act
    category = Column(String, nullable=False) # SAFETY, ENVIRONMENT, PRODUCTION, LABOUR
    frequency = Column(String, nullable=False) # DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUALLY
    due_date = Column(DateTime, nullable=False)
    assigned_owner = Column(String, nullable=False)
    status = Column(String, default="PENDING") # PENDING, COMPLIANT, NON_COMPLIANT, OVERDUE
    last_verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="compliance_obligations")

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(String, primary_key=True, default=generate_uuid)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    section_id = Column(String, ForeignKey("sections.id"), nullable=True)
    inspector_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    checklist_type = Column(String, nullable=False) # Daily Safety Walk, Environmental Clearance, Heavy Machinery Check
    scheduled_date = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String, default="SCHEDULED") # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="inspections")
    observations = relationship("Observation", back_populates="inspection", cascade="all, delete-orphan")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(String, primary_key=True, default=generate_uuid)
    inspection_id = Column(String, ForeignKey("inspections.id"), nullable=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    section_id = Column(String, ForeignKey("sections.id"), nullable=True)
    inspector_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False) # SAFETY, ENVIRONMENT, EQUIPMENT, LABOUR
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    is_violation = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    photo_url = Column(String, nullable=True)
    client_uuid = Column(String, unique=True, nullable=True) # Idempotent PWA offline sync key
    client_timestamp = Column(DateTime, default=datetime.utcnow)
    server_timestamp = Column(DateTime, default=datetime.utcnow)

    inspection = relationship("Inspection", back_populates="observations")
    capa = relationship("CAPA", back_populates="observation", uselist=False)

class CAPA(Base):
    __tablename__ = "capas"

    id = Column(String, primary_key=True, default=generate_uuid)
    observation_id = Column(String, ForeignKey("observations.id"), nullable=False)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    assigned_to_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_to_name = Column(String, nullable=True)
    sla_due_date = Column(DateTime, nullable=False)
    status = Column(String, default="OPEN") # OPEN, IN_PROGRESS, RESOLVED, VERIFIED, ESCALATED
    escalation_level = Column(Integer, default=0) # 0: Safety Officer, 1: Mine Manager, 2: General Manager, 3: Corporate Director
    proof_description = Column(Text, nullable=True)
    proof_photo_url = Column(String, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    observation = relationship("Observation", back_populates="capa")
    mine = relationship("Mine", back_populates="capas")

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(String, primary_key=True, default=generate_uuid)
    worker_id = Column(String, ForeignKey("workers.id"), nullable=False)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    verified = Column(Boolean, default=True)

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(String, primary_key=True, default=generate_uuid)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    submitted_by_name = Column(String, nullable=False)
    category = Column(String, nullable=False) # Safety Hazard, Wage Discrepancy, Equipment Malfunction, Working Conditions
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="SUBMITTED") # SUBMITTED, IN_REVIEW, RESOLVED, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=True)
    title = Column(String, nullable=False)
    doc_type = Column(String, nullable=False) # PERMIT, ENVIRONMENTAL_CLEARANCE, DGMS_NOTICE, CONTRACTOR_LICENSE
    file_path = Column(String, nullable=False)
    ocr_text = Column(Text, nullable=True)
    extracted_metadata = Column(JSON, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String, default="VALID") # VALID, EXPIRING_SOON, EXPIRED
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    entity_type = Column(String, nullable=False) # MINE, SECTION, CONTRACTOR
    entity_id = Column(String, nullable=False)
    entity_name = Column(String, nullable=False)
    score = Column(Float, nullable=False) # 0.0 - 100.0 (Higher = Higher Risk)
    risk_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    contributing_factors = Column(JSON, nullable=False) # List of key factors driving score
    computed_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False) # SLA_BREACH, ESCALATION, HIGH_RISK_ALERT, ANOMALY
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=datetime.utcnow)
    actor_id = Column(String, nullable=True)
    actor_email = Column(String, nullable=False)
    action = Column(String, nullable=False) # CREATE_OBSERVATION, AUTO_CREATE_CAPA, ESCALATE_CAPA, RESOLVE_CAPA, VERIFY_CAPA
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    payload_json = Column(Text, nullable=False)
    prev_hash = Column(String, nullable=False)
    current_hash = Column(String, nullable=False)
