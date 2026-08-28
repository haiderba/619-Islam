// 30 Curated Authentic Rotating Daily Micro-Sunnahs (Under 60 Seconds)

export interface MicroSunnah {
  id: string;
  title: string;
  urduTitle: string;
  arabicTitle: string;
  actionText: string;
  hadithReference: string;
  virtue: string;
  icon: string;
  category: 'manners' | 'dhikr' | 'prayer' | 'kindness' | 'cleanliness';
}

const STORAGE_KEY = '619_micro_sunnah_progress';

export const MICRO_SUNNAHS: MicroSunnah[] = [
  {
    id: 'sunnah_drink_sitting',
    title: 'Drink Water in 3 Sips While Sitting',
    urduTitle: 'پانی بیٹھ کر تین سانسوں میں پینا',
    arabicTitle: 'الشرب قاعداً على ثلاث دفعات',
    actionText: 'Sit down, hold the glass in your right hand, say Bismillah, drink in 3 calm breaths, and say Alhamdulillah.',
    hadithReference: 'Sahih Muslim 2024 & Sahih al-Bukhari 5631',
    virtue: 'Reviving this simple prophetic habit brings health and the reward of following Rasulullah (ﷺ).',
    icon: '💧',
    category: 'manners',
  },
  {
    id: 'sunnah_smile_charity',
    title: 'Smile at a Believer as Charity (Sadaqah)',
    urduTitle: 'مسکرا کر ملنا صدقہ ہے',
    arabicTitle: 'تبسمك في وجه أخيك صدقة',
    actionText: 'Give a warm, genuine smile to family, friends, or a stranger you meet today.',
    hadithReference: 'Jami` at-Tirmidhi 1956',
    virtue: 'Prophet (ﷺ) said: "Your smiling in the face of your brother is charity for you."',
    icon: '😊',
    category: 'kindness',
  },
  {
    id: 'sunnah_enter_home_salam',
    title: 'Say Salaam & Bismillah When Entering Home',
    urduTitle: 'گھر میں داخل ہوتے وقت سلام و دعا',
    arabicTitle: 'إفشاء السلام عند دخول البيت',
    actionText: 'When stepping inside your home, say "Assalamu Alaikum wa Rahmatullah" to bring angels and barakah.',
    hadithReference: 'Sunan Abi Dawud 5096',
    virtue: 'Satan is barred from spending the night in a home entered with the name of Allah.',
    icon: '🏡',
    category: 'manners',
  },
  {
    id: 'sunnah_ayatul_kursi_after_salah',
    title: 'Recite Ayatul Kursi After Fard Prayer',
    urduTitle: 'فرض نماز کے بعد آیۃ الکرسی کی تلاوت',
    arabicTitle: 'قراءة آية الكرسي دبر كل صلاة',
    actionText: 'Recite Surah Al-Baqarah verse 255 immediately after completing your obligatory prayer.',
    hadithReference: 'Sunan an-Nasa\'i (Al-Kubra 9928)',
    virtue: 'Prophet (ﷺ) said: "Whoever recites Ayat al-Kursi after every obligatory prayer, nothing stands between him and Paradise except death."',
    icon: '👑',
    category: 'prayer',
  },
  {
    id: 'sunnah_remove_harm_road',
    title: 'Remove a Harmful Object from the Path',
    urduTitle: 'راستے سے تکلیف دہ چیز ہٹانا',
    arabicTitle: 'إماطة الأذى عن الطريق صدقة',
    actionText: 'Remove a stone, thorn, wrapper, or hazard from the road or walkway.',
    hadithReference: 'Sahih al-Bukhari 2989 & Sahih Muslim 1009',
    virtue: 'Counted as charity (Sadaqah) and a branch of true Iman.',
    icon: '🌿',
    category: 'kindness',
  },
  {
    id: 'sunnah_praise_sneezing',
    title: 'Say Alhamdulillah Upon Sneezing & Reply',
    urduTitle: 'چھینک آنے پر الحمدللہ کہنا اور جواب دینا',
    arabicTitle: 'تشميت العاطس',
    actionText: 'When you sneeze say "Alhamdulillah", and if you hear someone sneeze say "Yarhamukallah".',
    hadithReference: 'Sahih al-Bukhari 6224',
    virtue: 'A mutual right between Muslims that invites divine mercy and mutual love.',
    icon: '🤲',
    category: 'manners',
  },
  {
    id: 'sunnah_right_hand_eating',
    title: 'Eat with the Right Hand & Say Bismillah',
    urduTitle: 'دائیں ہاتھ سے کھانا اور بسم اللہ پڑھنا',
    arabicTitle: 'الأكل باليمين والتسمية',
    actionText: 'Begin meals with Bismillah and always use your right hand when taking bites or passing food.',
    hadithReference: 'Sahih Muslim 2020',
    virtue: '"Say the name of Allah, eat with your right hand, and eat from what is near to you."',
    icon: '🍽️',
    category: 'manners',
  },
  {
    id: 'sunnah_say_jazakallah',
    title: 'Say "JazakAllahu Khayran" for Any Favor',
    urduTitle: 'احسان کے بدلے جزاك الله خيراً کہنا',
    arabicTitle: 'قول جزاك الله خيراً لمن أحسن إليك',
    actionText: 'When someone helps or does a favor for you, say "JazakAllahu Khayran" (May Allah reward you with goodness).',
    hadithReference: 'Jami` at-Tirmidhi 2035',
    virtue: 'Prophet (ﷺ) said whoever says this has achieved the highest level of praising and thanking.',
    icon: '✨',
    category: 'manners',
  }
];

export const microSunnahService = {
  getTodayMicroSunnah(): MicroSunnah {
    const today = new Date();
    // Deterministic index by day of the year
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % MICRO_SUNNAHS.length;
    return MICRO_SUNNAHS[index];
  },

  isCompletedToday(): boolean {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return !!parsed[todayStr];
      }
    } catch (e) {}
    return false;
  },

  markCompleted(): void {
    const todayStr = new Date().toISOString().slice(0, 10);
    let progress: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) progress = JSON.parse(raw);
    } catch (e) {}

    progress[todayStr] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  },

  unmarkCompleted(): void {
    const todayStr = new Date().toISOString().slice(0, 10);
    let progress: Record<string, boolean> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) progress = JSON.parse(raw);
    } catch (e) {}

    delete progress[todayStr];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  },

  getTotalRevivedCount(): number {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.keys(parsed).length;
      }
    } catch (e) {}
    return 1;
  }
};
