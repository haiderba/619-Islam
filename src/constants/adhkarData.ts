export interface AdhkarItem {
  id: string;
  category: 'Morning' | 'Evening' | 'PostPrayer';
  arabic: string;
  transliteration?: string;
  urdu: string;
  english: string;
  count: number; // e.g. 3 times
  source?: string;
}

export const ADHKAR_DATA: AdhkarItem[] = [
  // Morning Adhkar
  {
    id: 'm1',
    category: 'Morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    urdu: 'ہم نے اور تمام بادشاہی نے اللہ کے لیے صبح کی، اور تمام تعریفیں اللہ کے لیے ہیں۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں۔',
    english: 'We have entered upon the morning and the kingdom belongs to Allah. Praise is to Allah. None has the right to be worshipped except Allah alone, without partner.',
    count: 1,
  },
  {
    id: 'm2',
    category: 'Morning',
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur',
    urdu: 'اے اللہ! تیری ہی توفیق سے ہم نے صبح کی اور تیری ہی توفیق سے ہم نے شام کی، اور تیرے ہی حکم سے ہم جیتے ہیں اور مرتے ہیں اور تیری ہی طرف اٹھنا ہے۔',
    english: 'O Allah, by Your leave we have reached the morning and by Your leave we reach the evening, by Your leave we live and by Your leave we die, and unto You is our resurrection.',
    count: 1,
  },
  {
    id: 'm3',
    category: 'Morning',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    transliteration: 'Subhanallahi wa bihamdihi: Adada khalqihi, wa rida nafsihi, wa zinata arshihi, wa midada kalimatihi',
    urdu: 'اللہ پاک ہے اپنی تعریف کے ساتھ، اس کی مخلوق کی تعداد کے برابر، اس کی ذات کی رضا کے برابر، اس کے عرش کے وزن کے برابر اور اس کے کلمات کی روشنائی کے برابر۔',
    english: 'Glory is to Allah and praise is to Him, by the number of His creation, by His pleasure, by the weight of His Throne, and by the ink of His words.',
    count: 3,
  },

  // Evening Adhkar
  {
    id: 'e1',
    category: 'Evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ',
    transliteration: 'Amsayna wa amsal-mulku lillah wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah',
    urdu: 'ہم نے اور تمام بادشاہی نے اللہ کے لیے شام کی، اور تمام تعریفیں اللہ ہی کے لیے ہیں۔ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے اس کا کوئی شریک نہیں۔',
    english: 'We have reached the evening and the kingdom belongs to Allah. Praise is to Allah. None has the right to be worshipped except Allah alone, without partner.',
    count: 1,
  },
  {
    id: 'e2',
    category: 'Evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'udhu bikalimatil-lahit-tammati min sharri ma khalaq',
    urdu: 'میں اللہ کے مکمل کلمات کی پناہ مانگتا ہوں ہر اس چیز کے شر سے جو اس نے پیدا کی۔',
    english: 'I seek refuge in the Perfect Words of Allah from the evil of what He has created.',
    count: 3,
  },

  // Post-Prayer Adhkar
  {
    id: 'p1',
    category: 'PostPrayer',
    arabic: 'أَسْتَغْفِرُ اللَّهَ ، أَسْتَغْفِرُ اللَّهَ ، أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah, Astaghfirullah, Astaghfirullah',
    urdu: 'میں اللہ سے بخشش مانگتا ہوں، میں اللہ سے بخشش مانگتا ہوں، میں اللہ سے بخشش مانگتا ہوں۔',
    english: 'I ask Allah for forgiveness (3 times).',
    count: 3,
  },
  {
    id: 'p2',
    category: 'PostPrayer',
    arabic: 'اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
    transliteration: 'Allahumma antas-salamu wa minkas-salamu, tabarakta ya dhal-jalali wal-ikram',
    urdu: 'اے اللہ! تو ہی سلامتی والا ہے اور تیری ہی طرف سے سلامتی آتی ہے، تو بابرکت ہے اے عظمت اور عزت والے۔',
    english: 'O Allah, You are As-Salam and from You is all peace. Blessed are You, O Owner of majesty and honor.',
    count: 1,
  },
];
