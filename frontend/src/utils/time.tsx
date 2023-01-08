// in miliseconds
const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};
type TimeUnit = keyof typeof units;
const unitNames = Object.keys(units) as TimeUnit[];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

export function getRelativeTime(d1: Date, d2: Date = new Date()) {
  const elapsed = d1.valueOf() - d2.valueOf();

  if (Number.isNaN(elapsed)) {
    return;
  }

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u of Object.keys(units)) {
    if (Math.abs(elapsed) > units[u] || u === 'second') {
      return rtf.format(
        Math.round(elapsed / units[u]),
        u as Intl.RelativeTimeFormatUnit
      );
    }
  }
}

export type UnitDisplay = 'short' | 'long' | 'narrow' | undefined;
export function getDurationText({
  d1,
  d2 = new Date(),
  unitDisplay = 'long',
  minimumUnit = 'second',
}: {
  d1: Date;
  d2?: Date;
  unitDisplay?: UnitDisplay;
  minimumUnit?: TimeUnit;
}) {
  const elapsed = Math.abs(d1.valueOf() - d2.valueOf());

  if (Number.isNaN(elapsed)) {
    return '';
  }

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u of unitNames) {
    const meetsMin = units[u] >= (units[minimumUnit] || -1);
    if ((elapsed > units[u] || u === 'second') && meetsMin) {
      const nf = Intl.NumberFormat(navigator.languages as string[], {
        style: 'unit',
        unit: u,
        unitDisplay: unitDisplay,
      });
      return nf.format(Math.round(elapsed / units[u]));
    }
  }

  return '';
}

/**
 * Returns duration since provided date formatted as HH:MM:SS
 */
export function milliToHms(d: number): string {
  d = Number(d) / 1000;
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor((d % 3600) % 60);

  const hDisplay = h > 0 ? h + '' : undefined;
  const mDisplay = m > 0 ? m + '' : '';
  const sDisplay = s + '';

  if (h === 0 && m === 0) {
    return `${s}s`;
  }

  return [hDisplay, mDisplay, sDisplay]
    .filter((v) => v !== undefined)
    .map((v) => v?.padStart(2, '0'))
    .join(':');
}

/**
 * Builds a string showing time since current time as HH:MM:SS
 * When < 1 min ago, returns just seconds as '2s'
 */
export function hoursMinutesSecondsSince(d: Date): string {
  const elapsed = Math.abs(new Date().valueOf() - d.valueOf());
  if (elapsed > units.day) {
    return getDurationText({ d1: d, unitDisplay: 'narrow' });
  }
  return milliToHms(elapsed);
}

/**
 * Finds the closest TimeUnit based on given milliseconds
 */
export function findClosestUnit(ms: number): [TimeUnit, number] {
  for (const [key, val] of Object.entries(units)) {
    if (ms > val) {
      return [key as TimeUnit, val];
    }
  }
  return ['second', units['second']];
}
