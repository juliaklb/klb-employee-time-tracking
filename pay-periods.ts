export type PayPeriod = { start: string; end: string; due: string; number: number | null; status: "done" | "open" };

const DAY = 86_400_000;
const iso = (date: Date) => date.toISOString().slice(0, 10);

export const PAY_PERIODS: PayPeriod[] = Array.from({ length: 44 }, (_, index) => {
  const start = new Date(Date.UTC(2026, 4, 2) + index * 14 * DAY);
  const end = new Date(start.getTime() + 13 * DAY);
  const due = new Date(end.getTime() + 2 * DAY);
  const firstNumbered = Date.UTC(2026, 11, 26);
  const number = start.getTime() >= firstNumbered ? Math.floor((start.getTime() - firstNumbered) / (14 * DAY)) + 1 : null;
  return { start: iso(start), end: iso(end), due: iso(due), number, status: start <= new Date("2026-06-27T00:00:00Z") ? "done" : "open" };
});

export const periodForDate = (date: Date) => PAY_PERIODS.find(period => date >= new Date(`${period.start}T00:00:00Z`) && date <= new Date(`${period.end}T23:59:59Z`)) ?? PAY_PERIODS[0];
export const formatPeriod = (period: PayPeriod) => `${formatDate(period.start)} – ${formatDate(period.end, true)}`;
export const formatDate = (value: string, withYear = false) => new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" as const } : {}) }).format(new Date(`${value}T12:00:00Z`));
