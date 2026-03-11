// Convert JS Date to bigint nanoseconds
export function dateToBigIntNs(date: Date): bigint {
  return BigInt(date.getTime()) * 1_000_000n;
}

// Convert bigint nanoseconds to JS Date
export function bigIntNsToDate(ns: bigint): Date {
  return new Date(Number(ns) / 1_000_000);
}

// Convert "YYYY-MM-DD" string to bigint nanoseconds (midnight UTC)
export function dateStringToNs(str: string): bigint {
  const d = new Date(`${str}T00:00:00Z`);
  return BigInt(d.getTime()) * 1_000_000n;
}

// Convert bigint nanoseconds to "YYYY-MM-DD"
export function nsToDateString(ns: bigint): string {
  const d = new Date(Number(ns) / 1_000_000);
  return d.toISOString().substring(0, 10);
}

// Convert "HH:MM" string to bigint (minutes since midnight * 60_000_000_000n)
export function timeStringToNs(str: string): bigint {
  const [h, m] = str.split(":").map(Number);
  return BigInt(h * 60 + m) * 60_000_000_000n;
}

// Convert bigint (minutes since midnight * 60_000_000_000n) to "HH:MM"
export function nsToTimeString(ns: bigint): string {
  const totalMinutes = Number(ns) / 60_000_000_000;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.floor(totalMinutes % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Format date for display: DD.MM.YYYY
export function formatDate(ns: bigint): string {
  const d = new Date(Number(ns) / 1_000_000);
  return d.toLocaleDateString("de-CH");
}

// Format duration in minutes as "X h Y min"
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} h`;
  return `${h}h ${m}min`;
}

// Format CHF amount
export function formatCHF(amount: number): string {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
  }).format(amount);
}

// Get months array for selects
export const MONTHS = [
  { value: 1, label: "Januar" },
  { value: 2, label: "Februar" },
  { value: 3, label: "März" },
  { value: 4, label: "April" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Dezember" },
];

export function getMonthName(month: number): string {
  return MONTHS.find((m) => m.value === month)?.label ?? "";
}
