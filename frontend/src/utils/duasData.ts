export interface DuaItem {
  id: string;
  category: 'morning_evening' | 'sleep' | 'food' | 'travel' | 'mosque' | 'forgiveness' | 'anxiety' | 'family' | 'rabbana';
  categoryTitle: string;
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
  urdu: string;
  reference: string;
  repeat: number;
  audioUrl?: string;
  virtue?: string;
}

export const DUA_CATEGORIES = [
  { id: 'all', label: 'All Duas', icon: '✨' },
  { id: 'favorites', label: '⭐ Saved Duas', icon: '⭐' },
  { id: 'morning_evening', label: '🌅 Morning & Evening', icon: '🌅' },
  { id: 'sleep', label: '🌙 Sleep & Waking', icon: '🌙' },
  { id: 'rabbana', label: '📖 40 Rabbana Quran', icon: '📖' },
  { id: 'forgiveness', label: '🤍 Istighfar & Tawbah', icon: '🤍' },
  { id: 'anxiety', label: '🛡️ Anxiety, Debt & Pain', icon: '🛡️' },
  { id: 'travel', label: '🚗 Travel & Leaving Home', icon: '🚗' },
  { id: 'food', label: '🍽️ Food & Iftar', icon: '🍽️' },
  { id: 'mosque', label: '🕌 Mosque & Adhan', icon: '🕌' },
  { id: 'family', label: '👨‍👩‍👧 Family & Parents', icon: '👨‍👩‍👧' },
];

