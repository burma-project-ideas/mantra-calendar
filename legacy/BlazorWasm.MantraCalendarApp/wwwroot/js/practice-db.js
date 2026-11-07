const databaseName = "mantra-practice-calendar";
const storeName = "journal";

export async function getLanguage() {
    const language = await transaction("readonly", store => store.get("language"));
    return language === "en" ? "en" : "mm";
}

export async function setLanguage(language) {
    if (language !== "en" && language !== "mm") throw new Error("Unsupported language.");
    await transaction("readwrite", store => store.put(language, "language"));
    setDocumentLanguage(language);
}

export function setDocumentLanguage(language) {
    document.documentElement.lang = language === "en" ? "en" : "my";
    const error = document.querySelector("#app-error-message");
    const reload = document.querySelector("#blazor-error-ui .reload");
    const dismiss = document.querySelector("#blazor-error-ui .dismiss");
    if (error) error.textContent = language === "en" ? "An unhandled error has occurred." : "အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။";
    if (reload) reload.textContent = language === "en" ? "Reload" : "ပြန်ဖွင့်ရန်";
    if (dismiss) dismiss.setAttribute("aria-label", language === "en" ? "Dismiss error" : "ပိတ်ရန်");
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        let blocked = false;
        request.onupgradeneeded = () => request.result.createObjectStore(storeName);
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
            blocked = true;
            reject(new Error("Close other calendar tabs and reload to open IndexedDB."));
        };
        request.onsuccess = () => {
            const database = request.result;
            database.onversionchange = () => database.close();
            if (blocked) database.close();
            else resolve(database);
        };
    });
}

async function transaction(mode, action) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
        let tx;
        try { tx = database.transaction(storeName, mode); }
        catch (error) { database.close(); reject(error); return; }
        let result;
        tx.oncomplete = () => { database.close(); resolve(result); };
        tx.onabort = () => { database.close(); reject(tx.error || new Error("IndexedDB transaction aborted.")); };
        try {
            const request = action(tx.objectStore(storeName));
            if (request) request.onsuccess = () => { result = request.result; };
        } catch (error) {
            tx.abort();
            reject(error);
        }
    });
}

function validateStartDate(startDate) {
    if (typeof startDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)
        || startDate < "0001-01-01" || startDate > "9999-10-02")
        throw new Error("Choose a valid start date with room for the full 90-day schedule.");
    const date = new Date(`${startDate}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== startDate)
        throw new Error("Invalid schedule date.");
}

function validateProgress(progress) {
    if (!Array.isArray(progress)) throw new Error("Invalid stored progress.");
    return progress.map(record => {
        if (!record || typeof record !== "object") throw new Error("Invalid progress record.");
        const date = record.date ?? record.Date;
        const mantraName = record.mantraName ?? record.MantraName;
        const isPracticed = record.isPracticed ?? record.IsPracticed;
        if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(date)
            || !Number.isFinite(Date.parse(date)) || typeof mantraName !== "string"
            || !mantraName.trim() || typeof isPracticed !== "boolean")
            throw new Error("Invalid progress record.");
        const day = date.slice(0, 10);
        const calendarDate = new Date(`${day}T00:00:00Z`);
        if (day < "0001-01-01" || !Number.isFinite(calendarDate.getTime())
            || calendarDate.toISOString().slice(0, 10) !== day)
            throw new Error("Invalid progress date.");
        return { date: `${day}T00:00:00`, mantraName, isPracticed };
    });
}

async function readSchedule(startDate) {
    validateStartDate(startDate);
    const saved = await transaction("readonly", store => store.get(`schedule:${startDate}`));
    return { startDate, progress: saved === undefined ? [] : validateProgress(saved) };
}

export async function load() {
    await migrateDeletedSchedules();
    const active = await transaction("readonly", store => store.get("activeStartDate"));
    if (active === null) return null;
    if (active !== undefined) return readSchedule(active);

    // Read legacy data only when IndexedDB has never been initialized; never write or delete it.
    let legacy = null;
    try { legacy = window.localStorage.getItem("mantraProgress"); }
    catch (error) { if (error.name !== "SecurityError") throw error; }
    const now = new Date();
    const startDate = legacy !== null ? "2025-07-09"
        : `${now.getFullYear().toString().padStart(4, "0")}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
    validateStartDate(startDate);
    const progress = legacy !== null ? validateProgress(JSON.parse(legacy)) : [];
    const existing = await transaction("readwrite", store => {
        const request = store.get("activeStartDate");
        request.addEventListener("success", () => {
            if (request.result === undefined) {
                store.add(progress, `schedule:${startDate}`);
                store.put(startDate, "activeStartDate");
            }
        });
        return request;
    });
    if (existing !== undefined) return readSchedule(existing);
    return { startDate, progress };
}

