export interface NameOfAllah {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningUr: string;
  explanation: string;
  category: 'mercy' | 'majesty' | 'forgiveness' | 'creator' | 'protection' | 'all';
  audioUrl: string;
}

export const ALLAH_NAMES: NameOfAllah[] = [
  {
    id: 1,
    arabic: "الرَّحْمَنُ",
    transliteration: "Ar-Rahman",
    meaningEn: "The Most Gracious",
    meaningUr: "نہایت مہربان",
    explanation: "The One who has plenty of mercy for the believers and the blasphemers in this world and exclusively for the believers in the hereafter.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/001_001_002.mp3"
  },
  {
    id: 2,
    arabic: "الرَّحِيمُ",
    transliteration: "Ar-Raheem",
    meaningEn: "The Most Merciful",
    meaningUr: "نہایت رحم والا",
    explanation: "The One who bestows particular and enduring mercy on the believers.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/001_001_003.mp3"
  },
  {
    id: 3,
    arabic: "الْمَلِكُ",
    transliteration: "Al-Malik",
    meaningEn: "The Sovereign King",
    meaningUr: "بادشاہ، حقیقی حاکم",
    explanation: "The absolute ruler with complete authority over all of creation.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_003.mp3"
  },
  {
    id: 4,
    arabic: "الْقُدُّوسُ",
    transliteration: "Al-Quddus",
    meaningEn: "The Most Holy",
    meaningUr: "نہایت پاک، ہر عیب سے پاک",
    explanation: "The One who is pure and free from any imperfection, error, or defect.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_004.mp3"
  },
  {
    id: 5,
    arabic: "السَّلَامُ",
    transliteration: "As-Salam",
    meaningEn: "The Source of Peace",
    meaningUr: "سلامتی والا، امن دینے والا",
    explanation: "The One who grants peace and security to His creation.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_005.mp3"
  },
  {
    id: 6,
    arabic: "الْمُؤْمِنُ",
    transliteration: "Al-Mu'min",
    meaningEn: "The Granter of Security",
    meaningUr: "امن و امان دینے والا",
    explanation: "The One who affirms the truth of His words and gives assurance of safety.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_006.mp3"
  },
  {
    id: 7,
    arabic: "الْمُهَيْمِنُ",
    transliteration: "Al-Muhaymin",
    meaningEn: "The Guardian & Overseer",
    meaningUr: "نگہبان، نگاہ رکھنے والا",
    explanation: "The One who observes, guards, and preserves all affairs.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_007.mp3"
  },
  {
    id: 8,
    arabic: "الْعَزِيزُ",
    transliteration: "Al-Aziz",
    meaningEn: "The All-Mighty",
    meaningUr: "زبردست، غلبے والا",
    explanation: "The Victorious, Invincible Sovereign who can never be overcome.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_008.mp3"
  },
  {
    id: 9,
    arabic: "الْجَبَّارُ",
    transliteration: "Al-Jabbar",
    meaningEn: "The Compeller & Restorer",
    meaningUr: "سب پر غالب، درست کرنے والا",
    explanation: "The One whose will prevails and who mends the brokenhearted.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_009.mp3"
  },
  {
    id: 10,
    arabic: "الْمُتَكَبِّرُ",
    transliteration: "Al-Mutakabbir",
    meaningEn: "The Supreme in Greatness",
    meaningUr: "بڑائی والا، کبریا والا",
    explanation: "The One who is clear from the attributes of the creatures and is exalted above all.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/059_023_010.mp3"
  },
  {
    id: 11,
    arabic: "الْخَالِقُ",
    transliteration: "Al-Khaliq",
    meaningEn: "The Creator",
    meaningUr: "پیدا کرنے والا",
    explanation: "The One who brings everything from non-existence into existence.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/059_024_002.mp3"
  },
  {
    id: 12,
    arabic: "الْبَارِئُ",
    transliteration: "Al-Bari'",
    meaningEn: "The Originator",
    meaningUr: "ٹھیک بنانے والا، عدم سے لانے والا",
    explanation: "The Maker who creates with no prior model or imperfection.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/059_024_003.mp3"
  },
  {
    id: 13,
    arabic: "الْمُصَوِّرُ",
    transliteration: "Al-Musawwir",
    meaningEn: "The Fashioner of Forms",
    meaningUr: "صورت گری کرنے والا",
    explanation: "The One who shapes each created thing with unique beauty and proportion.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/059_024_004.mp3"
  },
  {
    id: 14,
    arabic: "الْغَفَّارُ",
    transliteration: "Al-Ghaffar",
    meaningEn: "The Perpetual Forgiver",
    meaningUr: "بڑا بخشنے والا",
    explanation: "The One who repeatedly forgives the sins and covers the faults of His servants.",
    category: "forgiveness",
    audioUrl: "https://audio.qurancdn.com/wbw/020_082_004.mp3"
  },
  {
    id: 15,
    arabic: "الْقَهَّارُ",
    transliteration: "Al-Qahhar",
    meaningEn: "The Subduer",
    meaningUr: "سب پر غالب، قہر والا",
    explanation: "The One who dominates and holds power over all aspects of creation.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/012_039_010.mp3"
  },
  {
    id: 16,
    arabic: "الْوَهَّابُ",
    transliteration: "Al-Wahhab",
    meaningEn: "The Giver of All Gifts",
    meaningUr: "بغیر عوض عطا کرنے والا",
    explanation: "The One who gives generously without expecting any return.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/003_008_012.mp3"
  },
  {
    id: 17,
    arabic: "الرَّزَّاقُ",
    transliteration: "Ar-Razzaq",
    meaningEn: "The Provider",
    meaningUr: "روزی رساں، رزق دینے والا",
    explanation: "The Provider who creates and supplies all sustenance for body and soul.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/051_058_003.mp3"
  },
  {
    id: 18,
    arabic: "الْفَتَّاحُ",
    transliteration: "Al-Fattah",
    meaningEn: "The Opener of All Doors",
    meaningUr: "کھولنے والا، فیصلہ کرنے والا",
    explanation: "The One who opens the doors of mercy, victory, knowledge, and relief.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/034_026_007.mp3"
  },
  {
    id: 19,
    arabic: "الْعَلِيمُ",
    transliteration: "Al-Aleem",
    meaningEn: "The All-Knowing",
    meaningUr: "سب کچھ جاننے والا",
    explanation: "The One whose knowledge embraces everything in the universe, seen and unseen.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_029_014.mp3"
  },
  {
    id: 20,
    arabic: "الْقَابِضُ",
    transliteration: "Al-Qabid",
    meaningEn: "The Restrainer & Constrictor",
    meaningUr: "تنگ کرنے والا، قبض کرنے والا",
    explanation: "The One who withholds or restricts according to divine wisdom.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_245_012.mp3"
  },
  {
    id: 21,
    arabic: "الْبَاسِطُ",
    transliteration: "Al-Basit",
    meaningEn: "The Expander & Provider",
    meaningUr: "فراخ کرنے والا، کشادگی دینے والا",
    explanation: "The One who extends abundance, provision, and joy to Whom He wills.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/002_245_013.mp3"
  },
  {
    id: 22,
    arabic: "الْخَافِضُ",
    transliteration: "Al-Khafid",
    meaningEn: "The Abaser",
    meaningUr: "پست کرنے والا",
    explanation: "The One who lowers the arrogant and the oppressors.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/056_003_001.mp3"
  },
  {
    id: 23,
    arabic: "الرَّافِعُ",
    transliteration: "Ar-Rafi",
    meaningEn: "The Exalter",
    meaningUr: "بلند کرنے والا",
    explanation: "The One who raises the righteous in status, honor, and station.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/056_003_002.mp3"
  },
  {
    id: 24,
    arabic: "الْمُعِزُّ",
    transliteration: "Al-Mu'izz",
    meaningEn: "The Bestower of Honor",
    meaningUr: "عزت دینے والا",
    explanation: "The One who gives true dignity and strength to whom He pleases.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/003_026_013.mp3"
  },
  {
    id: 25,
    arabic: "الْمُذِلُّ",
    transliteration: "Al-Muthill",
    meaningEn: "The Humiliator",
    meaningUr: "ذلت دینے والا",
    explanation: "The One who degrades the oppressors and arrogant tyrants.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/003_026_015.mp3"
  },
  {
    id: 26,
    arabic: "السَّمِيعُ",
    transliteration: "As-Sami",
    meaningEn: "The All-Hearing",
    meaningUr: "سب کچھ سننے والا",
    explanation: "The One who hears every voice, whisper, and secret prayer.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/002_127_011.mp3"
  },
  {
    id: 27,
    arabic: "الْبَصِيرُ",
    transliteration: "Al-Baseer",
    meaningEn: "The All-Seeing",
    meaningUr: "سب کچھ دیکھنے والا",
    explanation: "The One who sees all things in complete detail, nothing is hidden from Him.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/042_011_015.mp3"
  },
  {
    id: 28,
    arabic: "الْحَكَمُ",
    transliteration: "Al-Hakam",
    meaningEn: "The Ultimate Judge",
    meaningUr: "حاکم، فیصلہ کرنے والا",
    explanation: "The supreme arbiter whose verdict is perfectly just and flawless.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/006_114_003.mp3"
  },
  {
    id: 29,
    arabic: "الْعَدْلُ",
    transliteration: "Al-Adl",
    meaningEn: "The Perfectly Just",
    meaningUr: "انصاف کرنے والا",
    explanation: "The One who is absolutely fair and free from any injustice.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/006_115_004.mp3"
  },
  {
    id: 30,
    arabic: "اللَّطِيفُ",
    transliteration: "Al-Lateef",
    meaningEn: "The Subtle & Gracious",
    meaningUr: "باریک بین، لطف و کرم والا",
    explanation: "The One who knows all subtle details and bestows blessings in unfathomable ways.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/006_103_006.mp3"
  },
  {
    id: 31,
    arabic: "الْخَبِيرُ",
    transliteration: "Al-Khabeer",
    meaningEn: "The All-Aware",
    meaningUr: "باخبر، ہر راز سے واقف",
    explanation: "The One who knows the inner reality and hidden truth of all matters.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/006_103_007.mp3"
  },
  {
    id: 32,
    arabic: "الْحَلِيمُ",
    transliteration: "Al-Haleem",
    meaningEn: "The Most Forbearing",
    meaningUr: "بردبار، حلم والا",
    explanation: "The One who does not quickly punish the sinners, giving them time to repent.",
    category: "forgiveness",
    audioUrl: "https://audio.qurancdn.com/wbw/002_225_014.mp3"
  },
  {
    id: 33,
    arabic: "الْعَظِيمُ",
    transliteration: "Al-Azeem",
    meaningEn: "The Magnificent",
    meaningUr: "عظمت والا، بزرگ",
    explanation: "The One possessing ultimate grandeur, dignity, and power.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_255_049.mp3"
  },
  {
    id: 34,
    arabic: "الْغَفُورُ",
    transliteration: "Al-Ghafoor",
    meaningEn: "The All-Forgiving",
    meaningUr: "نہایت بخشنے والا",
    explanation: "The One whose forgiveness covers the multitude of sins completely.",
    category: "forgiveness",
    audioUrl: "https://audio.qurancdn.com/wbw/002_173_020.mp3"
  },
  {
    id: 35,
    arabic: "الشَّكُورُ",
    transliteration: "Ash-Shakoor",
    meaningEn: "The Appreciative",
    meaningUr: "قدردان، جزاء دینے والا",
    explanation: "The One who rewards abundantly for the smallest of good deeds.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/035_030_008.mp3"
  },
  {
    id: 36,
    arabic: "الْعَلِيُّ",
    transliteration: "Al-Aliyy",
    meaningEn: "The Most High",
    meaningUr: "سب سے بلند مرتبہ",
    explanation: "The One who is exalted above all in His essence, attributes, and sovereignty.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_255_048.mp3"
  },
  {
    id: 37,
    arabic: "الْكَبِيرُ",
    transliteration: "Al-Kabeer",
    meaningEn: "The Most Great",
    meaningUr: "سب سے بڑا، کبریائی والا",
    explanation: "The One whose majesty and greatness is boundless.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/022_062_014.mp3"
  },
  {
    id: 38,
    arabic: "الْحَفِيظُ",
    transliteration: "Al-Hafeez",
    meaningEn: "The Preserver & Protector",
    meaningUr: "حفاظت کرنے والا، نگہبان",
    explanation: "The One who protects and safeguards the heavens, the earth, and His servants.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/011_057_016.mp3"
  },
  {
    id: 39,
    arabic: "الْمُقِيتُ",
    transliteration: "Al-Muqeet",
    meaningEn: "The Nourisher",
    meaningUr: "توانائی اور روزی پہنچانے والا",
    explanation: "The One who provides nourishment and sustenance to all creations.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/004_085_016.mp3"
  },
  {
    id: 40,
    arabic: "الْحَسِيبُ",
    transliteration: "Al-Haseeb",
    meaningEn: "The Reckoner & Sufficient",
    meaningUr: "کفایت کرنے والا، حساب لینے والا",
    explanation: "The One who is sufficient for His servants and takes accurate account of all deeds.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/004_006_022.mp3"
  },
  {
    id: 41,
    arabic: "الْجَلِيلُ",
    transliteration: "Al-Jaleel",
    meaningEn: "The Sublime & Majestic",
    meaningUr: "عظمت اور جلال والا",
    explanation: "The One attributed with greatness of power and glory.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/055_027_004.mp3"
  },
  {
    id: 42,
    arabic: "الْكَرِيمُ",
    transliteration: "Al-Kareem",
    meaningEn: "The Most Generous",
    meaningUr: "نہایت سخی، کرم کرنے والا",
    explanation: "The One who bestows bounties endlessly without being asked.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/027_040_032.mp3"
  },
  {
    id: 43,
    arabic: "الرَّقِيبُ",
    transliteration: "Ar-Raqeeb",
    meaningEn: "The Watchful",
    meaningUr: "نگہبان، نگران",
    explanation: "The One who observes every single thought, action, and movement.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/004_001_024.mp3"
  },
  {
    id: 44,
    arabic: "الْمُجِيبُ",
    transliteration: "Al-Mujeeb",
    meaningEn: "The Responsive",
    meaningUr: "دعائیں قبول کرنے والا",
    explanation: "The One who answers the prayers and supplications of those who call upon Him.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/011_061_019.mp3"
  },
  {
    id: 45,
    arabic: "الْوَاسِعُ",
    transliteration: "Al-Wasi",
    meaningEn: "The All-Encompassing",
    meaningUr: "وسعت والا، لامحدود",
    explanation: "The One whose capacity, mercy, and knowledge know no boundaries.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/002_115_010.mp3"
  },
  {
    id: 46,
    arabic: "الْحَكِيمُ",
    transliteration: "Al-Hakeem",
    meaningEn: "The All-Wise",
    meaningUr: "حکمت والا، دانا",
    explanation: "The One who executes all things with supreme wisdom and purpose.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_032_012.mp3"
  },
  {
    id: 47,
    arabic: "الْوَدُودُ",
    transliteration: "Al-Wadood",
    meaningEn: "The Loving One",
    meaningUr: "محبت کرنے والا",
    explanation: "The One who loves His righteous servants and is the source of pure love.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/011_090_007.mp3"
  },
  {
    id: 48,
    arabic: "الْمَجِيدُ",
    transliteration: "Al-Majeed",
    meaningEn: "The All-Glorious",
    meaningUr: "بزرگی والا، شاندار",
    explanation: "The One who is full of glory, honor, and majesty.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/011_073_014.mp3"
  },
  {
    id: 49,
    arabic: "الْبَاعِثُ",
    transliteration: "Al-Ba'ith",
    meaningEn: "The Resurrector",
    meaningUr: "مردوں کو زندہ کرنے والا",
    explanation: "The One who will resurrect all creatures from their graves on the Day of Judgement.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/022_007_010.mp3"
  },
  {
    id: 50,
    arabic: "الشَّهِيدُ",
    transliteration: "Ash-Shaheed",
    meaningEn: "The All-Witnessing",
    meaningUr: "حاضر و ناظر، گواہ",
    explanation: "The One who witnesses all events at all times with perfect clarity.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/004_033_018.mp3"
  },
  {
    id: 51,
    arabic: "الْحَقُّ",
    transliteration: "Al-Haqq",
    meaningEn: "The Absolute Truth",
    meaningUr: "برحق، سچائی والا",
    explanation: "The One whose existence and word is the ultimate unchanging truth.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/022_062_005.mp3"
  },
  {
    id: 52,
    arabic: "الْوَكِيلُ",
    transliteration: "Al-Wakeel",
    meaningEn: "The Trustworthy Trustee",
    meaningUr: "کارساز، نگہبان",
    explanation: "The One upon whom all trust is rightfully placed to manage all affairs.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/003_173_013.mp3"
  },
  {
    id: 53,
    arabic: "الْقَوِيُّ",
    transliteration: "Al-Qawiyy",
    meaningEn: "The All-Strong",
    meaningUr: "طاقتور، قوت والا",
    explanation: "The One with inexhaustible, infinite strength and ability.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/022_040_029.mp3"
  },
  {
    id: 54,
    arabic: "الْمَتِينُ",
    transliteration: "Al-Mateen",
    meaningEn: "The Steadfast & Firm",
    meaningUr: "مضبوط، اٹل",
    explanation: "The One whose power never wavers, tires, or diminishes.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/051_058_005.mp3"
  },
  {
    id: 55,
    arabic: "الْوَلِيُّ",
    transliteration: "Al-Waliyy",
    meaningEn: "The Protecting Friend",
    meaningUr: "مددگار، حامی و ناصر",
    explanation: "The caring friend, ally, and supporter of the righteous.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/004_045_007.mp3"
  },
  {
    id: 56,
    arabic: "الْحَمِيدُ",
    transliteration: "Al-Hameed",
    meaningEn: "The All-Praiseworthy",
    meaningUr: "تعریف کے لائق",
    explanation: "The One deserving of all praise, gratitude, and adoration.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/014_001_014.mp3"
  },
  {
    id: 57,
    arabic: "الْمُحْصِي",
    transliteration: "Al-Muhsi",
    meaningEn: "The Appraiser & Counter",
    meaningUr: "شمار کرنے والا",
    explanation: "The One who knows the count and extent of everything in existence.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/072_028_010.mp3"
  },
  {
    id: 58,
    arabic: "الْمُبْدِئُ",
    transliteration: "Al-Mubdi",
    meaningEn: "The Originator",
    meaningUr: "پہلی بار پیدا کرنے والا",
    explanation: "The One who initiates creation out of nothingness.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/085_013_003.mp3"
  },
  {
    id: 59,
    arabic: "الْمُعِيدُ",
    transliteration: "Al-Mueed",
    meaningEn: "The Restorer",
    meaningUr: "دوبارہ پیدا کرنے والا",
    explanation: "The One who brings back creation after its death and dissolution.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/085_013_004.mp3"
  },
  {
    id: 60,
    arabic: "الْمُحْيِي",
    transliteration: "Al-Muhyi",
    meaningEn: "The Giver of Life",
    meaningUr: "زندگی بخشنے والا",
    explanation: "The One who bestows life upon souls and bodies.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/041_039_015.mp3"
  },
  {
    id: 61,
    arabic: "الْمُمِيتُ",
    transliteration: "Al-Mumeet",
    meaningEn: "The Creator of Death",
    meaningUr: "موت دینے والا",
    explanation: "The One who decrees the moment of death for all living beings.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/040_068_003.mp3"
  },
  {
    id: 62,
    arabic: "الْحَيُّ",
    transliteration: "Al-Hayy",
    meaningEn: "The Ever-Living",
    meaningUr: "ہمیشہ زندہ رہنے والا",
    explanation: "The One who possesses eternal, self-sustaining, endless life.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_255_004.mp3"
  },
  {
    id: 63,
    arabic: "الْقَيُّومُ",
    transliteration: "Al-Qayyum",
    meaningEn: "The Self-Sustaining",
    meaningUr: "سب کو قائم رکھنے والا",
    explanation: "The One who maintains, protects, and sustains all of the universe.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_255_005.mp3"
  },
  {
    id: 64,
    arabic: "الْوَاجِدُ",
    transliteration: "Al-Wajid",
    meaningEn: "The Perceiver & Finder",
    meaningUr: "حاصل کرنے والا، پانے والا",
    explanation: "The One who possesses everything and lacks nothing.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/093_007_001.mp3"
  },
  {
    id: 65,
    arabic: "الْمَاجِدُ",
    transliteration: "Al-Majid",
    meaningEn: "The Noble & Generous",
    meaningUr: "بزرگی والا، سخی",
    explanation: "The One who is noble in deeds and magnanimous in giving.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/085_015_002.mp3"
  },
  {
    id: 66,
    arabic: "الْوَاحِدُ",
    transliteration: "Al-Wahid",
    meaningEn: "The Unique One",
    meaningUr: "ایک، یکتا",
    explanation: "The One who is singular without any partner or equal.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_163_003.mp3"
  },
  {
    id: 67,
    arabic: "الْأَحَدُ",
    transliteration: "Al-Ahad",
    meaningEn: "The Indivisible One",
    meaningUr: "اکیلا، بے نظیر",
    explanation: "The Absolute One who has no parts, components, or equal.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/112_001_004.mp3"
  },
  {
    id: 68,
    arabic: "الصَّمَدُ",
    transliteration: "As-Samad",
    meaningEn: "The Eternal & Self-Sufficient",
    meaningUr: "بے نیاز، سب کا سہارا",
    explanation: "The One whom all creation depends upon, while He depends on none.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/112_002_002.mp3"
  },
  {
    id: 69,
    arabic: "الْقَادِرُ",
    transliteration: "Al-Qadir",
    meaningEn: "The Omnipotent",
    meaningUr: "قدرت والا، بااختیار",
    explanation: "The One who has absolute ability to do anything He wills.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/006_065_003.mp3"
  },
  {
    id: 70,
    arabic: "الْمُقْتَدِرُ",
    transliteration: "Al-Muqtadir",
    meaningEn: "The All-Determining",
    meaningUr: "مکمل قدرت والا",
    explanation: "The One who creates power in things and governs their destiny.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/054_042_007.mp3"
  },
  {
    id: 71,
    arabic: "الْمُقَدِّمُ",
    transliteration: "Al-Muqaddim",
    meaningEn: "The Expediter",
    meaningUr: "آگے کرنے والا",
    explanation: "The One who brings forward what He wills in time and status.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/050_028_006.mp3"
  },
  {
    id: 72,
    arabic: "الْمُؤَخِّرُ",
    transliteration: "Al-Mu'akhkhir",
    meaningEn: "The Delayer",
    meaningUr: "پیچھے کرنے والا",
    explanation: "The One who puts back or delays what He wills in His wisdom.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/071_004_007.mp3"
  },
  {
    id: 73,
    arabic: "الْأَوَّلُ",
    transliteration: "Al-Awwal",
    meaningEn: "The Very First",
    meaningUr: "سب سے پہلا، ازلی",
    explanation: "The One who existed before all creation without beginning.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/057_003_002.mp3"
  },
  {
    id: 74,
    arabic: "الْآخِرُ",
    transliteration: "Al-Akhir",
    meaningEn: "The Very Last",
    meaningUr: "سب کے بعد رہنے والا، ابدی",
    explanation: "The One who remains after all creation perishes without end.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/057_003_003.mp3"
  },
  {
    id: 75,
    arabic: "الظَّاهِرُ",
    transliteration: "Az-Zahir",
    meaningEn: "The Manifest",
    meaningUr: "ظاہر، واضح نشانات والا",
    explanation: "The One whose signs, power, and glory are manifest throughout creation.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/057_003_004.mp3"
  },
  {
    id: 76,
    arabic: "الْبَاطِنُ",
    transliteration: "Al-Batin",
    meaningEn: "The Hidden",
    meaningUr: "پوشیدہ، نگاہوں سے مخفی",
    explanation: "The One whose essence cannot be seen or comprehended by human eyes.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/057_003_005.mp3"
  },
  {
    id: 77,
    arabic: "الْوَالِي",
    transliteration: "Al-Wali",
    meaningEn: "The Sole Governor",
    meaningUr: "حکمران، کارساز",
    explanation: "The One who manages, plans, and governs the universe and all within it.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/013_011_020.mp3"
  },
  {
    id: 78,
    arabic: "الْمُتَعَالِي",
    transliteration: "Al-Muta'ali",
    meaningEn: "The Supreme Exalted",
    meaningUr: "بہت بلند، عالی شان",
    explanation: "The One exalted far above any attributes of the creation.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/013_009_006.mp3"
  },
  {
    id: 79,
    arabic: "الْبَرُّ",
    transliteration: "Al-Barr",
    meaningEn: "The Source of All Goodness",
    meaningUr: "احسان کرنے والا، بھلائی والا",
    explanation: "The One who is kind, beneficent, and good to His creation.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/052_028_007.mp3"
  },
  {
    id: 80,
    arabic: "التَّوَّابُ",
    transliteration: "At-Tawwab",
    meaningEn: "The Ever-Pardoning",
    meaningUr: "توبہ قبول کرنے والا",
    explanation: "The One who continuously invites His servants to repentance and accepts it.",
    category: "forgiveness",
    audioUrl: "https://audio.qurancdn.com/wbw/002_037_009.mp3"
  },
  {
    id: 81,
    arabic: "الْمُنْتَقِمُ",
    transliteration: "Al-Muntaqim",
    meaningEn: "The Avenger of Justice",
    meaningUr: "بدلہ لینے والا، انصاف قائم کرنے والا",
    explanation: "The One who brings retribution upon obstinate oppressors and tyrants.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/032_022_010.mp3"
  },
  {
    id: 82,
    arabic: "العَفُوُّ",
    transliteration: "Al-Afuww",
    meaningEn: "The Pardoner & Eraser of Sins",
    meaningUr: "معاف کرنے والا، گناہ مٹانے والا",
    explanation: "The One who wipes away sins as though they never occurred.",
    category: "forgiveness",
    audioUrl: "https://audio.qurancdn.com/wbw/004_043_036.mp3"
  },
  {
    id: 83,
    arabic: "الرَّؤُوفُ",
    transliteration: "Ar-Ra'oof",
    meaningEn: "The Most Compassionate",
    meaningUr: "نہایت شفیق، نرمی کرنے والا",
    explanation: "The One filled with tender affection and profound kindness.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/002_143_031.mp3"
  },
  {
    id: 84,
    arabic: "مَالِكُ الْمُلْكِ",
    transliteration: "Malik-ul-Mulk",
    meaningEn: "Owner of Absolute Sovereignty",
    meaningUr: "سلطنت کا مالک",
    explanation: "The supreme possessor and ruler over all dominion and kingdom.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/003_026_003.mp3"
  },
  {
    id: 85,
    arabic: "ذُو الْجَلَالِ وَالْإِكْرَامِ",
    transliteration: "Thul-Jalali wal-Ikram",
    meaningEn: "Lord of Majesty & Generosity",
    meaningUr: "جلال اور انعام و اکرام والا",
    explanation: "The Lord of infinite majesty, honor, dignity, and beneficence.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/055_078_004.mp3"
  },
  {
    id: 86,
    arabic: "الْمُقْسِطُ",
    transliteration: "Al-Muqsit",
    meaningEn: "The Equitable",
    meaningUr: "عدل و انصاف کرنے والا",
    explanation: "The One who dispenses justice with total impartiality.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/003_018_007.mp3"
  },
  {
    id: 87,
    arabic: "الْجَامِعُ",
    transliteration: "Al-Jami",
    meaningEn: "The Gatherer",
    meaningUr: "جمع کرنے والا",
    explanation: "The One who gathers all creation on the Day of Resurrection.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/003_009_004.mp3"
  },
  {
    id: 88,
    arabic: "الْغَنِيُّ",
    transliteration: "Al-Ghaniyy",
    meaningEn: "The Self-Sufficient",
    meaningUr: "بے نیاز، غنی",
    explanation: "The One who needs nothing and no one, while all need Him.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/002_263_008.mp3"
  },
  {
    id: 89,
    arabic: "الْمُغْنِي",
    transliteration: "Al-Mughni",
    meaningEn: "The Enricher",
    meaningUr: "بے نیاز کرنے والا، دولت مند بنانے والا",
    explanation: "The One who satisfies needs and enriches whom He pleases.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/053_048_003.mp3"
  },
  {
    id: 90,
    arabic: "الْمَانِعُ",
    transliteration: "Al-Mani",
    meaningEn: "The Withholder & Defender",
    meaningUr: "روکنے والا، حفاظت کرنے والا",
    explanation: "The One who prevents harm and protects His creation.",
    category: "protection",
    audioUrl: "https://audio.qurancdn.com/wbw/067_021_006.mp3"
  },
  {
    id: 91,
    arabic: "الضَّارُّ",
    transliteration: "Ad-Darr",
    meaningEn: "The Distresser",
    meaningUr: "نقصان پہنچانے والا (حکمت سے)",
    explanation: "The One who decrees hardship and trials to purify souls.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/006_017_004.mp3"
  },
  {
    id: 92,
    arabic: "النَّافِعُ",
    transliteration: "An-Nafi",
    meaningEn: "The Creator of Good & Benefit",
    meaningUr: "نفع پہنچانے والا",
    explanation: "The One who creates all sources of benefit, wellness, and virtue.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/010_106_007.mp3"
  },
  {
    id: 93,
    arabic: "النُّورُ",
    transliteration: "An-Noor",
    meaningEn: "The Illuminating Light",
    meaningUr: "روشن کرنے والا، نور",
    explanation: "The Light of the heavens and earth who guides hearts to truth.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/024_035_002.mp3"
  },
  {
    id: 94,
    arabic: "الْهَادِي",
    transliteration: "Al-Hadi",
    meaningEn: "The Guide",
    meaningUr: "ہدایت دینے والا",
    explanation: "The One who leads souls onto the straight path of salvation.",
    category: "mercy",
    audioUrl: "https://audio.qurancdn.com/wbw/022_054_016.mp3"
  },
  {
    id: 95,
    arabic: "الْبَدِيعُ",
    transliteration: "Al-Badee",
    meaningEn: "The Incomparable Originator",
    meaningUr: "انوکھی تخلیق کرنے والا",
    explanation: "The One who created the universe in unprecedented, matchless beauty.",
    category: "creator",
    audioUrl: "https://audio.qurancdn.com/wbw/002_117_001.mp3"
  },
  {
    id: 96,
    arabic: "الْبَاقِي",
    transliteration: "Al-Baqi",
    meaningEn: "The Everlasting",
    meaningUr: "ہمیشہ باقی رہنے والا",
    explanation: "The One whose existence is permanent, without end or decay.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/055_027_002.mp3"
  },
  {
    id: 97,
    arabic: "الْوَارِثُ",
    transliteration: "Al-Warith",
    meaningEn: "The Supreme Inheritor",
    meaningUr: "سب کا وارث",
    explanation: "The One who inherits the heavens and the earth when all else perishes.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/015_023_007.mp3"
  },
  {
    id: 98,
    arabic: "الرَّشِيدُ",
    transliteration: "Ar-Rasheed",
    meaningEn: "The Righteous Guide",
    meaningUr: "صحیح راہ دکھانے والا",
    explanation: "The One who directs all affairs with perfect wisdom and righteousness.",
    category: "majesty",
    audioUrl: "https://audio.qurancdn.com/wbw/018_017_028.mp3"
  },
  {
    id: 99,
    arabic: "الصَّبُورُ",
    transliteration: "As-Saboor",
    meaningEn: "The Most Patient",
    meaningUr: "صبر کرنے والا",
    explanation: "The One who does not rush to punish the defiant, enduring with infinite patience.",
    category: "forgiveness",
    audioUrl: "https://audio.qurancdn.com/wbw/008_046_010.mp3"
  }
];
