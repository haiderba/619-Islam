<div align="center">

  # 🌙 619 Islam — The Complete Spiritual Companion

  <p align="center">
    <strong>An elegant, privacy-first, universal Islamic companion progressive web application (PWA).</strong><br />
    Designed for believers worldwide to read the Quran, track prayers, learn Hadith, explore Islamic heritage, and build daily spiritual habits.
  </p>

  <p align="center">
    <a href="https://619-islam.bsf1802210.workers.dev" target="_blank">
      <img src="https://img.shields.io/badge/🚀_Live_App-619_Islam-0d9488?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Web App" />
    </a>
    <a href="https://github.com/haiderba/619-Islam/releases" target="_blank">
      <img src="https://img.shields.io/badge/Version-v1.7.5-f59e0b?style=for-the-badge" alt="Latest Version" />
    </a>
    <a href="https://github.com/haiderba/619-Islam/blob/main/LICENSE" target="_blank">
      <img src="https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge" alt="MIT License" />
    </a>
  </p>

  <p align="center">
    <a href="https://619-islam.bsf1802210.workers.dev">
      <strong>🌐 Launch Official Live App: https://619-islam.bsf1802210.workers.dev</strong>
    </a>
  </p>

</div>

---

## 🌟 Highlights & Key Features

### 📖 The Holy Quran & Dual Translations
- **Dual Translation Engine:** Display both a **Primary Translation** (prominent, bold, high-contrast) and a **Secondary Translation** (subtle, cross-reference view) simultaneously.
- **Multilingual Support:** English (*Abdel Haleem*, *Saheeh International*), Urdu (*Dr. Israr Ahmad*, *Fatah Muhammad Jalandhari*, *Maulana Junagarhi*), **Pashto** (*Zakaria Abulsalam*), **Sindhi** (*Taj Mehmood Amroti*), **Roman Urdu**, Hindi, French, and Spanish.
- **3 Reading Modes:**
  - **Verses Mode:** Clean verse-by-verse cards with dynamic translations and Tafsir access.
  - **Word-by-Word Learning Mode:** Interactive chips for individual word definitions, phonetics, and word pronunciation audio.
  - **Mushaf Mode:** Continuous Quranic reading mimicking physical Mushaf pages.
- **World-Renowned Qaris:** Stream or download complete recitations by *Mishary Rashid Alafasy*, *AbdulBaset AbdulSamad*, *Mahmoud Khalil Al-Husary*, *Abdur-Rahman as-Sudais*, *Minshawi*, *Maher Al-Muaiqly*, etc.
- **100% Offline Mode:** Full IndexedDB offline storage for complete offline Quran reading and listening.

### 🕌 Namaz (Prayer Times) & Azan
- **Precise Geolocation & Fiqh Calculations:** Hanafi, Shafi, Maliki, Hanbali, Jafari, and Ahle Hadith computation algorithms.
- **Real-Time Prayer Tracker:** Live countdown to the next prayer, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Tahajjud, and Sehri/Iftar times.
- **Azan Notifications & Visual Alerts:** Soft reminders for daily prayers.

### 🗓️ Multi-Calendar Header & Astronomy Observatory
- **Triple Calendar Consolidation:** Gregorian date, Islamic Hijri date (1448 AH), and traditional Desi Solar calendar (Bhadon, Kattey, Magh, etc.).
- **Moon Sighting & Lunar Observatory:** Real-time lunar illumination percentage, phase name, and moon visualization.
- **12-Month Islamic Events Calendar:** Comprehensive historical dates, Mawlid, Ramadan, Eid-ul-Fitr, Eid-ul-Adha, Ashura, and martyrdom anniversaries.

### 📚 Islamic Digital Library & E-Books
- Classical Islamic literature, Hadith anthologies, and jurisprudential texts.
- Integrated multi-language reader with customized typography, font size scaling, Light/Dark/Sepia themes, and bookmarks.

### 🧭 Sensor-Calibrated Qibla Compass
- Live compass with magnetic declination correction pointing directly towards the Kaaba in Mecca with accuracy indicators.

