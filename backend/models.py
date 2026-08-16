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

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    token = Column(String, unique=True, index=True)
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

# ==================== ISLAMIC BOOKS / DIGITAL LIBRARY MODELS ====================

class Tradition(Base):
    __tablename__ = "traditions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_ar = Column(String, nullable=True)
    name_ur = Column(String, nullable=True)
    slug = Column(String, unique=True, index=True)
    parent_id = Column(Integer, ForeignKey("traditions.id"), nullable=True)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    books = relationship("Book", back_populates="tradition")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_ar = Column(String, nullable=True)
    name_ur = Column(String, nullable=True)
    slug = Column(String, unique=True, index=True)
    icon_name = Column(String, default="BookOpen")
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    books = relationship("Book", back_populates="category")

class Author(Base):
    __tablename__ = "authors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    name_ar = Column(String, nullable=True)
    name_ur = Column(String, nullable=True)
    death_year_hijri = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    books = relationship("Book", back_populates="author")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    title_ar = Column(String, nullable=True)
    title_ur = Column(String, nullable=True)
    slug = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    author_id = Column(Integer, ForeignKey("authors.id"), nullable=True)
    tradition_id = Column(Integer, ForeignKey("traditions.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    language = Column(String, default="Arabic • English • Urdu")
    publication_year = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    copyright_status = Column(String, default="public_domain")
    license = Column(String, default="Open / Public Domain")
    is_readable = Column(Boolean, default=True)
    is_downloadable = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    total_pages = Column(Integer, default=100)
    total_chapters = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tradition = relationship("Tradition", back_populates="books")
    category = relationship("Category", back_populates="books")
    author = relationship("Author", back_populates="books")
    chapters = relationship("BookChapter", back_populates="book", cascade="all, delete-orphan")
    sources = relationship("BookSource", back_populates="book", cascade="all, delete-orphan")
    user_interactions = relationship("UserBook", back_populates="book", cascade="all, delete-orphan")

class BookChapter(Base):
    __tablename__ = "book_chapters"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    chapter_number = Column(Integer, default=1)
    title = Column(String, nullable=False)
    title_ar = Column(String, nullable=True)
    title_ur = Column(String, nullable=True)
    content_ar = Column(String, nullable=True)
    content_en = Column(String, nullable=True)
    content_ur = Column(String, nullable=True)

    book = relationship("Book", back_populates="chapters")

class BookSource(Base):
    __tablename__ = "book_sources"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    provider = Column(String, default="internal") # internal, al_islam, internet_archive, etc.
    external_id = Column(String, nullable=True)
    web_url = Column(String, nullable=True)
    reader_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)
    epub_url = Column(String, nullable=True)
    can_host = Column(Boolean, default=True)
    can_download = Column(Boolean, default=True)

    book = relationship("Book", back_populates="sources")

class UserBook(Base):
    __tablename__ = "user_books"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    is_favorite = Column(Boolean, default=False)
    last_chapter = Column(Integer, default=1)
    last_position = Column(String, default="0") # page/scroll position
    progress_percent = Column(Integer, default=0)
    last_read_at = Column(DateTime, default=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="user_interactions")

class BookBookmark(Base):
    __tablename__ = "book_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    chapter_number = Column(Integer, default=1)
    title = Column(String, nullable=False)
    selected_text = Column(String, nullable=True)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserBookPreference(Base):
    __tablename__ = "user_book_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    preferred_tradition_id = Column(Integer, ForeignKey("traditions.id"), nullable=True)
    preferred_tradition_slug = Column(String, default="all") # "all", "sunni", "shia", "hanafi", etc.
    reader_font_size = Column(Integer, default=18)
    reader_theme = Column(String, default="dark") # "dark", "light", "sepia"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

