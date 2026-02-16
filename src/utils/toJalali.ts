export function toJalali(gregorianStr: string): string {
  // ---------- 1. Parse input ----------
  const [datePart, timePart] = gregorianStr.split(' ');
  const [gy, gm, gd] = datePart.split('-').map(Number);
  const [gh, gmin, gs] = timePart.split(':').map(Number);

  // ---------- 2. Gregorian to Jalali date conversion ----------
  // Algorithm based on jalaali-js (public domain)
  const gregorianToJalali = (gy: number, gm: number, gd: number): [number, number, number] => {
    const gDaysInMonth: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const jDaysInMonth: number[] = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

    const gy2: number = (gm > 2) ? (gy + 1) : gy;
    let days: number = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd;
    for (let i = 0; i < gm - 1; ++i) {
      days += gDaysInMonth[i];
    }

    let jy: number = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;

    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }

    let jm: number;
    for (jm = 0; jm < 11 && days >= jDaysInMonth[jm]; ++jm) {
      days -= jDaysInMonth[jm];
    }
    jm++; // month is 1‑based
    const jd: number = days + 1;

    return [jy, jm, jd];
  };

  const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);

  // ---------- 3. Convert numbers to Persian digits ----------
  const toPersianDigits = (num: number): string => {
    const persianDigits: string[] = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const result = String(num).split('').map(d => persianDigits[parseInt(d, 10)]).join('');
    return num > 9 ? result : `۰${result}` ;
  };

  const jyStr: string = toPersianDigits(jy);
  const jmStr: string = toPersianDigits(jm);
  const jdStr: string = toPersianDigits(jd);
  const ghStr: string = toPersianDigits(gh);
  const gminStr: string = toPersianDigits(gmin);
  const gsStr: string = toPersianDigits(gs);

  return `${jyStr}/${jmStr}/${jdStr} ${ghStr}:${gminStr}:${gsStr}`;
}