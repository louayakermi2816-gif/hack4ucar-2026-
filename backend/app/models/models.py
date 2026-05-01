import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, Integer,
    DateTime, ForeignKey, Text, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base


def now_utc():
    return datetime.now(timezone.utc)


# ── 1. institutions ───────────────────────────────────────────────────────
class Institution(Base):
    __tablename__ = "institutions"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name             = Column(String, nullable=False)
    institution_type = Column(String, nullable=False)
    location         = Column(String, nullable=False)
    created_at       = Column(DateTime(timezone=True), default=now_utc)

    documents              = relationship("Document",             back_populates="institution", cascade="all, delete-orphan")
    academic_records       = relationship("AcademicRecord",       back_populates="institution", cascade="all, delete-orphan")
    employment_records     = relationship("EmploymentRecord",     back_populates="institution", cascade="all, delete-orphan")
    finance_records        = relationship("FinanceRecord",        back_populates="institution", cascade="all, delete-orphan")
    esg_records            = relationship("EsgRecord",            back_populates="institution", cascade="all, delete-orphan")
    hr_records             = relationship("HrRecord",             back_populates="institution", cascade="all, delete-orphan")
    research_records       = relationship("ResearchRecord",       back_populates="institution", cascade="all, delete-orphan")
    infrastructure_records = relationship("InfrastructureRecord", back_populates="institution", cascade="all, delete-orphan")
    partnership_records    = relationship("PartnershipRecord",    back_populates="institution", cascade="all, delete-orphan")
    alerts                 = relationship("Alert",                back_populates="institution", cascade="all, delete-orphan")
    reports                = relationship("Report",               back_populates="institution", cascade="all, delete-orphan")
    chat_sessions          = relationship("ChatSession",          back_populates="institution", cascade="all, delete-orphan")


# ── 2. documents ──────────────────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    filename       = Column(String, nullable=False)
    file_type      = Column(String, nullable=False)
    status         = Column(String, default="pending")
    uploaded_at    = Column(DateTime(timezone=True), default=now_utc)

    institution    = relationship("Institution", back_populates="documents")


# ── 3. academic_records ───────────────────────────────────────────────────
class AcademicRecord(Base):
    __tablename__ = "academic_records"
    __table_args__ = (
        CheckConstraint("success_rate    BETWEEN 0 AND 100", name="ck_academic_success"),
        CheckConstraint("attendance_rate BETWEEN 0 AND 100", name="ck_academic_attendance"),
        CheckConstraint("repetition_rate BETWEEN 0 AND 100", name="ck_academic_repetition"),
        CheckConstraint("dropout_rate    BETWEEN 0 AND 100", name="ck_academic_dropout"),
    )

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id    = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    semester          = Column(String, nullable=False, index=True)
    enrolled_students = Column(Integer, default=0)
    success_rate      = Column(Float)
    attendance_rate   = Column(Float)
    repetition_rate   = Column(Float)
    dropout_rate      = Column(Float)

    institution       = relationship("Institution", back_populates="academic_records")


# ── 4. employment_records ─────────────────────────────────────────────────
class EmploymentRecord(Base):
    __tablename__ = "employment_records"
    __table_args__ = (
        CheckConstraint("employability_rate BETWEEN 0 AND 100", name="ck_employment_employability"),
    )

    id                        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id            = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    year                      = Column(Integer, nullable=False, index=True)
    employability_rate        = Column(Float)
    insertion_delay_days      = Column(Integer)
    national_conventions      = Column(Integer)
    international_conventions = Column(Integer)

    institution               = relationship("Institution", back_populates="employment_records")


# ── 5. finance_records ────────────────────────────────────────────────────
class FinanceRecord(Base):
    __tablename__ = "finance_records"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id   = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    period           = Column(String, nullable=False, index=True)
    budget_allocated = Column(Float)
    budget_consumed  = Column(Float)
    cost_per_student = Column(Float)
    department       = Column(String)

    institution      = relationship("Institution", back_populates="finance_records")


