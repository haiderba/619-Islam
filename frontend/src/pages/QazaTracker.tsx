import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calculator, 
  Plus, 
  Minus, 
  Sparkles, 
  TrendingUp, 
  History, 
  Edit3, 
  RotateCcw, 
  Trash2, 
  X, 
  Info, 
  Flame, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle 
} from 'lucide-react';
import { qazaService, DEFAULT_QAZA_DATA } from '../services/qazaService';
import { QazaData, QazaPrayerKey, QazaLogEntry } from '../types/qaza';

interface PrayerConfig {
  key: QazaPrayerKey;
  name: string;
  arabic: string;
  icon: string;
  color: string;
  borderColor: string;
  bgColor: string;
  fardhRakah: string;
}

const PRAYERS_CONFIG: PrayerConfig[] = [
  { key: 'fajr', name: 'Fajr', arabic: 'الفجر', icon: '🌅', color: 'text-amber-400', borderColor: 'border-amber-500/30', bgColor: 'bg-amber-500/10', fardhRakah: '2 Fardh' },
  { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', icon: '☀️', color: 'text-yellow-400', borderColor: 'border-yellow-500/30', bgColor: 'bg-yellow-500/10', fardhRakah: '4 Fardh' },
  { key: 'asr', name: 'Asr', arabic: 'العصر', icon: '🌤️', color: 'text-orange-400', borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/10', fardhRakah: '4 Fardh' },
  { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب', icon: '🌇', color: 'text-rose-400', borderColor: 'border-rose-500/30', bgColor: 'bg-rose-500/10', fardhRakah: '3 Fardh' },
  { key: 'isha', name: 'Isha', arabic: 'العشاء', icon: '🌙', color: 'text-indigo-400', borderColor: 'border-indigo-500/30', bgColor: 'bg-indigo-500/10', fardhRakah: '4 Fardh' },
  { key: 'witr', name: 'Witr', arabic: 'الوتر', icon: '✨', color: 'text-teal-400', borderColor: 'border-teal-500/30', bgColor: 'bg-teal-500/10', fardhRakah: '3 Wajib' },
];

export const QazaTracker: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<QazaData>(DEFAULT_QAZA_DATA);
  const [logs, setLogs] = useState<QazaLogEntry[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetType, setResetType] = useState<'all' | 'completed' | 'targets'>('completed');
  const [showFiqhGuide, setShowFiqhGuide] = useState(false);

  // Custom Bulk Input state per prayer
  const [bulkInputOpen, setBulkInputOpen] = useState<QazaPrayerKey | null>(null);
  const [bulkAmount, setBulkAmount] = useState<number>(10);

  // Wizard State
  const [wizardYears, setWizardYears] = useState(1);
  const [wizardMonths, setWizardMonths] = useState(0);
  const [wizardDays, setWizardDays] = useState(0);
  const [includeWitr, setIncludeWitr] = useState(true);

  // Manual Edit State
  const [editTargets, setEditTargets] = useState(data.totalTarget);
  const [editCompleted, setEditCompleted] = useState(data.completed);

  // Daily Goal Selector
  const [dailyPaceGoal, setDailyPaceGoal] = useState<number>(data.dailyGoal || 5);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const d = qazaService.getData();
    setData(d);
    setEditTargets(d.totalTarget);
    setEditCompleted(d.completed);
    setDailyPaceGoal(d.dailyGoal || 5);
    setLogs(qazaService.getLogs());
  };

  const handleIncrement = (prayer: QazaPrayerKey, amount: number) => {
    const updated = qazaService.incrementPrayer(prayer, amount);
    setData(updated);
    setLogs(qazaService.getLogs());
  };

  const handleFullDayIncrement = (amount: number = 1) => {
    const updated = qazaService.incrementFullDay(amount);
    setData(updated);
    setLogs(qazaService.getLogs());
  };

  const handleDeleteLog = (id: string) => {
    const res = qazaService.deleteLog(id);
    setData(res.data);
    setLogs(res.logs);
  };

  const handleSaveWizard = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = qazaService.calculateMissedPrayers(wizardYears, wizardMonths, wizardDays, includeWitr);
    setData(updated);
    setShowWizard(false);
  };

  const handleSaveManualEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: QazaData = {
      ...data,
      totalTarget: { ...editTargets },
      completed: { ...editCompleted },
    };
    qazaService.saveData(updated);
    setData(updated);
    setShowEditModal(false);
  };

  const handlePaceGoalChange = (newGoal: number) => {
    setDailyPaceGoal(newGoal);
    const updated = qazaService.setDailyGoal(newGoal);
    setData(updated);
  };

  const handleExecuteReset = () => {
    const updated = qazaService.resetData(resetType);
    setData(updated);
    setLogs(qazaService.getLogs());
    setShowResetModal(false);
  };

  // Aggregates & Calculations
  const totalTargetCount = Object.values(data.totalTarget).reduce((a, b) => a + b, 0);
  const totalCompletedCount = Object.values(data.completed).reduce((a, b) => a + b, 0);
  const totalRemainingCount = Math.max(0, totalTargetCount - totalCompletedCount);
  const overallPercent = totalTargetCount > 0 
    ? Math.min(100, Math.round((totalCompletedCount / totalTargetCount) * 100)) 
    : (totalCompletedCount > 0 ? 100 : 0);

  const todayCompleted = qazaService.getTodayCompletedCount();
  const todayGoalPercent = Math.min(100, Math.round((todayCompleted / dailyPaceGoal) * 100));

  // Dynamic Completion Forecast
  const daysToFinish = totalRemainingCount > 0 ? Math.ceil(totalRemainingCount / dailyPaceGoal) : 0;
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysToFinish);
  const finishDateStr = totalRemainingCount > 0 
    ? finishDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Alhamdulillah! All Fulfilled';

  return (
    <div className="p-4 sm:p-6 pb-36 max-w-4xl mx-auto w-full space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* ── Top Navigation & Actions Header ── */}
      <header className="pt-1 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/namaz')}
            className="p-2 hover:bg-surface rounded-2xl text-subtext hover:text-text transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text tracking-tight flex items-center gap-2">
              <span>Qaza Namaz Tracker</span>
              <span className="text-sm font-arabic text-amber-500 font-bold">(قضاء الصلوات)</span>
            </h1>
            <p className="text-xs sm:text-sm text-subtext font-medium mt-0.5">
              Calculate, log, and fulfill missed obligatory prayers.
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm active:scale-95 transition-all"
            title="Open Qaza Calculator Wizard"
          >
            <Calculator size={14} />
            <span className="hidden sm:inline">Calculator Wizard</span>
            <span className="sm:hidden">Wizard</span>
          </button>

          <button
            onClick={() => setShowResetModal(true)}
            className="p-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all active:scale-95"
            title="Reset Qaza Tracker"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {/* ── Master Overview & Progress Card ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-teal-950/30 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/30 inline-block">
              Lifelong Qaza Progress
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {totalCompletedCount} <span className="text-xs sm:text-sm text-white/60 font-normal">/ {totalTargetCount} Fulfilled</span>
            </h3>
            <p className="text-xs text-white/80 font-medium">
              {totalRemainingCount > 0 ? `${totalRemainingCount.toLocaleString()} prayers remaining` : '✨ All targets fulfilled, Alhamdulillah!'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFullDayIncrement(1)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} className="fill-black" />
              <span>+1 Full Day (All 6)</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition-all active:scale-95"
              title="Edit Individual Targets"
            >
              <Edit3 size={15} />
            </button>

            <button
              onClick={() => setShowLogsModal(true)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/90 border border-white/20 transition-all active:scale-95 relative"
              title="View History Log"
            >
              <History size={15} />
              {logs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Overall Linear Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-white/80">
            <span>Overall Completion</span>
            <span className="text-amber-400 font-mono">{overallPercent}%</span>
          </div>
          <div className="w-full h-3.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* ── Today's Pace & Completion Forecast Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* 1. Today's Daily Target Flame Box */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Flame size={15} className="fill-amber-400" />
                <span>Today's Qaza Goal</span>
              </div>
              <span className="text-[11px] font-mono text-white/80 font-bold">
                {todayCompleted} / {dailyPaceGoal} Prayed
              </span>
            </div>

            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${todayGoalPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/60">
              <span>Set daily pace:</span>
              <div className="flex items-center gap-1">
                {[1, 3, 5, 10].map(goal => (
                  <button
                    key={goal}
                    onClick={() => handlePaceGoalChange(goal)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                      dailyPaceGoal === goal
                        ? 'bg-amber-500 text-black font-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    {goal}/day
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Projected Finish Date Box */}
          <div className="bg-black/30 border border-white/10 rounded-2xl p-3 flex flex-col justify-between space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <TrendingUp size={15} />
              <span>Projected Completion</span>
            </div>
            {totalRemainingCount > 0 ? (
              <div>
                <p className="text-sm font-black text-amber-300">
                  {finishDateStr}
                </p>
                <span className="text-[10px] text-white/60">
                  ({daysToFinish.toLocaleString()} days remaining at {dailyPaceGoal} prayers/day)
                </span>
              </div>
            ) : (
              <p className="text-xs font-bold text-emerald-400">
                ✨ Alhamdulillah, all missed prayers completed!
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── 6 Prayer Counter Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {PRAYERS_CONFIG.map((prayer) => {
          const completed = data.completed[prayer.key] || 0;
          const target = data.totalTarget[prayer.key] || 0;
          const remaining = Math.max(0, target - completed);
          const percent = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 100;
          const isBulkOpen = bulkInputOpen === prayer.key;

          return (
            <div 
              key={prayer.key}
              className={`bg-card border ${prayer.borderColor} rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5 hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{prayer.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-black text-text leading-tight">{prayer.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface text-subtext border border-border">
                          {prayer.fardhRakah}
                        </span>
                      </div>
                      <span className="text-xs font-arabic text-subtext font-bold">{prayer.arabic}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-lg font-black ${prayer.color}`}>{completed}</span>
                    <span className="text-xs text-muted font-bold"> / {target}</span>
                    <span className="block text-[10px] text-subtext font-medium">{remaining} left</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 mt-3">
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Increment Controls */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleIncrement(prayer.key, -1)}
                    disabled={completed <= 0}
                    className="p-2 rounded-xl bg-surface hover:bg-border text-subtext hover:text-danger disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-95"
                    title="Undo 1"
                  >
                    <Minus size={15} />
                  </button>

                  <button
                    onClick={() => handleIncrement(prayer.key, 1)}
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    <span>+1 Prayed</span>
                  </button>

                  <button
                    onClick={() => handleIncrement(prayer.key, 5)}
                    className="py-2.5 px-3 rounded-xl bg-surface hover:bg-border border border-border text-text text-xs font-bold active:scale-95 transition-all"
                    title="Add 5"
                  >
                    +5
                  </button>

                  <button
                    onClick={() => setBulkInputOpen(isBulkOpen ? null : prayer.key)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold active:scale-95 transition-all ${
                      isBulkOpen
                        ? 'bg-amber-500 text-black border-amber-500'
                        : 'bg-surface hover:bg-border border-border text-subtext'
                    }`}
                    title="Custom Bulk Add"
                  >
                    +N
                  </button>
                </div>

                {/* Bulk Custom Amount Accordion */}
                {isBulkOpen && (
                  <div className="p-2.5 bg-surface/80 rounded-2xl border border-border flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <input
                      type="number"
                      min="1"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 bg-card border border-border rounded-xl text-xs font-bold text-text text-center outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        handleIncrement(prayer.key, bulkAmount);
                        setBulkInputOpen(null);
                      }}
                      className="flex-1 py-1 px-2.5 bg-amber-500 text-black font-black text-xs rounded-xl shadow-sm active:scale-95 transition-all"
                    >
                      Add +{bulkAmount} {prayer.name}
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* ── 📚 ISLAMIC RULES & SUNNAH FIQH OF QAZA (ACCORDION) ── */}
      <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm space-y-3">
        <button
          onClick={() => setShowFiqhGuide(!showFiqhGuide)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-text">Rules & Sunnah Method of Qaza (احکام قضاء)</h3>
              <p className="text-xs text-subtext">How to calculate, offer, and fulfill Qaza prayers correctly.</p>
            </div>
          </div>
          <div className="p-1 rounded-full bg-surface text-subtext">
            {showFiqhGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showFiqhGuide && (
          <div className="pt-3 border-t border-border/60 space-y-3.5 text-xs leading-relaxed text-subtext animate-in fade-in">
            
            {/* 1. Which prayers are Qaza? */}
            <div className="bg-surface/80 p-3.5 rounded-2xl space-y-1">
              <strong className="text-text font-bold block text-[13px] text-amber-500">
                1. Which Prayers Must Be Made Up?
              </strong>
              <p>
                Only the <strong>Fardh</strong> units of the 5 daily prayers and the <strong>3 Witr</strong> prayer (Hanafi Wajib) must be made up. Sunnah and Nafl prayers do not have Qaza.
              </p>
            </div>

            {/* 2. Forbidden Times */}
            <div className="bg-surface/80 p-3.5 rounded-2xl space-y-1">
              <strong className="text-text font-bold block text-[13px] text-rose-400">
                2. Forbidden (Makruh) Times for Qaza
              </strong>
              <p>
                Qaza prayers can be offered at any time of day or night, <strong>except during the 3 Makruh times</strong>:
              </p>
              <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px]">
                <li>During <strong>Sunrise</strong> (until sun rises approx. 15-20 min).</li>
                <li>During <strong>Zawal / Istiwa</strong> (when sun is at exact zenith before Dhuhr).</li>
                <li>During <strong>Sunset</strong> (approx. 15-20 min before Maghrib starts, except that day's Asr).</li>
              </ul>
            </div>

            {/* 3. Authentic Sunnah Shortcuts */}
            <div className="bg-surface/80 p-3.5 rounded-2xl space-y-1">
              <strong className="text-text font-bold block text-[13px] text-emerald-400">
                3. Ease / Sunnah Shortcuts for Large Qaza-e-Umri
              </strong>
              <p>
                To help fulfill large missed counts without fatigue, scholars permit:
              </p>
              <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px]">
                <li>In 3rd and 4th Rakah of 4-Rakah Fardh prayers, you may recite <em>SubhanAllah</em> 3 times instead of Surah Al-Fatihah.</li>
                <li>Recite Tasbeeh in Ruku and Sujood at least 1 time clearly (or 3 times).</li>
                <li>In Tashahhud, after Durood-e-Ibrahim, recite a short Dua like <em>Rabbana Atina</em> once and perform Salam.</li>
              </ul>
            </div>

            {/* 4. Practical Strategy */}
            <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-2xl space-y-1 text-amber-300">
              <strong className="font-bold block text-[13px]">
                💡 Recommended Daily Habit Strategy (1 Ada + 1 Qaza)
              </strong>
              <p>
                The most sustainable way to complete Qaza is praying <strong>1 Qaza prayer immediately before or after each daily prayer</strong> (e.g. 1 Qaza Fajr with Fajr, 1 Qaza Dhuhr with Dhuhr). This completes 1 full day of Qaza every single day!
              </p>
            </div>

          </div>
        )}
      </div>

      {/* ── 🧙‍♂️ CALCULATOR WIZARD MODAL ── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-5 text-white relative">
              <button
                onClick={() => setShowWizard(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2">
                <Calculator size={20} />
                <h3 className="text-lg font-black">Qaza-e-Umri Calculator</h3>
              </div>
              <p className="text-xs text-white/80 mt-0.5">Estimate total missed prayers since puberty (Baligh).</p>
            </div>

            <form onSubmit={handleSaveWizard} className="p-5 sm:p-6 space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-start gap-2 text-xs text-amber-400">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>
                  Enter the approximate number of years and months you did not pray regularly. The tracker will configure your total targets automatically.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1">Years</label>
                  <input
                    type="number"
                    min="0"
                    max="80"
                    value={wizardYears}
                    onChange={(e) => setWizardYears(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1">Months</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={wizardMonths}
                    onChange={(e) => setWizardMonths(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1">Days</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={wizardDays}
                    onChange={(e) => setWizardDays(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-text flex items-center gap-1.5 cursor-pointer">
                  <span>Include Witr Prayer (Hanafi Wajib)</span>
                </label>
                <input
                  type="checkbox"
                  checked={includeWitr}
                  onChange={(e) => setIncludeWitr(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              <div className="bg-surface p-3 rounded-2xl border border-border text-center space-y-1">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Calculated Target</span>
                <p className="text-lg font-black text-amber-500">
                  {Math.round(wizardYears * 365.25 + wizardMonths * 30.4 + wizardDays)} Days of Prayers
                </p>
                <span className="text-[11px] text-subtext block">
                  ({Math.round((wizardYears * 365.25 + wizardMonths * 30.4 + wizardDays) * (includeWitr ? 6 : 5)).toLocaleString()} Total Prayers)
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                Set Targets & Start Tracking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 📝 MANUAL EDIT TARGETS MODAL ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary to-teal-700 p-5 text-white relative">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2">
                <Edit3 size={18} />
                <h3 className="text-lg font-black">Edit Targets & Completed</h3>
              </div>
              <p className="text-xs text-white/80 mt-0.5">Customize individual prayer numbers directly.</p>
            </div>

            <form onSubmit={handleSaveManualEdit} className="p-5 sm:p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {PRAYERS_CONFIG.map(p => (
                <div key={p.key} className="grid grid-cols-2 gap-2 bg-surface p-2.5 rounded-xl border border-border">
                  <div>
                    <label className="block text-[10px] font-bold text-subtext uppercase mb-1">{p.name} Total Target</label>
                    <input
                      type="number"
                      min="0"
                      value={editTargets[p.key] || 0}
                      onChange={(e) => setEditTargets({
                        ...editTargets,
                        [p.key]: parseInt(e.target.value, 10) || 0
                      })}
                      className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg text-text text-xs font-bold outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-subtext uppercase mb-1">{p.name} Completed</label>
                    <input
                      type="number"
                      min="0"
                      value={editCompleted[p.key] || 0}
                      onChange={(e) => setEditCompleted({
                        ...editCompleted,
                        [p.key]: parseInt(e.target.value, 10) || 0
                      })}
                      className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg text-text text-xs font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-md active:scale-95 transition-all mt-3"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 🗑️ SAFE MULTI-OPTION RESET MODAL ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-rose-600 to-red-700 p-5 text-white relative">
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-300" />
                <h3 className="text-lg font-black">Reset Qaza Tracker</h3>
              </div>
              <p className="text-xs text-white/80 mt-0.5">Select what you would like to reset safely.</p>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label 
                  onClick={() => setResetType('completed')}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    resetType === 'completed'
                      ? 'bg-rose-500/10 border-rose-500/50 text-text'
                      : 'bg-surface border-border text-subtext hover:border-border/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="resetOption"
                    checked={resetType === 'completed'}
                    onChange={() => setResetType('completed')}
                    className="accent-rose-500 mt-1"
                  />
                  <div>
                    <strong className="text-xs font-bold text-text block">
                      Reset Completed Count to 0 (Keep Targets)
                    </strong>
                    <span className="text-[11px] text-subtext leading-tight block mt-0.5">
                      Resets your fulfilled prayers back to zero while preserving your calculated years and target goals.
                    </span>
                  </div>
                </label>

                <label 
                  onClick={() => setResetType('targets')}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    resetType === 'targets'
                      ? 'bg-rose-500/10 border-rose-500/50 text-text'
                      : 'bg-surface border-border text-subtext hover:border-border/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="resetOption"
                    checked={resetType === 'targets'}
                    onChange={() => setResetType('targets')}
                    className="accent-rose-500 mt-1"
                  />
                  <div>
                    <strong className="text-xs font-bold text-text block">
                      Reset Targets Only to 0
                    </strong>
                    <span className="text-[11px] text-subtext leading-tight block mt-0.5">
                      Resets your target prayer counts so you can recalculate with the wizard. Keeps what you've prayed.
                    </span>
                  </div>
                </label>

                <label 
                  onClick={() => setResetType('all')}
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                    resetType === 'all'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-500 font-bold'
                      : 'bg-surface border-border text-subtext hover:border-border/80'
                  }`}
                >
                  <input
                    type="radio"
                    name="resetOption"
                    checked={resetType === 'all'}
                    onChange={() => setResetType('all')}
                    className="accent-rose-500 mt-1"
                  />
                  <div>
                    <strong className="text-xs font-bold text-rose-500 block">
                      Full Factory Reset (Wipe Everything)
                    </strong>
                    <span className="text-[11px] text-subtext leading-tight block mt-0.5">
                      Completely erases all completed prayers, targets, and history logs back to fresh zero.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 rounded-xl bg-surface border border-border text-subtext font-bold text-xs hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 📜 HISTORY LOGS MODAL (WITH 1-TAP DELETE) ── */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 text-white relative">
              <button
                onClick={() => setShowLogsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2">
                <History size={18} />
                <h3 className="text-lg font-black">Recent Activity Log</h3>
              </div>
              <p className="text-xs text-white/80 mt-0.5">Track and manage your recorded Qaza prayers.</p>
            </div>

            <div className="p-4 sm:p-6 space-y-2 max-h-[60vh] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-center py-8 text-xs text-muted">No activity logs recorded yet.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-3 bg-surface border border-border rounded-2xl flex items-center justify-between text-xs group hover:border-primary/40 transition-colors">
                    <div>
                      <span className="font-bold text-text capitalize block">
                        {log.prayer === 'full_day' ? '🌟 Full Day (All Prayers)' : `🕌 ${log.prayer}`}
                      </span>
                      <span className="text-[10px] text-muted">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                        +{log.count}
                      </span>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 rounded-lg text-subtext hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete & Revert this log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QazaTracker;

