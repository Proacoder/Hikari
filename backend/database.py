import os
import math
import logging
from datetime import datetime, timezone
from typing import Generator, List, Optional
from sqlalchemy import (
    create_engine, Column, Integer, Float, String, Text, Boolean, DateTime,
    ForeignKey, Index, UniqueConstraint, inspect as sa_inspect, text, event
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

logger = logging.getLogger("kaiser_db")

# Database URL configuration (PostgreSQL preferred, SQLite fallback for dev)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kaiser_civic.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_SQLITE = "sqlite" in DATABASE_URL
connect_args = {"check_same_thread": False, "timeout": 15} if IS_SQLITE else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_size=10 if not IS_SQLITE else 5,
    max_overflow=20 if not IS_SQLITE else 0,
)

if IS_SQLITE:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, connection_record):
        """Enable WAL mode and busy_timeout for concurrent SQLite reads/writes."""
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA busy_timeout=10000")
            cursor.execute("PRAGMA synchronous=NORMAL")
        except Exception as e:
            logger.warning(f"Failed to set SQLite pragma: {e}")
        finally:
            cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# -- Database Models --

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
    geojson_polygon = Column(Text, nullable=True)

    complaints = relationship("ComplaintModel", back_populates="ward", cascade="all, delete-orphan")
    users = relationship("UserModel", back_populates="ward")


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(20), nullable=False, default="citizen", index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True, index=True)
    ward_name = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    employee_id = Column(String(50), nullable=True)
    badge_number = Column(String(50), nullable=True)
    avatar_initials = Column(String(10), nullable=True)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ward = relationship("WardModel", back_populates="users")
    assigned_complaints = relationship(
        "ComplaintModel", foreign_keys="ComplaintModel.assigned_officer_id",
        back_populates="assigned_officer"
    )


class ComplaintModel(Base):
    __tablename__ = "complaints"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)
    severity = Column(Integer, default=50)
    status = Column(String(30), default="reported", index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=False, index=True)
    landmark = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    resolved_image_url = Column(Text, nullable=True)
    upvote_count = Column(Integer, default=0)

    created_by_id = Column(String(50), nullable=True, index=True)
    created_by_name = Column(String(100), nullable=True)
    created_by_email = Column(String(150), nullable=True)
    created_by_ward = Column(Integer, nullable=True)

    assigned_officer_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)

    ai_category = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)

    # CLIP validation metadata
    clip_category = Column(String(100), nullable=True)
    clip_score = Column(Float, nullable=True)
    clip_status = Column(String(50), default="inconclusive", nullable=True)
    clip_explanation = Column(Text, nullable=True)

    # Image authenticity & forensics metadata
    authenticity_verdict = Column(String(50), default="inconclusive", nullable=True)
    authenticity_score = Column(Float, nullable=True)
    authenticity_details = Column(Text, nullable=True)

    # Semantic and spatial duplicate tracking
    duplicate_status = Column(String(50), default="no_candidate", nullable=True)
    duplicate_parent_id = Column(String(50), ForeignKey("complaints.id"), nullable=True)
    duplicate_score = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    resolved_at = Column(DateTime, nullable=True)

    reopen_count = Column(Integer, default=0)
    reopened_at = Column(DateTime, nullable=True)
    reopen_reason = Column(Text, nullable=True)
    reopen_photo_url = Column(Text, nullable=True)
    is_permanently_locked = Column(Boolean, default=False)
    rating = Column(Integer, nullable=True)
    feedback_tags = Column(String(255), nullable=True)
    feedback_comment = Column(Text, nullable=True)

    ward = relationship("WardModel", back_populates="complaints")
    assigned_officer = relationship(
        "UserModel", foreign_keys=[assigned_officer_id],
        back_populates="assigned_complaints"
    )
    comments = relationship("CommentModel", back_populates="complaint", cascade="all, delete-orphan")
    audits = relationship("ResolutionAuditModel", back_populates="complaint", cascade="all, delete-orphan")
    upvotes = relationship("UpvoteModel", back_populates="complaint", cascade="all, delete-orphan")


class UpvoteModel(Base):
    """Tracks per-user upvotes to prevent duplicate voting."""
    __tablename__ = "upvotes"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "complaint_id", name="uq_user_complaint_upvote"),)

    complaint = relationship("ComplaintModel", back_populates="upvotes")


