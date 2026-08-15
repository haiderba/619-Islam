export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateFormatted(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getPastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getIslamicDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function getIslamicEvent(date: Date = new Date()): string | null {
  // We can format the date to get just the month and day numbers to match
  const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
    day: '2-digit', month: 'numeric'
  }).formatToParts(date);
  
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  
  const key = `${m}-${d}`;
  const events: Record<string, string> = {
    '1-1': 'Islamic New Year',
    '1-10': 'Day of Ashura',
    '3-12': 'Mawlid al-Nabi',
    '7-27': 'Isra and Mi\'raj',
    '8-15': 'Mid-Sha\'ban',
    '9-1': 'Ramadan Begins',
    '9-27': 'Laylat al-Qadr',
    '10-1': 'Eid al-Fitr',
    '12-9': 'Day of Arafah',
    '12-10': 'Eid al-Adha',
  };
  
  return events[key] || null;
}

export function getDesiDateString(date: Date = new Date()): string {
  // Pakistani Desi (Punjabi/Bikrami) Calendar logic
  const d = date.getDate();
  const m = date.getMonth() + 1; // 1-12
  
  const desiMonths = [
    "Baisakh", "Jeth", "Harh", "Sawan", "Bhadon", "Assu",
    "Katik", "Maghar", "Poh", "Magh", "Phagun", "Chet"
  ];
  
  // Starting day of each Gregorian month for the Desi month
  // Approximate Sankranti dates: Jan 14, Feb 13, Mar 14, Apr 14, May 15, Jun 15, Jul 16, Aug 16, Sep 16, Oct 17, Nov 16, Dec 16
  const starts = [14, 13, 14, 14, 15, 15, 16, 16, 16, 17, 16, 16];
  
  let monthIndex = 0;
  let desiDay = 1;
  let desiYear = date.getFullYear() + 57; // Bikrami year
  
  if (m === 4 && d >= starts[3]) { monthIndex = 0; desiDay = d - starts[3] + 1; }
  else if (m === 5 && d < starts[4]) { monthIndex = 0; desiDay = d + (30 - starts[3] + 1); }
  else if (m === 5 && d >= starts[4]) { monthIndex = 1; desiDay = d - starts[4] + 1; }
  else if (m === 6 && d < starts[5]) { monthIndex = 1; desiDay = d + (31 - starts[4] + 1); }
  else if (m === 6 && d >= starts[5]) { monthIndex = 2; desiDay = d - starts[5] + 1; }
  else if (m === 7 && d < starts[6]) { monthIndex = 2; desiDay = d + (30 - starts[5] + 1); }
  else if (m === 7 && d >= starts[6]) { monthIndex = 3; desiDay = d - starts[6] + 1; }
  else if (m === 8 && d < starts[7]) { monthIndex = 3; desiDay = d + (31 - starts[6] + 1); }
  else if (m === 8 && d >= starts[7]) { monthIndex = 4; desiDay = d - starts[7] + 1; }
  else if (m === 9 && d < starts[8]) { monthIndex = 4; desiDay = d + (31 - starts[7] + 1); }
  else if (m === 9 && d >= starts[8]) { monthIndex = 5; desiDay = d - starts[8] + 1; }
  else if (m === 10 && d < starts[9]) { monthIndex = 5; desiDay = d + (30 - starts[8] + 1); }
  else if (m === 10 && d >= starts[9]) { monthIndex = 6; desiDay = d - starts[9] + 1; }
  else if (m === 11 && d < starts[10]) { monthIndex = 6; desiDay = d + (31 - starts[9] + 1); }
  else if (m === 11 && d >= starts[10]) { monthIndex = 7; desiDay = d - starts[10] + 1; }
  else if (m === 12 && d < starts[11]) { monthIndex = 7; desiDay = d + (30 - starts[10] + 1); }
  else if (m === 12 && d >= starts[11]) { monthIndex = 8; desiDay = d - starts[11] + 1; }
  else if (m === 1 && d < starts[0]) { monthIndex = 8; desiDay = d + (31 - starts[11] + 1); desiYear -= 1; }
  else if (m === 1 && d >= starts[0]) { monthIndex = 9; desiDay = d - starts[0] + 1; desiYear -= 1; }
  else if (m === 2 && d < starts[1]) { monthIndex = 9; desiDay = d + (31 - starts[0] + 1); desiYear -= 1; }
  else if (m === 2 && d >= starts[1]) { monthIndex = 10; desiDay = d - starts[1] + 1; desiYear -= 1; }
  else if (m === 3 && d < starts[2]) { monthIndex = 10; desiDay = d + (28 - starts[1] + 1); desiYear -= 1; }
  else if (m === 3 && d >= starts[2]) { monthIndex = 11; desiDay = d - starts[2] + 1; desiYear -= 1; }
  else if (m === 4 && d < starts[3]) { monthIndex = 11; desiDay = d + (31 - starts[2] + 1); desiYear -= 1; }
  
  return `${desiDay} ${desiMonths[monthIndex]} ${desiYear}`;
}
