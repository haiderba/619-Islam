import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Coins, 
  DollarSign, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Copy, 
  Check, 
  TrendingUp, 
  CreditCard 
} from 'lucide-react';

export const ZakatCalculator: React.FC = () => {
  const navigate = useNavigate();

  // Currency
  const [currency, setCurrency] = useState<'PKR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'SAR'>('PKR');

  // Nisab Standard: Gold (87.48g) or Silver (612.36g)
  const [nisabType, setNisabType] = useState<'silver' | 'gold'>('silver');
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(24500); // Default in PKR
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(310); // Default in PKR

  // Asset Inputs
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [cashInBank, setCashInBank] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [stocksValue, setStocksValue] = useState<number>(0);
  const [cryptoValue, setCryptoValue] = useState<number>(0);
  const [businessInventory, setBusinessInventory] = useState<number>(0);
  const [rentalRevenue, setRentalRevenue] = useState<number>(0);

  // Liabilities / Deductions
  const [immediateDebts, setImmediateDebts] = useState<number>(0);
  const [dueExpenses, setDueExpenses] = useState<number>(0);

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'rules'>('calculator');

  // Nisab Threshold Calculations
  const goldNisabThreshold = 87.48 * goldPricePerGram;
  const silverNisabThreshold = 612.36 * silverPricePerGram;
  const activeNisabThreshold = nisabType === 'silver' ? silverNisabThreshold : goldNisabThreshold;

  // Total Assets Calculation
  const totalGoldValue = goldGrams * goldPricePerGram;
  const totalSilverValue = silverGrams * silverPricePerGram;
  const totalGrossAssets = 
    cashInHand + 
    cashInBank + 
    totalGoldValue + 
    totalSilverValue + 
    stocksValue + 
    cryptoValue + 
    businessInventory + 
    rentalRevenue;

  // Total Liabilities
  const totalLiabilities = immediateDebts + dueExpenses;

  // Net Zakatable Wealth
  const netZakatableWealth = Math.max(0, totalGrossAssets - totalLiabilities);

  // Is Eligible for Zakat (Net wealth >= Nisab threshold)
  const isEligible = netZakatableWealth >= activeNisabThreshold;
  const zakatDue = isEligible ? Math.round(netZakatableWealth * 0.025) : 0;

  // Handle currency preset changes
  const handleCurrencyChange = (newCurr: typeof currency) => {
    setCurrency(newCurr);
    if (newCurr === 'PKR') {
      setGoldPricePerGram(24500);
      setSilverPricePerGram(310);
    } else if (newCurr === 'USD') {
      setGoldPricePerGram(80);
      setSilverPricePerGram(1.05);
    } else if (newCurr === 'GBP') {
      setGoldPricePerGram(63);
      setSilverPricePerGram(0.85);
    } else if (newCurr === 'AED' || newCurr === 'SAR') {
      setGoldPricePerGram(295);
      setSilverPricePerGram(3.85);
    }
  };

  const handleCopySummary = () => {
    const text = `💰 619 Islam - Zakat Calculation Summary:\n• Gross Wealth: ${currency} ${totalGrossAssets.toLocaleString()}\n• Liabilities: ${currency} ${totalLiabilities.toLocaleString()}\n• Net Zakatable Wealth: ${currency} ${netZakatableWealth.toLocaleString()}\n• Nisab Threshold (${nisabType.toUpperCase()}): ${currency} ${Math.round(activeNisabThreshold).toLocaleString()}\n• Zakat Due (2.5%): ${currency} ${zakatDue.toLocaleString()}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto">
      {/* ── Header Navigation ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text px-3 py-1.5 rounded-full bg-card border border-border"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1 bg-surface p-1 rounded-full border border-border text-xs font-bold">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'calculator' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1 rounded-full transition-all ${
              activeTab === 'rules' ? 'bg-amber-500 text-black shadow-sm' : 'text-subtext'
            }`}
          >
            8 Recipients 📖
          </button>
        </div>
      </div>

      {/* ── Hero Master Card ── */}
      <div className="bg-gradient-to-br from-[#062426] via-[#093538] to-[#041c1d] border border-amber-500/40 rounded-3xl p-5 text-white shadow-xl shadow-teal-950/30 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-amber-400 tracking-wider">
            <Sparkles size={13} className="text-amber-400" />
            <span>Pillar of Islam • 2.5%</span>
          </div>
          
          <div className="flex items-start justify-between mt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Zakat Calculator
              </h1>
              <p className="text-xs text-white/80 mt-0.5">
                Calculate Zakat accurately across all your assets with Nisab threshold verification.
              </p>
            </div>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value as any)}
              className="bg-black/50 border border-amber-500/40 rounded-xl px-2.5 py-1 text-xs font-black text-amber-300 focus:outline-none backdrop-blur-md"
            >
              <option value="PKR">PKR (Rs)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SAR">SAR (ر.س)</option>
            </select>
          </div>

          {/* 🌟 Result Display Banner */}
          <div className="mt-4 bg-black/40 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-400 block tracking-wider">
                Total Zakat Due (2.5%)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                {currency} {zakatDue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {isEligible ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 size={12} />
                    <span>Nisab Met ({currency} {Math.round(activeNisabThreshold).toLocaleString()})</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300/80">
                    <Info size={12} />
                    <span>Below Nisab Threshold (No Zakat Due)</span>
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCopySummary}
              className="p-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 active:scale-95 transition-all flex flex-col items-center justify-center shrink-0"
              title="Copy Summary"
            >
              {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
              <span className="text-[9px] font-bold mt-0.5">{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <div className="space-y-4">
          {/* ── 1. Nisab Selection & Rates ── */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <Coins size={16} className="text-amber-400" />
                <h3 className="text-xs font-black text-text uppercase tracking-wider">
                  Nisab Standard
                </h3>
              </div>

              {/* Toggle Gold vs Silver Nisab */}
              <div className="flex items-center gap-1 bg-surface p-1 rounded-full border border-border text-[11px]">
                <button
                  onClick={() => setNisabType('silver')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                    nisabType === 'silver' ? 'bg-amber-500 text-black' : 'text-subtext'
                  }`}
                  title="Silver Nisab is recommended by scholars for maximum benefit to the poor"
                >
                  Silver (612.36g)
                </button>
                <button
                  onClick={() => setNisabType('gold')}
                  className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                    nisabType === 'gold' ? 'bg-amber-500 text-black' : 'text-subtext'
                  }`}
                >
                  Gold (87.48g)
                </button>
              </div>
            </div>

            {/* Live / Editable Gram Rates */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[10px] font-bold text-subtext block mb-1">
                  Gold Rate (1g in {currency}):
                </label>
                <input
                  type="number"
                  value={goldPricePerGram || ''}
                  onChange={(e) => setGoldPricePerGram(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-subtext block mb-1">
                  Silver Rate (1g in {currency}):
                </label>
                <input
                  type="number"
                  value={silverPricePerGram || ''}
                  onChange={(e) => setSilverPricePerGram(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
          </div>

          {/* ── 2. Zakatable Assets ── */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
              <DollarSign size={16} className="text-amber-400" />
              <h3 className="text-xs font-black text-text uppercase tracking-wider">
                1. Cash & Precious Metals
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  💵 Cash in Hand:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashInHand || ''}
                  onChange={(e) => setCashInHand(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  🏦 Cash in Bank Accounts:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={cashInBank || ''}
                  onChange={(e) => setCashInBank(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  ✨ Gold Owned (Grams):
                </label>
                <input
                  type="number"
                  placeholder="0g"
                  value={goldGrams || ''}
                  onChange={(e) => setGoldGrams(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
                {goldGrams > 0 && (
                  <span className="text-[10px] text-amber-500 font-bold mt-0.5 block">
                    = {currency} {totalGoldValue.toLocaleString()}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  🥈 Silver Owned (Grams):
                </label>
                <input
                  type="number"
                  placeholder="0g"
                  value={silverGrams || ''}
                  onChange={(e) => setSilverGrams(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
                {silverGrams > 0 && (
                  <span className="text-[10px] text-amber-500 font-bold mt-0.5 block">
                    = {currency} {totalSilverValue.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── 3. Investments, Crypto & Business ── */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
              <TrendingUp size={16} className="text-amber-400" />
              <h3 className="text-xs font-black text-text uppercase tracking-wider">
                2. Investments, Crypto & Business Assets
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  📈 Stocks / Mutual Funds Value:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={stocksValue || ''}
                  onChange={(e) => setStocksValue(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  🪙 Cryptocurrency Holdings:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={cryptoValue || ''}
                  onChange={(e) => setCryptoValue(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  🏪 Business Goods for Sale (Inventory):
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={businessInventory || ''}
                  onChange={(e) => setBusinessInventory(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  🏢 Rental Property Net Revenue:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={rentalRevenue || ''}
                  onChange={(e) => setRentalRevenue(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-amber-500/60"
                />
              </div>
            </div>
          </div>

          {/* ── 4. Deductions / Liabilities ── */}
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
              <CreditCard size={16} className="text-rose-400" />
              <h3 className="text-xs font-black text-text uppercase tracking-wider">
                3. Liabilities & Immediate Debts (Deductions)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  💳 Debts Due Immediately:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={immediateDebts || ''}
                  onChange={(e) => setImmediateDebts(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-rose-500/60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-subtext block mb-1">
                  🧾 Immediate Bills / Rent Due:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={dueExpenses || ''}
                  onChange={(e) => setDueExpenses(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-bold text-text focus:outline-none focus:border-rose-500/60"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── 8 Quranic Categories of Zakat Distribution ── */
        <div className="space-y-3">
          <div className="bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 rounded-3xl p-4 shadow-sm">
            <h2 className="text-sm font-black text-text flex items-center gap-1.5 mb-1">
              <Sparkles size={16} className="text-amber-400" />
              <span>Who is Eligible to Receive Zakat?</span>
            </h2>
            <p className="text-xs text-subtext leading-relaxed">
              Allah specifies the 8 categories of Zakat recipients in the Holy Quran (Surah At-Tawbah 9:60):
            </p>
          </div>

          {[
            { num: 1, title: 'Al-Fuqara (The Poor)', desc: 'Those who have no wealth or whose income meets less than half their essential needs.' },
            { num: 2, title: 'Al-Masakeen (The Destitute)', desc: 'Those who are in extreme hardship and have almost nothing.' },
            { num: 3, title: 'Amil Zakat (Administrators)', desc: 'Those appointed to collect and distribute Zakat funds.' },
            { num: 4, title: 'Mu’allafat al-Qulub (Reconciled Hearts)', desc: 'New converts to Islam or those whose hearts are to be inclined towards goodness.' },
            { num: 5, title: 'Ar-Riqaab (Freeing Captives)', desc: 'To liberate enslaved people or assist those trapped in unjust bondages.' },
            { num: 6, title: 'Al-Gharimeen (Debtors)', desc: 'Those overwhelmed by permissible debts they cannot repay on their own.' },
            { num: 7, title: 'Fi Sabilillah (In the Cause of Allah)', desc: 'Those striving in the path of Allah, Islamic education, and welfare.' },
            { num: 8, title: 'Ibn us-Sabil (The Stranded Traveler)', desc: 'A traveler stranded far from home without access to their funds.' },
          ].map((cat) => (
            <div
              key={cat.num}
              className="p-3.5 rounded-2xl bg-card/75 dark:bg-[#062426]/75 backdrop-blur-xl border border-border/80 dark:border-amber-500/20 shadow-sm flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-500 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {cat.num}
              </span>
              <div>
                <h3 className="text-xs font-black text-text">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-subtext mt-0.5 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
