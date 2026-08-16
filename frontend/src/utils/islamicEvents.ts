export interface IslamicEvent {
  day: number;
  month: number; // 1-12
  monthNameEn: string;
  monthNameAr: string;
  title: string;
  titleAr?: string;
  titleUr?: string;
  description: string;
  category: 'eid' | 'fast' | 'wiladat' | 'shahadat' | 'milestone' | 'general';
}

export const ISLAMIC_MONTHS = [
  { number: 1, nameEn: 'Muharram', nameAr: 'المحرم', days: 30 },
  { number: 2, nameEn: 'Safar', nameAr: 'صفر', days: 29 },
  { number: 3, nameEn: "Rabi' al-Awwal", nameAr: 'ربيع الأول', days: 30 },
  { number: 4, nameEn: "Rabi' al-Thani", nameAr: 'ربيع الثاني', days: 29 },
  { number: 5, nameEn: 'Jumada al-Awwal', nameAr: 'جمادى الأولى', days: 30 },
  { number: 6, nameEn: 'Jumada al-Thani', nameAr: 'جمادى الثانية', days: 29 },
  { number: 7, nameEn: 'Rajab', nameAr: 'رجب', days: 30 },
  { number: 8, nameEn: "Sha'ban", nameAr: 'شعبان', days: 29 },
  { number: 9, nameEn: 'Ramadan', nameAr: 'رمضان', days: 30 },
  { number: 10, nameEn: 'Shawwal', nameAr: 'شوال', days: 29 },
  { number: 11, nameEn: "Dhu al-Qi'dah", nameAr: 'ذو القعدة', days: 30 },
  { number: 12, nameEn: 'Dhu al-Hijjah', nameAr: 'ذو الحجة', days: 30 },
];

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  // 1. Muharram
  { day: 1, month: 1, monthNameEn: 'Muharram', monthNameAr: 'المحرم', title: 'Islamic New Year', titleAr: 'رأس السنة الهجرية', titleUr: 'آغازِ نیا اسلامی سال', description: 'Beginning of the new Hijri lunar calendar year.', category: 'milestone' },
  { day: 9, month: 1, monthNameEn: 'Muharram', monthNameAr: 'المحرم', title: 'Tasu’a (Eve of Ashura)', titleAr: 'تاسوعاء', titleUr: 'تاسوعہ', description: 'Day of devotion and preparation for Ashura.', category: 'fast' },
  { day: 10, month: 1, monthNameEn: 'Muharram', monthNameAr: 'المحرم', title: 'Day of Ashura (Martyrdom of Imam Hussain)', titleAr: 'يوم عاشوراء', titleUr: 'یومِ عاشوراء (شہادتِ امام حسینؑ)', description: 'Historic day of reflection, deliverance of Prophet Musa, and the martyrdom of Imam Hussain (AS) and his companions at Karbala.', category: 'shahadat' },
  { day: 25, month: 1, monthNameEn: 'Muharram', monthNameAr: 'المحرم', title: 'Martyrdom of Imam Zayn al-Abidin', titleAr: 'استشهاد الإمام زين العابدين', titleUr: 'شہادت امام زین العابدینؑ', description: 'Commemoration of the 4th Shia Imam and composer of Al-Sahifa al-Sajjadiyya.', category: 'shahadat' },

  // 2. Safar
  { day: 7, month: 2, monthNameEn: 'Safar', monthNameAr: 'صفر', title: 'Birth of Imam Musa al-Kadhim', titleAr: 'ولادة الإمام موسى الكاظم', titleUr: 'ولادت امام موسیٰ کاظمؑ', description: 'Commemoration of the 7th Shia Imam.', category: 'wiladat' },
  { day: 20, month: 2, monthNameEn: 'Safar', monthNameAr: 'صفر', title: 'Arbaeen of Imam Hussain', titleAr: 'أربعين الإمام الحسين', titleUr: 'چہلم امام حسینؑ (اربعین)', description: 'The 40th day commemoration of the Martyrs of Karbala, marked by the world’s largest peaceful pilgrimage.', category: 'shahadat' },
  { day: 28, month: 2, monthNameEn: 'Safar', monthNameAr: 'صفر', title: 'Demise of Prophet Muhammad ﷺ & Martyrdom of Imam Hasan', titleAr: 'وفاة النبي ﷺ وشهادة الإمام الحسن', titleUr: 'وفاتِ رسول اکرم ﷺ و شہادت امام حسن مجتبیٰؑ', description: 'Passing of the Holy Prophet Muhammad ﷺ and martyrdom of Imam Hasan al-Mujtaba (AS).', category: 'shahadat' },

  // 3. Rabi' al-Awwal
  { day: 1, month: 3, monthNameEn: "Rabi' al-Awwal", monthNameAr: 'ربيع الأول', title: 'Hijrah of Prophet Muhammad ﷺ (Laylat al-Mabit)', titleAr: 'هجرة النبي الأكرم ﷺ وليلة المبيت', titleUr: 'ہجرتِ نبوی و لیلۃ المبیت', description: 'Night of sacrifice when Imam Ali (AS) slept in the Prophet’s bed as the Prophet migrated to Madinah.', category: 'milestone' },
  { day: 8, month: 3, monthNameEn: "Rabi' al-Awwal", monthNameAr: 'ربيع الأول', title: 'Martyrdom of Imam Hasan al-Askari', titleAr: 'استشهاد الإمام الحسن العسكري', titleUr: 'شہادت امام حسن عسکریؑ', description: 'Commemoration of the 11th Shia Imam.', category: 'shahadat' },
  { day: 9, month: 3, monthNameEn: "Rabi' al-Awwal", monthNameAr: 'ربيع الأول', title: 'Eid-e-Zahra / Eid Shuja', titleAr: 'عيد الزهراء', titleUr: 'عیدِ زہراء', description: 'Beginning of the Imamate of Imam al-Mahdi (AJ).', category: 'eid' },
  { day: 12, month: 3, monthNameEn: "Rabi' al-Awwal", monthNameAr: 'ربيع الأول', title: 'Milad-un-Nabi ﷺ (Sunni Tradition)', titleAr: 'المولد النبوي الشريف', titleUr: 'عید میلاد النبی ﷺ (اہل سنت روایت)', description: 'Celebration of the blessed birth of the Prophet of Mercy, Muhammad ﷺ.', category: 'eid' },
  { day: 17, month: 3, monthNameEn: "Rabi' al-Awwal", monthNameAr: 'ربيع الأول', title: 'Milad-un-Nabi ﷺ & Imam Ja’far al-Sadiq (Shia Tradition)', titleAr: 'ولادة النبي ﷺ والإمام جعفر الصادق', titleUr: 'ولادتِ باسعادت رسول اللہ ﷺ و امام جعفر صادقؑ', description: 'Birth of Prophet Muhammad ﷺ and the 6th Imam Ja’far ibn Muhammad al-Sadiq (AS). Unity Week.', category: 'eid' },

  // 4. Rabi' al-Thani
  { day: 8, month: 4, monthNameEn: "Rabi' al-Thani", monthNameAr: 'ربيع الثاني', title: 'Birth of Imam Hasan al-Askari', titleAr: 'ولادة الإمام الحسن العسكري', titleUr: 'ولادت امام حسن عسکریؑ', description: 'Birth of the 11th Shia Imam.', category: 'wiladat' },
  { day: 10, month: 4, monthNameEn: "Rabi' al-Thani", monthNameAr: 'ربيع الثاني', title: 'Demise of Lady Fatimah Masuma of Qom', titleAr: 'وفاة السيدة فاطمة المعصومة', titleUr: 'وفات بی بی فاطمہ معصومہ قمؑ', description: 'Passing of the daughter of Imam Musa al-Kadhim (AS).', category: 'shahadat' },

  // 5. Jumada al-Awwal
  { day: 5, month: 5, monthNameEn: 'Jumada al-Awwal', monthNameAr: 'جمادى الأولى', title: 'Birth of Lady Zaynab bint Ali', titleAr: 'ولادة السيدة زينب الكبرى', titleUr: 'ولادت سیدہ زینب کبریٰؑ', description: 'Birth of the Heroine of Karbala, Lady Zaynab (AS).', category: 'wiladat' },
  { day: 13, month: 5, monthNameEn: 'Jumada al-Awwal', monthNameAr: 'جمادى الأولى', title: 'Martyrdom of Lady Fatimah al-Zahra (First Narration)', titleAr: 'استشهاد السيدة فاطمة الزهراء (الرواية الأولى)', titleUr: 'شہادت سیدۃ النساء فاطمۃ الزہراءؑ (روایتِ اول)', description: 'Commemoration of the Master of the Women of Paradise (Ayyam-e-Fatimiyya).', category: 'shahadat' },

  // 6. Jumada al-Thani
  { day: 3, month: 6, monthNameEn: 'Jumada al-Thani', monthNameAr: 'جمادى الثانية', title: 'Martyrdom of Lady Fatimah al-Zahra (Major Narration)', titleAr: 'استشهاد السيدة فاطمة الزهراء', titleUr: 'شہادتِ سیدہ فاطمۃ الزہراءؑ (روایتِ دوم)', description: 'Peak of Ayyam al-Fatimiyya commemorating Lady Fatimah (AS).', category: 'shahadat' },
  { day: 20, month: 6, monthNameEn: 'Jumada al-Thani', monthNameAr: 'جمادى الثانية', title: 'Birth of Lady Fatimah al-Zahra', titleAr: 'ولادة السيدة فاطمة الزهراء', titleUr: 'ولادت سیدہ فاطمۃ الزہراءؑ', description: 'Celebration of the birth of the beloved daughter of Prophet Muhammad ﷺ.', category: 'wiladat' },

  // 7. Rajab
  { day: 1, month: 7, monthNameEn: 'Rajab', monthNameAr: 'رجب', title: 'Sacred Month of Rajab Begins & Birth of Imam Baqir', titleAr: 'أول رجب وولادة الإمام الباقر', titleUr: 'آغازِ ماہِ رجب و ولادت امام محمد باقرؑ', description: 'One of the four sacred months. Highly recommended for fasting and repentance.', category: 'fast' },
  { day: 13, month: 7, monthNameEn: 'Rajab', monthNameAr: 'رجب', title: 'Birth of Imam Ali ibn Abi Talib inside the Kaaba', titleAr: 'ولادة أمير المؤمنين علي بن أبي طالب في الكعبة', titleUr: 'ولادتِ امیر المومنین حضرت علیؑ اندر خانہ کعبہ', description: 'The miraculous birth of the Commander of the Faithful inside the Holy Kaaba in Makkah.', category: 'wiladat' },
  { day: 27, month: 7, monthNameEn: 'Rajab', monthNameAr: 'رجب', title: 'Isra & Mi’raj / Mab’ath of Prophet Muhammad ﷺ', titleAr: 'الإسراء والمعراج والمبعث النبوي', titleUr: 'شبِ معراج و بعثتِ رسولِ اکرم ﷺ', description: 'The heavenly ascension of Prophet Muhammad ﷺ and the formal start of divine revelation.', category: 'eid' },

  // 8. Sha'ban
  { day: 3, month: 8, monthNameEn: "Sha'ban", monthNameAr: 'شعبان', title: 'Birth of Imam Hussain ibn Ali', titleAr: 'ولادة الإمام الحسين', titleUr: 'ولادت امام حسینؑ', description: 'Celebration of the birth of the Master of Youth of Paradise.', category: 'wiladat' },
  { day: 4, month: 8, monthNameEn: "Sha'ban", monthNameAr: 'شعبان', title: 'Birth of Hazrat Abbas Alamdar', titleAr: 'ولادة أبي الفضل العباس', titleUr: 'ولادت حضرت غازی عباس علمدارؑ', description: 'Birth of the Standard-Bearer of Karbala.', category: 'wiladat' },
  { day: 15, month: 8, monthNameEn: "Sha'ban", monthNameAr: 'شعبان', title: 'Shab-e-Barat & Birth of Imam al-Mahdi', titleAr: 'ليلة النصف من شعبان وولادة الإمام المهدي', titleUr: 'شبِ برات و ولادتِ با سعادت امام مہدی (عج)', description: 'Night of records, forgiveness, and birth of the Awaited Savior.', category: 'eid' },

  // 9. Ramadan
  { day: 1, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'First Day of Holy Ramadan (Fasting Begins)', titleAr: 'أول أيام شهر رمضان المبارك', titleUr: 'آغازِ ماہِ مبارک رمضان', description: 'The blessed month of fasting, divine mercy, and the Quran.', category: 'fast' },
  { day: 10, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'Demise of Mother of Believers Lady Khadijah', titleAr: 'وفاة السيدة خديجة الكبرى', titleUr: 'وفات ام المومنین سیدہ خدیجۃ الکبریٰؑ', description: 'Passing of the beloved first wife and premier supporter of the Prophet ﷺ.', category: 'shahadat' },
  { day: 15, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'Birth of Imam Hasan al-Mujtaba', titleAr: 'ولادة الإمام الحسن المجتبى', titleUr: 'ولادت امام حسن مجتبیٰؑ', description: 'Birth of the first grandson of the Holy Prophet ﷺ.', category: 'wiladat' },
  { day: 17, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'Battle of Badr (Ghazwa Badr)', titleAr: 'غزوة بدر الكبرى', titleUr: 'یومِ فتح و غزوہ بدر', description: 'The decisive first victory of Islam over idolatry.', category: 'milestone' },
  { day: 19, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'Striking of Imam Ali in Kufa & 1st Laylat al-Qadr', titleAr: 'ضربة الإمام علي وليلة القدر الأولى', titleUr: 'ضربتِ امیر المومنین حضرت علیؑ و پہلی شبِ قدر', description: 'First night of Laylat al-Qadr and the tragic striking of Imam Ali during Fajr prayer.', category: 'shahadat' },
  { day: 21, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'Martyrdom of Imam Ali & 2nd Laylat al-Qadr', titleAr: 'استشهاد الإمام علي وليلة القدر الثانية', titleUr: 'شہادتِ امیر المومنین علیؑ و دوسری شبِ قدر', description: 'Martyrdom of Imam Ali (AS) and the blessed Night of Decree.', category: 'shahadat' },
  { day: 23, month: 9, monthNameEn: 'Ramadan', monthNameAr: 'رمضان', title: 'Grand Laylat al-Qadr (Night of Power)', titleAr: 'ليلة القدر الكبرى', titleUr: 'عظیم شبِ قدر (۲۳ویں رات)', description: 'The Night of Power, better than a thousand months (Quran 97:3).', category: 'eid' },

  // 10. Shawwal
  { day: 1, month: 10, monthNameEn: 'Shawwal', monthNameAr: 'شوال', title: 'Eid al-Fitr (Festival of Fast-Breaking)', titleAr: 'عيد الفطر المبارك', titleUr: 'عید الفطر المبارک', description: 'Joyous celebration marking the completion of Ramadan.', category: 'eid' },
  { day: 8, month: 10, monthNameEn: 'Shawwal', monthNameAr: 'شوال', title: 'Demolition of Jannat al-Baqi Cemetery', titleAr: 'هدم قبور أئمة البقيع', titleUr: 'یومِ انہدامِ جنت البقیع', description: 'Day of sorrow commemorating the destruction of historic shrines in Madinah.', category: 'shahadat' },
  { day: 25, month: 10, monthNameEn: 'Shawwal', monthNameAr: 'شوال', title: 'Martyrdom of Imam Ja’far al-Sadiq', titleAr: 'استشهاد الإمام جعفر الصادق', titleUr: 'شہادت امام جعفر صادقؑ', description: 'Passing of the 6th Imam and founder of Ja’fari jurisprudence.', category: 'shahadat' },

  // 11. Dhu al-Qi'dah
  { day: 1, month: 11, monthNameEn: "Dhu al-Qi'dah", monthNameAr: 'ذو القعدة', title: 'Birth of Lady Fatimah Masuma', titleAr: 'ولادة السيدة فاطمة المعصومة', titleUr: 'ولادت حضرت فاطمہ معصومہؑ', description: 'Birth of the daughter of the 7th Imam.', category: 'wiladat' },
  { day: 11, month: 11, monthNameEn: "Dhu al-Qi'dah", monthNameAr: 'ذو القعدة', title: 'Birth of Imam Ali al-Rida', titleAr: 'ولادة الإمام علي بن موسى الرضا', titleUr: 'ولادت امام علی رضاؑ', description: 'Birth of the 8th Shia Imam resting in Mashhad.', category: 'wiladat' },
  { day: 25, month: 11, monthNameEn: "Dhu al-Qi'dah", monthNameAr: 'ذو القعدة', title: 'Dahw al-Ard (Spreading of the Earth)', titleAr: 'يوم دحو الأرض', titleUr: 'یومِ دحو الارض', description: 'Day when the earth was spread from beneath the Kaaba. Recommended day for fasting and prayer.', category: 'fast' },

  // 12. Dhu al-Hijjah
  { day: 1, month: 12, monthNameEn: 'Dhu al-Hijjah', monthNameAr: 'ذو الحجة', title: 'Marriage of Imam Ali & Lady Fatimah al-Zahra', titleAr: 'زواج النورين (علي وفاطمة)', titleUr: 'عقدِ نورین (نکاحِ حضرت علیؑ و بی بی فاطمہؑ)', description: 'Blessed heavenly union of Imam Ali and Lady Fatimah.', category: 'milestone' },
  { day: 8, month: 12, monthNameEn: 'Dhu al-Hijjah', monthNameAr: 'ذو الحجة', title: 'Day of Tarwiyah (Start of Hajj)', titleAr: 'يوم التروية', titleUr: 'یومِ ترویہ (آغازِ حج)', description: 'Pilgrims depart for Mina.', category: 'milestone' },
  { day: 9, month: 12, monthNameEn: 'Dhu al-Hijjah', monthNameAr: 'ذو الحجة', title: 'Day of Arafah & Dua of Imam Hussain', titleAr: 'يوم عرفة ودعاء الإمام الحسين', titleUr: 'یومِ عرفہ و دعائے عرفہ امام حسینؑ', description: 'The pinnacle of Hajj and the great day of forgiveness and supplication.', category: 'fast' },
  { day: 10, month: 12, monthNameEn: 'Dhu al-Hijjah', monthNameAr: 'ذو الحجة', title: 'Eid al-Adha (Festival of Sacrifice)', titleAr: 'عيد الأضحى المبارك', titleUr: 'عید الاضحیٰ المبارک', description: 'Commemorating Prophet Ibrahim’s obedience and the sacrifice.', category: 'eid' },
  { day: 18, month: 12, monthNameEn: 'Dhu al-Hijjah', monthNameAr: 'ذو الحجة', title: 'Eid al-Ghadir (Declaration of Wilayah)', titleAr: 'عيد الغدير الأغر', titleUr: 'عیدِ غدیرِ خم', description: 'The declaration by Prophet Muhammad ﷺ at Ghadir Khumm: "Whomsoever I am his Mawla, Ali is his Mawla."', category: 'eid' },
  { day: 24, month: 12, monthNameEn: 'Dhu al-Hijjah', monthNameAr: 'ذو الحجة', title: 'Eid al-Mubahala & Giving of Zakat in Ruku', titleAr: 'يوم المباهلة والتصدق بالخاتم', titleUr: 'عیدِ مباہلہ و تصدق بالخاتم', description: 'Historic event with the Christians of Najran and revelation of Ayat al-Tatheer (33:33).', category: 'eid' }
];

