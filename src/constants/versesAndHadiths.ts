export interface QuranQuote {
  id: number;
  arabic: string;
  urdu: string;
  english: string;
  surah: string;
}

export const QURAN_QUOTES: QuranQuote[] = [
  {
    id: 1,
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    urdu: 'پس یقیناً تنگی کے ساتھ آسانی ہے، بے شک تنگی کے ساتھ آسانی ہے۔',
    english: 'For indeed, with hardship will come ease. Indeed, with hardship will come ease.',
    surah: 'Surah Ash-Sharh (94:5-6)',
  },
  {
    id: 2,
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    urdu: 'پس تم مجھے یاد کرو، میں تمہیں یاد رکھوں گا اور میرا شکر ادا کرو اور ناشکری نہ کرو۔',
    english: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    surah: 'Surah Al-Baqarah (2:152)',
  },
  {
    id: 3,
    arabic: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',
    urdu: 'اور اس نے آپ کو تلاشِ حق میں پایا تو سیدھی راہ دکھائی۔',
    english: 'And He found you lost and guided you.',
    surah: 'Surah Ad-Duha (93:7)',
  },
  {
    id: 4,
    arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    urdu: 'اگر تم شکر ادا کرو گے تو میں تمہیں اور زیادہ نعمتوں سے نوازوں گا۔',
    english: 'If you are grateful, I will surely increase you in favor.',
    surah: 'Surah Ibrahim (14:7)',
  },
  {
    id: 5,
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    urdu: 'اللہ کسی جان پر اس کی طاقت سے زیادہ بوجھ نہیں ڈالتا۔',
    english: 'Allah does not burden a soul beyond that it can bear.',
    surah: 'Surah Al-Baqarah (2:286)',
  },
  {
    id: 6,
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    urdu: 'خبردار! اللہ کے ذکر ہی سے دلوں کو اطمینان و سکون حاصل ہوتا ہے۔',
    english: 'Unquestionably, by the remembrance of Allah do hearts find rest.',
    surah: 'Surah Ar-Ra’d (13:28)',
  },
  {
    id: 7,
    arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    urdu: 'اور تم ہمت نہ ہارو اور نہ غمگین ہو، تم ہی غالب رہو گے اگر تم مومن ہو۔',
    english: 'Do not falter and do not grieve, for you will be supreme if you are true believers.',
    surah: 'Surah Al-Imran (3:139)',
  },
  {
    id: 8,
    arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    urdu: 'اور وہ تمہارے ساتھ ہے تم جہاں کہیں بھی ہو۔',
    english: 'And He is with you wherever you are.',
    surah: 'Surah Al-Hadid (57:4)',
  },
];

export function getDailyQuranQuote(): QuranQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = dayOfYear % QURAN_QUOTES.length;
  return QURAN_QUOTES[index];
}