class CommentModel(Base):
    __tablename__ = "comments"

    id = Column(String(50), primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    author_id = Column(String(50), nullable=True)
    author_name = Column(String(100), nullable=False)
    author_role = Column(String(20), default="citizen")
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    complaint = relationship("ComplaintModel", back_populates="comments")


class ResolutionAuditModel(Base):
    """Immutable audit trail for every grievance status change."""
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

    complaint = relationship("ComplaintModel", back_populates="audits")


class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), nullable=False, index=True)  # Always required
    type = Column(String(30), default="alert")
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    complaint_id = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class OtpChallengeModel(Base):
    """Cryptographic single-use OTP challenge for citizen verification."""
    __tablename__ = "otp_challenges"

    id = Column(String(50), primary_key=True, index=True)
    email = Column(String(150), nullable=False, index=True)
    otp_hash = Column(String(128), nullable=False)
    salt = Column(String(64), nullable=False)
    expires_at = Column(DateTime, nullable=False, index=True)
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    is_used = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class DuplicateReviewModel(Base):
    """Staff review log for semantic/spatial duplicate candidates (no auto-merge)."""
    __tablename__ = "duplicate_reviews"

    id = Column(String(50), primary_key=True, index=True)
    complaint_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    candidate_id = Column(String(50), ForeignKey("complaints.id"), nullable=False, index=True)
    officer_id = Column(String(50), nullable=True)
    decision = Column(String(50), nullable=False)  # confirmed_duplicate, dismissed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


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
    r = 6371000.0
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
    """Geospatial proximity search using Python Haversine."""
    query = db.query(ComplaintModel).filter(ComplaintModel.status != "resolved")
    if category:
        query = query.filter(ComplaintModel.category.ilike(category))

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


def _migrate_schema():
    """
    Adds new columns to existing tables without dropping data.
    Uses SQLAlchemy inspector (works with PostgreSQL and SQLite).
    """
    inspector = sa_inspect(engine)
    tables_in_db = inspector.get_table_names()

    if "complaints" in tables_in_db:
        existing_cols = {col["name"] for col in inspector.get_columns("complaints")}
        new_columns = [
            ("reopen_count", "INTEGER DEFAULT 0"),
            ("reopened_at", "TIMESTAMP"),
            ("reopen_reason", "TEXT"),
            ("reopen_photo_url", "TEXT"),
            ("is_permanently_locked", "BOOLEAN DEFAULT FALSE"),
            ("rating", "INTEGER"),
            ("feedback_tags", "VARCHAR(255)"),
            ("feedback_comment", "TEXT"),
            ("clip_category", "VARCHAR(100)"),
            ("clip_score", "FLOAT"),
            ("clip_status", "VARCHAR(50) DEFAULT 'inconclusive'"),
            ("clip_explanation", "TEXT"),
            ("authenticity_verdict", "VARCHAR(50) DEFAULT 'inconclusive'"),
            ("authenticity_score", "FLOAT"),
            ("authenticity_details", "TEXT"),
            ("duplicate_status", "VARCHAR(50) DEFAULT 'no_candidate'"),
            ("duplicate_parent_id", "VARCHAR(50)"),
            ("duplicate_score", "FLOAT"),
        ]
        with engine.begin() as conn:
            for col_name, col_type in new_columns:
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE complaints ADD COLUMN {col_name} {col_type}"))
                        logger.info(f"Migrated: added column complaints.{col_name}")
                    except Exception as e:
                        logger.warning(f"Migration notice for {col_name}: {e}")