### 📿 Smart Digital Tasbeeh Counter
- Haptic touch feedback, customizable dhikr targets, presets (SubhanAllah, Alhamdulillah, Allahu Akbar, Ayat-ul-Kursi, Astaghfirullah), and progress history.

### 🤲 Fortress of the Muslim (Duas & Daily Azkar)
- Categorized supplications (Morning/Evening, Protection, Forgiveness, Health, Travel, Home, Sleep) with authentic Arabic text, Roman transliteration, and English translation.

### 🛡️ Ruqyah Healing Station & Islamic Quiz
- Authentic Quranic Ruqyah healing verses and audio.
- Interactive multi-level Islamic trivia to test and expand knowledge.

### 💰 Zakat Calculator & Khatam Planner
- Complete asset-based Zakat calculation (Gold, Silver, Cash, Business assets).
- Personalized Quran Khatam planner with daily verse targets.

---

## 📱 Installing 619 Islam as a Native App (PWA)

619 Islam is a **Progressive Web App (PWA)** that can be installed directly on any smartphone, tablet, or computer with zero app store downloads required:

### 🍏 iOS (iPhone & iPad)
1. Open **[https://619-islam.bsf1802210.workers.dev](https://619-islam.bsf1802210.workers.dev)** in **Safari**.
2. Tap the **Share** button (the square icon with an upward arrow at the bottom).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** — 619 Islam will now appear on your home screen with a full standalone native experience!

### 🤖 Android
1. Open **[https://619-islam.bsf1802210.workers.dev](https://619-islam.bsf1802210.workers.dev)** in **Google Chrome**.
2. Tap the **"Install 619 Islam"** banner at the top, or tap the three dots **(⋮)** and select **"Install App"** / **"Add to Home screen"**.

### 💻 Windows / macOS / Linux Desktop
1. Open the app in Chrome, Edge, or Brave.
2. Click the **Install** icon in the browser address bar.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Design System** | Tailwind CSS, Lucide Icons, Custom Urdu Typography |
| **Progressive Web App (PWA)** | Vite PWA Plugin, Workbox Service Worker |
| **Offline Storage** | IndexedDB (Dexie.js / Native IDB Storage) |
| **State Management** | React Context API |
| **Audio Engine** | Custom HTML5 Web Audio Player with Speed Modulation |
| **APIs** | Quran.com v4 API, Aladhan Prayer Engine |
| **Cloud Deployment** | Cloudflare Edge Workers & Pages |

---

## 💻 Local Development Setup

Follow these steps to run 619 Islam locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/haiderba/619-Islam.git
cd 619-Islam/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open **`http://localhost:5173`** or **`http://localhost:5174`** in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 📂 Project Directory Structure

```text
619-Islam/
├── frontend/
│   ├── public/
│   │   ├── splash-video.mp4        # Startup animation
│   │   ├── splash-mosque-bg.jpg    # Illuminated Mosque backdrop
│   │   ├── logo.png                # Brand identity logo
│   │   ├── manifest.webmanifest    # PWA Configuration
│   │   └── version.json            # Version tracker
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/          # Daily Ayah, Events, Moon Observatory
│   │   │   └── ui/                 # Layout, Splash, PWA Prompts, Navbars
│   │   ├── context/                # AuthContext, UpdateContext
│   │   ├── hooks/                  # useQuran, useNamaz, useGoals, useStreak
│   │   ├── pages/                  # Dashboard, Quran, SurahReader, Namaz, etc.
│   │   ├── services/               # quranOfflineService (IndexedDB)
│   │   └── utils/                  # LunarEngine, DesiCalendar, IslamicEvents
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── LICENSE
└── README.md
```

---

## 🤝 Contributing & Feedback

Contributions, suggestions, and feature requests are always welcome!
- Feel free to open an **[Issue](https://github.com/haiderba/619-Islam/issues)** or submit a **Pull Request**.
- If you find this project beneficial for your spiritual journey, please ⭐ **star the repository** on GitHub!

---

<div align="center">
  <p>Made with devotion for the global Muslim Ummah 🌍</p>
  <p><strong>619 Islam — Discipline & Faith Daily</strong></p>
</div>
