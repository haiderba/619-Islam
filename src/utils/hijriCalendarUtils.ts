export function getHijriDate(date: Date = new Date()): { day: number; monthName: string; year: number; formatted: string } {
  // Kuwati / Astronomical tabular algorithm approximation for Hijri conversion
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  let m = month + 1;
  let y = year;

  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);

  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

  let z = Math.floor(jd + 0.5);
  let i = Math.floor((z - 1867216.25) / 36524.25);
  a = z + 1 + i - Math.floor(i / 4);
  let bb = a + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);

  let l = bb - dd - Math.floor(30.6001 * ee);
  let n = ee - 1;
  if (ee > 13) n = ee - 13;
  let jyear = cc - 4716;
  if (n < 3) jyear = cc - 4715;

  let iyear = 10631 / 30;
  let epochastro = 1948084;

  let shift1 = 8.01 / 60;
  let z2 = Math.floor(jd - epochastro + shift1);
  let cyc = Math.floor(z2 / 10631);
  z2 = z2 - 10631 * cyc;
  let j2 = Math.floor((z2 - shift1) / iyear);
  let iy = 30 * cyc + j2;
  z2 = z2 - Math.floor(j2 * iyear + shift1);
  let im = Math.floor((z2 + 28.5001) / 29.5);

  if (im === 13) im = 12;
  let id = z2 - Math.floor(29.5001 * im - 29);

  const HIJRI_MONTHS = [
    'Muharram',
    'Safar',
    'Rabi’ al-Awwal',
    'Rabi’ al-Thani',
    'Jumada al-Awwal',
    'Jumada al-Thani',
    'Rajab',
    'Sha’ban',
    'Ramadan',
    'Shawwal',
    'Dhu al-Qa’dah',
    'Dhu al-Hijjah',
  ];

  const monthName = HIJRI_MONTHS[Math.max(0, Math.min(11, im - 1))];
  const hDay = Math.max(1, Math.min(30, id));
  const hYear = iy;

  return {
    day: hDay,
    monthName,
    year: hYear,
    formatted: `${hDay} ${monthName} ${hYear} AH`,
  };
}