def init_db():
    """Initializes schema and seeds baseline records only on empty tables."""
    # Create all tables (idempotent)
    Base.metadata.create_all(bind=engine)

    # Migrate any new columns on existing tables
    _migrate_schema()

    db = SessionLocal()
    try:
        from seed_data import (
            MUMBAI_WARDS, MOCK_USERS, MOCK_OFFICERS, DEMO_CITIZENS,
            MOCK_COMPLAINTS, MOCK_NOTIFICATIONS, MOCK_COMMENTS
        )
        import hashlib as _hashlib
        import os as _os

        def _hash_password(password: str) -> str:
            salt = _os.urandom(16).hex()
            hashed = _hashlib.pbkdf2_hmac(
                "sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000
            ).hex()
            return f"pbkdf2:sha256:100000${salt}${hashed}"

        # 1. Seed Wards (only if empty)
        if db.query(WardModel).count() == 0:
            logger.info("Seeding wards...")
            for w in MUMBAI_WARDS:
                db.add(WardModel(
                    id=w["id"], name=w["name"], code=w["code"],
                    zone=w["zone"], area=w["area"], ac_name=w.get("ac"),
                    phone=w.get("phone"), email=w.get("email"),
                    address=w.get("address"), lat=w["lat"], lng=w["lng"],
                ))
            db.commit()

        # 2. Seed Users (only if empty) — passwords hashed at seed time
        if db.query(UserModel).count() == 0:
            logger.info("Seeding users with hashed passwords...")
            admin = MOCK_USERS["admin"]
            db.add(UserModel(
                id=admin["id"], name=admin["name"], email=admin["email"],
                phone=admin["phone"], role=admin["role"],
                ward_id=admin.get("ward", 1),
                ward_name=admin.get("wardName", "A Ward"),
                department=admin.get("department", "Municipal Commissioner Office"),
                avatar_initials=admin.get("avatarInitials", "RM"),
                password=_hash_password(admin["password"]),
            ))
            for c in DEMO_CITIZENS:
                db.add(UserModel(
                    id=c["id"], name=c["name"], email=c["email"],
                    phone=c.get("phone", "+91 98000 00000"), role="citizen",
                    ward_id=c.get("ward", 8), ward_name=c.get("wardName", "G/N Ward"),
                    avatar_initials=c.get("avatarInitials", "CN"),
                    password=_hash_password(c["password"]),
                ))
            for o in MOCK_OFFICERS:
                db.add(UserModel(
                    id=o["id"], name=o["name"], email=o["email"],
                    phone=o.get("phone"), role="officer",
                    ward_id=o.get("ward"), ward_name=o.get("wardName"),
                    department=o.get("department"),
                    employee_id=o.get("employeeId"),
                    badge_number=o.get("badgeNumber"),
                    avatar_initials=o.get("avatarInitials", "OF"),
                    password=_hash_password(o["password"]),
                ))
            db.commit()

        # 3. Seed Complaints (only if empty)
        if db.query(ComplaintModel).count() == 0:
            logger.info("Seeding complaints...")
            for comp in MOCK_COMPLAINTS:
                created_by = comp.get("createdBy", {})
                assigned = comp.get("assignedOfficer") or {}
                officer_id = assigned.get("id") if isinstance(assigned, dict) else None
                db.add(ComplaintModel(
                    id=comp["id"], title=comp["title"],
                    description=comp.get("description", ""),
                    category=comp["category"], severity=comp.get("severity", 50),
                    status=comp.get("status", "reported"),
                    latitude=comp["latitude"], longitude=comp["longitude"],
                    ward_id=comp.get("ward", 1), landmark=comp.get("landmark", ""),
                    image_url=comp.get("imageUrl"),
                    resolved_image_url=comp.get("resolvedImageUrl"),
                    upvote_count=comp.get("upvoteCount", 1),
                    created_by_id=created_by.get("id"),
                    created_by_name=created_by.get("name"),
                    created_by_email=created_by.get("email"),
                    created_by_ward=created_by.get("ward"),
                    assigned_officer_id=officer_id if officer_id else None,
                    ai_category=comp.get("aiAnalysis", {}).get("categoryDetected"),
                    ai_confidence=comp.get("aiAnalysis", {}).get("confidence"),
                ))
            db.commit()

        # 4. Seed Comments (only if empty)
        if db.query(CommentModel).count() == 0:
            logger.info("Seeding comments...")
            for c in MOCK_COMMENTS:
                db.add(CommentModel(
                    id=c["id"], complaint_id=c["complaint_id"],
                    author_id=c["author_id"], author_name=c["author_name"],
                    author_role=c.get("author_role", "citizen"), text=c["text"],
                ))
            db.commit()

        # 5. Seed Notifications (only if empty; assign to valid user_ids)
        if db.query(NotificationModel).count() == 0:
            logger.info("Seeding notifications...")
            notif_user_map = {
                "notif-001": "user-001", "notif-002": "user-001",
                "notif-003": "user-002", "notif-004": "user-001",
            }
            for n in MOCK_NOTIFICATIONS:
                uid = notif_user_map.get(n["id"], "user-001")
                db.add(NotificationModel(
                    id=n["id"], user_id=uid,
                    type=n.get("type", "alert"), title=n["title"], body=n["body"],
                    complaint_id=n.get("complaintId"), is_read=n.get("isRead", False),
                ))
            db.commit()

        logger.info("Database initialization complete.")

    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