export const DUAS_DATABASE: DuaItem[] = [
  /* ── 🌅 MORNING & EVENING AZKAR ── */
  {
    id: "me-1",
    category: "morning_evening",
    categoryTitle: "Morning & Evening",
    title: "Sayyid al-Istighfār (The Chief of All Prayers for Forgiveness)",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliteration: "Allāhumma Anta Rabbī, lā ilāha illā Anta, khalaqtanī wa anā ʿabduka, wa anā ʿalā ʿahdika wa waʿdika mastataʿtu, aʿūdhu bika min sharri mā ṣanaʿtu, abū'u laka biniʿmatika ʿalayya, wa abū'u laka bidhanbī faghfir lī fa'innahu lā yaghfirudh-dhunūba illā Anta.",
    english: "O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I abide by Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favors upon me and I acknowledge my sins, so forgive me, for none forgives sins except You.",
    urdu: "اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، اور میں اپنی طاقت کے مطابق تیرے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے کے شر سے تیری پناہ مانگتا ہوں، اپنے اوپر تیری نعمتوں کا اعتراف کرتا ہوں اور اپنے گناہوں کا اقرار کرتا ہوں، پس مجھے بخش دے کیونکہ تیرے سوا کوئی گناہوں کو بخشنے والا نہیں۔",
    reference: "Sahih al-Bukhari 6306",
    repeat: 1,
    virtue: "Whoever recites it during the day or night with conviction and passes away will be among the people of Paradise."
  },
  {
    id: "me-2",
    category: "morning_evening",
    categoryTitle: "Morning & Evening",
    title: "Protection Against All Calamities & Poison",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillāhil-ladhī lā yaḍurru maʿas-mihī shay'un fil-arḍi wa lā fis-samā'i wa Huwas-Samīʿul-ʿAlīm.",
    english: "In the Name of Allah, with Whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    urdu: "اللہ کے نام کے ساتھ جس کے نام کی برکت سے زمین اور آسمان کی کوئی چیز نقصان نہیں پہنچا سکتی، اور وہی سب کچھ سننے والا اور جاننے والا ہے۔",
    reference: "Sunan Abi Dawud 5088 & At-Tirmidhi 3388",
    repeat: 3,
    virtue: "Whoever recites this 3 times in the morning and evening will not be harmed by anything."
  },
  {
    id: "me-3",
    category: "morning_evening",
    categoryTitle: "Morning & Evening",
    title: "Contentment with Faith & the Prophet ﷺ",
    arabic: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    transliteration: "Raḍītu billāhi Rabban, wa bil-Islāmi dīnan, wa bi-Muḥammadin (ṣallallāhu ʿalayhi wa sallama) Nabiyyan.",
    english: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace and blessings of Allah be upon him) as my Prophet.",
    urdu: "میں اللہ کے رب ہونے، اسلام کے دین ہونے اور محمد ﷺ کے نبی ہونے پر راضی اور خوش ہوں۔",
    reference: "Sunan Abi Dawud 5072",
    repeat: 3,
    virtue: "Allah promises to make whoever says this 3 times morning and evening pleased on the Day of Judgment."
  },

  /* ── 🌙 SLEEP & WAKING UP ── */
  {
    id: "sl-1",
    category: "sleep",
    categoryTitle: "Sleep & Waking Up",
    title: "Before Sleeping (Lie Down on Right Side)",
    arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    transliteration: "Bismika Rabbī waḍaʿtu janbī, wa bika arfaʿuh, fa'in amsakta nafsī far-ḥamhā, wa in arsaltahā faḥ-faẓhā bimā taḥfaẓu bihī ʿibādakaṣ-ṣāliḥīn.",
    english: "In Your name my Lord, I lie down and in Your name I rise. If You should take my soul, have mercy upon it; and if You return my soul, protect it as You protect Your righteous servants.",
    urdu: "اے میرے رب! تیرے ہی نام کے ساتھ میں نے اپنا پہلو رکھا اور تیرے ہی نام سے اسے اٹھاؤں گا۔ اگر تو میری جان کو روک لے تو اس پر رحم فرما، اور اگر اسے چھوڑ دے تو اس کی اسی طرح حفاظت فرما جس طرح تو اپنے نیک بندوں کی حفاظت فرماتا ہے۔",
    reference: "Sahih al-Bukhari 6320 & Muslim 2714",
    repeat: 1
  },
  {
    id: "sl-2",
    category: "sleep",
    categoryTitle: "Sleep & Waking Up",
    title: "Upon Waking Up in the Morning",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Al-ḥamdu lillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr.",
    english: "All praise is for Allah Who gave us life after having given us death, and unto Him is the resurrection.",
    urdu: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں مارنے (سلانے) کے بعد زندہ کیا اور اسی کی طرف لوٹ کر جانا ہے۔",
    reference: "Sahih al-Bukhari 6312",
    repeat: 1
  },

  /* ── 📖 40 RABBANA DUAS FROM THE QURAN ── */
  {
    id: "rab-1",
    category: "rabbana",
    categoryTitle: "40 Rabbana Duas",
    title: "Rabbana: Goodness in this World & the Hereafter",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār.",
    english: "Our Lord, grant us in this world that which is good and in the Hereafter that which is good, and protect us from the punishment of the Fire.",
    urdu: "اے ہمارے رب! ہمیں دنیا میں بھی بھلائی عطا فرما اور آخرت میں بھی بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔",
    reference: "Surah Al-Baqarah 2:201",
    repeat: 3,
    virtue: "The most frequent supplication recited by Prophet Muhammad ﷺ."
  },
  {
    id: "rab-2",
    category: "rabbana",
    categoryTitle: "40 Rabbana Duas",
    title: "Rabbana: Firmness of Faith & Do Not Deviate Our Hearts",
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    transliteration: "Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā wa hab lanā mil-ladunka raḥmah, innaka Antal-Wahhāb.",
    english: "Our Lord, let not our hearts deviate after You have guided us, and grant us from Yourself mercy. Indeed, You are the Bestower.",
    urdu: "اے ہمارے رب! ہمارے دلوں کو ٹیڑھا نہ کر بعد اس کے کہ تو نے ہمیں ہدایت دی، اور ہمیں اپنے پاس سے رحمت عطا فرما، بے شک تو ہی بڑا عطا فرمانے والا ہے۔",
    reference: "Surah Ali 'Imran 3:8",
    repeat: 1
  },
  {
    id: "rab-3",
    category: "rabbana",
    categoryTitle: "40 Rabbana Duas",
    title: "Rabbana: Righteous Spouses & Children as Comfort to Eyes",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyuniw-wajʿalnā lil-muttaqīna imāmā.",
    english: "Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.",
    urdu: "اے ہمارے رب! ہمیں ہماری بیویوں اور ہماری اولاد کی طرف سے آنکھوں کی ٹھنڈک عطا فرما اور ہمیں پرہیزگاروں کا پیشوا بنا۔",
    reference: "Surah Al-Furqan 25:74",
    repeat: 1
  },
  {
    id: "rab-4",
    category: "rabbana",
    categoryTitle: "40 Rabbana Duas",
    title: "Rabbana: Forgiveness for Parents & All Believers",
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    transliteration: "Rabbanagh-fir lī wa liwālidayya wa lil-mu'minīna yawma yaqūmul-ḥisāb.",
    english: "Our Lord, forgive me and my parents and the believers on the Day when the account is established.",
    urdu: "اے ہمارے رب! مجھے، میرے والدین کو اور تمام مومنین کو اس دن معاف فرما جب حساب قائم ہوگا۔",
    reference: "Surah Ibrahim 14:41",
    repeat: 3
  },

  /* ── 🤍 FORGIVENESS & TAWBAH ── */
  {
    id: "fg-1",
    category: "forgiveness",
    categoryTitle: "Forgiveness & Istighfar",
    title: "Dua of Prophet Yunus (AS) in the Belly of the Whale",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "Lā ilāha illā Anta subḥānaka innī kuntu minaẓ-ẓālimīn.",
    english: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    urdu: "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ہی قصورواروں میں سے ہوں۔",
    reference: "Surah Al-Anbiya 21:87",
    repeat: 7,
    virtue: "The Prophet ﷺ said no Muslim supplicates with this in distress except that Allah relieves him."
  },
  {
    id: "fg-2",
    category: "forgiveness",
    categoryTitle: "Forgiveness & Istighfar",
    title: "Astaghfirullah (General Istighfar 100x Daily)",
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullāha wa atūbu ilayh.",
    english: "I seek the forgiveness of Allah and I repent to Him.",
    urdu: "میں اللہ سے مغفرت طلب کرتا ہوں اور اسی کی طرف رجوع کرتا ہوں۔",
    reference: "Sahih al-Bukhari 6307",
    repeat: 100,
    virtue: "The Prophet ﷺ used to ask forgiveness more than 70 to 100 times each day."
  },

  /* ── 🛡️ ANXIETY, DEBT & HARDSHIP ── */
  {
    id: "anx-1",
    category: "anxiety",
    categoryTitle: "Anxiety & Relief",
    title: "Relief from Anxiety, Sorrow, Debt & Oppression",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa ḍalaʿid-dayni wa ghalabatir-rijāl.",
    english: "O Allah, I seek refuge in You from anxiety and sorrow, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and from being overpowered by men.",
    urdu: "اے اللہ! میں فکر اور غم سے، کمزوری اور سستی سے، بخل اور بزدلی سے، قرض کے بوجھ سے اور لوگوں کے غلبے سے تیری پناہ مانگتا ہوں۔",
    reference: "Sahih al-Bukhari 2893",
    repeat: 3
  },
  {
    id: "anx-2",
    category: "anxiety",
    categoryTitle: "Anxiety & Relief",
    title: "Dua in Times of Distress (Karb)",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    transliteration: "Lā ilāha illallāhul-ʿAẓīmul-Ḥalīm, Lā ilāha illallāhu Rabbul-ʿArshil-ʿAẓīm, Lā ilāha illallāhu Rabbus-samāwāti wa Rabbul-arḍi wa Rabbul-ʿArshil-Karīm.",
    english: "There is no deity except Allah, the Magnificent, the Forbearing. There is no deity except Allah, Lord of the Magnificent Throne. There is no deity except Allah, Lord of the heavens and Lord of the earth and Lord of the Noble Throne.",
    urdu: "اللہ کے سوا کوئی معبود نہیں جو عظمت والا، بردبار ہے۔ اللہ کے سوا کوئی معبود نہیں جو عرش عظیم کا رب ہے۔ اللہ کے سوا کوئی معبود نہیں جو آسمانوں کا رب، زمین کا رب اور معزز عرش کا رب ہے۔",
    reference: "Sahih al-Bukhari 6346 & Muslim 2730",
    repeat: 1
  },

  /* ── 🚗 TRAVEL & LEAVING HOME ── */
  {
    id: "tr-1",
    category: "travel",
    categoryTitle: "Travel & Protection",
    title: "When Stepping Out of the Home",
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillāh, tawakkaltu ʿalallāh, wa lā ḥawla wa lā quwwata illā billāh.",
    english: "In the Name of Allah, I place my trust in Allah; there is no might and no power except with Allah.",
    urdu: "اللہ کے نام کے ساتھ، میں نے اللہ پر بھروسہ کیا، اور اللہ کے بغیر نہ کوئی طاقت ہے اور نہ قوت۔",
    reference: "Sunan Abi Dawud 5095 & At-Tirmidhi 3426",
    repeat: 1,
    virtue: "Angels say to you: You are guided, defended, and protected, and Shaytan stays away from you."
  },
  {
    id: "tr-2",
    category: "travel",
    categoryTitle: "Travel & Protection",
    title: "Supplication for Riding a Vehicle or Starting a Journey",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
    transliteration: "Subḥānal-ladhī sakh-khara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā Rabbinā lamunqalibūn.",
    english: "Glory be to Him Who has subjected this to us, whereas we were unable to conquer it by ourselves, and indeed to our Lord we shall return.",
    urdu: "پاک ہے وہ ذات جس نے اس (سواری) کو ہمارے قابو میں کر دیا حالانکہ ہم اسے قابو میں لانے والے نہ تھے، اور بے شک ہم اپنے رب ہی کی طرف لوٹنے والے ہیں۔",
    reference: "Surah Az-Zukhruf 43:13-14",
    repeat: 1
  },

  /* ── 🍽️ FOOD & IFTAR ── */
  {
    id: "fd-1",
    category: "food",
    categoryTitle: "Food & Fasting",
    title: "Upon Breaking the Fast (Iftar)",
    arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ",
    transliteration: "Dhahabaẓ-ẓama'u wabtallatil-ʿurūq, wa thabatal-ajru in shā' Allāh.",
    english: "The thirst has vanished, the veins are moistened, and the reward is established, if Allah wills.",
    urdu: "پیاس چلی گئی، رگیں تر ہو گئیں اور اجر ثابت ہو گیا اگر اللہ نے چاہا۔",
    reference: "Sunan Abi Dawud 2357",
    repeat: 1
  },
  {
    id: "fd-2",
    category: "food",
    categoryTitle: "Food & Fasting",
    title: "After Finishing a Meal",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "Al-ḥamdu lillāhil-ladhī aṭʿamanā wa saqānā wa jaʿalanā Muslimīn.",
    english: "Praise be to Allah Who fed us, gave us drink, and made us Muslims.",
    urdu: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور ہمیں مسلمان بنایا۔",
    reference: "Sunan Abi Dawud 3850 & At-Tirmidhi 3457",
    repeat: 1
  },

  /* ── 🕌 MOSQUE & PRAYER ── */
  {
    id: "ms-1",
    category: "mosque",
    categoryTitle: "Mosque & Prayer",
    title: "When Entering the Mosque (Step with Right Foot)",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allāhummaf-taḥ lī abwāba raḥmatik.",
    english: "O Allah, open for me the doors of Your mercy.",
    urdu: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول دے۔",
    reference: "Sahih Muslim 713",
    repeat: 1
  },
  {
    id: "ms-2",
    category: "mosque",
    categoryTitle: "Mosque & Prayer",
    title: "When Leaving the Mosque (Step with Left Foot)",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allāhumma innī as'aluka min faḍlik.",
    english: "O Allah, I ask You of Your bounty.",
    urdu: "اے اللہ! میں تجھ سے تیرے فضل کا سوال کرتا ہوں۔",
    reference: "Sahih Muslim 713",
    repeat: 1
  },

  /* ── 👨‍👩‍👧 PARENTS & FAMILY ── */
  {
    id: "fm-1",
    category: "family",
    categoryTitle: "Parents & Family",
    title: "Dua for Mercy Upon Parents",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā.",
    english: "My Lord, have mercy upon them both as they raised me when I was small.",
    urdu: "اے میرے رب! ان دونوں (والدین) پر رحم فرما جس طرح انہوں نے بچپن میں میری پرورش فرمائی۔",
    reference: "Surah Al-Isra 17:24",
    repeat: 3
  }
];
