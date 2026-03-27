export const LS_KEY = "kekoa-v4";

export const today = () => new Date().toISOString().slice(0, 10);

export const loadState = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY));
  } catch {
    return null;
  }
};

export const saveState = (s) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
};

export const getPhase = (w) => (w <= 4 ? 1 : w <= 8 ? 2 : 3);
export const getPhaseKey = (w) => (getPhase(w) === 1 ? "p1" : getPhase(w) === 2 ? "p2" : "p3");

export function dateToWeek(startDate, dateStr) {
  return Math.max(1, Math.floor((new Date(dateStr) - new Date(startDate)) / 604800000) + 1);
}

export function weekDates(startDate, weekNum) {
  try {
    const s = new Date(startDate || today());
    if (isNaN(s.getTime())) return Array(7).fill(today());
    s.setDate(s.getDate() + ((weekNum || 1) - 1) * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  } catch {
    return Array(7).fill(today());
  }
}
