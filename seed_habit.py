import sys
import os
import uuid

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from database import SessionLocal
from models import GlobalHabit

db = SessionLocal()
if db.query(GlobalHabit).count() == 0:
    habit = GlobalHabit(
        id=str(uuid.uuid4()),
        title="Read Surah Al-Kahf on Friday",
        category="Sunnah",
        description="Join thousands of Muslims globally in reviving the Sunnah of reading Surah Al-Kahf every Friday for a light that extends between the two Fridays.",
        target_days=1,
        icon_name="BookOpen"
    )
    db.add(habit)
    db.commit()
    print("Seeded Ummah Habit!")
else:
    print("Habits already exist")
db.close()
