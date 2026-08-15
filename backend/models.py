from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    name = Column(String, nullable=True)
    fiqh = Column(String, default="Sunni (Hanafi)")
    language = Column(String, default="English")
    focus_areas = Column(String, default="") # comma separated
    onboarding_completed = Column(Boolean, default=False)
    quran_translation = Column(String, default="en.asad")
    latitude = Column(String, nullable=True)
    longitude = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    goals = relationship("Goal", back_populates="owner")
    tasbeeh_sessions = relationship("TasbeehItem", back_populates="owner")

class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String, primary_key=True, index=True) # UUID string
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    category = Column(String)
    description = Column(String, nullable=True)
    target_days = Column(Integer, nullable=True)
    repeat_type = Column(String)
    selected_days = Column(String, nullable=True) # comma separated ints
    reminder_frequency = Column(String)
    reminder_interval_minutes = Column(Integer, nullable=True)
    reminder_start_time = Column(String, nullable=True)
    reminder_end_time = Column(String, nullable=True)
    notification_mode = Column(String)
    notes = Column(String, nullable=True)
    icon_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    archived = Column(Boolean, default=False)

    owner = relationship("User", back_populates="goals")
    completions = relationship("TaskCompletion", back_populates="goal")

class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(String, ForeignKey("goals.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, index=True) # YYYY-MM-DD
    completed = Column(Boolean, default=True)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    goal = relationship("Goal", back_populates="completions")

class TasbeehItem(Base):
    __tablename__ = "tasbeeh_items"

    id = Column(String, primary_key=True, index=True) # UUID string
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    arabic = Column(String, nullable=True)
    transliteration = Column(String, nullable=True)
    translation = Column(String, nullable=True)
    target_count = Column(Integer, default=33)
    current_count = Column(Integer, default=0)
    is_custom = Column(Boolean, default=False)

    owner = relationship("User", back_populates="tasbeeh_sessions")

class GlobalHabit(Base):
    __tablename__ = "global_habits"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    description = Column(String, nullable=True)
    target_days = Column(Integer, default=30)
    icon_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

    memberships = relationship("HabitMembership", back_populates="habit")

class HabitMembership(Base):
    __tablename__ = "habit_memberships"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    habit_id = Column(String, ForeignKey("global_habits.id"))
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    habit = relationship("GlobalHabit", back_populates="memberships")