export async function listSchedules() {
    let active;
    const keys = await transaction("readonly", store => {
        const request = store.get("activeStartDate");
        request.onsuccess = () => { active = request.result; };
        return store.getAllKeys();
    });
    const starts = keys.filter(key => typeof key === "string" && key.startsWith("schedule:"))
        .map(key => key.slice(9));
    if (active !== undefined && active !== null && !starts.includes(active)) starts.push(active);
    starts.forEach(validateStartDate);
    return starts.sort().reverse();
}

export async function select(startDate) {
    const schedule = await readSchedule(startDate);
    await transaction("readwrite", store => {
        const request = store.get(`schedule:${startDate}`);
        request.onsuccess = () => {
            if (request.result === undefined) store.put([], `schedule:${startDate}`);
        };
        return store.put(startDate, "activeStartDate");
    });
    return schedule;
}

export async function save(startDate, progress) {
    validateStartDate(startDate);
    const valid = validateProgress(progress);
    await transaction("readwrite", store => store.put(valid, `schedule:${startDate}`));
}

export async function deleteSchedule(startDate) {
    validateStartDate(startDate);
    let next = null;
    await transaction("readwrite", store => {
        let active;
        let deleted;
        const current = store.get("activeStartDate");
        current.onsuccess = () => { active = current.result; };
        const target = store.get(`schedule:${startDate}`);
        target.onsuccess = () => { deleted = target.result; };
        const keys = store.getAllKeys();
        keys.addEventListener("success", () => {
            try {
                if (deleted === undefined && active !== startDate) throw new Error("Schedule no longer exists.");
                store.add({ startDate, progress: validateProgress(deleted === undefined ? [] : deleted),
                    deletedAt: new Date().toISOString() }, `deleted:${crypto.randomUUID()}`);
                const remaining = keys.result.filter(key => typeof key === "string"
                    && key.startsWith("schedule:") && key !== `schedule:${startDate}`)
                    .map(key => key.slice(9)).sort().reverse();
                const nextStart = remaining.includes(active) ? active : remaining[0];
                if (nextStart === undefined) {
                    store.delete(`schedule:${startDate}`);
                    store.put(null, "activeStartDate");
                    return;
                }
                validateStartDate(nextStart);
                const request = store.get(`schedule:${nextStart}`);
                request.onsuccess = () => {
                    try {
                        next = { startDate: nextStart, progress: validateProgress(request.result) };
                        store.delete(`schedule:${startDate}`);
                        store.put(nextStart, "activeStartDate");
                    } catch { store.transaction.abort(); }
                };
            } catch { store.transaction.abort(); }
        });
        return keys;
    });
    return next;
}

async function migrateDeletedSchedules() {
    await transaction("readwrite", store => {
        const request = store.get("lastDeletedSchedule");
        request.addEventListener("success", () => {
            if (request.result === undefined) return;
            try {
                const deleted = request.result;
                validateStartDate(deleted?.startDate);
                store.add({ startDate: deleted.startDate, progress: validateProgress(deleted.progress),
                    deletedAt: new Date().toISOString() }, `deleted:${crypto.randomUUID()}`);
                store.delete("lastDeletedSchedule");
            } catch { store.transaction.abort(); }
        });
        return request;
    });
}

export async function listDeletedSchedules() {
    await migrateDeletedSchedules();
    let keys;
    const values = await transaction("readonly", store => {
        const request = store.getAllKeys();
        request.onsuccess = () => { keys = request.result; };
        return store.getAll();
    });
    return keys.flatMap((key, i) => {
        if (typeof key !== "string" || !key.startsWith("deleted:")) return [];
        const deleted = values[i];
        validateStartDate(deleted?.startDate);
        const progress = validateProgress(deleted.progress);
        if (typeof deleted.deletedAt !== "string" || !Number.isFinite(Date.parse(deleted.deletedAt)))
            throw new Error("Invalid deleted schedule timestamp.");
        return [{ id: key, startDate: deleted.startDate, deletedAt: deleted.deletedAt,
            completedCount: progress.filter(record => record.isPracticed).length }];
    }).sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
}

