// Use the unchanged storage module at the same public URL so existing journals and checks remain compatible.
// shortcut: assets use root URLs; add base-path support before subfolder hosting.
const storageModule = new URL("/js/practice-db.js", window.location.origin)
  .href;
export const db = await import(/* @vite-ignore */ storageModule);

export type Progress = {
  date: string;
  mantraName: string;
  isPracticed: boolean;
};
export type Journal = { startDate: string; progress: Progress[] };
export type DeletedCopy = {
  id: string;
  startDate: string;
  deletedAt: string;
  completedCount: number;
};
