import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DAILY_QUIZ_QUESTIONS
} from '../utils/quizData';
import { 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  Flame,
  Info
} from 'lucide-react';

export const IslamicQuiz: React.FC = () => {
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = DAILY_QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < DAILY_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto">
      {/* ── Top Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-muted uppercase tracking-wider">
          Daily Trivia
        </span>
      </div>

      {/* ── Hero Master Banner ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Islamic Knowledge Challenge</span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Daily Islamic Quiz
              </h1>
              <p className="text-xs text-white/80 mt-0.5">
                Test your knowledge of Quran, Seerah, and Islamic history.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 rounded-2xl text-amber-300 text-xs font-black">
              <Flame size={14} className="text-amber-400 fill-amber-400" />
              <span>Score: {score}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + (quizFinished ? 1 : 0)) / DAILY_QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {!quizFinished ? (
        /* ── Active Question Card ── */
        <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Question Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">
              Category: {currentQ.category}
            </span>

            <span className="text-muted font-bold">
              Question {currentIdx + 1} of {DAILY_QUIZ_QUESTIONS.length}
            </span>
          </div>

          {/* Question Title */}
          <h2 className="text-sm sm:text-base font-black text-text leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-2 pt-1">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle = 'bg-surface/80 hover:bg-card border-border text-text';

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black ring-1 ring-emerald-500/40';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-400 font-black';
                } else {
                  optionStyle = 'bg-surface/40 border-border/40 text-muted opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-3 ${optionStyle}`}
                >
                  <span>{option}</span>

                  {isAnswered && (
                    <>
                      {isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                      {isSelected && !isCorrect && <XCircle size={16} className="text-rose-400 shrink-0" />}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="bg-surface/90 dark:bg-black/40 border border-border/80 rounded-2xl p-4 space-y-1.5 animate-in fade-in-50 text-xs">
              <div className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-400">
                <Info size={13} />
                <span>Authentic Explanation</span>
              </div>
              <p className="text-subtext leading-relaxed font-medium">
                {currentQ.explanation}
              </p>
              <span className="text-[10px] text-muted block italic pt-1">
                Ref: {currentQ.reference}
              </span>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>{currentIdx < DAILY_QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      ) : (
        /* ── Final Results Card ── */
        <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-6 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Award size={32} />
          </div>

          <div>
            <h2 className="text-xl font-black text-text">
              Quiz Completed! Masha'Allah
            </h2>
            <p className="text-xs text-subtext mt-1">
              You scored <strong className="text-amber-500 font-bold">{score} out of {DAILY_QUIZ_QUESTIONS.length}</strong> ({Math.round((score / DAILY_QUIZ_QUESTIONS.length) * 100)}% accuracy)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 dark:bg-black/30 border border-border text-xs text-subtext leading-relaxed">
            {score === 5 ? (
              <span className="text-emerald-400 font-bold">🌟 Perfect Score! Excellent knowledge of Islamic history and Quran.</span>
            ) : score >= 3 ? (
              <span className="text-amber-400 font-bold">👍 Great effort! Keep learning daily and increasing your knowledge.</span>
            ) : (
              <span className="text-text font-bold">📖 Good practice! Review the explanations and try again tomorrow.</span>
            )}
          </div>

          <button
            onClick={restartQuiz}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            <span>Retake Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
};