export async function restoreDeletedSchedule(id) {
    if (typeof id !== "string" || !id.startsWith("deleted:")) throw new Error("Invalid recovery identifier.");
    let restored;
    await transaction("readwrite", store => {
        const request = store.get(id);
        request.addEventListener("success", () => {
            try {
                const deleted = request.result;
                validateStartDate(deleted?.startDate);
                const schedule = { startDate: deleted.startDate, progress: validateProgress(deleted.progress) };
                const existing = store.get(`schedule:${schedule.startDate}`);
                existing.onsuccess = () => {
                    if (existing.result !== undefined) { store.transaction.abort(); return; }
                    store.add(schedule.progress, `schedule:${schedule.startDate}`);
                    store.put(schedule.startDate, "activeStartDate");
                    store.delete(id);
                    restored = schedule;
                };
            } catch { store.transaction.abort(); }
        });
        return request;
    });
    return restored;
}

export async function permanentlyDeleteSchedule(id) {
    if (typeof id !== "string" || !id.startsWith("deleted:") || id.length <= 8)
        throw new Error("Invalid recovery identifier.");
    await transaction("readwrite", store => store.delete(id));
}

export async function emptyDeletedSchedules(ids) {
    if (!Array.isArray(ids) || ids.some(id => typeof id !== "string" || !id.startsWith("deleted:") || id.length <= 8)
        || new Set(ids).size !== ids.length) throw new Error("Invalid recovery identifiers.");
    await transaction("readwrite", store => {
        for (const id of ids) store.delete(id);
    });
}


