import React from 'react';
import { useNamaz } from '../hooks/useNamaz';
import { CheckCircle2, Circle, Clock, Compass, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PRAYERS = [
  { name: 'Fajr', icon: '🌅' },
  { name: 'Dhuhr', icon: '☀️' },
  { name: 'Asr', icon: '🌤️' },
  { name: 'Maghrib', icon: '🌇' },
  { name: 'Isha', icon: '🌙' },
];

const Namaz: React.FC = () => {
  const { timings, locationName, loading, error, completedPrayers, togglePrayer } = useNamaz();
  const { user } = useAuth();

  const getNextPrayer = () => {
    if (!timings) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const prayer of PRAYERS) {
      const timeStr = timings[prayer.name as keyof typeof timings];
      if (!timeStr) continue;
      
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        return { name: prayer.name, time: timeStr };
      }
    }
    // If all prayers today have passed, Fajr is next (tomorrow)
    return { name: 'Fajr', time: timings.Fajr };
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto">
      <header className="mb-6 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text">Prayer Times</h1>
          <div className="flex items-center gap-1.5 text-primary mt-1 text-sm font-medium">
            <MapPin size={15} className="shrink-0" />
            <span className="truncate">{locationName} • <span className="text-subtext font-normal">{user?.fiqh}</span></span>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Next Prayer Card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl shadow-lg shadow-primary/20 text-white mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Compass size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">Next Prayer</p>
          <div className="text-4xl font-bold mb-1">{nextPrayer ? nextPrayer.name : '...'}</div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock size={16} />
            <span className="font-medium">{nextPrayer ? nextPrayer.time : '--:--'}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-text mb-4">Today's Tracker</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {PRAYERS.map((prayer) => {
            const timeStr = timings ? timings[prayer.name as keyof typeof timings] : '--:--';
            const isCompleted = !!completedPrayers[prayer.name];
            
            // Format time to 12-hour AM/PM for better readability
            let formattedTime = timeStr;
            if (timeStr && timeStr !== '--:--') {
              const [h, m] = timeStr.split(':');
              const hours = parseInt(h);
              const suffix = hours >= 12 ? 'PM' : 'AM';
              const displayHours = hours % 12 || 12;
              formattedTime = `${displayHours}:${m} ${suffix}`;
            }

            return (
              <div 
                key={prayer.name}
                onClick={() => togglePrayer(prayer.name)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-card border-border hover:border-primary/30 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{prayer.icon}</div>
                  <div>
                    <span className={`block font-bold ${isCompleted ? 'text-subtext line-through' : 'text-text'}`}>
                      {prayer.name}
                    </span>
                    <span className="text-xs font-medium text-muted">{formattedTime}</span>
                  </div>
                </div>
                <div>
                  {isCompleted ? (
                    <CheckCircle2 size={24} className="text-success" />
                  ) : (
                    <Circle size={24} className="text-muted" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Namaz;
