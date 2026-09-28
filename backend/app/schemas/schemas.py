from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class TokenData(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    organization_id: Optional[str] = None
    subsidiary_id: Optional[str] = None
    mine_id: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Organization & Subsidiary & Mine Schemas
class SectionOut(BaseModel):
    id: str
    mine_id: str
    name: str
    code: str
    section_type: str

    class Config:
        from_attributes = True

class MineOut(BaseModel):
    id: str
    subsidiary_id: str
    name: str
    code: str
    mine_type: str
    latitude: float
    longitude: float
    district: str
    production_capacity_mt: float
    sections: List[SectionOut] = []

    class Config:
        from_attributes = True

class SubsidiaryOut(BaseModel):
    id: str
    name: str
    code: str
    state: str
    mines: List[MineOut] = []

    class Config:
        from_attributes = True

class OrganizationOut(BaseModel):
    id: str
    name: str
    code: str
    subsidiaries: List[SubsidiaryOut] = []

    class Config:
        from_attributes = True

# Compliance Obligation Schemas
class ComplianceCreate(BaseModel):
    mine_id: str
    section_id: Optional[str] = None
    title: str
    statutory_ref: str
    category: str  # SAFETY, ENVIRONMENT, PRODUCTION, LABOUR
    frequency: str # DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUALLY
    due_date: datetime
    assigned_owner: str

class ComplianceOut(ComplianceCreate):
    id: str
    status: str
    last_verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Observation & Inspection Schemas
class ObservationCreate(BaseModel):
    mine_id: str
    section_id: Optional[str] = None
    inspection_id: Optional[str] = None
    category: str
    description: str
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    is_violation: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None
    client_uuid: Optional[str] = None
    client_timestamp: Optional[datetime] = None

class ObservationOut(ObservationCreate):
    id: str
    inspector_id: str
    server_timestamp: datetime

    class Config:
        from_attributes = True

class InspectionOut(BaseModel):
    id: str
    mine_id: str
    section_id: Optional[str] = None
    inspector_id: str
    title: str
    checklist_type: str
    scheduled_date: datetime
    completed_at: Optional[datetime] = None
    status: str
    observations: List[ObservationOut] = []

    class Config:
        from_attributes = True

# CAPA Schemas
class CAPAResolve(BaseModel):
    proof_description: str
    proof_photo_url: Optional[str] = None

class CAPAOut(BaseModel):
    id: str
    observation_id: str
    mine_id: str
    title: str
    description: str
    severity: str
    assigned_to_id: Optional[str] = None
    assigned_to_name: Optional[str] = None
    sla_due_date: datetime
    status: str
    escalation_level: int
    proof_description: Optional[str] = None
    proof_photo_url: Optional[str] = None
    resolved_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Risk & AI Analytics Schemas
class FactorDetail(BaseModel):
    factor: str
    weight: float
    description: str

class RiskScoreOut(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    entity_name: str
    score: float
    risk_level: str
    contributing_factors: List[Dict[str, Any]]
    computed_at: datetime

    class Config:
        from_attributes = True

class AnomalyOut(BaseModel):
    entity_id: str
    entity_name: str
    metric: str
    expected_value: float
    actual_value: float
    deviation_sigmas: float
    explanation: str

class RecurringViolationClusterOut(BaseModel):
    cluster_id: int
    topic_label: str
    violation_count: int
    sample_descriptions: List[str]
    suggested_root_cause: str

# Audit Log & Integrity
class AuditLogOut(BaseModel):
    id: str
    timestamp: datetime
    actor_id: Optional[str] = None
    actor_email: str
    action: str
    entity_type: str
    entity_id: str
    payload_json: str
    prev_hash: str
    current_hash: str

    class Config:
        from_attributes = True

class AuditVerificationResult(BaseModel):
    is_valid: bool
    total_records: int
    tampered_records_count: int
    tampered_log_ids: List[str]
    message: str
