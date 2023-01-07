import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

export const timeDurationFormatter = buildFormatter({
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: '',
    suffixFromNow: 'from now',
    seconds: 'just now',
    minute: '1 minute',
    minutes: '%d minutes',
    hour: '1 hour',
    hours: '%d hours',
    day: '1 day',
    days: '%d days',
    month: '1 month',
    months: '%d months',
    year: '1 year',
    years: '%d years',
    wordSeparator: ' ',
    numbers: []
});

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

export function getDurationText({
  d1,
  d2 = new Date(),
  unitDisplay = 'long',
  minimumUnit = 'second',
}: {
  d1: Date;
  d2?: Date;
  unitDisplay?: 'short' | 'long' | 'narrow' | undefined;
  minimumUnit?: TimeUnit;
}) {
  const elapsed = Math.abs(d1.valueOf() - d2.valueOf());

  if (Number.isNaN(elapsed)) {
    return;
  }

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u of Object.keys(units)) {
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
}