# ── 6. esg_records ────────────────────────────────────────────────────────
class EsgRecord(Base):
    __tablename__ = "esg_records"
    __table_args__ = (
        CheckConstraint("recycling_rate BETWEEN 0 AND 100", name="ck_esg_recycling"),
    )

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    period         = Column(String, nullable=False, index=True)
    energy_kwh     = Column(Float)
    carbon_kg      = Column(Float)
    recycling_rate = Column(Float)
    mobility_type  = Column(String)

    institution    = relationship("Institution", back_populates="esg_records")


# ── 7. hr_records ─────────────────────────────────────────────────────────
class HrRecord(Base):
    __tablename__ = "hr_records"
    __table_args__ = (
        CheckConstraint("absenteeism_rate BETWEEN 0 AND 100", name="ck_hr_absenteeism"),
    )

    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id       = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    period               = Column(String, nullable=False, index=True)
    teaching_staff_count = Column(Integer)
    admin_staff_count    = Column(Integer)
    absenteeism_rate     = Column(Float)
    training_hours       = Column(Integer)

    institution          = relationship("Institution", back_populates="hr_records")


# ── 8. research_records ───────────────────────────────────────────────────
class ResearchRecord(Base):
    __tablename__ = "research_records"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id  = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    year            = Column(Integer, nullable=False, index=True)
    publications    = Column(Integer)
    active_projects = Column(Integer)
    funding_secured = Column(Float)
    patents         = Column(Integer)

    institution     = relationship("Institution", back_populates="research_records")


# ── 9. infrastructure_records ─────────────────────────────────────────────
class InfrastructureRecord(Base):
    __tablename__ = "infrastructure_records"
    __table_args__ = (
        CheckConstraint("room_occupancy_rate BETWEEN 0 AND 100", name="ck_infra_occupancy"),
    )

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id      = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    period              = Column(String, nullable=False, index=True)
    room_occupancy_rate = Column(Float)
    equipment_status    = Column(String)
    ongoing_works       = Column(Integer)

    institution         = relationship("Institution", back_populates="infrastructure_records")


# ── 10. partnership_records ───────────────────────────────────────────────
class PartnershipRecord(Base):
    __tablename__ = "partnership_records"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id    = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    active_agreements = Column(Integer)
    incoming_mobility = Column(Integer)
    outgoing_mobility = Column(Integer)

    institution       = relationship("Institution", back_populates="partnership_records")


# ── 11. alerts ────────────────────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    kpi_domain     = Column(String, nullable=False)
    severity       = Column(String, nullable=False)
    message_fr     = Column(Text)
    message_ar     = Column(Text)
    triggered_at   = Column(DateTime(timezone=True), default=now_utc)
    resolved_at    = Column(DateTime(timezone=True), nullable=True)

    institution    = relationship("Institution", back_populates="alerts")


# ── 12. reports ───────────────────────────────────────────────────────────
class Report(Base):
    __tablename__ = "reports"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type    = Column(String, nullable=False)
    period         = Column(String)
    file_path      = Column(String)
    generated_at   = Column(DateTime(timezone=True), default=now_utc)

    institution    = relationship("Institution", back_populates="reports")


# ── 13. chat_sessions ─────────────────────────────────────────────────────
class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at     = Column(DateTime(timezone=True), default=now_utc)

    institution    = relationship("Institution", back_populates="chat_sessions")
    messages       = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


# ── 14. chat_messages ─────────────────────────────────────────────────────
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role       = Column(String, nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    session    = relationship("ChatSession", back_populates="messages")


# ── 15. users ─────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email           = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name       = Column(String, nullable=False)
    role            = Column(String, nullable=False)  # president / dean / admin / researcher / student
    institution_id  = Column(UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=True)
    is_active       = Column(Integer, default=1)
    created_at      = Column(DateTime(timezone=True), default=now_utc)

    institution     = relationship("Institution")

