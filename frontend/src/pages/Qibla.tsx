import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Compass as CompassIcon, MapPin, AlertCircle, RefreshCw, Navigation, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MECCA_LAT = 21.422487;
const MECCA_LNG = 39.826206;

// Formula to calculate Qibla bearing from user coordinates
export const getQiblaBearing = (lat: number, lng: number): number => {
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;
  const phi2 = (MECCA_LAT * Math.PI) / 180;
  const lambda2 = (MECCA_LNG * Math.PI) / 180;
  const deltaLambda = lambda2 - lambda1;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
};

// Haversine formula to calculate distance in km to Mecca
export const getDistanceToMecca = (lat: number, lng: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((MECCA_LAT - lat) * Math.PI) / 180;
  const dLon = ((MECCA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((MECCA_LAT * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Get cardinal direction name (e.g. NNE, WSW)
export const getCardinalDirection = (angle: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((angle % 360) / 22.5)) % 16;
  return directions[index];
};

const Qibla: React.FC = () => {
  const { user } = useAuth();

  const [headingDisplay, setHeadingDisplay] = useState<number | null>(null);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [error, setError] = useState<string>('');
  const [permissionRequired, setPermissionRequired] = useState<boolean>(false);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [tiltWarning, setTiltWarning] = useState<boolean>(false);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [diffAngleDisplay, setDiffAngleDisplay] = useState<number>(0);

  // Direct DOM Refs & Animation Refs for high-performance zero-lag 60fps rendering
  const dialRef = useRef<HTMLDivElement | null>(null);
  const rawHeadingRef = useRef<number | null>(null);
  const smoothHeadingRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastStateUpdateRef = useRef<number>(0);
  const hasVibratedRef = useRef<boolean>(false);

  // 1. Fetch & compute coordinates
  const fetchCoordinates = useCallback(() => {
    setLocationLoading(true);
    setError('');

    const applyCoords = (lat: number, lng: number) => {
      setUserCoords({ lat, lng });
      const bearing = getQiblaBearing(lat, lng);
      setQiblaBearing(bearing);
      setDistanceKm(getDistanceToMecca(lat, lng));
      setLocationLoading(false);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("GPS lookup fallback", err);
          if (user?.latitude && user?.longitude) {
            applyCoords(parseFloat(user.latitude), parseFloat(user.longitude));
          } else {
            applyCoords(31.5204, 74.3587);
            setError("Using default coordinates. Tap Refresh GPS to update.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else if (user?.latitude && user?.longitude) {
      applyCoords(parseFloat(user.latitude), parseFloat(user.longitude));
    } else {
      applyCoords(31.5204, 74.3587);
    }
  }, [user]);

  useEffect(() => {
    fetchCoordinates();
  }, [fetchCoordinates]);

  // 2. High-Frequency Sensor Listener (Updates raw heading ref without re-renders)
  const handleOrientation = useCallback((event: DeviceOrientationEvent | any) => {
    let compassHeading: number | null = null;

    // Detect device tilt
    if (event.beta !== null && event.gamma !== null) {
      const isTilted = Math.abs(event.beta) > 35 || Math.abs(event.gamma) > 35;
      setTiltWarning(isTilted);
    }

    // iOS WebKit Compass
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      compassHeading = event.webkitCompassHeading;
      setSensorActive(true);
      setPermissionRequired(false);
    } 
    // Android Absolute Orientation
    else if (event.absolute === true && event.alpha !== null && event.alpha !== undefined) {
      compassHeading = (360 - event.alpha) % 360;
      setSensorActive(true);
      setPermissionRequired(false);
    } 
    // Standard Alpha Fallback
    else if (event.alpha !== null && event.alpha !== undefined) {
      compassHeading = (360 - event.alpha) % 360;
      setSensorActive(true);
      setPermissionRequired(false);
    }

    if (compassHeading !== null && !isNaN(compassHeading)) {
      rawHeadingRef.current = compassHeading;
      if (smoothHeadingRef.current === null) {
        smoothHeadingRef.current = compassHeading;
      }
    }
  }, []);

  // 3. 60fps Butter-Smooth Damping & Stabilization Loop
  useEffect(() => {
    const updateLoop = () => {
      if (rawHeadingRef.current !== null && smoothHeadingRef.current !== null) {
        const raw = rawHeadingRef.current;
        const current = smoothHeadingRef.current;

        // Calculate shortest angular difference (handling 360/0 wrap-around)
        let diff = ((raw - current + 540) % 360) - 180;

        // Deadzone Noise Gate: if movement is under 0.2 degrees, hold steady on table/flat surface
        if (Math.abs(diff) > 0.2) {
          // Low-pass exponential smoothing factor (0.12 gives smooth, fluid motion without lag)
          const smoothed = (current + diff * 0.12 + 360) % 360;
          smoothHeadingRef.current = smoothed;

          // Direct DOM transform update for ultra-low latency
          if (dialRef.current) {
            dialRef.current.style.transform = `rotate(${-smoothed}deg)`;
          }
        }

        // Throttle React state updates to ~15fps for UI numbers and alignment check
        const now = performance.now();
        if (now - lastStateUpdateRef.current > 70) {
          lastStateUpdateRef.current = now;
          const currentHeading = Math.round(smoothHeadingRef.current);
          setHeadingDisplay(currentHeading);

          if (qiblaBearing !== null) {
            const relDiff = ((qiblaBearing - currentHeading + 540) % 360) - 180;
            setDiffAngleDisplay(relDiff);
            const aligned = Math.abs(relDiff) <= 3;
            setIsAligned(aligned);

            // Haptic vibration on alignment
            if (aligned) {
              if (!hasVibratedRef.current && navigator.vibrate) {
                navigator.vibrate([60, 40, 60]);
                hasVibratedRef.current = true;
              }
            } else {
              hasVibratedRef.current = false;
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [qiblaBearing]);

  // 4. Request Sensor Permissions
  const requestPermission = async () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === 'granted') {
          setPermissionRequired(false);
          setSensorActive(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
          setError("Motion sensor permission denied in browser settings.");
          setPermissionRequired(true);
        }
      } catch (err) {
        console.error("Sensor permission error", err);
        setError("Please allow sensor access when prompted.");
      }
    } else {
      // Android / non-iOS
      setPermissionRequired(false);
      setSensorActive(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const isIOS = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
    
    if (isIOS) {
      setPermissionRequired(true);
    } else {
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  const qiblaNeedleAngle = qiblaBearing !== null ? qiblaBearing : 0;

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto flex flex-col items-center justify-between min-h-[85vh] text-center">
      {/* Header */}
      <header className="pt-2 w-full">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${sensorActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            {sensorActive ? 'Live Sensor Active' : 'Calibrating'}
          </span>
          <button 
            onClick={fetchCoordinates} 
            disabled={locationLoading}
            className="p-2 text-subtext hover:text-primary transition-colors active:scale-95 bg-surface border border-border rounded-full shadow-sm"
            title="Refresh GPS"
          >
            <RefreshCw size={15} className={locationLoading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">Qibla Direction</h1>
        <p className="text-subtext text-xs mt-0.5">Rotate device until the Kaaba needle points straight up</p>
      </header>

      {/* Sensor Permission Banner if iOS */}
      {permissionRequired && (
        <div className="my-2 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-surface border-2 border-primary/30 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <CompassIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-text">Enable Live Compass</p>
              <p className="text-[11px] text-subtext">Tap to unlock accurate gyroscope tracking.</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all shrink-0"
          >
            Enable
          </button>
        </div>
      )}

      {/* Error / Notice Banner */}
      {error && (
        <div className="my-2 w-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tilt Warning Banner */}
      {tiltWarning && (
        <div className="my-1.5 w-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
          <AlertCircle size={14} className="shrink-0" />
          <span>Hold phone flat horizontally for best precision</span>
        </div>
      )}

      {/* Main Smooth Compass Bezel */}
      <div className="relative w-full max-w-[310px] aspect-square flex items-center justify-center my-4">
        
        {/* Alignment Glow Aura */}
        <div className={`absolute inset-0 rounded-full transition-all duration-700 blur-2xl ${
          isAligned 
            ? 'bg-emerald-500/35 scale-105' 
            : 'bg-primary/5 scale-95'
        }`} />

        {/* Top Direction Indicator (Device Forward Line) */}
        <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
          <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] transition-colors duration-300 ${
            isAligned ? 'border-t-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'border-t-primary'
          }`} />
        </div>

        {/* Outer Bezel */}
        <div className="absolute inset-0 rounded-full border-4 border-card/90 bg-gradient-to-b from-surface/90 to-card shadow-2xl backdrop-blur-md flex items-center justify-center">
          
          {/* Degree Ticks */}
          <div className="absolute inset-2 rounded-full border border-border/30 overflow-hidden pointer-events-none opacity-60">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className={`w-[2px] ${deg % 90 === 0 ? 'h-3.5 bg-primary' : 'h-1.5 bg-muted'}`} />
              </div>
            ))}
          </div>

          {/* ROTATING COMPASS DIAL (Hardware-Accelerated via DOM Ref) */}
          <div 
            ref={dialRef}
            className="w-full h-full relative rounded-full will-change-transform"
            style={{ transform: 'rotate(0deg)' }}
          >
            {/* Cardinal Points on Dial */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 font-black text-sm text-red-500">N</div>
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 font-bold text-xs text-subtext">S</div>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-subtext">E</div>
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-subtext">W</div>

            {/* QIBLA POINTER NEEDLE */}
            {qiblaBearing !== null && (
              <div
                className="absolute inset-0 flex justify-center items-start transition-transform duration-300"
                style={{ transform: `rotate(${qiblaNeedleAngle}deg)` }}
              >
                {/* Pointer Arrow & Kaaba Badge */}
                <div className="flex flex-col items-center -mt-1 cursor-pointer">
                  {/* Kaaba Badge */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                    isAligned 
                      ? 'bg-emerald-500 border-white text-white scale-110 shadow-emerald-500/50' 
                      : 'bg-card border-primary text-primary shadow-primary/20'
                  }`}>
                    <span className="text-lg">🕋</span>
                  </div>

                  {/* Golden Beam */}
                  <div className={`w-1.5 h-20 rounded-full mt-1 transition-all duration-300 ${
                    isAligned 
                      ? 'bg-gradient-to-b from-emerald-500 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.8)]' 
                      : 'bg-gradient-to-b from-primary to-transparent'
                  }`} />
                </div>
              </div>
            )}
          </div>

          {/* Center Hub */}
          <div className="absolute w-8 h-8 rounded-full bg-card border-3 border-primary shadow-xl flex items-center justify-center z-20">
            <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${isAligned ? 'bg-emerald-500' : 'bg-primary'}`} />
          </div>

          {/* Heading Readout in Center */}
          <div className="absolute bottom-9 z-10 flex flex-col items-center pointer-events-none">
            <span className="text-[11px] font-bold text-muted uppercase tracking-widest">
              {headingDisplay !== null ? `${headingDisplay}° ${getCardinalDirection(headingDisplay)}` : 'Live Compass'}
            </span>
          </div>
        </div>
      </div>

      {/* Status & Navigation Guidance Card */}
      <div className="w-full space-y-2.5">
        {/* Main Status Badge */}
        <div className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
          isAligned 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10' 
            : 'bg-card border-border text-text shadow-sm'
        }`}>
          <div className="flex items-center gap-3 text-left">
            {isAligned ? (
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                <CheckCircle2 size={22} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Navigation size={18} className="transform -rotate-45" />
              </div>
            )}
            <div>
              <p className="font-bold text-xs sm:text-sm">
                {isAligned 
                  ? 'Perfect! Facing Holy Kaaba' 
                  : headingDisplay !== null 
                    ? `Turn ${Math.abs(diffAngleDisplay)}° ${diffAngleDisplay > 0 ? 'Right' : 'Left'}`
                    : 'Point phone towards Qibla'
                }
              </p>
              <p className="text-[11px] text-subtext">
                {isAligned 
                  ? 'Prayer direction is locked and accurate' 
                  : `Qibla Bearing is ${qiblaBearing ? Math.round(qiblaBearing) : '--'}° ${qiblaBearing ? getCardinalDirection(qiblaBearing) : ''}`
                }
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-base sm:text-lg font-black text-primary">
              {qiblaBearing !== null ? `${Math.round(qiblaBearing)}°` : '--'}
            </span>
          </div>
        </div>

        {/* Distance & Coordinates Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-card border border-border p-3 rounded-2xl text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-muted mb-0.5">
              <MapPin size={13} className="text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Distance</span>
            </div>
            <p className="text-sm font-bold text-text">
              {distanceKm ? `${distanceKm.toLocaleString()} km` : '--'}
            </p>
            <p className="text-[10px] text-subtext truncate">To Mecca Al-Mukarramah</p>
          </div>

          <div className="bg-card border border-border p-3 rounded-2xl text-left shadow-sm">
            <div className="flex items-center gap-1.5 text-muted mb-0.5">
              <Sparkles size={13} className="text-accentGold" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Coordinates</span>
            </div>
            <p className="text-sm font-bold text-text truncate">
              {userCoords ? `${userCoords.lat.toFixed(2)}°, ${userCoords.lng.toFixed(2)}°` : 'Detecting...'}
            </p>
            <p className="text-[10px] text-subtext truncate">GPS Location Locked</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qibla;
