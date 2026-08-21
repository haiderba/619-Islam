import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Clock, 
  Compass, 
  BookOpen, 
  Activity, 
  Users, 
  Sparkles, 
  Moon, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Calculator,
  HelpCircle,
  MapPin,
  Target,
  FileText
} from 'lucide-react';
import IslamicEventsModal from '../components/dashboard/IslamicEventsModal';
import MoonSightingModal from '../components/dashboard/MoonSightingModal';
import { getMoonPhase } from '../utils/lunarEngine';

interface FeatureItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  to?: string;
  action?: () => void;
  badge?: string;
}

interface FeatureCategory {
  title: string;
  description: string;
  items: FeatureItem[];
}

export const AllFeatures: React.FC = () => {
  const navigate = useNavigate();
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showMoonModal, setShowMoonModal] = useState(false);

  const todayMoon = getMoonPhase(new Date());

  const FEATURE_CATEGORIES: FeatureCategory[] = [
    {
      title: 'Spiritual Devotion',
      description: 'Daily recitation, Divine names, and remembrance',
      items: [
        {
          id: 'quran',
          title: 'The Holy Quran',
          subtitle: '114 Surahs, Tafsir, Audio CDN',
          icon: <Book size={22} className="text-amber-400" />,
          to: '/quran',
          badge: 'v4 Open API',
        },
        {
          id: 'sleep-station',
          title: 'Quran Sleep Sanctuary',
          subtitle: 'Bedtime Quran & Rain/Breeze Ambiance',
          icon: <Moon size={22} className="text-cyan-400" />,
          to: '/sleep-station',
          badge: 'New 🌙',
        },
        {
          id: 'names-of-allah',
          title: '99 Names of Allah',
          subtitle: 'Asma-ul-Husna with Audio & Meanings',
          icon: <Sparkles size={22} className="text-amber-400" />,
          to: '/names-of-allah',
          badge: 'New ✨',
        },
        {
          id: 'ruqyah',
          title: 'Ruqyah Shariah & Healing',
          subtitle: 'Protection verses & audio streams',
          icon: <ShieldCheck size={22} className="text-amber-400" />,
          to: '/ruqyah',
          badge: 'New ✨',
        },
        {
          id: 'duas',
          title: 'Duas & Daily Azkar',
          subtitle: 'Morning, Evening & Occasion Duas',
          icon: <BookOpen size={22} className="text-amber-400" />,
          to: '/duas',
        },
        {
          id: 'tasbeeh',
          title: 'Tasbeeh Counter',
          subtitle: 'Digital Beads with Haptic Feedback',
          icon: <Activity size={22} className="text-amber-400" />,
          to: '/tasbeeh',
        },
      ],
    },
    {
      title: 'Daily Practice & Direction',
      description: 'Prayer timetable, Kaaba orientation, and habits',
      items: [
        {
          id: 'namaz',
          title: 'Namaz & Prayer Times',
          subtitle: 'Exact calculation & monthly timetable',
          icon: <Clock size={22} className="text-amber-400" />,
          to: '/namaz',
        },
        {
          id: 'qaza',
          title: 'Qaza Namaz Tracker',
          subtitle: 'Calculate & log missed lifetime prayers',
          icon: <Calculator size={22} className="text-amber-400" />,
          to: '/qaza',
          badge: 'New ✨',
        },
        {
          id: 'qibla',
          title: 'Qibla Direction',
          subtitle: 'Live Compass pointing to Kaaba',
          icon: <Compass size={22} className="text-amber-400" />,
          to: '/qibla',
          badge: 'Accurate',
        },
        {
          id: 'khatam',
          title: 'Khatam-ul-Quran Planner',
          subtitle: '30-day, 60-day reading schedules',
          icon: <Target size={22} className="text-amber-400" />,
          to: '/khatam',
          badge: 'New ✨',
        },
        {
          id: 'habits',
          title: 'Ummah Habits',
          subtitle: 'Track streaks & spiritual routine',
          icon: <Users size={22} className="text-amber-400" />,
          to: '/habits',
        },
      ],
    },
    {
      title: 'Knowledge, Pillars & Community',
      description: 'Hadith, Zakat calculation, trivia, and locator',
      items: [
        {
          id: 'zakat',
          title: 'Smart Zakat Calculator',
          subtitle: 'Gold & Silver Nisab across multi-assets',
          icon: <Calculator size={22} className="text-amber-400" />,
          to: '/zakat',
          badge: 'New ✨',
        },
        {
          id: 'hadith',
          title: 'Authentic Hadith Explorer',
          subtitle: 'Bukhari, Muslim, Nawawi & Sanad grades',
          icon: <FileText size={22} className="text-amber-400" />,
          to: '/hadith',
          badge: 'New ✨',
        },
        {
          id: 'quiz',
          title: 'Daily Islamic Quiz',
          subtitle: '5-question trivia with explanations',
          icon: <HelpCircle size={22} className="text-amber-400" />,
          to: '/quiz',
          badge: 'New ✨',
        },
        {
          id: 'masjid-finder',
          title: 'Nearby Masajid & Halal',
          subtitle: 'Live GPS discovery & directions',
          icon: <MapPin size={22} className="text-amber-400" />,
          to: '/masjid-finder',
          badge: 'New ✨',
        },
      ],
    },
    {
      title: 'Islamic Astronomy & Calendar',
      description: 'Moon sighting, lunar phases, and holy events',
      items: [
        {
          id: 'moon-observatory',
          title: 'Moon Sighting Observatory',
          subtitle: `Live Phase (${todayMoon.illumination}%) & Eclipse Tracker`,
          icon: <Moon size={22} className="text-amber-400" />,
          action: () => setShowMoonModal(true),
          badge: 'Interactive',
        },
        {
          id: 'islamic-calendar',
          title: '12-Month Events Calendar',
          subtitle: 'Verified Hijri dates, Wiladat & Shahadat',
          icon: <Calendar size={22} className="text-amber-400" />,
          action: () => setShowEventsModal(true),
          badge: '1448 AH',
        },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-6xl mx-auto w-full">
      {/* ── Top Header Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Dashboard</span>
        </button>

        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Feature Directory
        </span>
      </div>

      {/* ── Hero Feature Directory Banner ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Islamic Ecosystem</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            All Islamic Features & Tools
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-sm leading-relaxed">
            Access the complete catalog of Quranic, devotional, astronomical, and daily Islamic practice tools in one place.
          </p>
        </div>
      </div>

      {/* ── Categorized Feature Cards ── */}
      <div className="space-y-6">
        {FEATURE_CATEGORIES.map((category, catIdx) => (
          <div key={catIdx} className="space-y-2.5">
            <div>
              <h2 className="text-xs font-black uppercase text-amber-500 tracking-wider">
                {category.title}
              </h2>
              <p className="text-[11px] text-muted">
                {category.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.items.map((item) => {
                const handleClick = () => {
                  if (item.action) {
                    item.action();
                  } else if (item.to) {
                    navigate(item.to);
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={handleClick}
                    className="p-3.5 rounded-2xl bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 hover:border-amber-500/50 shadow-sm flex items-center justify-between gap-3 cursor-pointer group active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-black text-text group-hover:text-amber-500 transition-colors truncate">
                            {item.title}
                          </h3>
                          {item.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-subtext truncate mt-0.5 font-medium">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-muted group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 🗓️ 12-Month Events Calendar Modal */}
      <IslamicEventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        currentMonthNumber={3}
        currentDayNumber={3}
        hijriYear={1448}
      />

      {/* 🌙 Moon Sighting Observatory Modal */}
      <MoonSightingModal
        isOpen={showMoonModal}
        onClose={() => setShowMoonModal(false)}
        initialHijriDay={3}
        initialHijriMonth="Rabi' al-Awwal"
        initialHijriYear={1448}
      />
    </div>
  );
};
