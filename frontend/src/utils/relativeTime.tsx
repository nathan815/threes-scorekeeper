// in miliseconds
const units: { [key in Intl.RelativeTimeFormatUnit]?: number } = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
};

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
