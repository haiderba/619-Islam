import models
from database import SessionLocal

def seed_books_catalog():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(models.Tradition).first():
            print("Books catalog already seeded.")
            return

        print("Seeding Islamic Books Catalog (Traditions, Categories, Authors, Books & Chapters)...")

        # 1. TRADITIONS
        traditions_data = [
            {"id": 1, "name": "All Traditions", "name_ar": "جميع المذاهب", "name_ur": "تمام مکاتب فکر", "slug": "all", "parent_id": None, "sort_order": 0, "description": "Browse Islamic literature across all traditions and schools of thought."},
            {"id": 2, "name": "Sunni", "name_ar": "أهل السنة والجماعة", "name_ur": "اہل سنت و جماعت", "slug": "sunni", "parent_id": None, "sort_order": 1, "description": "Works authored within mainstream Sunni scholarship."},
            {"id": 3, "name": "Hanafi", "name_ar": "المذهب الحنفي", "name_ur": "فقہ حنفی", "slug": "hanafi", "parent_id": 2, "sort_order": 2, "description": "Jurisprudence and theology of the Hanafi tradition founded by Imam Abu Hanifah."},
            {"id": 4, "name": "Shafi'i", "name_ar": "المذهب الشافعي", "name_ur": "فقہ شافعی", "slug": "shafii", "parent_id": 2, "sort_order": 3, "description": "Works of the Shafi'i legal school founded by Imam Muhammad ibn Idris al-Shafi'i."},
            {"id": 5, "name": "Maliki", "name_ar": "المذهب المالكي", "name_ur": "فقہ مالکی", "slug": "maliki", "parent_id": 2, "sort_order": 4, "description": "Tradition of Imam Malik ibn Anas and the scholars of Madinah."},
            {"id": 6, "name": "Hanbali", "name_ar": "المذهب الحنبلي", "name_ur": "فقہ حنبلی", "slug": "hanbali", "parent_id": 2, "sort_order": 5, "description": "Jurisprudence founded by Imam Ahmad ibn Hanbal."},
            {"id": 7, "name": "Shia", "name_ar": "الشيعة الإمامية", "name_ur": "اہل تشیع", "slug": "shia", "parent_id": None, "sort_order": 6, "description": "Classical and contemporary Shia scholarship centered on the teachings of the Ahl al-Bayt."},
            {"id": 8, "name": "Ja'fari", "name_ar": "المذهب الجعفري", "name_ur": "فقہ جعفری", "slug": "jafari", "parent_id": 7, "sort_order": 7, "description": "Jurisprudence and theology following Imam Ja'far al-Sadiq and the Twelve Imams."},
            {"id": 9, "name": "Ibadi", "name_ar": "المذهب الإباضي", "name_ur": "اباضی", "slug": "ibadi", "parent_id": None, "sort_order": 8, "description": "Classical scholarship of the Ibadi school of thought."},
            {"id": 10, "name": "Comparative & Academic", "name_ar": "الفقه المقارن", "name_ur": "مقارن و تحقیقی", "slug": "comparative", "parent_id": None, "sort_order": 9, "description": "Comparative jurisprudence, inter-school dialogue, and unified Islamic heritage."},
            {"id": 11, "name": "General Islamic", "name_ar": "إسلاميات عامة", "name_ur": "عمومی اسلامی", "slug": "general", "parent_id": None, "sort_order": 10, "description": "Foundational spirituality, Quranic studies, and universally accepted moral works."}
        ]

        tradition_objs = {}
        for t in traditions_data:
            obj = models.Tradition(
                id=t["id"],
                name=t["name"],
                name_ar=t["name_ar"],
                name_ur=t["name_ur"],
                slug=t["slug"],
                parent_id=t["parent_id"],
                sort_order=t["sort_order"],
                description=t["description"]
            )
            db.add(obj)
            tradition_objs[t["slug"]] = obj
        db.commit()

        # 2. CATEGORIES
        categories_data = [
            {"id": 1, "name": "Quran & Tafsir", "name_ar": "القرآن والتفسير", "name_ur": "قرآن و تفسیر", "slug": "quran-tafsir", "icon_name": "BookOpen", "sort_order": 1, "description": "Exegesis, Quranic sciences, and verse-by-verse reflections."},
            {"id": 2, "name": "Hadith & Sunnah", "name_ar": "الحديث الشريف", "name_ur": "حدیث و روایات", "slug": "hadith", "icon_name": "Scroll", "sort_order": 2, "description": "Prophetic traditions, narrations of Ahl al-Bayt, and hadith commentaries."},
            {"id": 3, "name": "Fiqh & Law", "name_ar": "الفقه الإسلامي", "name_ur": "فقہ و احکام", "slug": "fiqh", "icon_name": "Scale", "sort_order": 3, "description": "Islamic jurisprudence, ritual rulings, transactions, and daily living."},
            {"id": 4, "name": "Aqeedah & Theology", "name_ar": "العقيدة وعلم الكلام", "name_ur": "عقائد و کلام", "slug": "aqeedah", "icon_name": "ShieldCheck", "sort_order": 4, "description": "Monotheism, divine justice, prophethood, imamate, and the afterlife."},
            {"id": 5, "name": "Seerah & History", "name_ar": "السيرة والتاريخ", "name_ur": "سیرت و تاریخ", "slug": "seerah", "icon_name": "Clock", "sort_order": 5, "description": "Biography of Prophet Muhammad ﷺ, early Islamic history, and pious predecessors."},
            {"id": 6, "name": "Ethics & Akhlaq", "name_ar": "الأخلاق والآداب", "name_ur": "اخلاق و آداب", "slug": "ethics", "icon_name": "HeartHandshake", "sort_order": 6, "description": "Purification of the soul, noble character traits, manners, and interpersonal ethics."},
            {"id": 7, "name": "Spirituality & Duas", "name_ar": "الأدعية والمناجاة", "name_ur": "ادعیہ و مناجات", "slug": "duas", "icon_name": "Sparkles", "sort_order": 7, "description": "Authentic supplications, intimate whispered prayers, and spiritual devotion."},
            {"id": 8, "name": "Ahl al-Bayt", "name_ar": "أهل البيت عليهم السلام", "name_ur": "اہل بیت علیہم السلام", "slug": "ahl-al-bayt", "icon_name": "Crown", "sort_order": 8, "description": "Sermons, letters, and biographies of the Prophet's household."},
        ]

        category_objs = {}
        for c in categories_data:
            obj = models.Category(
                id=c["id"],
                name=c["name"],
                name_ar=c["name_ar"],
                name_ur=c["name_ur"],
                slug=c["slug"],
                icon_name=c["icon_name"],
                sort_order=c["sort_order"],
                description=c["description"]
            )
            db.add(obj)
            category_objs[c["slug"]] = obj
        db.commit()

        # 3. AUTHORS
        authors_data = [
            {"id": 1, "name": "Imam Ali ibn Abi Talib (compiled by Sharif al-Radi)", "name_ar": "الإمام علي بن أبي طالب (جمع الشريف الرضي)", "name_ur": "امام علی ابن ابی طالب (جامع: شریف الرضی)", "death_year_hijri": "40 AH / 406 AH", "bio": "The fourth Rightly Guided Caliph and first Shia Imam, known as the Gateway of Knowledge."},
            {"id": 2, "name": "Imam Yahya ibn Sharaf al-Nawawi", "name_ar": "الإمام يحيى بن شرف النووي", "name_ur": "امام یحییٰ بن شرف النووی", "death_year_hijri": "676 AH", "bio": "Celebrated Syrian Shafi'i scholar of Hadith, Fiqh, and author of the Forty Hadith and Riyad as-Salihin."},
            {"id": 3, "name": "Imam Ali Zayn al-Abidin (al-Sajjad)", "name_ar": "الإمام علي بن الحسين زين العابدين", "name_ur": "امام علی زین العابدین علیہ السلام", "death_year_hijri": "95 AH", "bio": "Fourth Shia Imam, renowned for his profound spiritual supplications in Al-Sahifa al-Sajjadiyya."},
            {"id": 4, "name": "Shaykh Muhammad ibn Ya'qub al-Kulayni", "name_ar": "الشيخ محمد بن يعقوب الكليني", "name_ur": "شیخ محمد بن یعقوب الکلینی", "death_year_hijri": "329 AH", "bio": "Prominent Shia hadith compiler, author of the monumental Kitab al-Kafi."},
            {"id": 5, "name": "Imam Abu al-Husayn Ahmad al-Quduri", "name_ar": "الإمام أحمد بن محمد القدوري", "name_ur": "امام احمد بن محمد القدوری", "death_year_hijri": "428 AH", "bio": "Famous Iraqi Hanafi jurist and author of the foundational manual Mukhtasar al-Quduri."},
            {"id": 6, "name": "Imam Abu Hamid al-Ghazali", "name_ar": "حجة الإسلام أبو حامد الغزالي", "name_ur": "امام ابو حامد الغزالی", "death_year_hijri": "505 AH", "bio": "Hujjat al-Islam, one of Islam's greatest philosophers, theologians, and spiritual masters."},
            {"id": 7, "name": "Shaykh Safiur Rahman Mubarakpuri", "name_ar": "الشيخ صفي الرحمن المباركفوري", "name_ur": "مولانا صفی الرحمن مبارکپوری", "death_year_hijri": "1427 AH", "bio": "Acclaimed Islamic historian and author of the award-winning biography of Prophet Muhammad ﷺ, Ar-Raheeq Al-Makhtum."}
        ]

        author_objs = {}
        for a in authors_data:
            obj = models.Author(
                id=a["id"],
                name=a["name"],
                name_ar=a["name_ar"],
                name_ur=a["name_ur"],
                death_year_hijri=a["death_year_hijri"],
                bio=a["bio"]
            )
            db.add(obj)
            author_objs[a["id"]] = obj
        db.commit()

        # 4. BOOKS & CHAPTER CONTENT
        books_data = [
            {
                "id": 1,
                "title": "Nahj al-Balagha (Peak of Eloquence)",
                "title_ar": "نهج البلاغة",
                "title_ur": "نہج البلاغہ",
                "slug": "nahj-al-balagha",
                "description": "The monumental collection of sermons, letters, and wisdoms of Imam Ali ibn Abi Talib, celebrated across the Islamic world for its unmatched spiritual depth, literary brilliance, and universal principles of justice.",
                "author_id": 1,
                "tradition_id": 7, # Shia
                "category_id": 8, # Ahl al-Bayt
                "language": "Arabic • English • Urdu",
                "publication_year": "Classical (4th Century AH)",
                "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "total_chapters": 3,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Khutbah al-Muttaqin (The Sermon on the Pious)",
                        "title_ar": "خطبة المتقين (همام)",
                        "title_ur": "خطبہ متقین (پرہیزگاروں کے اوصاف)",
                        "content_ar": """بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
أَمَّا بَعْدُ، فَإِنَّ اللَّهَ سُبْحَانَهُ وَتَعَالَى خَلَقَ الْخَلْقَ حِينَ خَلَقَهُمْ غَنِيّاً عَنْ طَاعَتِهِمْ، آمِناً مِنْ مَعْصِيَتِهِمْ، لِأَنَّهُ لَا تَضُرُّهُ مَعْصِيَةُ مَنْ عَصَاهُ، وَلَا تَنْفَعُهُ طَاعَةُ مَنْ أَطَاعَهُ.
فَالْمُتَّقُونَ فِيهَا هُمْ أَهْلُ الْفَضَائِلِ: مَنْطِقُهُمُ الصَّوَابُ، وَمَلْبَسُهُمُ الِاقْتِصَادُ، وَمَشْيُهُمُ التَّوَاضُعُ.
غَضُّوا أَبْصَارَهُمْ عَمَّا حَرَّمَ اللَّهُ عَلَيْهِمْ، وَوَقَفُوا أَسْمَاعَهُمْ عَلَى الْعِلْمِ النَّافِعِ لَهُمْ.
نُزِّلَتْ أَنْفُسُهُمْ مِنْهُمْ فِي الْبَلَاءِ كَالَّتِي نُزِّلَتْ فِي الرَّخَاءِ.""",
                        "content_en": """In the name of Allah, the Most Compassionate, the Most Merciful.
Now then, Allah the Glorified created creation when He created them without any need for their obedience or fear of their disobedience, for the disobedience of the sinner harms Him not, nor does the obedience of the obedient benefit Him.
The God-conscious (Muttaqun) in this world are people of distinction: their speech is truthful, their dress is modest, and their walk is humble.
They lower their gaze from what Allah has forbidden them, and dedicate their ears to knowledge that benefits them.
In hardship, their souls remain as composed and steadfast as in times of ease and prosperity.""",
                        "content_ur": """شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے۔
اما بعد! اللہ سبحانہ و تعالیٰ نے مخلوقات کو اس وقت پیدا کیا جب وہ ان کی اطاعت سے بے نیاز اور ان کی نافرمانی سے بے خوف تھا، کیونکہ کسی گنہگار کی نافرمانی اسے نقصان نہیں پہنچا سکتی اور نہ کسی فرمانبردار کی اطاعت اسے فائدہ پہنچاتی ہے۔
دنیا میں متقی اور پرہیزگار لوگ ہی فضیلت والے ہیں: ان کی گفتگو سچی، ان کا لباس میانہ روی پر مبنی اور ان کی چال عاجزانہ ہے۔
انہوں نے اپنی نگاہوں کو ان چیزوں سے ہٹا لیا ہے جو اللہ نے ان پر حرام کی ہیں اور اپنے کانوں کو اسی علم پر لگا رکھا ہے جو ان کے لیے نفع بخش ہے۔
آزمائش اور مصیبت میں ان کا دل ایسا ہی مطمئن رہتا ہے جیسا کہ خوشحالی و فراخی میں رہتا ہے۔"""
                    },
                    {
                        "chapter_number": 2,
                        "title": "Letter to Malik al-Ashtar on Governance & Justice",
                        "title_ar": "عهده لمالك الأشتر حين ولاه مصر",
                        "title_ur": "مالک اشتر کے نام تاریخی عہد نامہ و اصولِ حکمرانی",
                        "content_ar": """وَأَشْعِرْ قَلْبَكَ الرَّحْمَةَ لِلرَّعِيَّةِ، وَالْمَحَبَّةَ لَهُمْ، وَاللُّطْفَ بِهِمْ، وَلَا تَكُونَنَّ عَلَيْهِمْ سَبُعاً ضَارِياً تَغْتَنِمُ أَكْلَهُمْ، فَإِنَّهُمْ صِنْفَانِ: إِمَّا أَخٌ لَكَ فِي الدِّينِ، وَإِمَّا نَظِيرٌ لَكَ فِي الْخَلْقِ.
يَفْرُطُ مِنْهُمُ الزَّلَلُ، وَتَعْرِضُ لَهُمُ الْعِلَلُ، وَيُؤْتَى عَلَى أَيْدِيهِمْ فِي الْعَمْدِ وَالْخَطَإِ، فَأَعْطِهِمْ مِنْ عَفْوِكَ وَصَفْحِكَ مِثْلَ الَّذِي تُحِبُّ وَتَرْضَى أَنْ يُعْطِيَكَ اللَّهُ مِنْ عَفْوِهِ وَصَفْحِهِ.""",
                        "content_en": """Habituate your heart to mercy for the subjects and to affection and kindness for them. Do not behave towards them as a ravenous beast that considers their destruction as its spoil, for they are of two kinds: either your brother in religion, or your equal in creation.
Mistakes are committed by them, lapses occur from them, and errors are done intentionally and accidentally. Therefore, grant them your pardon and forgiveness in the same way you would love Allah to grant you His pardon and forgiveness.""",
                        "content_ur": """اپنے دل میں عوام کے لیے رحمت، محبت اور مہربانی کا احساس بیدار رکھو۔ ان پر پھاڑ کھانے والے درندے کی طرح نہ بنو جو ان کے شکار کو غنیمت سمجھے، کیونکہ انسان دو ہی قسم کے ہیں: یا تو وہ دین میں تمہارے بھائی ہیں، یا پھر خلقت و انسانیت میں تمہارے جیسے انسان ہیں۔
ان سے لغزشیں بھی سرزد ہوں گی، کوتاہیاں بھی ہوں گی، اور دانستہ یا نادانستہ خطائیں بھی واقع ہوں گی۔ لہٰذا تم انہیں اپنی طرف سے اسی طرح معافی اور درگزر عطا کرو جس طرح تم خود اللہ سے اپنے لیے عفو و مغفرت کی امید رکھتے ہو۔"""
                    },
                    {
                        "chapter_number": 3,
                        "title": "Short Maxims of Wisdom",
                        "title_ar": "قصار الحكم والمواعظ",
                        "title_ur": "حکمت و دانائی کے منتخب ارشادات",
                        "content_ar": """١. صَدْرُ الْعَاقِلِ صُنْدُوقُ سِرِّهِ، وَالْبَشَاشَةُ حِبَالَةُ الْمَوَدَّةِ، وَالِاحْتِمَالُ قَبْرُ الْعُيُوبِ.
٢. أَعْجَزُ النَّاسِ مَنْ عَجَزَ عَنِ اكْتِسَابِ الْإِخْوَانِ، وَأَعْجَزُ مِنْهُ مَنْ ضَيَّعَ مَنْ ظَفِرَ بِهِ مِنْهُمْ.
٣. الْعِلْمُ وِرَاثَةٌ كَرِيمَةٌ، وَالْآدَابُ حُلَلٌ مُجَدَّدَةٌ، وَالْفِكْرُ مِرْآةٌ صَافِيَةٌ.""",
                        "content_en": """1. The heart of a wise person is the repository of his secrets. Cheerful countenance is the bond of friendship, and forbearance is the grave of shortcomings.
2. The most helpless person is the one who is unable to make friends, and even more helpless is the one who loses those he has found.
3. Knowledge is a noble legacy, good manners are ever-fresh garments, and contemplation is a polished mirror.""",
                        "content_ur": """۱. عقلمند کا سینہ اس کے رازوں کا خزانہ ہے، کشادہ پیشانی محبت کا جال ہے، اور برداشت عیوب کا مدفن ہے۔
۲. سب سے بے بس انسان وہ ہے جو دوست بنانے میں ناکام رہے، اور اس سے بھی زیادہ بے بس وہ ہے جو بنائے ہوئے دوستوں کو ضائع کر دے۔
۳. علم ایک قیمتی میراث ہے، اچھے اخلاق ہمیشہ تازہ رہنے والے لباس ہیں، اور فکر و غور ایک صاف شفاف آئینہ ہے۔"""
                    }
                ]
            },
            {
                "id": 2,
                "title": "Al-Arba'in an-Nawawiyya (The 40 Hadith of Imam Nawawi)",
                "title_ar": "الأربعون النووية",
                "title_ur": "چالیس احادیثِ نبوی (اربعین نووی)",
                "slug": "arbaeen-nawawi",
                "description": "The quintessential collection of 42 comprehensive prophetic traditions compiled by Imam an-Nawawi that summarize the core principles, legal maxims, and spiritual foundations of Islam.",
                "author_id": 2,
                "tradition_id": 2, # Sunni
                "category_id": 2, # Hadith
                "language": "Arabic • English • Urdu",
                "publication_year": "670 AH",
                "cover_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "total_chapters": 3,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Hadith 1: Actions are Judged by Intentions",
                        "title_ar": "الحديث الأول: إنما الأعمال بالنيات",
                        "title_ur": "حدیث ۱: اعمال کا دارومدار نیتوں پر ہے",
                        "content_ar": """عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ:
«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ».
رَوَاهُ إِمَامَا الْمُحَدِّثِينَ: أَبُو عَبْدِ اللَّهِ مُحَمَّدُ بْنُ إِسْمَاعِيلَ بْنِ إِبْرَاهِيمَ بْنِ الْمُغِيرَةِ بْنِ بَرْدِزْبَهْ الْبُخَارِيُّ، وَأَبُو الْحُسَيْنِ مُسْلِمُ بْنُ الْحَجَّاجِ بْنِ مُسْلِمٍ الْقُشَيْرِيُّ النَّيْسَابُورِيُّ.""",
                        "content_en": """It is narrated on the authority of the Leader of the Believers, Umar ibn al-Khattab (may Allah be pleased with him), who said: I heard the Messenger of Allah (peace be upon him) say:
"Actions are only by intentions, and every person shall have only that which he intended. Thus, he whose migration was for Allah and His Messenger, his migration was for Allah and His Messenger; and he whose migration was to achieve some worldly gain or to marry a woman, his migration was for that which he migrated."
[Narrated by Bukhari & Muslim]""",
                        "content_ur": """امیر المؤمنین حضرت عمر بن خطاب رضی اللہ عنہ سے روایت ہے، فرماتے ہیں کہ میں نے رسول اللہ ﷺ کو فرماتے سنا:
"اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کو وہی ملے گا جس کی اس نے نیت کی۔ پس جس کی ہجرت اللہ اور اس کے رسول کے لیے ہو تو اس کی ہجرت اللہ اور اس کے رسول ہی کی طرف ہے، اور جس کی ہجرت دنیا حاصل کرنے یا کسی عورت سے نکاح کی غرض سے ہو تو اس کی ہجرت اسی مقصد کے لیے سمجھی جائے گی جس کے لیے اس نے ہجرت کی۔"
[صحیح بخاری و صحیح مسلم]"""
                    },
                    {
                        "chapter_number": 2,
                        "title": "Hadith 2: Islam, Iman, and Ihsan (Hadith Jibril)",
                        "title_ar": "الحديث الثاني: مراتب الدين (حديث جبريل)",
                        "title_ur": "حدیث ۲: دین کے درجات - اسلام، ایمان اور احسان (حدیثِ جبریل)",
                        "content_ar": """عَنْ عُمَرَ رَضِيَ اللَّهُ عَنْهُ أَيْضاً قَالَ: بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ رَسُولِ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ ذَاتَ يَوْمٍ إِذْ طَلَعَ عَلَيْنَا رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ، شَدِيدُ سَوَادِ الشَّعْرِ، لا يُرَى عَلَيْهِ أَثَرُ السَّفَرِ، وَلا يَعْرِفُهُ مِنَّا أَحَدٌ...
فَقَالَ: يَا مُحَمَّدُ أَخْبِرْنِي عَنِ الإِسْلامِ؟ فَقَالَ: «الإِسْلامُ أَنْ تَشْهَدَ أَنْ لا إِلَهَ إِلا اللَّهُ وَأَنَّ مُحَمَّداً رَسُولُ اللَّهِ، وَتُقِيمَ الصَّلاةَ، وَتُؤْتِيَ الزَّكَاةَ، وَتَصُومَ رَمَضَانَ، وَتَحُجَّ الْبَيْتَ إِنِ اسْتَطَعْتَ إِلَيْهِ سَبِيلاً».
قَالَ: فَأَخْبِرْنِي عَنِ الإِيمَانِ؟ قَالَ: «أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلائِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ».
قَالَ: فَأَخْبِرْنِي عَنِ الإِحْسَانِ؟ قَالَ: «أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ».
ثُمَّ قَالَ: «يَا عُمَرُ، هَذَا جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ».""",
                        "content_en": """Also on the authority of Umar (may Allah be pleased with him): One day while we were sitting with the Messenger of Allah (peace be upon him), there appeared before us a man whose clothes were exceedingly white and whose hair was exceedingly black. No signs of travel were visible upon him and none of us knew him...
He said: "O Muhammad, tell me about Islam." The Messenger of Allah said: "Islam is to testify that there is no god but Allah and that Muhammad is the Messenger of Allah, to establish prayer, to give zakat, to fast during Ramadan, and to perform the pilgrimage to the House if you are able."
He said: "Then tell me about Iman." He replied: "It is to believe in Allah, His angels, His books, His messengers, the Last Day, and to believe in destiny — its good and its bad."
He said: "Then tell me about Ihsan." He replied: "It is to worship Allah as though you see Him, and if you cannot see Him, then truly He sees you."
Then the Prophet said: "O Umar, that was Jibril who came to teach you your religion."
[Narrated by Muslim]""",
                        "content_ur": """حضرت عمر رضی اللہ عنہ سے روایت ہے کہ ایک دن ہم رسول اللہ ﷺ کے پاس بیٹھے تھے کہ اچانک ایک شخص ہمارے سامنے نمودار ہوا جس کے کپڑے انتہائی سفید اور بال گہرے سیاہ تھے۔ اس پر سفر کا کوئی نشان نہیں تھا اور ہم میں سے کوئی اسے جانتا بھی نہ تھا...
اس نے کہا: "اے محمد! مجھے اسلام کے بارے میں بتائیے۔" آپ ﷺ نے فرمایا: "اسلام یہ ہے کہ تم گواہی دو کہ اللہ کے سوا کوئی معبود نہیں اور محمد ﷺ اللہ کے رسول ہیں، نماز قائم کرو، زکوٰۃ ادا کرو، رمضان کے روزے رکھو، اور اگر استطاعت ہو تو بیت اللہ کا حج کرو۔"
اس نے کہا: "مجھے ایمان کے بارے میں بتائیے۔" آپ ﷺ نے فرمایا: "تم اللہ پر، اس کے فرشتوں پر، اس کی کتابوں پر، اس کے رسولوں پر، یومِ آخرت پر، اور تقدیر کی اچھائی اور برائی پر یقین رکھو۔"
اس نے کہا: "مجھے احسان کے بارے میں بتائیے۔" آپ ﷺ نے فرمایا: "تم اللہ کی عبادت اس طرح کرو گویا تم اسے دیکھ رہے ہو، اور اگر تم اسے نہیں دیکھ رہے تو وہ تمہیں دیکھ رہا ہے۔"
پھر آپ ﷺ نے فرمایا: "اے عمر! یہ جبرائیلؑ تھے جو تمہیں تمہارا دین سکھانے آئے تھے۔"
[صحیح مسلم]"""
                    },
                    {
                        "chapter_number": 3,
                        "title": "Hadith 3: Leaving that which does not concern you",
                        "title_ar": "الحديث الثاني عشر: من حسن إسلام المرء",
                        "title_ur": "حدیث ۱۲: بے فائدہ باتوں کو چھوڑ دینا اچھے اسلام کی علامت ہے",
                        "content_ar": """عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:
«مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ».
حَدِيثٌ حَسَنٌ، رَوَاهُ التِّرْمِذِيُّ وَغَيْرُهُ هَكَذَا.""",
                        "content_en": """On the authority of Abu Hurayrah (may Allah be pleased with him) who said: The Messenger of Allah (peace be upon him) said:
"Part of the excellence of one's Islam is his leaving that which does not concern him."
[A sound hadith, narrated by At-Tirmidhi and others]""",
                        "content_ur": """حضرت ابو ہریرہ رضی اللہ عنہ سے روایت ہے کہ رسول اللہ ﷺ نے ارشاد فرمایا:
"انسان کے اسلام کا حسن اور کمال یہ ہے کہ وہ ان باتوں کو چھوڑ دے جو اس کے کام کی نہیں ہیں اور جن سے اس کا کوئی سروکار نہیں۔"
[جامع ترمذی و دیگر]"""
                    }
                ]
            },
            {
                "id": 3,
                "title": "Al-Sahifa al-Sajjadiyya (Psalms of Islam)",
                "title_ar": "الصحيفة السجادية الكاملة",
                "title_ur": "صحیفہ سجادیہ (زبورِ آلِ محمد)",
                "slug": "sahifa-sajjadiyya",
                "description": "The timeless treasury of sublime supplications, whispered prayers, and spiritual meditations composed by Imam Ali ibn al-Husayn Zayn al-Abidin (al-Sajjad), revered as one of the greatest spiritual masterpieces in Islamic literature.",
                "author_id": 3,
                "tradition_id": 7, # Shia
                "category_id": 7, # Spirituality & Duas
                "language": "Arabic • English • Urdu",
                "publication_year": "1st Century AH",
                "cover_url": "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "total_chapters": 2,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Dua in Praise of Allah Almighty",
                        "title_ar": "الدعاء الأول: في التحميد لله عز وجل",
                        "title_ur": "پہلی دعا: اللہ تعالیٰ کی حمد و ثناء",
                        "content_ar": """الْحَمْدُ لِلَّهِ الْأَوَّلِ بِلَا أَوَّلٍ كَانَ قَبْلَهُ، وَالْآخِرِ بِلَا آخِرٍ يَكُونُ بَعْدَهُ، الَّذِي قَصُرَتْ عَنْ رُؤْيَتِهِ أَبْصَارُ النَّاظِرِينَ، وَعَجَزَتْ عَنْ نَعْتِهِ أَوْهَامُ الْوَاصِفِينَ.
ابْتَدَعَ بِقُدْرَتِهِ الْخَلْقَ ابْتِدَاعاً، وَاخْتَرَعَهُمْ عَلَى مَشِيَّتِهِ اخْتِرَاعاً، ثُمَّ سَلَكَ بِهِمْ طَرِيقَ إِرَادَتِهِ، وَبَعَثَهُمْ فِي سَبِيلِ مَحَبَّتِهِ.""",
                        "content_en": """Praise belongs to Allah, the First, without a first before Him, the Last, without a last after Him, whom the eyes of beholders fail to see, and whom the descriptions of describers fail to depict.
He originated creation through His power, and produced them according to His sovereign will, then caused them to walk along the path of His intention, and sent them forth on the path of His love.""",
                        "content_ur": """تمام تعریفیں اللہ کے لیے ہیں جو ایسا اول ہے جس سے پہلے کوئی اول نہ تھا، اور ایسا آخر ہے جس کے بعد کوئی آخر نہ ہوگا، جس کے دیدار سے دیکھنے والوں کی آنکھیں قاصر اور جس کی صفت بیان کرنے سے عقلیں عاجز ہیں۔
اس نے اپنی قدرتِ کاملہ سے کائنات کو تخلیق کیا اور اپنی مشیت کے مطابق مخلوقات کو پیدا فرمایا، پھر انہیں اپنے ارادے کی راہ پر چلایا اور اپنی محبت کے راستے پر روانہ کیا۔"""
                    },
                    {
                        "chapter_number": 2,
                        "title": "Dua for Parents (Righteousness & Respect)",
                        "title_ar": "الدعاء الرابع والعشرون: لأبويه عليهما السلام",
                        "title_ur": "چوبیسویں دعا: والدین کے لیے دعا و مغفرت",
                        "content_ar": """اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ وَآلِهِ الطَّاهِرِينَ، وَاخْصُصْ أَبَوَيَّ بِأَفْضَلِ مَا خَصَصْتَ بِهِ آبَاءَ عِبَادِكَ الْمُؤْمِنِينَ وَأُمَّهَاتِهِمْ، يَا أَرْحَمَ الرَّاحِمِينَ.
اللَّهُمَّ اجْعَلْنِي أَهَابُهُمَا هَيْبَةَ السُّلْطَانِ الْعَسُوفِ، وَأَبَرُّهُمَا بِرَّ الْأُمِّ الرَّءُوفِ، وَاجْعَلْ طَاعَتِي لِوَالِدَيَّ وَبِرِّي بِهِمَا أَقَرَّ لِعَيْنِي مِنْ رَقْدَةِ الْوَسْنَانِ، وَأَثْلَجَ لِصَدْرِي مِنْ شَرْبَةِ الظَّمْآنِ.""",
                        "content_en": """O Allah, bless Muhammad, Your servant and Messenger, and his pure household, and single out my parents for the best of what You have singled out for the fathers and mothers of Your faithful servants, O Most Merciful of the merciful!
O Allah, let me fear them with the awe of a powerful authority, and love them with the tenderness of an affectionate mother. Make my obedience to my parents and devotion to them more pleasing to my eyes than sleep to the drowsy, and more refreshing to my heart than cool water to the thirsty!""",
                        "content_ur": """اے اللہ! اپنے بندے اور رسول محمد ﷺ اور ان کی پاکیزہ آل پر رحمت نازل فرما، اور میرے والدین کو ان بہترین برکتوں سے نواز جو تو نے اپنے مومن بندوں کے والدین کے لیے مخصوص فرمائی ہیں، اے سب سے بڑھ کر رحم فرمانے والے!
اے اللہ! میرے دل میں ان کا احترام ایسا بنا دے جیسے کسی حاکم کا وقار ہوتا ہے، اور میرے برتاؤ کو ان کے ساتھ ایسا شفیق بنا دے جیسے مہربان ماں کا اپنے بچے کے ساتھ ہوتا ہے۔ میرے لیے والدین کی اطاعت اور ان کی خدمت کو نیند کے متلاشی کے لیے آرام سے زیادہ دلکش اور پیاسے کے لیے ٹھنڈے پانی سے زیادہ پرسکون بنا دے!"""
                    }
                ]
            },
            {
                "id": 4,
                "title": "Riyad as-Salihin (Gardens of the Righteous)",
                "title_ar": "رياض الصالحين من كلام سيد المرسلين",
                "title_ur": "ریاض الصالحین (باغِ صالحین)",
                "slug": "riyad-as-salihin",
                "description": "A comprehensive, world-renowned anthology of authentic prophetic traditions compiled by Imam an-Nawawi, organized into practical chapters covering everyday morals, family life, community welfare, and spiritual purification.",
                "author_id": 2,
                "tradition_id": 2, # Sunni
                "category_id": 6, # Ethics
                "language": "Arabic • English • Urdu",
                "publication_year": "670 AH",
                "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "total_chapters": 2,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Chapter on Patience and Steadfastness (Bab as-Sabr)",
                        "title_ar": "باب الصبر والاحتساب",
                        "title_ur": "باب الصبر: صبر و استقامت کی فضیلت",
                        "content_ar": """قَالَ اللَّهُ تَعَالَى: {يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ} [آل عمران: ٢٠٠].
وَعَنْ أَبِي مَالِكٍ الْحَارِثِ بْنِ عَاصِمٍ الْأَشْعَرِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:
«الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ - أَوْ تَمْلأُ - مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ، وَالصَّلاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ، كُلُّ النَّاسِ يَغْدُو فَبَائِعٌ نَفْسَهُ فَمُعْتِقُهَا أَوْ مُوبِقُهَا».
رَوَاهُ مُسْلِمٌ.""",
                        "content_en": """Allah the Exalted says: "O you who have believed, persevere and endure and remain stationed and fear Allah that you may be successful." (3:200).
Abu Malik al-Harith ibn Asim al-Ash'ari (may Allah be pleased with him) reported: The Messenger of Allah (peace be upon him) said:
"Purity is half of faith. Al-hamdu lillah (praise be to Allah) fills the scale. Subhan Allah and Al-hamdu lillah together fill whatever is between the heavens and the earth. Prayer is light, charity is proof, patience is illumination, and the Quran is an argument for you or against you. Every person goes out in the morning and sells himself, thereby freeing it or destroying it."
[Narrated by Muslim]""",
                        "content_ur": """اللہ تعالیٰ کا ارشاد ہے: "اے ایمان والو! صبر کرو، اور ثابت قدم رہو، اور چوکس رہو، اور اللہ سے ڈرتے رہو تاکہ تم فلاح پاؤ۔" (آل عمران: ۲۰۰)
حضرت ابو مالک اشعری رضی اللہ عنہ سے روایت ہے کہ رسول اللہ ﷺ نے فرمایا:
"پاکیزگی اور صفائی آدھا ایمان ہے۔ 'الحمد للہ' ترازو کو بھر دیتا ہے۔ 'سبحان اللہ' اور 'الحمد للہ' زمین و آسمان کے درمیان کی ساری خلا کو بھر دیتے ہیں۔ نماز روشنی ہے، صدقہ دلیل و برہان ہے، صبر ایک تابناک اجالا ہے، اور قرآن تمہارے حق میں یا تمہارے خلاف حجت ہے۔ ہر انسان صبح اٹھ کر اپنی جان کی سودا بازی کرتا ہے؛ یا تو وہ اسے اللہ کی اطاعت میں لگا کر آزاد کر لیتا ہے یا نافرمانی کر کے ہلاکت میں ڈال دیتا ہے۔"
[صحیح مسلم]"""
                    },
                    {
                        "chapter_number": 2,
                        "title": "Chapter on Sincerity in All Actions (Bab al-Ikhlas)",
                        "title_ar": "باب الإخلاص وإحضار النية",
                        "title_ur": "باب الإخلاص: تمام کاموں میں اخلاص اور نیک نیتی",
                        "content_ar": """قَالَ اللَّهُ تَعَالَى: {وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلَاةَ وَيُؤْتُوا الزَّكَاةَ ۚ وَذَٰلِكَ دِينُ الْقَيِّمَةِ} [البينة: ٥].
وَعَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ:
«إِنَّ اللَّهَ لا يَنْظُرُ إِلَى أَجْسَادِكُمْ، وَلا إِلَى صُوَرِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ».
رَوَاهُ مُسْلِمٌ.""",
                        "content_en": """Allah the Exalted says: "And they were not commanded except to worship Allah, being sincere to Him in religion, inclining to truth, and to establish prayer and to give zakah. And that is the correct religion." (98:5).
Abu Hurayrah (may Allah be pleased with him) reported: The Messenger of Allah (peace be upon him) said:
"Verily Allah does not look at your bodies nor at your appearances, but rather He looks into your hearts and your deeds."
[Narrated by Muslim]""",
                        "content_ur": """اللہ تعالیٰ کا ارشاد ہے: "اور انہیں اس کے سوا کوئی حکم نہیں دیا گیا تھا کہ وہ یکسو ہو کر صرف اللہ کے لیے دین کو خالص کرتے ہوئے اس کی عبادت کریں، نماز قائم کریں اور زکوٰۃ ادا کریں۔ اور یہی سیدھا اور سچا دین ہے۔" (البینہ: ۵)
حضرت ابو ہریرہ رضی اللہ عنہ سے روایت ہے کہ رسول اللہ ﷺ نے فرمایا:
"بے شک اللہ تعالیٰ تمہارے جسموں اور تمہاری ظاہری صورتوں کو نہیں دیکھتا، بلکہ وہ تمہارے دلوں اور تمہارے اعمال کو دیکھتا ہے۔"
[صحیح مسلم]"""
                    }
                ]
            },
            {
                "id": 5,
                "title": "Mukhtasar al-Quduri (Foundations of Hanafi Fiqh)",
                "title_ar": "مختصر القدوري في الفقه الحنفي",
                "title_ur": "مختصر القدوری (فقہِ حنفی کی بنیادی کتاب)",
                "slug": "mukhtasar-al-quduri",
                "description": "The authoritative classical primer of Hanafi jurisprudence by Imam al-Quduri, covering the legal rules of purification, prayers, transactions, and ethical obligations according to the school of Imam Abu Hanifah.",
                "author_id": 5,
                "tradition_id": 3, # Hanafi
                "category_id": 3, # Fiqh
                "language": "Arabic • English • Urdu",
                "publication_year": "428 AH",
                "cover_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "total_chapters": 1,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Kitab at-Taharah (The Book of Purification & Wudu)",
                        "title_ar": "كتاب الطهارة وأحكام الوضوء",
                        "title_ur": "کتاب الطہارۃ: وضو، غسل اور پاکیزگی کے بنیادی احکام",
                        "content_ar": """قَالَ اللَّهُ تَعَالَى: {يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ وَأَيْدِيَكُمْ إِلَى الْمَرَافِقِ وَامْسَحُوا بِرُءُوسِكُمْ وَأَرْجُلَكُمْ إِلَى الْكَعْبَيْنِ}.
فَرَائِضُ الْوُضُوءِ أَرْبَعَةٌ:
١. غَسْلُ الْوَجْهِ مِنَ الْقِصَاصِ إِلَى أَسْفَلِ الذَّقَنِ وَمَا بَيْنَ شَحْمَتَيِ الْأُذُنَيْنِ.
٢. غَسْلُ الْيَدَيْنِ مَعَ الْمِرْفَقَيْنِ.
٣. مَسْحُ رُبُعِ الرَّأْسِ.
٤. غَسْلُ الرِّجْلَيْنِ مَعَ الْكَعْبَيْنِ.""",
                        "content_en": """Allah the Exalted says: "O you who have believed, when you rise to prayer, wash your faces and your hands up to the elbows and wipe over your heads and wash your feet up to the ankles." (5:6).
The obligatory acts (Fara'id) of Wudu are four:
1. Washing the entire face from the hairline to below the chin and from earlobe to earlobe.
2. Washing both arms including the elbows.
3. Wiping over at least one-fourth of the head.
4. Washing both feet including the ankles.""",
                        "content_ur": """اللہ تعالیٰ کا ارشاد ہے: "اے ایمان والو! جب تم نماز کے لیے کھڑے ہو تو اپنے چہرے اور کہنیوں تک ہاتھ دھو لو، اور اپنے سروں کا مسح کرو اور ٹخنوں تک پاؤں دھو لو۔" (المائدہ: ۶)
وضو کے فرائض چار ہیں:
۱. پیشانی کے بالوں سے لے کر ٹھوڑی کے نیچے تک اور ایک کان کی لو سے دوسرے کان کی لو تک پورے چہرے کا دھونا۔
۲. دونوں ہاتھوں کا کہنیوں سمیت دھونا۔
۳. چوتھائی سر کا مسح کرنا۔
۴. دونوں پاؤں کا ٹخنوں سمیت دھونا۔"""
                    }
                ]
            },
            {
                "id": 6,
                "title": "Ar-Raheeq Al-Makhtum (The Sealed Nectar)",
                "title_ar": "الرحيق المختوم في سيرة النبي المأمون",
                "title_ur": "الرحیق المختوم (سیرتِ نبوی ﷺ کا شاہکار)",
                "slug": "ar-raheeq-al-makhtum",
                "description": "The award-winning, globally acclaimed biography of Prophet Muhammad ﷺ by Shaykh Safiur Rahman Mubarakpuri, capturing the vibrant historical context, noble character, and transformative mission of the final Messenger.",
                "author_id": 7,
                "tradition_id": 11, # General
                "category_id": 5, # Seerah
                "language": "Arabic • English • Urdu",
                "publication_year": "1396 AH / 1976 CE",
                "cover_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "total_chapters": 1,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "The First Divine Revelation in Cave Hira",
                        "title_ar": "مبدأ الوحي ونزول جبريل في غار حراء",
                        "title_ur": "آغازِ وحی اور غارِ حرا میں نزولِ جبریل علیہ السلام",
                        "content_ar": """لَمَّا تَمَّ لَهُ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَرْبَعُونَ سَنَةً، وَهِيَ رَأْسُ الْكَمَالِ، بَدَتْ طَلائِعُ النُّبُوَّةِ؛ فَكَانَ لا يَرَى رُؤْيَا إِلا جَاءَتْ مِثْلَ فَلَقِ الصُّبْحِ.
وَحُبِّبَ إِلَيْهِ الْخَلاءُ، فَكَانَ يَخْلُو بِغَارِ حِرَاءٍ يَتَحَنَّثُ فِيهِ اللَّيَالِيَ ذَوَاتِ الْعَدَدِ.
حَتَّى جَاءَهُ الْحَقُّ وَهُوَ فِي غَارِ حِرَاءٍ، فَجَاءَهُ الْمَلَكُ فَقَالَ: «اقْرَأْ»، قَالَ: «مَا أَنَا بِقَارِئٍ»، فَأَخَذَهُ فَغَطَّهُ حَتَّى بَلَغَ مِنْهُ الْجَهْدَ، ثُمَّ أَرْسَلَهُ فَقَالَ: {اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ}.""",
                        "content_en": """When the Prophet (peace be upon him) reached forty years of age — the peak of human maturity — the early signs of Prophethood began to manifest. He would not see a dream except that it came true as clear as the breaking of the dawn.
Solitude became beloved to him, and he would retreat to Cave Hira to worship Allah for several nights at a time.
Until the Truth came to him while he was in Cave Hira. The Angel Jibril came to him and said: "Read!" He replied: "I cannot read." The angel embraced him firmly until he could bear it no more, then released him and recited: "Read in the name of your Lord who created..." (96:1).""",
                        "content_ur": """جب رسول اللہ ﷺ کی عمرِ مبارک چالیس سال ہوئی — جو کمالِ انسانیت کا دور ہوتا ہے — تو نبوت کے آثار ظاہر ہونا شروع ہوئے۔ آپ جو بھی خواب دیکھتے وہ صبح کے اجالے کی طرح سچ ثابت ہوتا۔
آپ کو تنہائی اور خلوت نشینی محبوب ہو گئی، چنانچہ آپ مکہ مکرمہ کے قریب غارِ حرا میں تشریف لے جاتے اور کئی کئی راتیں مسلسل عبادت میں مصروف رہتے۔
یہاں تک کہ غارِ حرا میں آپ پر حق نازل ہوا۔ حضرت جبرائیل علیہ السلام تشریف لائے اور کہا: "پڑھیے!" آپ ﷺ نے فرمایا: "میں پڑھا ہوا نہیں ہوں۔" فرشتے نے آپ کو زور سے اپنے سینے سے لگایا اور پھر چھوڑ کر کہا: "پڑھیے اپنے رب کے نام سے جس نے پیدا کیا!" (العلق: ۱)"""
                    }
                ]
            }
        ]

        for b in books_data:
            book_obj = models.Book(
                id=b["id"],
                title=b["title"],
                title_ar=b["title_ar"],
                title_ur=b["title_ur"],
                slug=b["slug"],
                description=b["description"],
                author_id=b["author_id"],
                tradition_id=b["tradition_id"],
                category_id=b["category_id"],
                language=b["language"],
                publication_year=b["publication_year"],
                cover_url=b["cover_url"],
                featured=b["featured"],
                total_chapters=len(b["chapters"])
            )
            db.add(book_obj)
            db.commit()

            # Add chapters
            for chap in b["chapters"]:
                ch_obj = models.BookChapter(
                    book_id=b["id"],
                    chapter_number=chap["chapter_number"],
                    title=chap["title"],
                    title_ar=chap["title_ar"],
                    title_ur=chap["title_ur"],
                    content_ar=chap["content_ar"],
                    content_en=chap["content_en"],
                    content_ur=chap["content_ur"]
                )
                db.add(ch_obj)

            # Add source entry
            source_obj = models.BookSource(
                book_id=b["id"],
                provider="internal",
                can_host=True,
                can_download=True
            )
            db.add(source_obj)
            db.commit()

        print("Successfully seeded Islamic Books Catalog!")

    except Exception as e:
        print(f"Error seeding books catalog: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_books_catalog()
