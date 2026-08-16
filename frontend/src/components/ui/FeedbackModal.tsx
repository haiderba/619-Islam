import React, { useState } from 'react';
import { MessageSquare, Star, Send, X, CheckCircle2, Sparkles, Bug, BookOpen, ThumbsUp, Lightbulb } from 'lucide-react';
import { feedbackService, CreateFeedbackPayload } from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'feature_request', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'improvement', label: 'App Improvement', icon: Sparkles, color: 'text-primary bg-primary/10 border-primary/30' },
  { id: 'translation_correction', label: 'Quran / Translation', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'bug_report', label: 'Bug Report', icon: Bug, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'compliment', label: 'Dua / Compliment', icon: ThumbsUp, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
] as const;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<CreateFeedbackPayload['category']>('feature_request');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState(user?.name || user?.username || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      setSubmitting(true);
      await feedbackService.submitFeedback({
        category,
        subject: subject.trim(),
        message: message.trim(),
        user_name: userName.trim() || undefined,
        user_email: userEmail.trim() || undefined
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setSubject('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-teal-700 to-amber-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-white/15 backdrop-blur-sm">
              <MessageSquare className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Suggest Features & Feedback</h2>
              <p className="text-white/80 text-xs font-medium">Help us build and improve 619 Islam for the Ummah</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* ⭐ Star on GitHub Callout Card */}
          <div className="bg-surface/80 border border-border/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 group hover:border-amber-500/40 transition-all shadow-sm">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <Star size={22} className="fill-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text">Love 619 Islam?</h4>
                <p className="text-[11px] text-subtext leading-tight mt-0.5">
                  Star our official repository on GitHub to support open Islamic technology!
                </p>
              </div>
            </div>

            <a
              href="https://github.com/haiderba/619-Islam"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-extrabold shadow-md active:scale-95 transition-all shrink-0"
            >
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>Star on GitHub</span>
            </a>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-base sm:text-lg font-black text-text">JazakAllahu Khairan!</h3>
              <p className="text-xs text-subtext max-w-sm mx-auto leading-relaxed">
                Your feedback has been delivered to the developers. We review all requests and implement updates for the Ummah regularly!
              </p>
              <button
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Category Picker */}
              <div>
                <label className="block text-[11px] font-bold text-subtext uppercase tracking-wider mb-2">
                  Feedback Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-md font-bold'
                            : 'bg-surface border-border/80 text-text hover:border-primary/40'
                        }`}
                      >
                        <Icon size={14} className={isSelected ? 'text-white' : 'text-primary'} />
                        <span className="text-xs font-semibold truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-subtext uppercase tracking-wider mb-1">
                  Title / Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add Pashto Tafsir / Audio recitation bookmark"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold text-subtext uppercase tracking-wider mb-1">
                  Your Suggestion / Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the feature, improvement, or feedback in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-text text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Optional Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-subtext uppercase tracking-wider mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl text-text text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                <Send size={15} />
                <span>{submitting ? 'Submitting...' : 'Send Feedback to Developers'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-surface/50 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-card border border-border text-xs font-bold text-subtext hover:text-text hover:bg-surface transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
