import sequence from "./data/mantras.json" with { type: "json" };

export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear().toString().padStart(4, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
export function addDays(iso, count) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
export function makeDays(start, progress = []) {
  const records = new Map(
    progress.map((item) => [
      `${item.date.slice(0, 10)}:${item.mantraName}`,
      item.isPracticed,
    ]),
  );
  return sequence.map((mantras, index) => ({
    date: addDays(start, index),
    index: index + 1,
    mantras: mantras.map((mantra) => ({
      ...mantra,
      isPracticed:
        records.get(`${addDays(start, index)}:${mantra.name}`) === true,
    })),
  }));
}
export function toProgress(days) {
  return days.flatMap((day) =>
    day.mantras.map((mantra) => ({
      date: `${day.date}T00:00:00`,
      mantraName: mantra.name,
      isPracticed: mantra.isPracticed,
    })),
  );
}