export function getUpcomingIslamicEvent(currentHijriMonth: number, currentHijriDay: number) {
  // Find events in the current month on or after current day
  const thisMonthEvents = ISLAMIC_EVENTS.filter(
    e => e.month === currentHijriMonth && e.day >= currentHijriDay
  ).sort((a, b) => a.day - b.day);

  if (thisMonthEvents.length > 0) {
    const nextEvent = thisMonthEvents[0];
    const daysUntil = nextEvent.day - currentHijriDay;
    return {
      event: nextEvent,
      daysUntil,
      isToday: daysUntil === 0,
      label: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`
    };
  }

  // Otherwise, find the first event of the subsequent month
  const nextMonth = currentHijriMonth === 12 ? 1 : currentHijriMonth + 1;
  const nextMonthEvents = ISLAMIC_EVENTS.filter(e => e.month === nextMonth).sort((a, b) => a.day - b.day);

  if (nextMonthEvents.length > 0) {
    const nextEvent = nextMonthEvents[0];
    // Approximate remaining days in current month (assume 30 days) + next event day
    const daysUntil = (30 - currentHijriDay) + nextEvent.day;
    return {
      event: nextEvent,
      daysUntil,
      isToday: false,
      label: `in ~${daysUntil} days`
    };
  }

  return null;
}
