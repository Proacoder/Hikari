import os
import math
from datetime import datetime, timezone
from typing import Generator, List, Optional
from sqlalchemy import (
    create_engine, Column, Integer, Float, String, Text, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

# Database URL configuration (PostgreSQL with PostGIS support, fallback to SQLite)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kaiser_civic.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite-specific connect args
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ── Database Models ──────────────────────────────────────────────────────────

class WardModel(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    code = Column(String(20), nullable=False, unique=True, index=True)
    zone = Column(String(50), nullable=False)
    area = Column(Text, nullable=False)
    ac_name = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    geojson_polygon = Column(Text, nullable=True)  # Boundary coordinates

    # Relationships
    complaints = relationship("ComplaintModel", back_populates="ward", cascade="all, delete-orphan")
    users = relationship("UserModel", back_populates="ward")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(20), nullable=False, default="citizen", index=True)  # citizen | officer | admin
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True, index=True)
    ward_name = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    employee_id = Column(String(50), nullable=True)
    badge_number = Column(String(50), nullable=True)
    avatar_initials = Column(String(10), nullable=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    ward = relationship("WardModel", back_populates="users")
    assigned_complaints = relationship("ComplaintModel", foreign_keys="ComplaintModel.assigned_officer_id", back_populates="assigned_officer")


class ComplaintModel(Base):
    __tablename__ = "complaints"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)
    severity = Column(Integer, default=50)
    status = Column(String(30), default="reported", index=True)  # reported | in_progress | resolved | escalated
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    landmark = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    resolved_image_url = Column(Text, nullable=True)
    upvote_count = Column(Integer, default=1)

    # Citizen who created the report
    created_by_id = Column(String(50), nullable=True, index=True)
    created_by_name = Column(String(100), nullable=True)
    created_by_email = Column(String(150), nullable=True)
    created_by_ward = Column(Integer, nullable=True)

    # Assigned Municipal Officer
    assigned_officer_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)

    # AI Detection Analytics
    ai_category = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    ward = relationship("WardModel", back_populates="complaints")
    assigned_officer = relationship("UserModel", foreign_keys=[assigned_officer_id], back_populates="assigned_complaints")
    comments = relationship("CommentModel", back_populates="complaint", cascade="all, delete-orphan")
    audits = relationship("ResolutionAuditModel", back_populates="complaint", cascade="all, delete-orphan")


class CommentModel(Base):
    __tablename__ = "comments"

    id = Column(String(50), primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    author_id = Column(String(50), nullable=True)
    author_name = Column(String(100), nullable=False)
    author_role = Column(String(20), default="citizen")
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    complaint = relationship("ComplaintModel", back_populates="comments")


class ResolutionAuditModel(Base):
    """Immutable audit trail for every grievance status change and officer intervention."""
    __tablename__ = "resolution_audits"

    id = Column(String(50), primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    officer_id = Column(String(50), nullable=True)
    officer_name = Column(String(100), nullable=False)
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    notes = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    complaint = relationship("ComplaintModel", back_populates="audits")


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=True, index=True)
    type = Column(String(30), default="alert")
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    complaint_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Composite index for spatial proximity queries
Index("idx_complaint_coords", ComplaintModel.latitude, ComplaintModel.longitude)


def get_db() -> Generator[Session, None, None]:
    """FastAPI database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes geodesic distance in meters between two lat/lon coordinates."""
    r = 6371000.0  # Earth radius in meters
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2.0)**2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


def find_nearby_complaints(
    db: Session,
    lat: float,
    lng: float,
    radius_meters: float = 25.0,
    category: Optional[str] = None
) -> List[ComplaintModel]:
    """
    Geospatial proximity search.
    Computes distance using PostGIS or Python Haversine fallback.
    """
    query = db.query(ComplaintModel).filter(ComplaintModel.status != "resolved")
    if category:
        query = query.filter(ComplaintModel.category.ilike(category))

    # Fast bounding box pre-filter (~100m) to minimize full scans
    delta_lat = (radius_meters + 100) / 111000.0
    delta_lng = (radius_meters + 100) / (111000.0 * math.cos(math.radians(lat)))
    candidates = query.filter(
        ComplaintModel.latitude.between(lat - delta_lat, lat + delta_lat),
        ComplaintModel.longitude.between(lng - delta_lng, lng + delta_lng)
    ).all()

    matches = []
    for comp in candidates:
        dist = haversine_distance(lat, lng, comp.latitude, comp.longitude)
        if dist <= radius_meters:
            matches.append(comp)
    return matches


