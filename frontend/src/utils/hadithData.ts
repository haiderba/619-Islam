export interface HadithItem {
  id: number;
  collection: string; // 'Bukhari' | 'Muslim' | 'Tirmidhi' | 'Abu Dawud' | 'Nawawi'
  bookNumber: number;
  hadithNumber: number;
  narrator: string;
  arabic: string;
  english: string;
  urdu: string;
  chapter: string;
  grade: 'Sahih' | 'Hasan' | 'Muttafaqun Alayh';
  topic: 'character' | 'prayer' | 'mercy' | 'repentance' | 'charity' | 'knowledge' | 'fasting';
}

export const HADITH_COLLECTIONS = [
  { id: 'all', name: 'All Collections', count: 20 },
  { id: 'Bukhari', name: 'Ṣaḥīḥ al-Bukhārī', count: 6 },
  { id: 'Muslim', name: 'Ṣaḥīḥ Muslim', count: 5 },
  { id: 'Nawawi', name: '40 Ḥadīth Nawawī', count: 4 },
  { id: 'Tirmidhi', name: 'Jāmiʿ at-Tirmidhī', count: 3 },
  { id: 'Abu Dawud', name: 'Sunan Abī Dāwūd', count: 2 },
];

export const HADITH_TOPICS = [
  { id: 'all', label: 'All Topics' },
  { id: 'character', label: '🌿 Good Character' },
  { id: 'mercy', label: '🤲 Mercy & Compassion' },
  { id: 'repentance', label: '🤍 Repentance & Hope' },
  { id: 'prayer', label: '🕌 Namaz & Worship' },
  { id: 'charity', label: '💰 Charity & Giving' },
  { id: 'knowledge', label: '📖 Seeking Knowledge' },
  { id: 'fasting', label: '🌙 Fasting & Ramadan' },
];

