from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError, jwt
from typing import List, Optional

import secrets
import urllib.parse
import models, schemas, auth, email_service
from database import engine, get_db
import datetime

models.Base.metadata.create_all(bind=engine)

def init_db():
    from database import SessionLocal
    import books_seed
    db = SessionLocal()
    try:
        admin_user = db.query(models.User).filter(
            (models.User.username == "admin") | (models.User.email == "admin@619islam.com")
        ).first()
        if not admin_user:
            admin_user = models.User(
                username="admin",
                email="admin@619islam.com",
                hashed_password=auth.get_password_hash("admin123"),
                is_verified=True,
                name="Admin",
                onboarding_completed=True
            )
            db.add(admin_user)
            db.commit()
            print("Successfully initialized default admin user (admin / admin123)")
        else:
            # Preserve existing custom password, only ensure verified & active
            if not admin_user.is_verified:
                admin_user.is_verified = True
                db.commit()
        
        # Seed and update Islamic books catalog
        books_seed.seed_books_catalog()
    except Exception as e:
        print(f"Error during db init: {e}")
    finally:
        db.close()

init_db()

app = FastAPI(title="619 Islam API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://619-islam.bsf1802210.workers.dev",
        "https://six19-islam-backend.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.workers\.dev|https://.*\.pages\.dev|https://.*\.trycloudflare\.com|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.head("/")
def root():
    return {"status": "ok", "service": "619 Islam API", "version": "1.0.0"}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return db.query(models.User).filter(models.User.username == username).first()
    except Exception:
        return None

@app.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    norm_email = user.email.strip().lower()
    norm_username = user.username.strip().lower()

    if not norm_email or "@" not in norm_email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    if not norm_username or len(norm_username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")

    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # 1. Check if email is already registered to an active verified account
    existing_by_email = db.query(models.User).filter(models.User.email == norm_email).first()
    if existing_by_email and existing_by_email.is_verified:
        raise HTTPException(
            status_code=400, 
            detail="An account with this email is already registered. Please sign in or reset your password."
        )

    # 2. Check if username is already registered and taken by another user
    existing_by_username = db.query(models.User).filter(models.User.username == norm_username).first()
    if existing_by_username:
        if existing_by_username.is_verified:
            raise HTTPException(
                status_code=400, 
                detail="This username is already registered. Please choose another username."
            )
        # If unverified, ensure it doesn't collide with another unverified account's email
        if existing_by_email and existing_by_username.id != existing_by_email.id:
            raise HTTPException(
                status_code=400, 
                detail="This username is already registered. Please choose another username."
            )
        if not existing_by_email and existing_by_username.email != norm_email:
            raise HTTPException(
                status_code=400, 
                detail="This username is already registered. Please choose another username."
            )

    # 3. Handle unverified user record reuse or create new
    if existing_by_email:
        # Update unverified record for this email
        existing_by_email.username = norm_username
        existing_by_email.name = user.name or norm_username
        existing_by_email.fiqh = user.fiqh
        existing_by_email.hashed_password = auth.get_password_hash(user.password)
        db_user = existing_by_email
    else:
        # Create new unverified user
        hashed_password = auth.get_password_hash(user.password)
        db_user = models.User(
            email=norm_email,
            username=norm_username,
            name=user.name or norm_username,
            fiqh=user.fiqh,
            hashed_password=hashed_password,
            is_verified=False
        )
        db.add(db_user)

    db.commit()
    db.refresh(db_user)

    # 4. Generate 6-digit OTP (Valid for 15 minutes)
    otp_code = email_service.generate_otp_code()
    expires_at = datetime.datetime.utcnow() + timedelta(minutes=15)

    # Invalidate previous unused codes for this email
    db.query(models.EmailVerification).filter(
        models.EmailVerification.email == norm_email,
        models.EmailVerification.is_used == False
    ).update({"is_used": True})

    # Save new OTP record
    verification_entry = models.EmailVerification(
        email=norm_email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(verification_entry)
    db.commit()

    # Send verification email via Brevo
    email_sent, email_msg = email_service.send_verification_email(
        recipient_email=norm_email,
        recipient_name=user.name or norm_username,
        otp_code=otp_code
    )

    return {
        "status": "pending_verification",
        "email": norm_email,
        "username": norm_username,
        "message": "Verification code sent to your email." if email_sent else f"Failed to send email: {email_msg}",
        "email_sent": email_sent,
        "email_msg": email_msg
    }

@app.post("/verify-otp", response_model=schemas.AuthTokenResponse)
def verify_otp(req: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    norm_email = req.email.strip().lower()
    norm_code = req.otp_code.strip()

    # Find matching active verification record
    record = db.query(models.EmailVerification).filter(
        models.EmailVerification.email == norm_email,
        models.EmailVerification.otp_code == norm_code,
        models.EmailVerification.is_used == False
    ).order_by(models.EmailVerification.id.desc()).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")

    if record.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Verification code has expired (15-minute limit). Please request a new code.")

    # Mark OTP as used
    record.is_used = True

    # Mark User as verified
    user = db.query(models.User).filter(models.User.email == norm_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.commit()
    db.refresh(user)

    # Generate JWT Token for immediate login
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/resend-otp")
def resend_otp(req: schemas.ResendOtpRequest, db: Session = Depends(get_db)):
    norm_email = req.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == norm_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with this email")

    # Invalidate previous unused codes
    db.query(models.EmailVerification).filter(
        models.EmailVerification.email == norm_email,
        models.EmailVerification.is_used == False
    ).update({"is_used": True})

    # Generate fresh OTP (Valid for 15 minutes)
    otp_code = email_service.generate_otp_code()
    expires_at = datetime.datetime.utcnow() + timedelta(minutes=15)

    verification_entry = models.EmailVerification(
        email=norm_email,
        otp_code=otp_code,
        expires_at=expires_at,
        is_used=False
    )
    db.add(verification_entry)
    db.commit()

    email_sent, email_msg = email_service.send_verification_email(
        recipient_email=norm_email,
        recipient_name=user.name or user.username,
        otp_code=otp_code
    )

    return {
        "status": "success" if email_sent else "error",
        "message": "A new verification code has been sent to your email." if email_sent else f"Failed to send email: {email_msg}",
        "email_sent": email_sent,
        "email_msg": email_msg
    }

@app.get("/debug-email")
def debug_email(to: str = "uhaider695@gmail.com"):
    import os
    success, msg = email_service.send_verification_email(to, "Test User", "123456")
    api_key = os.getenv("BREVO_API_KEY", "")
    return {
        "success": success,
        "detail": msg,
        "api_key_configured": bool(api_key),
        "api_key_snippet": (api_key[:8] + "...") if api_key else "NOT_SET",
        "sender_email": os.getenv("BREVO_SENDER_EMAIL", "uhaider695@gmail.com")
    }

@app.post("/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    norm_email = req.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == norm_email).first()
    if not user:
        return {
            "status": "success",
            "message": "If an account with this email exists, a 6-digit password reset code has been sent."
        }

    # Invalidate previous unused reset tokens for this email
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == user.email,
        models.PasswordResetToken.is_used == False
    ).update({"is_used": True})

    # Generate 6-digit numeric reset OTP (Valid for 15 minutes)
    reset_otp = email_service.generate_otp_code()
    expires_at = datetime.datetime.utcnow() + timedelta(minutes=15)

    token_entry = models.PasswordResetToken(
        email=user.email,
        token=reset_otp,
        expires_at=expires_at,
        is_used=False
    )
    db.add(token_entry)
    db.commit()

    base_origin = req.origin_url.rstrip("/") if req.origin_url else "https://619-islam.bsf1802210.workers.dev"
    encoded_email = urllib.parse.quote_plus(user.email)
    reset_link = f"{base_origin}/reset-password?token={reset_otp}&email={encoded_email}"

    email_sent, email_msg = email_service.send_password_reset_email(
        recipient_email=user.email,
        recipient_name=user.name or user.username,
        reset_code=reset_otp,
        reset_link=reset_link,
        expire_minutes=15
    )

    return {
        "status": "success",
        "message": "A 6-digit password reset code (valid for 15 minutes) has been sent to your email.",
        "email_sent": email_sent,
        "email_msg": email_msg
    }

@app.get("/verify-reset-token")
def verify_reset_token(token: str, email: str, db: Session = Depends(get_db)):
    norm_email = email.strip().lower()
    norm_token = token.strip()

    record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == norm_email,
        models.PasswordResetToken.token == norm_token,
        models.PasswordResetToken.is_used == False
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid reset code. Please check and try again.")

    if record.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Password reset code has expired (15-minute limit). Please request a new code.")

    return {"status": "valid", "email": norm_email}

@app.post("/reset-password", response_model=schemas.AuthTokenResponse)
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    norm_email = req.email.strip().lower()
    norm_token = req.token.strip()

    record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.email == norm_email,
        models.PasswordResetToken.token == norm_token,
        models.PasswordResetToken.is_used == False
    ).first()

    if not record:
        raise HTTPException(status_code=400, detail="Invalid or already used reset code.")

    if record.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset code has expired (15-minute limit). Please request a new code.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    user = db.query(models.User).filter(models.User.email == norm_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    # Update password and mark token as used
    record.is_used = True
    user.hashed_password = auth.get_password_hash(req.new_password)
    user.is_verified = True
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.username == form_data.username) | (models.User.email == form_data.username)
    ).first()

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If admin or already verified, allow login
    if not user.is_verified and user.username != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email first.",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/user/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/user/me", response_model=schemas.UserResponse)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if user_update.fiqh is not None:
        current_user.fiqh = user_update.fiqh
    if user_update.quran_translation is not None:
        current_user.quran_translation = user_update.quran_translation
    if user_update.latitude is not None:
        current_user.latitude = user_update.latitude
    if user_update.longitude is not None:
        current_user.longitude = user_update.longitude
    db.commit()
    db.refresh(current_user)
    return current_user

@app.put("/user/password")
def update_password(pw_update: schemas.UserPasswordUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not auth.verify_password(pw_update.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = auth.get_password_hash(pw_update.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

# Goals Endpoints
@app.get("/goals", response_model=List[schemas.GoalResponse])
def get_goals(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    goals = db.query(models.Goal).filter(models.Goal.user_id == current_user.id).all()
    return goals

@app.post("/goals", response_model=schemas.GoalResponse)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_goal = models.Goal(**goal.dict(), user_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

# Task Completions Endpoints
@app.get("/progress", response_model=List[schemas.TaskCompletionResponse])
def get_progress(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    progress = db.query(models.TaskCompletion).filter(models.TaskCompletion.user_id == current_user.id).all()
    return progress

@app.get("/progress/dates")
def get_progress_dates(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Return unique dates where the user completed at least one task. Used for streak calculation."""
    completions = db.query(models.TaskCompletion).filter(
        models.TaskCompletion.user_id == current_user.id,
        models.TaskCompletion.completed == True
    ).all()
    # Return unique dates sorted descending
    unique_dates = sorted(set(c.date for c in completions), reverse=True)
    return [{"date": d} for d in unique_dates]

@app.post("/progress", response_model=schemas.TaskCompletionResponse)
def create_progress(prog: schemas.TaskCompletionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if already exists for date and goal
    existing = db.query(models.TaskCompletion).filter(
        models.TaskCompletion.user_id == current_user.id,
        models.TaskCompletion.goal_id == prog.goal_id,
        models.TaskCompletion.date == prog.date
    ).first()
    if existing:
        existing.completed = prog.completed
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_prog = models.TaskCompletion(**prog.dict(), user_id=current_user.id)
        db.add(db_prog)
        db.commit()
        db.refresh(db_prog)
        return db_prog

# Tasbeeh Endpoints
@app.get("/tasbeeh", response_model=List[schemas.TasbeehItemResponse])
def get_tasbeeh(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = db.query(models.TasbeehItem).filter(models.TasbeehItem.user_id == current_user.id).all()
    return items

@app.post("/tasbeeh", response_model=schemas.TasbeehItemResponse)
def create_tasbeeh(item: schemas.TasbeehItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = models.TasbeehItem(**item.dict(), user_id=current_user.id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.put("/tasbeeh/{item_id}")
def update_tasbeeh(item_id: str, current_count: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    item = db.query(models.TasbeehItem).filter(models.TasbeehItem.id == item_id, models.TasbeehItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.current_count = current_count
    db.commit()
    db.refresh(item)
    return item

# Global Habits (Ummah) Endpoints
@app.get("/global-habits", response_model=List[schemas.GlobalHabitResponse])
def get_global_habits(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    habits = db.query(models.GlobalHabit).filter(models.GlobalHabit.is_active == True).all()
    
    response_habits = []
    for habit in habits:
        # Calculate member count
        member_count = db.query(models.HabitMembership).filter(models.HabitMembership.habit_id == habit.id).count()
        # Check if current user joined
        joined = db.query(models.HabitMembership).filter(
            models.HabitMembership.habit_id == habit.id,
            models.HabitMembership.user_id == current_user.id
        ).first() is not None

        habit_dict = habit.__dict__.copy()
        habit_dict['member_count'] = member_count
        habit_dict['joined'] = joined
        response_habits.append(habit_dict)
        
    return response_habits

@app.post("/global-habits", response_model=schemas.GlobalHabitResponse)
def create_global_habit(habit: schemas.GlobalHabitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_habit = models.GlobalHabit(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    # Return dummy member_count/joined for the response
    habit_dict = db_habit.__dict__.copy()
    habit_dict['member_count'] = 0
    habit_dict['joined'] = False
    return habit_dict

@app.delete("/global-habits/{habit_id}")
def delete_global_habit(habit_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    habit = db.query(models.GlobalHabit).filter(models.GlobalHabit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    # Delete memberships first (cascade)
    db.query(models.HabitMembership).filter(models.HabitMembership.habit_id == habit_id).delete()
    
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}

@app.post("/global-habits/{habit_id}/join")
def join_global_habit(habit_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    habit = db.query(models.GlobalHabit).filter(models.GlobalHabit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    existing = db.query(models.HabitMembership).filter(
        models.HabitMembership.habit_id == habit_id,
        models.HabitMembership.user_id == current_user.id
    ).first()
    
    if existing:
        return {"message": "Already joined"}
        
    membership = models.HabitMembership(user_id=current_user.id, habit_id=habit_id)
    db.add(membership)
    db.commit()
    return {"message": "Successfully joined"}

@app.post("/global-habits/{habit_id}/leave")
def leave_global_habit(habit_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    membership = db.query(models.HabitMembership).filter(
        models.HabitMembership.habit_id == habit_id,
        models.HabitMembership.user_id == current_user.id
    ).first()
    
    if membership:
        db.delete(membership)
        db.commit()
        
    return {"message": "Successfully left"}

# ==================== ISLAMIC BOOKS / DIGITAL LIBRARY ENDPOINTS ====================

@app.get("/books/traditions", response_model=List[schemas.TraditionResponse])
def get_traditions(db: Session = Depends(get_db)):
    return db.query(models.Tradition).filter(models.Tradition.is_active == True).order_by(models.Tradition.sort_order).all()

@app.get("/books/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).filter(models.Category.is_active == True).order_by(models.Category.sort_order).all()

@app.get("/books", response_model=List[schemas.BookSummaryResponse])
def list_books(
    tradition: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    language: Optional[str] = None,
    featured: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    query = db.query(models.Book).filter(models.Book.is_active == True)

    if tradition and tradition.lower() != "all":
        trad = db.query(models.Tradition).filter(models.Tradition.slug == tradition.lower()).first()
        if trad:
            child_ids = [t.id for t in db.query(models.Tradition).filter(models.Tradition.parent_id == trad.id).all()]
            trad_ids = [trad.id] + child_ids
            query = query.filter(models.Book.tradition_id.in_(trad_ids))

    if category and category.lower() != "all":
        cat = db.query(models.Category).filter(models.Category.slug == category.lower()).first()
        if cat:
            query = query.filter(models.Book.category_id == cat.id)

    if featured is not None:
        query = query.filter(models.Book.featured == featured)

    if search:
        s = f"%{search.strip().lower()}%"
        query = query.join(models.Author, isouter=True).filter(
            (models.Book.title.ilike(s)) |
            (models.Book.title_ar.ilike(s)) |
            (models.Book.title_ur.ilike(s)) |
            (models.Book.description.ilike(s)) |
            (models.Author.name.ilike(s))
        )

    books = query.all()

    user_interactions = {}
    if current_user:
        user_books = db.query(models.UserBook).filter(models.UserBook.user_id == current_user.id).all()
        for ub in user_books:
            user_interactions[ub.book_id] = ub

    results = []
    for b in books:
        ub = user_interactions.get(b.id)
        results.append({
            "id": b.id,
            "title": b.title,
            "title_ar": b.title_ar,
            "title_ur": b.title_ur,
            "slug": b.slug,
            "description": b.description,
            "language": b.language,
            "publication_year": b.publication_year,
            "cover_url": b.cover_url,
            "copyright_status": b.copyright_status,
            "is_readable": b.is_readable,
            "is_downloadable": b.is_downloadable,
            "featured": b.featured,
            "total_chapters": b.total_chapters,
            "author": b.author,
            "tradition": b.tradition,
            "category": b.category,
            "is_favorite": ub.is_favorite if ub else False,
            "progress_percent": ub.progress_percent if ub else 0,
            "last_chapter": ub.last_chapter if ub else 1
        })

    return results

@app.get("/books/{book_id}", response_model=schemas.BookDetailResponse)
def get_book_detail(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_current_user_optional)
):
    b = db.query(models.Book).filter(models.Book.id == book_id, models.Book.is_active == True).first()
    if not b:
        raise HTTPException(status_code=404, detail="Book not found")

    ub = None
    if current_user:
        ub = db.query(models.UserBook).filter(
            models.UserBook.user_id == current_user.id,
            models.UserBook.book_id == book_id
        ).first()

    return {
        "id": b.id,
        "title": b.title,
        "title_ar": b.title_ar,
        "title_ur": b.title_ur,
        "slug": b.slug,
        "description": b.description,
        "language": b.language,
        "publication_year": b.publication_year,
        "cover_url": b.cover_url,
        "copyright_status": b.copyright_status,
        "is_readable": b.is_readable,
        "is_downloadable": b.is_downloadable,
        "featured": b.featured,
        "total_chapters": b.total_chapters,
        "author": b.author,
        "tradition": b.tradition,
        "category": b.category,
        "chapters": b.chapters,
        "sources": b.sources,
        "is_favorite": ub.is_favorite if ub else False,
        "progress_percent": ub.progress_percent if ub else 0,
        "last_chapter": ub.last_chapter if ub else 1
    }

@app.get("/books/{book_id}/chapters/{chapter_number}", response_model=schemas.BookChapterDetail)
def get_book_chapter(
    book_id: int,
    chapter_number: int,
    db: Session = Depends(get_db)
):
    chap = db.query(models.BookChapter).filter(
        models.BookChapter.book_id == book_id,
        models.BookChapter.chapter_number == chapter_number
    ).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chap

@app.get("/user/library")
def get_user_library(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user_books = db.query(models.UserBook).filter(
        models.UserBook.user_id == current_user.id
    ).order_by(models.UserBook.last_read_at.desc()).all()

    continue_reading = []
    favorites = []

    for ub in user_books:
        b = ub.book
        if not b or not b.is_active:
            continue
        book_data = {
            "id": b.id,
            "title": b.title,
            "title_ar": b.title_ar,
            "title_ur": b.title_ur,
            "slug": b.slug,
            "author": b.author.name if b.author else "Classical",
            "cover_url": b.cover_url,
            "last_chapter": ub.last_chapter,
            "last_position": ub.last_position,
            "progress_percent": ub.progress_percent,
            "last_read_at": ub.last_read_at,
            "is_favorite": ub.is_favorite
        }
        if ub.progress_percent > 0:
            continue_reading.append(book_data)
        if ub.is_favorite:
            favorites.append(book_data)

    bmarks = db.query(models.BookBookmark).filter(
        models.BookBookmark.user_id == current_user.id
    ).order_by(models.BookBookmark.created_at.desc()).all()

    bookmarks_list = []
    for bm in bmarks:
        bk = db.query(models.Book).filter(models.Book.id == bm.book_id).first()
        bookmarks_list.append({
            "id": bm.id,
            "book_id": bm.book_id,
            "book_title": bk.title if bk else "Book",
            "chapter_number": bm.chapter_number,
            "title": bm.title,
            "selected_text": bm.selected_text,
            "note": bm.note,
            "created_at": bm.created_at
        })

    return {
        "continue_reading": continue_reading,
        "favorites": favorites,
        "bookmarks": bookmarks_list
    }

@app.post("/user/books/{book_id}/favorite")
def toggle_book_favorite(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ub = db.query(models.UserBook).filter(
        models.UserBook.user_id == current_user.id,
        models.UserBook.book_id == book_id
    ).first()

    if not ub:
        ub = models.UserBook(
            user_id=current_user.id,
            book_id=book_id,
            is_favorite=True
        )
        db.add(ub)
    else:
        ub.is_favorite = not ub.is_favorite

    db.commit()
    return {"status": "success", "is_favorite": ub.is_favorite}

@app.post("/user/books/{book_id}/progress")
def update_book_progress(
    book_id: int,
    prog: schemas.BookProgressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    ub = db.query(models.UserBook).filter(
        models.UserBook.user_id == current_user.id,
        models.UserBook.book_id == book_id
    ).first()

    if not ub:
        ub = models.UserBook(
            user_id=current_user.id,
            book_id=book_id,
            last_chapter=prog.chapter_number,
            last_position=prog.position or "0",
            progress_percent=prog.progress_percent,
            last_read_at=datetime.datetime.utcnow()
        )
        db.add(ub)
    else:
        ub.last_chapter = prog.chapter_number
        ub.last_position = prog.position or ub.last_position
        ub.progress_percent = prog.progress_percent
        ub.last_read_at = datetime.datetime.utcnow()

    db.commit()
    return {"status": "success", "progress_percent": ub.progress_percent}

@app.get("/user/preferences/books", response_model=schemas.UserBookPreferenceResponse)
def get_user_book_preference(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    pref = db.query(models.UserBookPreference).filter(
        models.UserBookPreference.user_id == current_user.id
    ).first()

    if not pref:
        default_slug = "all"
        if current_user.fiqh:
            f = current_user.fiqh.lower()
            if "shia" in f or "jafari" in f: default_slug = "shia"
            elif "hanafi" in f: default_slug = "hanafi"
            elif "shafi" in f: default_slug = "shafii"
            elif "maliki" in f: default_slug = "maliki"
            elif "hanbali" in f: default_slug = "hanbali"
            elif "sunni" in f: default_slug = "sunni"

        pref = models.UserBookPreference(
            user_id=current_user.id,
            preferred_tradition_slug=default_slug
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return pref

@app.put("/user/preferences/books", response_model=schemas.UserBookPreferenceResponse)
def update_user_book_preference(
    pref_update: schemas.UserBookPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    pref = db.query(models.UserBookPreference).filter(
        models.UserBookPreference.user_id == current_user.id
    ).first()

    if not pref:
        pref = models.UserBookPreference(
            user_id=current_user.id,
            preferred_tradition_slug=pref_update.preferred_tradition_slug,
            reader_font_size=pref_update.reader_font_size or 18,
            reader_theme=pref_update.reader_theme or "dark"
        )
        db.add(pref)
    else:
        pref.preferred_tradition_slug = pref_update.preferred_tradition_slug
        if pref_update.reader_font_size:
            pref.reader_font_size = pref_update.reader_font_size
        if pref_update.reader_theme:
            pref.reader_theme = pref_update.reader_theme

    db.commit()
    db.refresh(pref)
    return pref

@app.post("/user/bookmarks", response_model=schemas.BookmarkResponse)
def create_bookmark(
    bm: schemas.BookmarkCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    obj = models.BookBookmark(
        user_id=current_user.id,
        book_id=bm.book_id,
        chapter_number=bm.chapter_number,
        title=bm.title,
        selected_text=bm.selected_text,
        note=bm.note
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    bk = db.query(models.Book).filter(models.Book.id == obj.book_id).first()
    return {
        "id": obj.id,
        "book_id": obj.book_id,
        "book_title": bk.title if bk else "Book",
        "chapter_number": obj.chapter_number,
        "title": obj.title,
        "selected_text": obj.selected_text,
        "note": obj.note,
        "created_at": obj.created_at
    }

@app.delete("/user/bookmarks/{bookmark_id}")
def delete_bookmark(
    bookmark_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bm = db.query(models.BookBookmark).filter(
        models.BookBookmark.id == bookmark_id,
        models.BookBookmark.user_id == current_user.id
    ).first()
    if bm:
        db.delete(bm)
        db.commit()
    return {"status": "success", "message": "Bookmark deleted"}

# ==================== FEEDBACK & FEATURE REQUEST ENDPOINTS ====================

@app.post("/feedback", response_model=schemas.UserFeedbackResponse)
def submit_feedback(
    fb_in: schemas.UserFeedbackCreate,
    db: Session = Depends(get_db)
):
    feedback_id = str(uuid.uuid4())
    obj = models.UserFeedback(
        id=feedback_id,
        user_name=fb_in.user_name,
        user_email=fb_in.user_email,
        category=fb_in.category,
        subject=fb_in.subject,
        message=fb_in.message,
        status="new",
        created_at=datetime.datetime.utcnow()
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@app.get("/admin/feedbacks", response_model=List[schemas.UserFeedbackResponse])
def get_admin_feedbacks(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.UserFeedback)
    if status and status != "all":
        query = query.filter(models.UserFeedback.status == status)
    if category and category != "all":
        query = query.filter(models.UserFeedback.category == category)
    return query.order_by(models.UserFeedback.created_at.desc()).all()

@app.patch("/admin/feedbacks/{feedback_id}/status", response_model=schemas.UserFeedbackResponse)
def update_feedback_status(
    feedback_id: str,
    status_update: schemas.UserFeedbackUpdateStatus,
    db: Session = Depends(get_db)
):
    fb = db.query(models.UserFeedback).filter(models.UserFeedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    fb.status = status_update.status
    if status_update.admin_notes is not None:
        fb.admin_notes = status_update.admin_notes
    db.commit()
    db.refresh(fb)
    return fb

@app.delete("/admin/feedbacks/{feedback_id}")
def delete_feedback(
    feedback_id: str,
    db: Session = Depends(get_db)
):
    fb = db.query(models.UserFeedback).filter(models.UserFeedback.id == feedback_id).first()
    if fb:
        db.delete(fb)
        db.commit()
    return {"status": "success", "message": "Feedback deleted successfully"}

