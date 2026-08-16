from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    name: Optional[str] = None
    fiqh: str = "Sunni (Hanafi)"

class UserResponse(UserBase):
    id: int
    name: Optional[str] = None
    fiqh: str
    language: str
    focus_areas: str
    onboarding_completed: bool
    quran_translation: str
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class VerifyOtpRequest(BaseModel):
    email: str
    otp_code: str

class ResendOtpRequest(BaseModel):
    email: str

class ForgotPasswordRequest(BaseModel):
    email: str
    origin_url: Optional[str] = None

class ResetPasswordRequest(BaseModel):
    email: str
    token: str
    new_password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    fiqh: Optional[str] = None
    quran_translation: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class GoalBase(BaseModel):
    id: str
    title: str
    category: str
    description: Optional[str] = None
    target_days: Optional[int] = None
    repeat_type: str
    selected_days: Optional[str] = None
    reminder_frequency: str
    reminder_interval_minutes: Optional[int] = None
    reminder_start_time: Optional[str] = None
    reminder_end_time: Optional[str] = None
    notification_mode: str
    notes: Optional[str] = None
    icon_name: Optional[str] = None
    archived: Optional[bool] = False

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TaskCompletionBase(BaseModel):
    goal_id: str
    date: str
    completed: bool

class TaskCompletionCreate(TaskCompletionBase):
    pass

class TaskCompletionResponse(TaskCompletionBase):
    id: int
    user_id: int
    completed_at: datetime

    class Config:
        from_attributes = True

class TasbeehItemBase(BaseModel):
    id: str
    title: str
    arabic: Optional[str] = None
    transliteration: Optional[str] = None
    translation: Optional[str] = None
    target_count: int
    current_count: int
    is_custom: Optional[bool] = False

class TasbeehItemCreate(TasbeehItemBase):
    pass

class TasbeehItemResponse(TasbeehItemBase):
    user_id: int

    class Config:
        from_attributes = True

class GlobalHabitBase(BaseModel):
    id: str
    title: str
    category: str
    description: Optional[str] = None
    target_days: int = 30
    icon_name: Optional[str] = None
    is_active: bool = True

class GlobalHabitCreate(GlobalHabitBase):
    pass

class GlobalHabitResponse(GlobalHabitBase):
    created_at: datetime
    member_count: int = 0
    joined: bool = False

    class Config:
        from_attributes = True

# ==================== ISLAMIC BOOKS / LIBRARY SCHEMAS ====================

class TraditionResponse(BaseModel):
    id: int
    name: str
    name_ar: Optional[str] = None
    name_ur: Optional[str] = None
    slug: str
    parent_id: Optional[int] = None
    description: Optional[str] = None
    sort_order: int = 0

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    name_ar: Optional[str] = None
    name_ur: Optional[str] = None
    slug: str
    icon_name: str
    description: Optional[str] = None
    sort_order: int = 0

    class Config:
        from_attributes = True

class AuthorResponse(BaseModel):
    id: int
    name: str
    name_ar: Optional[str] = None
    name_ur: Optional[str] = None
    death_year_hijri: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class BookSourceResponse(BaseModel):
    id: int
    provider: str
    web_url: Optional[str] = None
    pdf_url: Optional[str] = None
    can_host: bool = True
    can_download: bool = True

    class Config:
        from_attributes = True

class BookChapterSummary(BaseModel):
    id: int
    chapter_number: int
    title: str
    title_ar: Optional[str] = None
    title_ur: Optional[str] = None

    class Config:
        from_attributes = True

class BookChapterDetail(BookChapterSummary):
    content_ar: Optional[str] = None
    content_en: Optional[str] = None
    content_ur: Optional[str] = None

    class Config:
        from_attributes = True

class BookSummaryResponse(BaseModel):
    id: int
    title: str
    title_ar: Optional[str] = None
    title_ur: Optional[str] = None
    slug: str
    description: Optional[str] = None
    language: str
    publication_year: Optional[str] = None
    cover_url: Optional[str] = None
    copyright_status: str
    is_readable: bool = True
    is_downloadable: bool = True
    featured: bool = False
    total_chapters: int = 1
    author: Optional[AuthorResponse] = None
    tradition: Optional[TraditionResponse] = None
    category: Optional[CategoryResponse] = None
    is_favorite: bool = False
    progress_percent: int = 0
    last_chapter: int = 1

    class Config:
        from_attributes = True

class BookDetailResponse(BookSummaryResponse):
    chapters: List[BookChapterSummary] = []
    sources: List[BookSourceResponse] = []

    class Config:
        from_attributes = True

class BookProgressUpdate(BaseModel):
    chapter_number: int
    position: Optional[str] = "0"
    progress_percent: int

class BookmarkCreate(BaseModel):
    book_id: int
    chapter_number: int
    title: str
    selected_text: Optional[str] = None
    note: Optional[str] = None

class BookmarkResponse(BookmarkCreate):
    id: int
    created_at: datetime
    book_title: Optional[str] = None

    class Config:
        from_attributes = True

class UserBookPreferenceUpdate(BaseModel):
    preferred_tradition_slug: str
    reader_font_size: Optional[int] = 18
    reader_theme: Optional[str] = "dark"

class UserBookPreferenceResponse(BaseModel):
    preferred_tradition_slug: str
    reader_font_size: int = 18
    reader_theme: str = "dark"

    class Config:
        from_attributes = True

# ==================== FEEDBACK SCHEMAS ====================

class UserFeedbackCreate(BaseModel):
    category: str = "feature_request" # feature_request, bug_report, translation_correction, improvement, compliment
    subject: str
    message: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None

class UserFeedbackUpdateStatus(BaseModel):
    status: str # new, under_review, planned, resolved
    admin_notes: Optional[str] = None

class UserFeedbackResponse(BaseModel):
    id: str
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    category: str
    subject: str
    message: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