export const HADITH_DATABASE: HadithItem[] = [
  {
    id: 1,
    collection: "Bukhari",
    bookNumber: 1,
    hadithNumber: 1,
    narrator: "Umar ibn al-Khattab (RA)",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english: "Actions are but by intentions, and every person will have only what they intended.",
    urdu: "اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی۔",
    chapter: "Revelation & Intentions",
    grade: "Muttafaqun Alayh",
    topic: "character"
  },
  {
    id: 2,
    collection: "Bukhari",
    bookNumber: 2,
    hadithNumber: 13,
    narrator: "Anas ibn Malik (RA)",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    urdu: "تم میں سے کوئی اس وقت تک کامل مومن نہیں ہو سکتا جب تک وہ اپنے بھائی کے لیے وہی پسند نہ کرے جو اپنے لیے پسند کرتا ہے۔",
    chapter: "Book of Belief (Iman)",
    grade: "Sahih",
    topic: "character"
  },
  {
    id: 3,
    collection: "Muslim",
    bookNumber: 45,
    hadithNumber: 2586,
    narrator: "Abu Hurairah (RA)",
    arabic: "إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
    english: "Verily, Allah does not look at your appearances or your wealth, but rather He looks at your hearts and your deeds.",
    urdu: "اللہ تعالیٰ تمہاری صورتوں اور تمہارے مالوں کو نہیں دیکھتا، بلکہ وہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔",
    chapter: "Virtues and Good Manners",
    grade: "Sahih",
    topic: "character"
  },
  {
    id: 4,
    collection: "Tirmidhi",
    bookNumber: 27,
    hadithNumber: 1924,
    narrator: "Abdullah ibn Amr (RA)",
    arabic: "الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ",
    english: "Those who show mercy will be shown mercy by the Most Merciful. Show mercy to those on earth, and He who is in the heavens will show mercy to you.",
    urdu: "رحم کرنے والوں پر رحمان رحم فرماتا ہے۔ تم زمین والوں پر رحم کرو، آسمان والا تم پر رحم فرمائے گا۔",
    chapter: "Righteousness and Relations",
    grade: "Hasan",
    topic: "mercy"
  },
  {
    id: 5,
    collection: "Muslim",
    bookNumber: 48,
    hadithNumber: 2699,
    narrator: "Abu Hurairah (RA)",
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
    english: "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.",
    urdu: "جو شخص علم کی تلاش میں کسی راستے پر چلتا ہے، اللہ تعالیٰ اس کے بدلے اس کے لیے جنت کا راستہ آسان فرما دیتا ہے۔",
    chapter: "Remembrance, Supplication and Knowledge",
    grade: "Sahih",
    topic: "knowledge"
  },
  {
    id: 6,
    collection: "Bukhari",
    bookNumber: 24,
    hadithNumber: 1410,
    narrator: "Adi ibn Hatim (RA)",
    arabic: "اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    english: "Protect yourselves from the Hellfire, even with half a date given in charity.",
    urdu: "جہنم کی آگ سے بچو، خواہ کھجور کا ایک ٹکڑا صدقہ کر کے ہی کیوں نہ ہو۔",
    chapter: "Book of Zakat & Charity",
    grade: "Sahih",
    topic: "charity"
  },
  {
    id: 7,
    collection: "Nawawi",
    bookNumber: 1,
    hadithNumber: 18,
    narrator: "Abu Dharr & Mu'adh ibn Jabal (RA)",
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ",
    english: "Fear Allah wherever you are, follow up a bad deed with a good deed and it will wipe it out, and behave with good character towards the people.",
    urdu: "جہاں کہیں بھی ہو اللہ سے ڈرو، اور برائی کے بعد نیکی کرو وہ اسے مٹا دے گی، اور لوگوں کے ساتھ اچھے اخلاق سے پیش آؤ۔",
    chapter: "Forty Hadith of An-Nawawi",
    grade: "Hasan",
    topic: "character"
  },
  {
    id: 8,
    collection: "Muslim",
    bookNumber: 4,
    hadithNumber: 429,
    narrator: "Abu Hurairah (RA)",
    arabic: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ",
    english: "The closest a servant is to his Lord is when he is in prostration (Sujud), so increase your supplications.",
    urdu: "بندہ اپنے رب کے سب سے زیادہ قریب سجدے کی حالت میں ہوتا ہے، پس سجدے میں کثرت سے دعا کیا کرو۔",
    chapter: "Book of Prayer (Salat)",
    grade: "Sahih",
    topic: "prayer"
  },
  {
    id: 9,
    collection: "Tirmidhi",
    bookNumber: 37,
    hadithNumber: 2499,
    narrator: "Anas ibn Malik (RA)",
    arabic: "كُلُّ ابْنِ آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ",
    english: "Every son of Adam commits sins, and the best of those who sin are those who constantly repent.",
    urdu: "ہر انسان خطا کار ہے، اور بہترین خطا کار وہ ہیں جو کثرت سے توبہ کرتے ہیں۔",
    chapter: "Description of the Day of Judgment",
    grade: "Hasan",
    topic: "repentance"
  },
  {
    id: 10,
    collection: "Bukhari",
    bookNumber: 73,
    hadithNumber: 6011,
    narrator: "Abu Hurairah (RA)",
    arabic: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    english: "A good, kind word is a charity.",
    urdu: "اچھی اور پاکیزہ بات کہنا بھی صدقہ ہے۔",
    chapter: "Book of Good Manners (Adab)",
    grade: "Sahih",
    topic: "charity"
  },
  {
    id: 11,
    collection: "Muslim",
    bookNumber: 13,
    hadithNumber: 1151,
    narrator: "Abu Hurairah (RA)",
    arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    english: "Whoever fasts Ramadan out of faith and hope for reward, all their past sins will be forgiven.",
    urdu: "جس نے ایمان اور ثواب کی نیت سے رمضان کے روزے رکھے، اس کے پچھلے تمام گناہ معاف کر دیے جاتے ہیں۔",
    chapter: "Book of Fasting (Sawm)",
    grade: "Muttafaqun Alayh",
    topic: "fasting"
  },
  {
    id: 12,
    collection: "Abu Dawud",
    bookNumber: 41,
    hadithNumber: 4799,
    narrator: "Abu Hurairah (RA)",
    arabic: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    english: "The strong person is not the one who overcomes people in wrestling; rather, the strong person is the one who controls himself when angry.",
    urdu: "طاقتور وہ نہیں جو لوگوں کو پچھاڑ دے، بلکہ طاقتور وہ ہے جو غصے کے وقت اپنے نفس پر قابو رکھے۔",
    chapter: "General Behavior (Adab)",
    grade: "Sahih",
    topic: "character"
  },
  {
    id: 13,
    collection: "Bukhari",
    bookNumber: 64,
    hadithNumber: 4418,
    narrator: "Ibn Mas'ud (RA)",
    arabic: "عَلَيْكُمْ بِالصِّدْقِ، فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
    english: "Adhere to truthfulness, for truthfulness leads to righteousness, and righteousness leads to Paradise.",
    urdu: "سچائی کو لازم پکڑو، کیونکہ سچائی نیکی کی طرف لے جاتی ہے اور نیکی جنت کی طرف رہنمائی کرتی ہے۔",
    chapter: "Book of Manners",
    grade: "Muttafaqun Alayh",
    topic: "character"
  },
  {
    id: 14,
    collection: "Nawawi",
    bookNumber: 1,
    hadithNumber: 2,
    narrator: "Umar ibn al-Khattab (RA)",
    arabic: "الإِحْسَانُ أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ",
    english: "Ihsan (Excellence) is to worship Allah as though you see Him; and if you do not see Him, truly He sees you.",
    urdu: "احسان یہ ہے کہ تم اللہ کی عبادت اس طرح کرو گویا تم اسے دیکھ رہے ہو، اور اگر تم اسے نہ دیکھ سکو تو وہ تمہیں دیکھ رہا ہے۔",
    chapter: "Hadith Jibril",
    grade: "Sahih",
    topic: "prayer"
  },
  {
    id: 15,
    collection: "Muslim",
    bookNumber: 48,
    hadithNumber: 2687,
    narrator: "Abu Hurairah (RA)",
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلاَّ عِزًّا",
    english: "Charity does not decrease wealth, and Allah increases the honor of a servant who forgives.",
    urdu: "صدقہ مال میں کمی نہیں کرتا، اور معاف کرنے سے اللہ بندے کی عزت میں اضافہ ہی فرماتا ہے۔",
    chapter: "Virtues and Forgiveness",
    grade: "Sahih",
    topic: "charity"
  }
];
