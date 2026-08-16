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