def init_db():
    """Initializes schema and seeds realistic baseline records if table is empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from seed_data import (
            MUMBAI_WARDS, MOCK_USERS, MOCK_OFFICERS, DEMO_CITIZENS,
            MOCK_COMPLAINTS, MOCK_NOTIFICATIONS, MOCK_COMMENTS
        )

        # 1. Seed Wards
        if db.query(WardModel).count() == 0:
            for w in MUMBAI_WARDS:
                db.add(WardModel(
                    id=w["id"],
                    name=w["name"],
                    code=w["code"],
                    zone=w["zone"],
                    area=w["area"],
                    ac_name=w.get("ac"),
                    phone=w.get("phone"),
                    email=w.get("email"),
                    address=w.get("address"),
                    lat=w["lat"],
                    lng=w["lng"],
                ))
            db.commit()

        # 2. Seed Users
        if db.query(UserModel).count() == 0:
            # Admin
            admin = MOCK_USERS["admin"]
            db.add(UserModel(
                id=admin["id"],
                name=admin["name"],
                email=admin["email"],
                phone=admin["phone"],
                role=admin["role"],
                ward_id=admin.get("ward", 1),
                ward_name=admin.get("wardName", "A Ward"),
                department=admin.get("department", "Municipal Commissioner Office"),
                avatar_initials=admin.get("avatarInitials", "RM"),
                password=admin["password"],
            ))

            # Demo Citizens
            for c in DEMO_CITIZENS:
                db.add(UserModel(
                    id=c["id"],
                    name=c["name"],
                    email=c["email"],
                    phone=c.get("phone", "+91 98000 00000"),
                    role="citizen",
                    ward_id=c.get("ward", 8),
                    ward_name=c.get("wardName", "G/N Ward"),
                    avatar_initials=c.get("avatarInitials", "CN"),
                    password=c["password"],
                ))

            # Officers
            for o in MOCK_OFFICERS:
                db.add(UserModel(
                    id=o["id"],
                    name=o["name"],
                    email=o["email"],
                    phone=o.get("phone"),
                    role="officer",
                    ward_id=o.get("ward"),
                    ward_name=o.get("wardName"),
                    department=o.get("department"),
                    employee_id=o.get("employeeId"),
                    badge_number=o.get("badgeNumber"),
                    avatar_initials=o.get("avatarInitials", "OF"),
                    password=o["password"],
                ))
            db.commit()

        # 3. Seed Initial Complaints
        if db.query(ComplaintModel).count() == 0:
            for comp in MOCK_COMPLAINTS:
                created_by = comp.get("createdBy", {})
                assigned = comp.get("assignedOfficer") or {}
                db.add(ComplaintModel(
                    id=comp["id"],
                    title=comp["title"],
                    description=comp.get("description", ""),
                    category=comp["category"],
                    severity=comp.get("severity", 50),
                    status=comp.get("status", "reported"),
                    latitude=comp["latitude"],
                    longitude=comp["longitude"],
                    ward_id=comp.get("ward", 1),
                    landmark=comp.get("landmark", ""),
                    image_url=comp.get("imageUrl"),
                    resolved_image_url=comp.get("resolvedImageUrl"),
                    upvote_count=comp.get("upvoteCount", 1),
                    created_by_id=created_by.get("id"),
                    created_by_name=created_by.get("name"),
                    created_by_email=created_by.get("email"),
                    created_by_ward=created_by.get("ward"),
                    assigned_officer_id=assigned.get("id") if isinstance(assigned, dict) else None,
                    ai_category=comp.get("aiAnalysis", {}).get("categoryDetected"),
                    ai_confidence=comp.get("aiAnalysis", {}).get("confidence"),
                ))
            db.commit()

        # 4. Seed Comments
        if db.query(CommentModel).count() == 0:
            for c in MOCK_COMMENTS:
                db.add(CommentModel(
                    id=c["id"],
                    complaint_id=c["complaint_id"],
                    author_id=c["author_id"],
                    author_name=c["author_name"],
                    author_role=c.get("author_role", "citizen"),
                    text=c["text"],
                ))
            db.commit()

        # 5. Seed Notifications
        if db.query(NotificationModel).count() == 0:
            for n in MOCK_NOTIFICATIONS:
                db.add(NotificationModel(
                    id=n["id"],
                    type=n.get("type", "alert"),
                    title=n["title"],
                    body=n["body"],
                    complaint_id=n.get("complaintId"),
                    is_read=n.get("isRead", False),
                ))
            db.commit()

    finally:
        db.close()
