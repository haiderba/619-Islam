export interface QuizQuestion {
  id: number;
  category: 'Quran' | 'Seerah' | 'Prophets' | 'Fiqh' | 'History';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  reference: string;
}

export const DAILY_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "Quran",
    question: "Which Surah in the Holy Quran does NOT begin with 'Bismillah-ir-Rahman-ir-Rahim'?",
    options: ["Surah Al-Kahf", "Surah At-Tawbah", "Surah Al-Anfal", "Surah Al-Mulk"],
    correctIndex: 1,
    explanation: "Surah At-Tawbah (Surah 9) does not begin with Bismillah as it was revealed concerning the declaration of immunity and severing of treaties with idolaters.",
    reference: "Surah At-Tawbah (Chapter 9)"
  },
  {
    id: 2,
    category: "Prophets",
    question: "Which Prophet is mentioned by name the most times in the Holy Quran?",
    options: ["Prophet Ibrahim (AS)", "Prophet Musa (AS)", "Prophet Isa (AS)", "Prophet Nuh (AS)"],
    correctIndex: 1,
    explanation: "Prophet Musa (Moses) peace be upon him is mentioned by name 136 times across numerous Surahs in the Quran.",
    reference: "Mentioned 136 times in the Quran"
  },
  {
    id: 3,
    category: "Seerah",
    question: "In which year of the Hijri calendar did the conquest of Makkah (Fath Makkah) take place?",
    options: ["6 AH", "8 AH", "10 AH", "2 AH"],
    correctIndex: 1,
    explanation: "The peaceful conquest of Makkah occurred in the month of Ramadan in the 8th year after Hijrah (8 AH).",
    reference: "Sahih al-Bukhari & Sirat Ibn Hisham"
  },
  {
    id: 4,
    category: "Fiqh",
    question: "What is the minimum threshold of wealth required before Zakat becomes obligatory called?",
    options: ["Fitrana", "Nisab", "Sadaqah", "Ushr"],
    correctIndex: 1,
    explanation: "Nisab is the qualifying wealth threshold (equivalent to 87.48g of gold or 612.36g of silver) held for one lunar year (Hawl).",
    reference: "Islamic Jurisprudence (Fiqh of Zakat)"
  },
  {
    id: 5,
    category: "History",
    question: "Who was the companion known by the title 'Dhul-Nurayn' (The Possessor of Two Lights)?",
    options: ["Ali ibn Abi Talib (RA)", "Uthman ibn Affan (RA)", "Umar ibn al-Khattab (RA)", "Abu Bakr as-Siddiq (RA)"],
    correctIndex: 1,
    explanation: "Uthman ibn Affan (RA) was called Dhul-Nurayn because he married two daughters of Prophet Muhammad ﷺ: Ruqayyah and Umm Kulthum.",
    reference: "Tabaqat Ibn Sa'd & Al-Bidayah wan-Nihayah"
  }
];
