import models
from database import SessionLocal

def seed_books_catalog():
    db = SessionLocal()
    try:
        print("Seeding/Updating Islamic Books Catalog...")

        # 1. TRADITIONS
        traditions_data = [
            {"id": 1, "name": "All Traditions", "name_ar": "جميع المذاهب", "name_ur": "تمام مکاتب فکر", "slug": "all", "parent_id": None, "sort_order": 0, "description": "Browse Islamic literature across all traditions and schools of thought."},
            {"id": 2, "name": "Sunni", "name_ar": "أهل السنة والجماعة", "name_ur": "اہل سنت و جماعت", "slug": "sunni", "parent_id": None, "sort_order": 1, "description": "Classical and contemporary Sunni scholarship across all schools."},
            {"id": 3, "name": "Hanafi", "name_ar": "المذهب الحنفي", "name_ur": "فقہ حنفی", "slug": "hanafi", "parent_id": 2, "sort_order": 2, "description": "Jurisprudence and theology founded by Imam Abu Hanifah."},
            {"id": 4, "name": "Shafi'i", "name_ar": "المذهب الشافعي", "name_ur": "فقہ شافعی", "slug": "shafii", "parent_id": 2, "sort_order": 3, "description": "Works of the Shafi'i legal school founded by Imam Muhammad ibn Idris al-Shafi'i."},
            {"id": 5, "name": "Maliki", "name_ar": "المذهب المالكي", "name_ur": "فقہ مالکی", "slug": "maliki", "parent_id": 2, "sort_order": 4, "description": "Tradition of Imam Malik ibn Anas and scholars of Madinah."},
            {"id": 6, "name": "Hanbali", "name_ar": "المذهب الحنبلي", "name_ur": "فقہ حنبلی", "slug": "hanbali", "parent_id": 2, "sort_order": 5, "description": "Jurisprudence founded by Imam Ahmad ibn Hanbal."},
            {"id": 7, "name": "Shia", "name_ar": "الشيعة الإمامية", "name_ur": "اہل تشیع", "slug": "shia", "parent_id": None, "sort_order": 6, "description": "Classical and contemporary Shia scholarship centered on the Ahl al-Bayt."},
            {"id": 8, "name": "Ja'fari", "name_ar": "المذهب الجعفري", "name_ur": "فقہ جعفری", "slug": "jafari", "parent_id": 7, "sort_order": 7, "description": "Jurisprudence and theology following Imam Ja'far al-Sadiq and the Twelve Imams."},
            {"id": 9, "name": "Ibadi", "name_ar": "المذهب الإباضي", "name_ur": "اباضی", "slug": "ibadi", "parent_id": None, "sort_order": 8, "description": "Classical scholarship of the Ibadi school of thought."},
            {"id": 10, "name": "Comparative", "name_ar": "الفقه المقارن", "name_ur": "مقارن و تحقیقی", "slug": "comparative", "parent_id": None, "sort_order": 9, "description": "Comparative jurisprudence, inter-school dialogue, and unified Islamic heritage."},
            {"id": 11, "name": "General Islamic", "name_ar": "إسلاميات عامة", "name_ur": "عمومی اسلامی", "slug": "general", "parent_id": None, "sort_order": 10, "description": "Foundational spirituality, Quranic reflections, and universally shared classics."}
        ]

        for t in traditions_data:
            existing = db.query(models.Tradition).filter(models.Tradition.id == t["id"]).first()
            if not existing:
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
            else:
                existing.name = t["name"]
                existing.name_ar = t["name_ar"]
                existing.name_ur = t["name_ur"]
                existing.slug = t["slug"]
                existing.parent_id = t["parent_id"]
                existing.sort_order = t["sort_order"]
                existing.description = t["description"]
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

        for c in categories_data:
            existing = db.query(models.Category).filter(models.Category.id == c["id"]).first()
            if not existing:
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
            else:
                existing.name = c["name"]
                existing.name_ar = c["name_ar"]
                existing.name_ur = c["name_ur"]
                existing.slug = c["slug"]
                existing.icon_name = c["icon_name"]
                existing.sort_order = c["sort_order"]
                existing.description = c["description"]
        db.commit()

        # 3. AUTHORS
        authors_data = [
            {"id": 1, "name": "Imam Ali ibn Abi Talib (compiled by Sharif al-Radi)", "name_ar": "الإمام علي بن أبي طالب (جامع: الشريف الرضي)", "name_ur": "امام علی ابن ابی طالب (جامع: شریف الرضی)", "death_year_hijri": "40 AH / 406 AH", "bio": "The Gateway of Knowledge and fourth Caliph."},
            {"id": 2, "name": "Imam Yahya ibn Sharaf al-Nawawi", "name_ar": "الإمام يحيى بن شرف النووي", "name_ur": "امام یحییٰ بن شرف النووی", "death_year_hijri": "676 AH", "bio": "Master hadith scholar and jurist."},
            {"id": 3, "name": "Imam Ali Zayn al-Abidin (al-Sajjad)", "name_ar": "الإمام علي بن الحسين زين العابدين", "name_ur": "امام علی زین العابدین علیہ السلام", "death_year_hijri": "95 AH", "bio": "Fourth Shia Imam, composer of Al-Sahifa al-Sajjadiyya and Risalat al-Huquq."},
            {"id": 4, "name": "Shaykh Muhammad ibn Ya'qub al-Kulayni", "name_ar": "الشيخ محمد بن يعقوب الكليني", "name_ur": "شیخ محمد بن یعقوب الکلینی", "death_year_hijri": "329 AH", "bio": "Premier Shia hadith compiler, author of Kitab al-Kafi."},
            {"id": 5, "name": "Imam Abu al-Husayn Ahmad al-Quduri", "name_ar": "الإمام أحمد بن محمد القدوري", "name_ur": "امام احمد بن محمد القدوری", "death_year_hijri": "428 AH", "bio": "Iraqi Hanafi jurist, author of Mukhtasar al-Quduri."},
            {"id": 6, "name": "Imam Abu Hamid al-Ghazali", "name_ar": "حجة الإسلام أبو حامد الغزالي", "name_ur": "امام ابو حامد الغزالی", "death_year_hijri": "505 AH", "bio": "Hujjat al-Islam, master of ethics, philosophy, and spirituality."},
            {"id": 7, "name": "Shaykh Safiur Rahman Mubarakpuri", "name_ar": "الشيخ صفي الرحمن المباركفوري", "name_ur": "مولانا صفی الرحمن مبارکپوری", "death_year_hijri": "1427 AH", "bio": "Award-winning biographer of the Prophet ﷺ."},
            {"id": 8, "name": "Imam Muhammad ibn Ismail al-Bukhari", "name_ar": "الإمام محمد بن إسماعيل البخاري", "name_ur": "امام محمد بن اسماعیل البخاری", "death_year_hijri": "256 AH", "bio": "Compiler of Sahih al-Bukhari, the most revered Sunni Hadith anthology."},
            {"id": 9, "name": "Imam Muslim ibn al-Hajjaj al-Naysaburi", "name_ar": "الإمام مسلم بن الحجاج النيسابوري", "name_ur": "امام مسلم بن الحجاج النیسابوری", "death_year_hijri": "261 AH", "bio": "Compiler of Sahih Muslim, famous for thematic hadith arrangement."},
            {"id": 10, "name": "Imam Abu Hanifah an-Nu'man", "name_ar": "الإمام الأعظم أبو حنيفة النعمان", "name_ur": "امام اعظم ابو حنیفہ", "death_year_hijri": "150 AH", "bio": "Founder of the Hanafi school of jurisprudence."},
            {"id": 11, "name": "Imam Malik ibn Anas", "name_ar": "إمام دار الهجرة مالك بن أنس", "name_ur": "امام مالک بن انس", "death_year_hijri": "179 AH", "bio": "Imam of Madinah and author of Al-Muwatta."},
            {"id": 12, "name": "Imam Muhammad ibn Idris al-Shafi'i", "name_ar": "الإمام محمد بن إدريس الشافعي", "name_ur": "امام محمد بن ادریس الشافعی", "death_year_hijri": "204 AH", "bio": "Founder of the Shafi'i legal school and father of Usul al-Fiqh."},
            {"id": 13, "name": "Imam Ahmad ibn Hanbal", "name_ar": "الإمام أحمد بن حنبل", "name_ur": "امام احمد بن حنبل", "death_year_hijri": "241 AH", "bio": "Imam of Ahl al-Sunnah, compiler of Musnad Ahmad and Kitab az-Zuhd."},
            {"id": 14, "name": "Shaykh al-Saduq (Muhammad ibn Ali ibn Babawayh)", "name_ar": "الشيخ الصدوق ابن بابويه القمي", "name_ur": "شیخ صدوق ابن بابویہ قمی", "death_year_hijri": "381 AH", "bio": "Great classical Shia scholar and compiler of Man La Yahduruhu al-Faqih and Al-Khisal."},
            {"id": 15, "name": "Mawlana Ashraf Ali Thanvi", "name_ar": "الشيخ أشرف علي التهانوي", "name_ur": "مولانا اشرف علی تھانوی", "death_year_hijri": "1362 AH", "bio": "Prominent South Asian Hanafi jurist and author of Bihashti Zewar."}
        ]

        for a in authors_data:
            existing = db.query(models.Author).filter(models.Author.id == a["id"]).first()
            if not existing:
                obj = models.Author(
                    id=a["id"],
                    name=a["name"],
                    name_ar=a["name_ar"],
                    name_ur=a["name_ur"],
                    death_year_hijri=a["death_year_hijri"],
                    bio=a["bio"]
                )
                db.add(obj)
            else:
                existing.name = a["name"]
                existing.name_ar = a["name_ar"]
                existing.name_ur = a["name_ur"]
                existing.death_year_hijri = a["death_year_hijri"]
                existing.bio = a["bio"]
        db.commit()

        # 4. COMPREHENSIVE SEEDED BOOKS ACROSS TRADITIONS
        books_data = [
            # ----- SHIA TRADITION -----
            {
                "id": 1,
                "title": "Nahj al-Balagha (Peak of Eloquence)",
                "title_ar": "نهج البلاغة",
                "title_ur": "نہج البلاغہ",
                "slug": "nahj-al-balagha",
                "description": "The celebrated collection of sermons, letters, and wisdoms of Imam Ali ibn Abi Talib on spiritual purification, statecraft, and divine justice.",
                "author_id": 1,
                "tradition_id": 7, # Shia
                "category_id": 8, # Ahl al-Bayt
                "language": "Arabic • English • Urdu",
                "publication_year": "400 AH",
                "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Khutbah al-Muttaqin (The Sermon on the Pious)",
                        "title_ar": "خطبة المتقين (همام)",
                        "title_ur": "خطبہ متقین (پرہیزگاروں کے اوصاف)",
                        "content_ar": "أَمَّا بَعْدُ، فَإِنَّ اللَّهَ سُبْحَانَهُ خَلَقَ الْخَلْقَ غَنِيّاً عَنْ طَاعَتِهِمْ، آمِناً مِنْ مَعْصِيَتِهِمْ. فَالْمُتَّقُونَ فِيهَا هُمْ أَهْلُ الْفَضَائِلِ: مَنْطِقُهُمُ الصَّوَابُ، وَمَلْبَسُهُمُ الِاقْتِصَادُ، وَمَشْيُهُمُ التَّوَاضُعُ.",
                        "content_en": "Now then, Allah the Glorified created creation without any need for their obedience. The God-conscious (Muttaqun) in this world are people of virtue: their speech is truthful, their dress modest, and their walk humble.",
                        "content_ur": "اما بعد! اللہ سبحانہ و تعالیٰ نے مخلوق کو پیدا کیا جبکہ وہ ان کی اطاعت سے بے نیاز تھا۔ دنیا میں متقی لوگ ہی فضیلت والے ہیں: ان کی گفتگو سچی، ان کا لباس میانہ اور ان کی چال عاجزانہ ہے۔"
                    },
                    {
                        "chapter_number": 2,
                        "title": "Letter to Malik al-Ashtar on Justice & Governance",
                        "title_ar": "عهده لمالك الأشتر في العدل والإنصاف",
                        "title_ur": "مالک اشتر کے نام تاریخی عہد نامہ و اصولِ حکمرانی",
                        "content_ar": "وَأَشْعِرْ قَلْبَكَ الرَّحْمَةَ لِلرَّعِيَّةِ، وَالْمَحَبَّةَ لَهُمْ، فَإِنَّهُمْ صِنْفَانِ: إِمَّا أَخٌ لَكَ فِي الدِّينِ، وَإِمَّا نَظِيرٌ لَكَ فِي الْخَلْقِ.",
                        "content_en": "Habituate your heart to mercy for the subjects and kindness for them, for they are of two kinds: either your brother in religion, or your equal in creation.",
                        "content_ur": "اپنے دل میں رعایا کے لیے رحمت اور محبت کا جذبہ رکھو، کیونکہ انسان دو ہی طرح کے ہیں: یا تو وہ دین میں تمہارے بھائی ہیں یا خلقت میں تمہارے جیسے انسان ہیں۔"
                    }
                ]
            },
            {
                "id": 3,
                "title": "Al-Sahifa al-Sajjadiyya (Psalms of Islam)",
                "title_ar": "الصحيفة السجادية الكاملة",
                "title_ur": "صحیفہ سجادیہ (زبورِ آلِ محمد)",
                "slug": "sahifa-sajjadiyya",
                "description": "Sublime supplications, whispered prayers, and spiritual meditations composed by Imam Ali ibn al-Husayn Zayn al-Abidin.",
                "author_id": 3,
                "tradition_id": 7, # Shia
                "category_id": 7, # Spirituality & Duas
                "language": "Arabic • English • Urdu",
                "publication_year": "95 AH",
                "cover_url": "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Dua in Praise of Allah Almighty",
                        "title_ar": "الدعاء الأول: في التحميد لله عز وجل",
                        "title_ur": "پہلی دعا: اللہ تعالیٰ کی حمد و ثناء",
                        "content_ar": "الْحَمْدُ لِلَّهِ الْأَوَّلِ بِلَا أَوَّلٍ كَانَ قَبْلَهُ، وَالْآخِرِ بِلَا آخِرٍ يَكُونُ بَعْدَهُ، الَّذِي قَصُرَتْ عَنْ رُؤْيَتِهِ أَبْصَارُ النَّاظِرِينَ.",
                        "content_en": "Praise belongs to Allah, the First without a first before Him, the Last without a last after Him, whom the eyes of beholders fail to encompass.",
                        "content_ur": "تمام تعریفیں اللہ کے لیے ہیں جو ایسا اول ہے جس سے پہلے کوئی اول نہ تھا، اور ایسا آخر ہے جس کے بعد کوئی آخر نہیں۔"
                    },
                    {
                        "chapter_number": 2,
                        "title": "Dua for Parents (Righteousness & Devotion)",
                        "title_ar": "الدعاء الرابع والعشرون: لأبويه عليهما السلام",
                        "title_ur": "چوبیسویں دعا: والدین کے لیے دعا و مغفرت",
                        "content_ar": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِهِ، وَاخْصُصْ أَبَوَيَّ بِأَفْضَلِ مَا خَصَصْتَ بِهِ آبَاءَ عِبَادِكَ الْمُؤْمِنِينَ، يَا أَرْحَمَ الرَّاحِمِينَ.",
                        "content_en": "O Allah, bless Muhammad and his household, and single out my parents for the best blessings You have granted to the parents of the faithful!",
                        "content_ur": "اے اللہ! محمد ﷺ اور ان کی آل پر رحمت نازل فرما اور میرے والدین کو ان بہترین برکتوں سے نواز جو تو نے مومنین کے والدین کے لیے رکھی ہیں۔"
                    }
                ]
            },
            {
                "id": 7,
                "title": "Risalat al-Huquq (The Treatise on Rights)",
                "title_ar": "رسالة الحقوق للإمام السجاد",
                "title_ur": "رسالۃ الحقوق (حقوق کا عظیم منشور)",
                "slug": "risalat-al-huquq",
                "description": "Imam Zayn al-Abidin's comprehensive ethical framework outlining 50 fundamental rights: rights of God, rights of oneself, family, teachers, neighbors, and society.",
                "author_id": 3,
                "tradition_id": 8, # Ja'fari
                "category_id": 6, # Ethics
                "language": "Arabic • English • Urdu",
                "publication_year": "90 AH",
                "cover_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "The Greatest Right: Rights of Allah & Self",
                        "title_ar": "حق الله الأكبر وحق النفس والجوارح",
                        "title_ur": "اللہ تعالیٰ کا سب سے بڑا حق اور اپنے اعضاء کے حقوق",
                        "content_ar": "فَأَمَّا حَقُّ اللَّهِ الْأَكْبَرُ فَأَنْ تَعْبُدَهُ لَا تُشْرِكُ بِهِ شَيْئاً. وَأَمَّا حَقُّ نَفْسِكَ عَلَيْكَ فَأَنْ تَسْتَعْمِلَهَا فِي طَاعَةِ اللَّهِ. وَحَقُّ اللِّسَانِ إِكْرَامُهُ عَنِ الْخَنَى، وَتَعْوِيدُهُ عَلَى الْخَيْرِ.",
                        "content_en": "The greatest right of Allah is that you worship Him without associating any partner with Him. The right of your self is that you employ it in obedience to Allah. The right of the tongue is to deem it noble above vulgarity and habituate it to speaking good.",
                        "content_ur": "اللہ کا سب سے بڑا حق یہ ہے کہ تم اسی کی عبادت کرو اور کسی کو اس کا شریک نہ ٹھہراؤ۔ تمہاری جان کا تم پر یہ حق ہے کہ تم اسے اللہ کی اطاعت میں لگاؤ، اور زبان کا حق یہ ہے کہ اسے بیہودہ باتوں سے پاک رکھو اور بھلائی کا عادی بناؤ۔"
                    }
                ]
            },
            {
                "id": 8,
                "title": "Kitab al-Kafi (Selections from Usul al-Kafi)",
                "title_ar": "أصول الكافي - كتاب العقل والجهل وفضل العلم",
                "title_ur": "اصولِ کافی (کتاب العقل والجہل و فضیلتِ علم)",
                "slug": "usul-al-kafi",
                "description": "Foundational narrations compiled by Shaykh al-Kulayni on the primacy of intellect, theology, divine guidance, and virtues of seeking knowledge.",
                "author_id": 4,
                "tradition_id": 7, # Shia
                "category_id": 2, # Hadith
                "language": "Arabic • English • Urdu",
                "publication_year": "329 AH",
                "cover_url": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "The Book of Intellect and Ignorance (Kitab al-Aql)",
                        "title_ar": "كتاب العقل والجهل",
                        "title_ur": "کتاب العقل و الجہل (عقل و دانائی کی فضیلت)",
                        "content_ar": "عَنْ أَبِي جَعْفَرٍ الْبَاقِرِ عَلَيْهِ السَّلَامُ قَالَ: لَمَّا خَلَقَ اللَّهُ الْعَقْلَ اسْتَنْطَقَهُ ثُمَّ قَالَ لَهُ: أَقْبِلْ فَأَقْبَلَ، ثُمَّ قَالَ لَهُ: أَدْبِرْ فَأَدْبَرَ، ثُمَّ قَالَ: وَعِزَّتِي وَجَلَالِي مَا خَلَقْتُ خَلْقاً هُوَ أَحَبُّ إِلَيَّ مِنْكَ، بِكَ آخُذُ وَبِكَ أُعْطِي.",
                        "content_en": "Imam Muhammad al-Baqir (peace be upon him) said: When Allah created the Intellect, He tested it and said: 'Advance', so it advanced; then He said: 'Retreat', so it retreated. Then Allah said: 'By My Might and Majesty, I have created no creation more beloved to Me than you. Through you I reward and through you I hold accountable.'",
                        "content_ur": "امام محمد باقر علیہ السلام سے روایت ہے کہ جب اللہ تعالیٰ نے عقل کو پیدا کیا تو اس سے فرمایا: 'آگے آؤ' تو وہ آگے آئی، پھر فرمایا: 'پیچھے ہٹو' تو وہ پیچھے ہٹی۔ تب اللہ نے فرمایا: 'میری عزت و جلال کی قسم! میں نے تجھ سے زیادہ پیاری کوئی مخلوق پیدا نہیں کی، تیرے ہی ذریعے میں جزا دوں گا اور تیرے ہی ذریعے محاسبہ کروں گا۔'"
                    }
                ]
            },
            {
                "id": 9,
                "title": "Al-Khisal (The Book of Pious Characteristics)",
                "title_ar": "الخصال للشيخ الصدوق",
                "title_ur": "الخصال (عمدہ عادات اور اخلاقی خصائل)",
                "slug": "al-khisal",
                "description": "Shaykh al-Saduq's ethical compendium classifying virtues and moral guidance through numbered sets of prophetic and Ahl al-Bayt traditions.",
                "author_id": 14,
                "tradition_id": 8, # Ja'fari
                "category_id": 6, # Ethics
                "language": "Arabic • English • Urdu",
                "publication_year": "381 AH",
                "cover_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Three Noble Traits Beloved to Allah",
                        "title_ar": "باب الثلاثة: ثلاث خصال من خصال الإيمان",
                        "title_ur": "تین خصلتیں جو ایمان کا کمال ہیں",
                        "content_ar": "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَآلِهِ: ثَلَاثٌ مَنْ كُنَّ فِيهِ اسْتَكْمَلَ خِصَالَ الْإِيمَانِ: إِذَا رَضِيَ لَمْ يُدْخِلْهُ رِضَاهُ فِي بَاطِلٍ، وَإِذَا غَضِبَ لَمْ يُخْرِجْهُ غَضَبُهُ مِنَ الْحَقِّ، وَإِذَا قَدَرَ لَمْ يَتَعَاطَ مَا لَيْسَ لَهُ.",
                        "content_en": "The Messenger of Allah ﷺ said: Three traits complete one's faith: when pleased, pleasure does not lead him into falsehood; when angry, anger does not lead him away from the truth; and when having power, he does not take what is not his.",
                        "content_ur": "رسول اللہ ﷺ نے فرمایا: تین خصلتیں جس میں ہوں اس کا ایمان مکمل ہے: جب خوش ہو تو خوشی اسے باطل میں نہ لے جائے، جب غصے میں ہو تو غصہ اسے حق سے نہ ہٹائے، اور جب قدرت و اختیار پائے تو ناحق چیز پر ہاتھ نہ ڈالے۔"
                    }
                ]
            },

            # ----- SUNNI TRADITION (Hanafi, Shafi'i, Maliki, Hanbali, General Sunni) -----
            {
                "id": 2,
                "title": "Al-Arba'in an-Nawawiyya (40 Hadith of Nawawi)",
                "title_ar": "الأربعون النووية",
                "title_ur": "چالیس احادیثِ نبوی (اربعین نووی)",
                "slug": "arbaeen-nawawi",
                "description": "The quintessential collection of 42 core prophetic traditions compiled by Imam an-Nawawi summarizing the fundamental legal and moral pillars of Islam.",
                "author_id": 2,
                "tradition_id": 2, # Sunni
                "category_id": 2, # Hadith
                "language": "Arabic • English • Urdu",
                "publication_year": "676 AH",
                "cover_url": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Hadith 1: Actions are Judged by Intentions",
                        "title_ar": "الحديث الأول: إنما الأعمال بالنيات",
                        "title_ur": "حدیث ۱: اعمال کا دارومدار نیتوں پر ہے",
                        "content_ar": "«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ».",
                        "content_en": "Actions are only by intentions, and every person shall have only that which he intended. Thus, he whose migration was for Allah and His Messenger, his migration was for Allah and His Messenger.",
                        "content_ur": "اعمال کا دارومدار نیتوں پر ہے اور ہر انسان کو وہی ملے گا جس کی اس نے نیت کی۔ پس جس کی ہجرت اللہ اور اس کے رسول کے لیے ہو تو اس کی ہجرت اللہ اور اس کے رسول ہی کے لیے ہے۔"
                    },
                    {
                        "chapter_number": 2,
                        "title": "Hadith 2: Islam, Iman, and Ihsan (Hadith Jibril)",
                        "title_ar": "الحديث الثاني: مراتب الدين - حديث جبريل",
                        "title_ur": "حدیث ۲: دین کے مراتب - اسلام، ایمان اور احسان",
                        "content_ar": "قَالَ: فَأَخْبِرْنِي عَنِ الإِحْسَانِ؟ قَالَ: «أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ».",
                        "content_en": "He said: 'Tell me about Ihsan.' The Prophet replied: 'It is to worship Allah as though you see Him, and if you cannot see Him, then truly He sees you.'",
                        "content_ur": "اس نے کہا: 'مجھے احسان کے بارے میں بتائیے۔' آپ ﷺ نے فرمایا: 'تم اللہ کی عبادت اس طرح کرو گویا تم اسے دیکھ رہے ہو، اور اگر تم اسے نہیں دیکھ رہے تو وہ تمہیں دیکھ رہا ہے۔'"
                    }
                ]
            },
            {
                "id": 4,
                "title": "Riyad as-Salihin (Gardens of the Righteous)",
                "title_ar": "رياض الصالحين من كلام سيد المرسلين",
                "title_ur": "ریاض الصالحین (باغِ صالحین)",
                "slug": "riyad-as-salihin",
                "description": "An essential anthology of prophetic hadiths organized by practical moral chapters: sincerity, patience, piety, truthfulness, and family ethics.",
                "author_id": 2,
                "tradition_id": 2, # Sunni
                "category_id": 6, # Ethics
                "language": "Arabic • English • Urdu",
                "publication_year": "670 AH",
                "cover_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Chapter on Patience and Steadfastness (Bab as-Sabr)",
                        "title_ar": "باب الصبر والاحتساب",
                        "title_ur": "باب الصبر: صبر و استقامت کی فضیلت",
                        "content_ar": "«الصَّلاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ، وَالْقُرْآنُ حُجَّةٌ لَكَ أَوْ عَلَيْكَ».",
                        "content_en": "Prayer is light, charity is proof, patience is illumination, and the Quran is an argument for you or against you.",
                        "content_ur": "نماز روشنی ہے، صدقہ دلیل ہے، صبر ایک تابناک اجالا ہے، اور قرآن تمہارے حق میں یا تمہارے خلاف حجت ہے۔"
                    }
                ]
            },
            {
                "id": 5,
                "title": "Mukhtasar al-Quduri (Hanafi Fiqh Primer)",
                "title_ar": "مختصر القدوري في الفقه الحنفي",
                "title_ur": "مختصر القدوری (فقہِ حنفی کی مستند کتاب)",
                "slug": "mukhtasar-al-quduri",
                "description": "The classical, foundational primer of Hanafi jurisprudence by Imam al-Quduri, covering ritual purification, prayer timings, and legal rulings.",
                "author_id": 5,
                "tradition_id": 3, # Hanafi
                "category_id": 3, # Fiqh
                "language": "Arabic • English • Urdu",
                "publication_year": "428 AH",
                "cover_url": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Kitab at-Taharah (Purification & Wudu Rulings)",
                        "title_ar": "كتاب الطهارة وأحكام الوضوء",
                        "title_ur": "کتاب الطہارۃ: وضو اور پاکیزگی کے فرائض و سنن",
                        "content_ar": "فَرَائِضُ الْوُضُوءِ أَرْبَعَةٌ: غَسْلُ الْوَجْهِ، وَغَسْلُ الْيَدَيْنِ مَعَ الْمِرْفَقَيْنِ، وَمَسْحُ رُبُعِ الرَّأْسِ، وَغَسْلُ الرِّجْلَيْنِ مَعَ الْكَعْبَيْنِ.",
                        "content_en": "The obligatory acts (Fara'id) of Wudu are four: washing the face, washing both arms including the elbows, wiping over one-fourth of the head, and washing both feet including the ankles.",
                        "content_ur": "وضو کے چار فرائض ہیں: چہرہ دھونا، کہنیوں سمیت دونوں ہاتھ دھونا، چوتھائی سر کا مسح کرنا، اور ٹخنوں سمیت دونوں پاؤں دھونا۔"
                    }
                ]
            },
            {
                "id": 10,
                "title": "Al-Fiqh al-Akbar (Foundations of Islamic Belief)",
                "title_ar": "الفقه الأكبر للإمام أبي حنيفة",
                "title_ur": "الفقہ الاکبر (امام اعظم ابو حنیفہ کی کتاب العقائد)",
                "slug": "al-fiqh-al-akbar",
                "description": "Imam Abu Hanifah's seminal theological treatise defining the Sunni Hanafi creed on Tawhid, Divine Attributes, Destiny, and Faith.",
                "author_id": 10,
                "tradition_id": 3, # Hanafi
                "category_id": 4, # Aqeedah
                "language": "Arabic • English • Urdu",
                "publication_year": "150 AH",
                "cover_url": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Oneness of God and Divine Attributes",
                        "title_ar": "أصل التوحيد وما يجب اعتقاده",
                        "title_ur": "توحیدِ باری تعالیٰ اور صفاتِ الٰہیہ کا بیان",
                        "content_ar": "وَاللَّهُ تَعَالَى وَاحِدٌ لَا مِنْ طَرِيقِ الْعَدَدِ وَلَكِنْ مِنْ طَرِيقِ أَنَّهُ لَا شَرِيكَ لَهُ، لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُواً أَحَدٌ.",
                        "content_en": "Allah the Exalted is One, not in terms of number, but in the sense that He has no partner. He neither begets nor is born, and nor is there to Him any equivalent.",
                        "content_ur": "اللہ تعالیٰ ایک ہے، نہ کہ عددی لحاظ سے بلکہ اس لحاظ سے کہ اس کا کوئی شریک نہیں، نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے اور نہ کوئی اس کا ہمسر ہے۔"
                    }
                ]
            },
            {
                "id": 11,
                "title": "Al-Muwatta of Imam Malik",
                "title_ar": "الموطأ لإمام دار الهجرة مالك بن أنس",
                "title_ur": "موطا امام مالک (اہلِ مدینہ کا فقہی و حدیثی ذخیرہ)",
                "slug": "al-muwatta-malik",
                "description": "The earliest extant legal and hadith compilation from the scholars of Madinah, compiled by Imam Malik ibn Anas.",
                "author_id": 11,
                "tradition_id": 5, # Maliki
                "category_id": 3, # Fiqh
                "language": "Arabic • English • Urdu",
                "publication_year": "179 AH",
                "cover_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Book of Prayer Timings and Congregations",
                        "title_ar": "وقوت الصلاة وما جاء في فضلها",
                        "title_ur": "نماز کے اوقات اور باجماعت ادائیگی کی فضیلت",
                        "content_ar": "عَنْ يَحْيَى بْنِ سَعِيدٍ أَنَّ عُمَرَ بْنَ عَبْدِ الْعَزِيزِ أَخَّرَ الصَّلَاةَ يَوْماً، فَدَخَلَ عَلَيْهِ عُرْوَةُ بْنُ الزُّبَيْرِ فَأَخْبَرَهُ أَنَّ الْمُغِيرَةَ بْنَ شُعْبَةَ كَانَ يُؤَخِّرُ الصَّلَاةَ فَقَالَ لَهُ أَبُو مَسْعُودٍ الْأَنْصَارِيُّ: أَلَمْ تَعْلَمْ أَنَّ جِبْرِيلَ نَزَلَ فَصَلَّى فَصَلَّى رَسُولُ اللَّهِ ﷺ.",
                        "content_en": "Yahya ibn Sa'id reported that the Angel Jibril descended and demonstrated the precise prayer timings to the Messenger of Allah ﷺ.",
                        "content_ur": "حضرت جبرائیل علیہ السلام نے نازل ہو کر رسول اللہ ﷺ کو نمازوں کے وقت اور ان کی ادائیگی کا طریقہ سکھایا۔"
                    }
                ]
            },
            {
                "id": 12,
                "title": "Bihashti Zewar (Heavenly Ornaments)",
                "title_ar": "بهشتي زيور في الفقه الحنفي",
                "title_ur": "بہشتی زیور (احکام و مسائلِ شریعت)",
                "slug": "bihashti-zewar",
                "description": "Mawlana Ashraf Ali Thanvi's widely read encyclopedic manual of Hanafi everyday fiqh, family relations, hygiene, and ethical guidelines.",
                "author_id": 15,
                "tradition_id": 3, # Hanafi
                "category_id": 3, # Fiqh
                "language": "Urdu • English • Arabic",
                "publication_year": "1325 AH",
                "cover_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
                "featured": False,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Foundational Faith & Daily Obligations",
                        "title_ar": "العقائد الأساسية والواجبات اليومية",
                        "title_ur": "ایمانیات کے بنیادی عقائد اور روزمرہ فرائض",
                        "content_ar": "يَجِبُ عَلَى كُلِّ مُسْلِمٍ وَمُسْلِمَةٍ مَعْرِفَةُ أَرْكَانِ الْإِيمَانِ وَفَرَائِضِ الصَّلَاةِ وَالطَّهَارَةِ.",
                        "content_en": "It is essential for every Muslim to understand the pillars of belief and the obligatory acts of prayer, cleanliness, and daily worship.",
                        "content_ur": "ہر مسلمان پر لازم ہے کہ وہ اپنے دین کے بنیادی عقائد، نماز کے فرائض اور طہارت کے صحیح مسائل کو اچھی طرح سمجھے۔"
                    }
                ]
            },

            # ----- GENERAL ISLAMIC & SEERAH / ETHICS -----
            {
                "id": 6,
                "title": "Ar-Raheeq Al-Makhtum (The Sealed Nectar)",
                "title_ar": "الرحيق المختوم في سيرة النبي المأمون",
                "title_ur": "الرحیق المختوم (سیرتِ نبوی ﷺ کا مستند شاہکار)",
                "slug": "ar-raheeq-al-makhtum",
                "description": "The award-winning, globally acclaimed biography of Prophet Muhammad ﷺ by Shaykh Safiur Rahman Mubarakpuri.",
                "author_id": 7,
                "tradition_id": 11, # General Islamic
                "category_id": 5, # Seerah
                "language": "Arabic • English • Urdu",
                "publication_year": "1396 AH",
                "cover_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "The First Divine Revelation in Cave Hira",
                        "title_ar": "مبدأ الوحي ونزول جبريل في غار حراء",
                        "title_ur": "آغازِ وحی اور غارِ حرا میں نزولِ جبریل علیہ السلام",
                        "content_ar": "حَتَّى جَاءَهُ الْحَقُّ وَهُوَ فِي غَارِ حِرَاءٍ، فَجَاءَهُ الْمَلَكُ فَقَالَ: «اقْرَأْ»، قَالَ: «مَا أَنَا بِقَارِئٍ»، فَقَالَ: {اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ}.",
                        "content_en": "Until the Truth came to him in Cave Hira. The Angel Jibril came and said: 'Read!' He replied: 'I cannot read.' Then the angel recited: 'Read in the name of your Lord who created...'",
                        "content_ur": "یہاں تک کہ غارِ حرا میں آپ پر حق نازل ہوا۔ حضرت جبرائیل علیہ السلام نے آ کر کہا: 'پڑھیے!' آپ ﷺ نے فرمایا: 'میں پڑھا ہوا نہیں ہوں۔' فرشتے نے کہا: 'پڑھیے اپنے رب کے نام سے جس نے پیدا کیا!'"
                    }
                ]
            },
            {
                "id": 13,
                "title": "Bidayat al-Hidayah (The Beginning of Guidance)",
                "title_ar": "بداية الهداية لحجة الإسلام الغزالي",
                "title_ur": "ہدایت کا آغاز (امام غزالی کی خود سازی کی رہنمائی)",
                "slug": "bidayat-al-hidayah",
                "description": "Imam al-Ghazali's practical manual of spiritual discipline, daily routine from dawn till dusk, and guarding the senses from sin.",
                "author_id": 6,
                "tradition_id": 11, # General Islamic
                "category_id": 6, # Ethics
                "language": "Arabic • English • Urdu",
                "publication_year": "500 AH",
                "cover_url": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80",
                "featured": True,
                "chapters": [
                    {
                        "chapter_number": 1,
                        "title": "Daily Etiquette from Awakening till Dawn",
                        "title_ar": "آداب الاستيقاظ من النوم إلى صلاة الفجر",
                        "title_ur": "بیدار ہونے سے فجر کی نماز تک کے آداب و دعائیں",
                        "content_ar": "إِذَا اسْتَيْقَظْتَ مِنَ النَّوْمِ فَاجْتَهِدْ أَنْ تَبْتَدِئَ بِذِكْرِ اللَّهِ تَعَالَى وَقُلْ: الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
                        "content_en": "When you awaken from sleep, strive to begin with the remembrance of Allah and say: 'Praise be to Allah who gave us life after having caused us to die, and unto Him is the resurrection.'",
                        "content_ur": "جب تم نیند سے بیدار ہو تو کوشش کرو کہ تمہارا آغاز اللہ کے ذکر سے ہو اور یہ دعا پڑھو: 'سب تعریفیں اللہ کے لیے ہیں جس نے ہمیں موت کے بعد زندگی دی اور اسی کی طرف لوٹنا ہے۔'"
                    }
                ]
            }
        ]

        for b in books_data:
            existing_book = db.query(models.Book).filter(models.Book.id == b["id"]).first()
            if not existing_book:
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
            else:
                existing_book.title = b["title"]
                existing_book.title_ar = b["title_ar"]
                existing_book.title_ur = b["title_ur"]
                existing_book.slug = b["slug"]
                existing_book.description = b["description"]
                existing_book.author_id = b["author_id"]
                existing_book.tradition_id = b["tradition_id"]
                existing_book.category_id = b["category_id"]
                existing_book.language = b["language"]
                existing_book.publication_year = b["publication_year"]
                existing_book.cover_url = b["cover_url"]
                existing_book.featured = b["featured"]
                existing_book.total_chapters = len(b["chapters"])
                db.commit()

            # Clean and re-seed chapters
            db.query(models.BookChapter).filter(models.BookChapter.book_id == b["id"]).delete()
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

            # Ensure source
            if not db.query(models.BookSource).filter(models.BookSource.book_id == b["id"]).first():
                source_obj = models.BookSource(
                    book_id=b["id"],
                    provider="internal",
                    can_host=True,
                    can_download=True
                )
                db.add(source_obj)
            db.commit()

        print("Successfully seeded all Islamic Books across Traditions!")

    except Exception as e:
        print(f"Error seeding books catalog: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_books_catalog()