function validateBackupSchedule(schedule) {
    if (!schedule || typeof schedule !== "object") throw new Error("Invalid backup schedule.");
    validateStartDate(schedule.startDate);
    const progress = validateProgress(schedule.progress);
    const end = new Date(`${schedule.startDate}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 89);
    const lastDate = end.toISOString().slice(0, 10);
    const records = new Set();
    for (const record of progress) {
        const day = record.date.slice(0, 10);
        const key = JSON.stringify([day, record.mantraName]);
        if (day < schedule.startDate || day > lastDate || records.has(key))
            throw new Error("Out-of-range or duplicate progress in backup.");
        records.add(key);
    }
    return { startDate: schedule.startDate, progress };
}

function validateBackup(backup) {
    if (!backup || backup.format !== "mantra-practice-calendar" || ![1, 2].includes(backup.version)
        || !Array.isArray(backup.schedules))
        throw new Error("Choose a version 1 or 2 Mantra Practice Calendar JSON backup.");
    const schedules = backup.schedules.map(validateBackupSchedule);
    const starts = new Set(schedules.map(schedule => schedule.startDate));
    if (starts.size !== schedules.length) throw new Error("Duplicate schedule in backup.");
    if (backup.version === 2 && backup.activeStartDate === null) {
        if (schedules.length !== 0) throw new Error("Saved schedules require an active selection.");
    } else {
        validateStartDate(backup.activeStartDate);
        if (!starts.has(backup.activeStartDate)) throw new Error("The active schedule is missing from the backup.");
    }
    const deleted = backup.version === 1 ? [] : backup.deletedSchedules;
    if (!Array.isArray(deleted)) throw new Error("Recovery history is missing from the backup.");
    const ids = new Set();
    const deletedSchedules = deleted.map(copy => {
        const schedule = validateBackupSchedule(copy);
        if (typeof copy.id !== "string" || !copy.id.startsWith("deleted:") || copy.id.length <= 8 || ids.has(copy.id))
            throw new Error("Invalid or duplicate recovery identifier.");
        ids.add(copy.id);
        if (typeof copy.deletedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(copy.deletedAt)
            || !Number.isFinite(Date.parse(copy.deletedAt))) throw new Error("Invalid deletion timestamp.");
        const deletedAt = new Date(copy.deletedAt).toISOString();
        if (deletedAt.slice(0, 19) !== copy.deletedAt.slice(0, 19)) throw new Error("Invalid deletion timestamp.");
        return { id: copy.id, ...schedule, deletedAt };
    });
    return { format: "mantra-practice-calendar", version: backup.version,
        activeStartDate: backup.activeStartDate, schedules, deletedSchedules };
}

function parseBackup(text) {
    if (typeof text !== "string" || new TextEncoder().encode(text).length > 5 * 1024 * 1024)
        throw new Error("Backup files must be no larger than 5 MiB.");
    return validateBackup(JSON.parse(text));
}

export async function exportBackup() {
    await migrateDeletedSchedules();
    let keys;
    const values = await transaction("readonly", store => {
        const request = store.getAllKeys();
        request.onsuccess = () => { keys = request.result; };
        return store.getAll();
    });
    const entries = new Map(keys.map((key, i) => [key, values[i]]));
    const activeStartDate = entries.get("activeStartDate") ?? null;
    const schedules = keys.filter(key => typeof key === "string" && key.startsWith("schedule:"))
        .map(key => ({ startDate: key.slice(9), progress: entries.get(key) }));
    if (activeStartDate !== null && !schedules.some(schedule => schedule.startDate === activeStartDate))
        schedules.push({ startDate: activeStartDate, progress: [] });
    const deletedSchedules = keys.filter(key => typeof key === "string" && key.startsWith("deleted:"))
        .map(key => ({ ...entries.get(key), id: key }));
    return validateBackup({ format: "mantra-practice-calendar", version: 2, activeStartDate, schedules, deletedSchedules });
}

export async function downloadBackup(locale) {
    const backup = await exportBackup();
    const fingerprint = await backupFingerprint(backup);
    const text = JSON.stringify(backup, null, 2);
    if (new TextEncoder().encode(text).length > 5 * 1024 * 1024)
        throw new Error("This journal exceeds the 5 MiB backup limit.");
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "mantra-backup.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const exportedAt = new Date().toISOString();
    await transaction("readwrite", store => {
        store.put(exportedAt, "lastBackupExportedAt");
        store.put(fingerprint, "lastBackupFingerprint");
    });
    return new Date(exportedAt).toLocaleString(locale);
}

async function backupFingerprint(backup) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(backup)));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function backupChangesWarning() {
    const fingerprint = await transaction("readonly", store => store.get("lastBackupFingerprint"));
    if (!fingerprint) return "Backup coverage is unknown. Export a new backup before permanently deleting recovery history.";
    return fingerprint === await backupFingerprint(await exportBackup()) ? null
        : "Schedules, progress or recovery history have changed since the last backup was exported. Export a new backup before permanently deleting recovery history.";
}

export async function lastBackupExportedAt(locale) {
    const value = await transaction("readonly", store => store.get("lastBackupExportedAt"));
    return typeof value === "string" && Number.isFinite(Date.parse(value))
        ? new Date(value).toLocaleString(locale) : null;
}

export function watchBackupTab(callback) {
    let active = true;
    const refresh = () => {
        if (active && document.visibilityState === "visible")
            callback.invokeMethodAsync("RefreshOnReturn").catch(() => {});
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return { dispose() {
        active = false;
        document.removeEventListener("visibilitychange", refresh);
        window.removeEventListener("focus", refresh);
    } };
}

export async function previewBackup(text) {
    const backup = parseBackup(text);
    const keys = await transaction("readonly", store => store.getAllKeys());
    return {
        scheduleCount: backup.schedules.length,
        replaceCount: backup.schedules.filter(schedule => keys.includes(`schedule:${schedule.startDate}`)).length,
        deletedCount: backup.deletedSchedules.length,
        existingDeletedCount: backup.deletedSchedules.filter(copy => keys.includes(copy.id)).length
    };
}

export async function restoreBackup(text) {
    const backup = parseBackup(text);
    let restored = null;
    await transaction("readwrite", store => {
        for (const schedule of backup.schedules) store.put(schedule.progress, `schedule:${schedule.startDate}`);
        for (const copy of backup.deletedSchedules) {
            const existing = store.get(copy.id);
            existing.onsuccess = () => {
                if (existing.result === undefined)
                    store.add({ startDate: copy.startDate, progress: copy.progress, deletedAt: copy.deletedAt }, copy.id);
            };
        }
        const current = store.get("activeStartDate");
        current.addEventListener("success", () => {
            const startDate = backup.activeStartDate ?? current.result ?? null;
            if (backup.activeStartDate !== null) {
                const active = backup.schedules.find(schedule => schedule.startDate === startDate);
                restored = { startDate, progress: active.progress };
                store.put(startDate, "activeStartDate");
            } else if (startDate === null) store.put(null, "activeStartDate");
            else {
                const active = store.get(`schedule:${startDate}`);
                active.onsuccess = () => {
                    try {
                        validateStartDate(startDate);
                        restored = { startDate, progress: active.result === undefined ? [] : validateProgress(active.result) };
                    } catch { store.transaction.abort(); }
                };
            }
        });
        return current;
    });
    return restored;
}
