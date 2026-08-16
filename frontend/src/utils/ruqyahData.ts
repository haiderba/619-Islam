export interface RuqyahAudioTrack {
  id: string;
  reciter: string;
  duration: string;
  audioUrl: string;
}

export interface RuqyahVerse {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
  urdu: string;
  repetitionCount: number;
  benefit: string;
}

export const RUQYAH_AUDIO_TRACKS: RuqyahAudioTrack[] = [
  {
    id: 'alafasy',
    reciter: 'Mishary Rashid Alafasy',
    duration: '45 mins (Full Comprehensive)',
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3' // Live Quran audio CDN
  },
  {
    id: 'sudais',
    reciter: 'Abdur-Rahman as-Sudais',
    duration: '35 mins (Protection & Healing)',
    audioUrl: 'https://server11.mp3quran.net/sds/001.mp3'
  },
  {
    id: 'ghamdi',
    reciter: 'Saad Al-Ghamdi',
    duration: '40 mins (Ruqyah Shariah)',
    audioUrl: 'https://server7.mp3quran.net/s_gmd/001.mp3'
  }
];

export const RUQYAH_VERSES: RuqyahVerse[] = [
  {
    id: 1,
    title: "Surah Al-Fātiḥah (The Cure / Ash-Shifā)",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَالِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    transliteration: "Bismillāhir-Raḥmānir-Raḥīm. Al-ḥamdu lillāhi Rabbil-ʿālamīn...",
    english: "In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds...",
    urdu: "اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔ سب تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا رب ہے۔",
    repetitionCount: 7,
    benefit: "The Prophet ﷺ referred to it as 'Ash-Shifa' (The Ultimate Cure) for spiritual and physical illness."
  },
  {
    id: 2,
    title: "Āyat al-Kursī (The Greatest Verse of Protection)",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm...",
    english: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence...",
    urdu: "اللہ، اس کے سوا کوئی معبود نہیں، وہ زندہ ہے سب کا تھامنے والا ہے۔",
    repetitionCount: 3,
    benefit: "A guardian angel protects the reciter from all harms and evil until morning."
  },
  {
    id: 3,
    title: "Al-Mu'awwidhatayn (Surah Al-Falaq & Surah An-Nas)",
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    transliteration: "Qul aʿūdhu bi Rabbil-falaq... Qul aʿūdhu bi Rabbin-nās...",
    english: "Say, 'I seek refuge in the Lord of daybreak...' Say, 'I seek refuge in the Lord of mankind...'",
    urdu: "کہہ دیجئے: میں صبح کے رب کی پناہ مانگتا ہوں... کہہ دیجئے: میں انسانوں کے رب کی پناہ مانگتا ہوں۔",
    repetitionCount: 3,
    benefit: "Supreme protection against the evil eye (Hasad), black magic, and whisperings of Shaytan."
  },
  {
    id: 4,
    title: "Prophetic Dua for Pain & Illness",
    arabic: "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لاَ شِفَاءَ إِلاَّ شِفَاؤُكَ، شِفَاءً لاَ يُغَادِرُ سَقَمًا",
    transliteration: "Allāhumma Rabban-nās, adh-hibil-ba's, ishfi Antash-Shāfī, lā shifā'a illā shifā'uk, shifā'an lā yughādiru saqamā.",
    english: "O Allah, Lord of mankind, remove the hardship and grant healing; You are the Healer, there is no cure except Your cure, a cure that leaves no illness behind.",
    urdu: "اے اللہ، لوگوں کے رب! تکلیف کو دور فرما، شفا عطا فرما، تو ہی شفا دینے والا ہے، تیری شفا کے سوا کوئی شفا نہیں، ایسی شفا جو کوئی بیماری نہ چھوڑے۔",
    repetitionCount: 3,
    benefit: "Sunnah supplication recited by the Prophet ﷺ when visiting the sick or experiencing physical ailment."
  }
];
