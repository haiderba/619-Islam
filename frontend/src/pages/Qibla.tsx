import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Compass as CompassIcon, 
  MapPin, 
  AlertCircle, 
  RefreshCw, 
  Navigation, 
  CheckCircle2, 
  Sun, 
  SlidersHorizontal, 
  HelpCircle, 
  X,
  RotateCw,
  LocateFixed,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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

// Approximate Solar Azimuth calculation to align with the Sun in the sky
export const getSunAzimuth = (lat: number, lng: number, date: Date = new Date()): number => {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = 23.45 * Math.sin(rad * (360 / 365) * (dayOfYear - 81)) * rad;
  const timeHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const solarTime = (timeHours + lng / 15) % 24;
  const hourAngle = (solarTime - 12) * 15 * rad;

  const latRad = lat * rad;
  const altitude = Math.asin(
    Math.sin(latRad) * Math.sin(declination) +
    Math.cos(latRad) * Math.cos(declination) * Math.cos(hourAngle)
  );

  let azimuth = Math.acos(
    (Math.sin(declination) - Math.sin(latRad) * Math.sin(altitude)) /
    (Math.cos(latRad) * Math.cos(altitude))
  ) / rad;

  if (Math.sin(hourAngle) > 0) {
    azimuth = 360 - azimuth;
  }
  return (azimuth + 360) % 360;
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
  const [locationName, setLocationName] = useState<string>('Detecting location...');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsPermissionState, setGpsPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const [error, setError] = useState<string>('');
  const [permissionRequired, setPermissionRequired] = useState<boolean>(false);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [tiltWarning, setTiltWarning] = useState<boolean>(false);
  const [isAligned, setIsAligned] = useState<boolean>(false);
  const [diffAngleDisplay, setDiffAngleDisplay] = useState<number>(0);
  
  // Calibration & Assistive Tools
  const [calibrationOffset, setCalibrationOffset] = useState<number>(0);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [showOffsetControls, setShowOffsetControls] = useState<boolean>(false);
  const [sunAzimuth, setSunAzimuth] = useState<number | null>(null);

  // Direct DOM Refs & Animation Refs for 60fps rendering
  const dialRef = useRef<HTMLDivElement | null>(null);
  const rawHeadingRef = useRef<number | null>(null);
  const smoothHeadingRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastStateUpdateRef = useRef<number>(0);
  const hasVibratedRef = useRef<boolean>(false);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    offsetRef.current = calibrationOffset;
  }, [calibrationOffset]);

  // 1. High-Accuracy GPS Position & Ummah/Aladhan Qibla Verification
  const requestGPSLocation = useCallback(() => {
    setLocationLoading(true);
    setError('');

    const applyCoords = async (lat: number, lng: number, accuracy?: number) => {
      setUserCoords({ lat, lng });
      if (accuracy) setGpsAccuracy(Math.round(accuracy));

      // Calculate mathematically via great-circle geodesics
      const calculatedBearing = getQiblaBearing(lat, lng);
      setQiblaBearing(calculatedBearing);
      setDistanceKm(getDistanceToMecca(lat, lng));
      setSunAzimuth(Math.round(getSunAzimuth(lat, lng)));

      // Reverse geocode city name & verify with Aladhan Qibla API in parallel
      try {
        const [geoRes, qiblaApiRes] = await Promise.all([
          axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`).catch(() => null),
          axios.get(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`).catch(() => null)
        ]);

        if (geoRes?.data) {
          const city = geoRes.data.city || geoRes.data.locality || geoRes.data.principalSubdivision;
          const country = geoRes.data.countryName;
          if (city && country) {
            setLocationName(`${city}, ${country}`);
          } else if (city || country) {
            setLocationName(city || country);
          }
        }

        // Cross-verify with Aladhan API if available
        if (qiblaApiRes?.data?.data?.direction) {
          const apiBearing = Number(qiblaApiRes.data.data.direction);
          if (!isNaN(apiBearing)) {
            setQiblaBearing(apiBearing);
          }
        }
      } catch (e) {
        // Fallback already set via geodesic formula
      } finally {
        setLocationLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsPermissionState('granted');
          applyCoords(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        (err) => {
          console.warn("GPS Permission or lookup error:", err);
          if (err.code === err.PERMISSION_DENIED) {
            setGpsPermissionState('denied');
            setError("GPS Location access was denied. Please allow Location in browser settings for 100% accuracy.");
          }
          // Fallback to user saved profile coordinates
          if (user?.latitude && user?.longitude) {
            applyCoords(parseFloat(user.latitude), parseFloat(user.longitude));
          } else {
            // Default Lahore coordinates as safety fallback
            applyCoords(31.5204, 74.3587);
            setLocationName('Lahore, Pakistan (Default)');
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 12000, 
          maximumAge: 0 // Always request fresh real-time satellite fix
        }
      );
    } else if (user?.latitude && user?.longitude) {
      applyCoords(parseFloat(user.latitude), parseFloat(user.longitude));
    } else {
      applyCoords(31.5204, 74.3587);
    }
  }, [user]);

  useEffect(() => {
    requestGPSLocation();
  }, [requestGPSLocation]);

  const hasAbsoluteRef = useRef<boolean>(false);

  // 2. Multi-Sensor Orientation Listener (Clean separation between iOS, Android Absolute, and Relative)
  const handleOrientation = useCallback((event: DeviceOrientationEvent | any, isAbsoluteEvent: boolean = false) => {
    let compassHeading: number | null = null;

    // Detect device tilt
    if (event.beta !== null && event.gamma !== null) {
      const isTilted = Math.abs(event.beta) > 35 || Math.abs(event.gamma) > 35;
      setTiltWarning(isTilted);
    }

    // 🍎 1. iOS WebKit Compass Heading (0 = True North, clockwise)
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      compassHeading = Number(event.webkitCompassHeading);
      setSensorActive(true);
      setPermissionRequired(false);
      hasAbsoluteRef.current = true;
    } 
    // 🤖 2. Android Absolute Orientation (deviceorientationabsolute or absolute === true)
    else if (isAbsoluteEvent || event.absolute === true) {
      if (event.alpha !== null && event.alpha !== undefined) {
        compassHeading = (360 - event.alpha) % 360;
        setSensorActive(true);
        setPermissionRequired(false);
        hasAbsoluteRef.current = true;
      }
    } 
    // 📱 3. Standard Fallback (ONLY if absolute orientation has never fired)
    else if (!hasAbsoluteRef.current && event.alpha !== null && event.alpha !== undefined) {
      compassHeading = (360 - event.alpha) % 360;
      setSensorActive(true);
      setPermissionRequired(false);
    }

    if (compassHeading !== null && !isNaN(compassHeading)) {
      // Apply user manual calibration offset
      const correctedHeading = (compassHeading + offsetRef.current + 360) % 360;
      rawHeadingRef.current = correctedHeading;
      if (smoothHeadingRef.current === null) {
        smoothHeadingRef.current = correctedHeading;
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

        // Deadzone Noise Gate: if movement is under 0.2 degrees, hold steady
        if (Math.abs(diff) > 0.2) {
          // Low-pass exponential smoothing factor (0.18 gives fluid response without jitter)
          const smoothed = (current + diff * 0.18 + 360) % 360;
          smoothHeadingRef.current = smoothed;

          // Direct DOM transform update for ultra-low latency
          if (dialRef.current) {
            dialRef.current.style.transform = `rotate(${-smoothed}deg)`;
          }
        }

        // Throttle React state updates to ~15fps for UI numbers and alignment check
        const now = performance.now();
        if (now - lastStateUpdateRef.current > 65) {
          lastStateUpdateRef.current = now;
          const currentHeading = Math.round(smoothHeadingRef.current);
          setHeadingDisplay(currentHeading);

          if (qiblaBearing !== null) {
            const relDiff = ((qiblaBearing - currentHeading + 540) % 360) - 180;
            const roundedDiff = Math.round(relDiff);
            setDiffAngleDisplay(roundedDiff);
            const aligned = Math.abs(roundedDiff) <= 4;
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

  // 4. Request Sensor Permissions (iOS User-Gesture requirement)
  const requestSensorPermission = async () => {
    // @ts-ignore
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const state = await DeviceOrientationEvent.requestPermission();
        if (state === 'granted') {
          setPermissionRequired(false);
          setSensorActive(true);
          window.addEventListener('deviceorientation', (e) => handleOrientation(e, false), true);
        } else {
          setError("Sensor permission denied. Please enable motion sensors in Safari Settings.");
          setPermissionRequired(true);
        }
      } catch (err) {
        console.error("Sensor permission error", err);
        setError("Please allow sensor access when prompted.");
      }
    } else {
      setPermissionRequired(false);
      setSensorActive(true);
      window.addEventListener('deviceorientationabsolute', (e) => handleOrientation(e, true), true);
      window.addEventListener('deviceorientation', (e) => handleOrientation(e, false), true);
    }
  };

  useEffect(() => {
    // @ts-ignore
    const isIOS = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
    
    const handleAbs = (e: any) => handleOrientation(e, true);
    const handleRel = (e: any) => handleOrientation(e, false);

    if (isIOS) {
      setPermissionRequired(true);
    } else {
      window.addEventListener('deviceorientationabsolute', handleAbs, true);
      window.addEventListener('deviceorientation', handleRel, true);
    }

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleAbs, true);
      window.removeEventListener('deviceorientation', handleRel, true);
    };
  }, [handleOrientation]);

  const qiblaNeedleAngle = qiblaBearing !== null ? qiblaBearing : 0;

  return (
    <div className="p-4 sm:p-6 pb-28 max-w-lg mx-auto flex flex-col items-center justify-between min-h-[88vh] text-center space-y-4">
      {/* Header */}
      <header className="pt-2 w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${sensorActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <span className="text-[11px] font-black uppercase tracking-wider text-text">
              {sensorActive ? 'Live Sensor 100% Active' : 'Calibrating Compass...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowCalibrationModal(true)}
              className="p-2 rounded-xl bg-card border border-border text-subtext hover:text-text text-xs font-bold flex items-center gap-1 shadow-sm"
              title="Calibration Guide"
            >
              <HelpCircle size={15} />
            </button>

            <button
              onClick={() => setShowOffsetControls(!showOffsetControls)}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 shadow-sm transition-colors ${
                showOffsetControls 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-card border-border text-subtext hover:text-text'
              }`}
              title="Fine-Tune Offset"
            >
              <SlidersHorizontal size={15} />
            </button>

            <button 
              onClick={requestGPSLocation} 
              disabled={locationLoading}
              className="p-2 text-subtext hover:text-primary transition-colors active:scale-95 bg-card border border-border rounded-xl shadow-sm"
              title="Refresh GPS"
            >
              <RefreshCw size={15} className={locationLoading ? 'animate-spin text-primary' : ''} />
            </button>
          </div>
        </div>

        {/* Location & GPS Accuracy Banner */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-card border border-border/80 shadow-sm text-left">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-text truncate">{locationName}</p>
              <p className="text-[10px] text-subtext">
                {userCoords ? `${userCoords.lat.toFixed(4)}° N, ${userCoords.lng.toFixed(4)}° E` : 'Detecting GPS...'}
                {gpsAccuracy ? ` • ±${gpsAccuracy}m accuracy` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={requestGPSLocation}
            className={`shrink-0 px-2.5 py-1.5 rounded-xl font-bold text-[10px] border flex items-center gap-1 transition-colors ${
              gpsPermissionState === 'denied'
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20'
            }`}
          >
            <LocateFixed size={12} />
            <span>{gpsPermissionState === 'denied' ? 'Grant GPS Access' : 'Recalibrate GPS'}</span>
          </button>
        </div>
      </header>

      {/* Sensor Permission Banner (iOS) */}
      {permissionRequired && (
        <div className="w-full bg-gradient-to-r from-primary/15 via-primary/5 to-card border-2 border-primary/40 p-4 rounded-3xl flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
              <CompassIcon size={22} />
            </div>
            <div>
              <p className="text-xs font-black text-text">Enable Gyroscope & Compass</p>
              <p className="text-[11px] text-subtext">Tap to unlock real-time 360° device orientation.</p>
            </div>
          </div>
          <button
            onClick={requestSensorPermission}
            className="px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-2xl shadow-md active:scale-95 transition-all shrink-0 hover:bg-primary-dark"
          >
            Enable Now
          </button>
        </div>
      )}

      {/* Manual Fine-Tuning Calibration Slider (if opened) */}
      {showOffsetControls && (
        <div className="w-full bg-card border border-border p-3.5 rounded-2xl space-y-2 text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text">
              <SlidersHorizontal size={14} className="text-primary" />
              <span>Compass Fine-Tune Offset</span>
            </div>
            <span className="text-xs font-black text-primary">{calibrationOffset > 0 ? `+${calibrationOffset}°` : `${calibrationOffset}°`}</span>
          </div>
          <p className="text-[10px] text-subtext leading-relaxed">
            If magnetic interference from phone cases causes a slight shift, adjust the degree offset to match your true North.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setCalibrationOffset(prev => Math.max(prev - 5, -45))}
              className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-bold hover:bg-border"
            >
              -5°
            </button>
            <input
              type="range"
              min="-45"
              max="45"
              value={calibrationOffset}
              onChange={(e) => setCalibrationOffset(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <button
              onClick={() => setCalibrationOffset(prev => Math.min(prev + 5, 45))}
              className="px-3 py-1 bg-surface border border-border rounded-lg text-xs font-bold hover:bg-border"
            >
              +5°
            </button>
            <button
              onClick={() => setCalibrationOffset(0)}
              className="px-2 py-1 bg-surface border border-border rounded-lg text-[10px] text-subtext hover:text-text font-bold"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Error / Notice Banner */}
      {error && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-left">
          <AlertCircle size={16} className="shrink-0" />
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Tilt Warning */}
      {tiltWarning && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs px-3.5 py-1.5 rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
          <RotateCw size={13} className="shrink-0" />
          <span>Hold phone flat horizontally for maximum precision</span>
        </div>
      )}

      {/* 🧭 Main Smooth Compass Bezel */}
      <div className="relative w-full max-w-[310px] aspect-square flex items-center justify-center my-2">
        
        {/* Alignment Glow Aura */}
        <div className={`absolute inset-0 rounded-full transition-all duration-700 blur-2xl ${
          isAligned 
            ? 'bg-emerald-500/40 scale-105' 
            : 'bg-primary/5 scale-95'
        }`} />

        {/* Top Direction Indicator (Device Forward Line) */}
        <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
          <div className={`w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[14px] transition-colors duration-300 ${
            isAligned ? 'border-t-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,1)]' : 'border-t-primary'
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
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 font-black text-sm text-rose-500">N</div>
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
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                    isAligned 
                      ? 'bg-emerald-500 border-white text-white scale-110 shadow-emerald-500/60' 
                      : 'bg-card border-primary text-primary shadow-primary/20'
                  }`}>
                    <span className="text-xl">🕋</span>
                  </div>

                  {/* Golden Beam */}
                  <div className={`w-1.5 h-20 rounded-full mt-1 transition-all duration-300 ${
                    isAligned 
                      ? 'bg-gradient-to-b from-emerald-500 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.9)]' 
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

      {/* Status & Direction Guidance Card */}
      <div className="w-full space-y-2.5">
        <div className={`p-4 rounded-3xl border transition-all duration-300 flex items-center justify-between ${
          isAligned 
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-xl shadow-emerald-500/10' 
            : 'bg-card border-border text-text shadow-sm'
        }`}>
          <div className="flex items-center gap-3 text-left">
            {isAligned ? (
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                <CheckCircle2 size={24} />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Navigation size={20} className="transform -rotate-45" />
              </div>
            )}
            <div>
              <p className="font-black text-sm">
                {isAligned 
                  ? '✨ Perfect! Facing Holy Kaaba' 
                  : headingDisplay !== null 
                    ? `Turn ${Math.abs(diffAngleDisplay)}° ${diffAngleDisplay > 0 ? 'Right' : 'Left'}`
                    : 'Point phone towards Qibla'
                }
              </p>
              <p className="text-xs text-subtext mt-0.5">
                {isAligned 
                  ? 'Prayer direction locked with high accuracy' 
                  : `Target Bearing: ${qiblaBearing ? Math.round(qiblaBearing) : '--'}° ${qiblaBearing ? getCardinalDirection(qiblaBearing) : ''}`
                }
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-black text-primary">
              {qiblaBearing !== null ? `${Math.round(qiblaBearing)}°` : '--'}
            </span>
          </div>
        </div>

        {/* Distance & Astronomical Sun Verification Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-card border border-border p-3.5 rounded-2xl text-left shadow-sm space-y-0.5">
            <div className="flex items-center gap-1.5 text-muted">
              <MapPin size={13} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Distance</span>
            </div>
            <p className="text-sm font-black text-text">
              {distanceKm ? `${distanceKm.toLocaleString()} km` : '--'}
            </p>
            <p className="text-[10px] text-subtext truncate">To Mecca Al-Mukarramah</p>
          </div>

          <div className="bg-card border border-border p-3.5 rounded-2xl text-left shadow-sm space-y-0.5">
            <div className="flex items-center gap-1.5 text-muted">
              <Sun size={13} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Sun Position</span>
            </div>
            <p className="text-sm font-black text-text">
              {sunAzimuth !== null ? `${sunAzimuth}° ${getCardinalDirection(sunAzimuth)}` : '--'}
            </p>
            <p className="text-[10px] text-subtext truncate">Current Solar Angle</p>
          </div>
        </div>
      </div>

      {/* 📖 Sensor Calibration & Tutorial Modal */}
      {showCalibrationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-base font-black text-text">100% Compass Calibration</h3>
              </div>
              <button
                onClick={() => setShowCalibrationModal(false)}
                className="p-1 rounded-xl bg-surface text-subtext hover:text-text"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-subtext leading-relaxed">
              <div className="p-3 rounded-2xl bg-surface border border-border space-y-1">
                <h4 className="font-bold text-text flex items-center gap-1.5">
                  <span>1. Wave in Figure-8 Motion (∞)</span>
                </h4>
                <p className="text-[11px]">
                  Rotate your phone in a smooth infinity (figure-8) pattern in the air for 5 seconds to calibrate your phone's internal magnetometer sensor.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface border border-border space-y-1">
                <h4 className="font-bold text-text flex items-center gap-1.5">
                  <span>2. Keep Device Horizontal & Flat</span>
                </h4>
                <p className="text-[11px]">
                  Lay your phone flat on your palm or a table away from metal objects, magnets, or laptops for perfect precision.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-surface border border-border space-y-1">
                <h4 className="font-bold text-text flex items-center gap-1.5">
                  <span>3. High-Accuracy GPS satellite fix</span>
                </h4>
                <p className="text-[11px]">
                  Tap <strong>"Recalibrate GPS"</strong> outdoors or near a window so the app locks your exact satellite coordinates.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCalibrationModal(false)}
              className="w-full py-3 bg-primary text-white font-bold text-xs rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all text-center"
            >
              Got it, Calibrated!
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Qibla;
