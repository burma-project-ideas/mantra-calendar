async function checkIndexedDb() {
    function check(value, message) { if (!value) throw new Error(message); }
    async function rejects(action, message) {
        let rejected = false;
        try { await action(); } catch { rejected = true; }
        check(rejected, message);
    }
    check(!(await indexedDB.databases()).some(db => db.name === 'mantra-practice-calendar'),
        'Use a fresh isolated browser context; this check never replaces an existing journal.');
    const api = await import('/js/practice-db.js');
    const originalGet = Storage.prototype.getItem;
    const originalSet = Storage.prototype.setItem;
    const originalPut = IDBObjectStore.prototype.put;
    const originalDelete = IDBObjectStore.prototype.delete;
    const originalAdd = IDBObjectStore.prototype.add;
    try {
        Storage.prototype.setItem = () => { throw new Error('localStorage writes are forbidden'); };
        const initial = await api.load();
        check(initial.progress.length === 0, 'Fresh journal must be empty.');
        Storage.prototype.getItem = () => { throw new Error('localStorage reads are forbidden after initialization'); };
        const record = { date: '2026-11-04T00:00:00', mantraName: 'အရဟံ', isPracticed: true };
        await api.select('2026-11-04');
        await api.save('2026-11-04', [record]);
        check((await api.load()).startDate === '2026-11-04', 'Active schedule must persist.');
        check((await api.load()).progress[0].isPracticed, 'Saved progress must persist.');
        check((await api.select('2026-11-05')).progress.length === 0, 'Overlapping schedules must be independent.');
        check((await api.select('2026-11-04')).progress.length === 1, 'Earlier schedule must be retained.');
        const beforeList = JSON.stringify(await api.exportBackup());
        const starts = await api.listSchedules();
        check(starts.includes('2026-11-04') && starts.includes('2026-11-05'), 'Saved schedule list omitted a practiced or empty schedule.');
        check(JSON.stringify(starts) === JSON.stringify([...starts].sort().reverse()), 'Saved schedules are not newest first.');
        check(JSON.stringify(await api.exportBackup()) === beforeList, 'Listing schedules modified the journal.');
        await rejects(() => api.select('2026-02-30'), 'Invalid calendar date accepted.');
        await rejects(() => api.save('2026-11-04', [{ ...record, date: '2026-02-30T00:00:00' }]), 'Invalid progress date accepted.');
        IDBObjectStore.prototype.put = function (...args) {
            const request = originalPut.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.save('2026-11-04', []), 'Aborted transaction reported success.');
        IDBObjectStore.prototype.put = originalPut;
        check((await api.load()).progress.length === 1, 'Aborted transaction changed saved data.');
        const backup = await api.exportBackup();
        check(backup.version === 2 && backup.activeStartDate === '2026-11-04', 'Backup format or active schedule is wrong.');
        check(backup.schedules.some(s => s.startDate === '2026-11-05' && s.progress.length === 0), 'Empty schedules were lost.');
        const backupText = JSON.stringify(backup);
        const preview = await api.previewBackup(backupText);
        check(preview.scheduleCount === backup.schedules.length && preview.replaceCount === backup.schedules.length, 'Preview counts are wrong.');
        check(JSON.stringify(await api.exportBackup()) === backupText, 'Preview changed the journal.');
        await api.select('2027-01-01');
        await api.save('2027-01-01', []);
        await api.save('2026-11-04', []);
        const restored = await api.restoreBackup(backupText);
        check(restored.startDate === '2026-11-04' && restored.progress[0].isPracticed, 'Backup round-trip failed.');
        check((await api.exportBackup()).schedules.some(s => s.startDate === '2027-01-01'), 'Restore deleted an unrelated schedule.');
        check((await api.listSchedules()).includes('2027-01-01'), 'Schedule list lost an unrelated schedule after restore.');
        const beforeInvalid = JSON.stringify(await api.exportBackup());
        const wrongVersion = { ...backup, version: 99 };
        const duplicateSchedule = { ...backup, schedules: [...backup.schedules, backup.schedules[0]] };
        const missingActive = { ...backup, activeStartDate: '2028-01-01' };
        const duplicateProgress = structuredClone(backup);
        const withProgress = duplicateProgress.schedules.find(s => s.startDate === '2026-11-04');
        withProgress.progress.push(withProgress.progress[0]);
        const outsideSchedule = structuredClone(backup);
        outsideSchedule.schedules.find(s => s.startDate === '2026-11-04').progress[0].date = '2026-01-01T00:00:00';
        for (const invalid of ['not JSON', JSON.stringify(wrongVersion), JSON.stringify(duplicateSchedule),
            JSON.stringify(missingActive), JSON.stringify(duplicateProgress), JSON.stringify(outsideSchedule)])
            await rejects(() => api.restoreBackup(invalid), 'Invalid backup was accepted.');
        await rejects(() => api.previewBackup(' '.repeat(5 * 1024 * 1024 + 1)), 'Oversized backup was accepted.');
        check(JSON.stringify(await api.exportBackup()) === beforeInvalid, 'Invalid import changed journal data.');
        const changed = structuredClone(backup);
        changed.activeStartDate = '2026-11-05';
        changed.schedules.find(s => s.startDate === '2026-11-04').progress = [];
        IDBObjectStore.prototype.put = function (...args) {
            const request = originalPut.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.restoreBackup(JSON.stringify(changed)), 'Aborted restore reported success.');
        IDBObjectStore.prototype.put = originalPut;
        check(JSON.stringify(await api.exportBackup()) === beforeInvalid, 'Aborted restore partially changed the journal.');
        const beforeDelete = JSON.stringify(await api.exportBackup());
        IDBObjectStore.prototype.delete = function (...args) {
            const request = originalDelete.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.deleteSchedule('2026-11-04'), 'Aborted deletion reported success.');
        IDBObjectStore.prototype.delete = originalDelete;
        check(JSON.stringify(await api.exportBackup()) === beforeDelete, 'Aborted deletion changed data or active selection.');
        check((await api.listDeletedSchedules()).length === 0, 'Aborted deletion created a recovery record.');
        await rejects(() => api.deleteSchedule('2026-02-30'), 'Invalid deletion date was accepted.');
        const next = await api.deleteSchedule('2026-11-04');
        check(next.startDate === '2027-01-01', 'Deletion did not select newest remaining schedule.');
        check(!(await api.listSchedules()).includes('2026-11-04'), 'Deleted schedule still listed.');
        check((await api.listSchedules()).includes('2026-11-05'), 'Deletion removed an unrelated schedule.');
        const deleted = (await api.listDeletedSchedules())[0];
        check(deleted.startDate === '2026-11-04' && deleted.completedCount === 1, 'Deleted schedule was not retained with its progress.');
        const beforeUndo = JSON.stringify(await api.exportBackup());
        IDBObjectStore.prototype.add = function (...args) {
            const request = originalAdd.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.restoreDeletedSchedule(deleted.id), 'Aborted recovery reported success.');
        IDBObjectStore.prototype.add = originalAdd;
        check(JSON.stringify(await api.exportBackup()) === beforeUndo && (await api.listDeletedSchedules())[0].id === deleted.id, 'Failed recovery changed journal or deleted data.');
        const recovered = await api.restoreDeletedSchedule(deleted.id);
        check(recovered.startDate === '2026-11-04' && recovered.progress[0].isPracticed, 'Undo lost the deleted progress.');
        check((await api.listDeletedSchedules()).length === 0 && (await api.load()).startDate === '2026-11-04', 'Restore did not consume recovery or select the restored schedule.');
        check((await api.listSchedules()).includes('2027-01-01'), 'Undo removed an unrelated schedule.');
        await api.deleteSchedule('2026-11-04');
        const conflictCopy = (await api.listDeletedSchedules())[0];
        await api.select('2026-11-04');
        const beforeCollision = JSON.stringify(await api.exportBackup());
        await rejects(() => api.restoreDeletedSchedule(conflictCopy.id), 'Recovery overwrote a recreated schedule.');
        check(JSON.stringify(await api.exportBackup()) === beforeCollision && (await api.listDeletedSchedules())[0].id === conflictCopy.id, 'Conflicting restore modified data.');
        await api.save('2026-11-04', [record]);
        await api.deleteSchedule('2026-11-04');
        await api.deleteSchedule('2026-11-05');
        const copies = await api.listDeletedSchedules();
        check(copies.length === 3 && new Set(copies.map(copy => copy.id)).size === 3, 'A later deletion overwrote earlier recovery copies.');
        check(copies.filter(copy => copy.startDate === '2026-11-04').length === 2, 'Repeated deletions of the same start date lost history.');
        for (const start of await api.listSchedules()) await api.deleteSchedule(start);
        check((await api.listSchedules()).length === 0 && await api.load() === null, 'Last deletion recreated a schedule or re-read legacy storage.');
        const deletedBeforeRestore = await api.listDeletedSchedules();
        const olderCopy = deletedBeforeRestore[deletedBeforeRestore.length - 1];
        check((await api.restoreDeletedSchedule(olderCopy.id)).startDate === olderCopy.startDate, 'Cannot restore an older entry from an empty journal.');
        check((await api.listDeletedSchedules()).length === deletedBeforeRestore.length - 1, 'Restoring an older entry removed other deleted schedules.');
        await api.deleteSchedule(olderCopy.startDate);
        await api.select('2028-01-01');
        check((await api.load()).startDate === '2028-01-01', 'Cannot create a schedule after deleting all.');
        await api.deleteSchedule('2028-01-01');
        await api.restoreBackup(backupText);
        check((await api.load()).progress[0].isPracticed, 'Backup could not restore an empty journal.');
        await rejects(() => api.restoreDeletedSchedule('schedule:2026-11-04'), 'Recovery accepted a saved-schedule key.');
        const db = await new Promise((resolve,reject) => {
            const request = indexedDB.open('mantra-practice-calendar',1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        await new Promise((resolve,reject) => {
            const tx = db.transaction('journal','readwrite');
            tx.objectStore('journal').put({startDate:'2029-01-01',progress:[{date:'2029-01-01T00:00:00',mantraName:'အရဟံ',isPracticed:true}]},'lastDeletedSchedule');
            tx.oncomplete = resolve;
            tx.onabort = () => reject(tx.error);
        });
        db.close();
        const migrated = await api.listDeletedSchedules();
        const legacy = migrated.find(copy => copy.startDate === '2029-01-01');
        check(legacy && legacy.completedCount === 1, 'Legacy Undo copy was not migrated with progress.');
        await api.load();
        check((await api.listDeletedSchedules()).length === migrated.length, 'Legacy migration created duplicate recovery entries.');
        check((await api.restoreDeletedSchedule(legacy.id)).progress[0].isPracticed, 'Migrated recovery lost progress.');
        const historyBackup = await api.exportBackup();
        check(historyBackup.version === 2 && historyBackup.deletedSchedules.length > 0, 'Export omitted recovery history.');
        const historyText = JSON.stringify(historyBackup);
        const recoverable = historyBackup.deletedSchedules.find(copy => !historyBackup.schedules.some(s => s.startDate === copy.startDate));
        await api.restoreDeletedSchedule(recoverable.id);
        await api.restoreBackup(historyText);
        const importedCopy = (await api.exportBackup()).deletedSchedules.find(copy => copy.id === recoverable.id);
        check(JSON.stringify(importedCopy) === JSON.stringify(recoverable), 'Recovery history round-trip lost identity, timestamp or progress.');
        const afterHistory = await api.exportBackup();
        await api.restoreBackup(historyText);
        check((await api.listDeletedSchedules()).length === afterHistory.deletedSchedules.length, 'Repeated history import created duplicates.');
        const changedCopy = structuredClone(historyBackup);
        changedCopy.deletedSchedules.find(copy => copy.id === recoverable.id).progress = [];
        await api.restoreBackup(JSON.stringify(changedCopy));
        check(JSON.stringify((await api.exportBackup()).deletedSchedules.find(copy => copy.id === recoverable.id)) === JSON.stringify(recoverable), 'Import overwrote existing recovery data.');
        const oldBackup = { format: historyBackup.format, version: 1, activeStartDate: historyBackup.activeStartDate, schedules: historyBackup.schedules };
        const historyBeforeV1 = JSON.stringify((await api.exportBackup()).deletedSchedules);
        await api.restoreBackup(JSON.stringify(oldBackup));
        check(JSON.stringify((await api.exportBackup()).deletedSchedules) === historyBeforeV1, 'Version 1 import discarded existing history.');
        const archiveOnly = { format: historyBackup.format, version: 2, activeStartDate: null, schedules: [], deletedSchedules: historyBackup.deletedSchedules };
        const archivePreview = await api.previewBackup(JSON.stringify(archiveOnly));
        check(archivePreview.scheduleCount === 0 && archivePreview.deletedCount === historyBackup.deletedSchedules.length
            && archivePreview.existingDeletedCount === historyBackup.deletedSchedules.length, 'Archive-only preview counts are wrong.');
        const activeBeforeArchive = JSON.stringify(await api.load());
        await api.restoreBackup(JSON.stringify(archiveOnly));
        check(JSON.stringify(await api.load()) === activeBeforeArchive, 'Archive-only import changed the current active schedule.');
        const beforeBadHistory = JSON.stringify(await api.exportBackup());
        const duplicateHistory = structuredClone(historyBackup);
        duplicateHistory.deletedSchedules.push(duplicateHistory.deletedSchedules[0]);
        const invalidHistoryId = structuredClone(historyBackup);
        invalidHistoryId.deletedSchedules[0].id = 'schedule:2026-11-04';
        const invalidTimestamp = structuredClone(historyBackup);
        invalidTimestamp.deletedSchedules[0].deletedAt = 'not a timestamp';
        const impossibleTimestamp = structuredClone(historyBackup);
        impossibleTimestamp.deletedSchedules[0].deletedAt = '2026-02-30T00:00:00.000Z';
        const invalidHistoryProgress = structuredClone(historyBackup);
        invalidHistoryProgress.deletedSchedules[0].progress = [{ ...record, date: '0001-01-01T00:00:00' }];
        const missingHistory = structuredClone(historyBackup);
        delete missingHistory.deletedSchedules;
        for (const invalid of [duplicateHistory, invalidHistoryId, invalidTimestamp, impossibleTimestamp, invalidHistoryProgress, missingHistory])
            await rejects(() => api.restoreBackup(JSON.stringify(invalid)), 'Invalid recovery history was accepted.');
        check(JSON.stringify(await api.exportBackup()) === beforeBadHistory, 'Invalid history changed the journal.');
        const abortedHistory = structuredClone(historyBackup);
        abortedHistory.deletedSchedules.push({ ...abortedHistory.deletedSchedules[0], id: 'deleted:rollback-copy' });
        abortedHistory.schedules[0].progress = [];
        IDBObjectStore.prototype.add = function (...args) {
            const request = originalAdd.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.restoreBackup(JSON.stringify(abortedHistory)), 'Aborted history import reported success.');
        IDBObjectStore.prototype.add = originalAdd;
        check(JSON.stringify(await api.exportBackup()) === beforeBadHistory, 'History import abort partially changed saved schedules or history.');
        for (const start of await api.listSchedules()) await api.deleteSchedule(start);
        const emptyExport = await api.exportBackup();
        check(emptyExport.activeStartDate === null && emptyExport.schedules.length === 0 && emptyExport.deletedSchedules.length > 0, 'Cannot export recovery history without saved schedules.');
        check(await api.restoreBackup(JSON.stringify(archiveOnly)) === null && await api.load() === null, 'Archive-only empty restore created an active schedule.');
        await api.select('2031-01-01');
        await api.save('2031-01-01', [{ ...record, date: '2031-01-01T00:00:00' }]);
        const beforePurge = await api.exportBackup();
        const purging = beforePurge.deletedSchedules[0];
        for (const invalidId of ['schedule:2031-01-01', 'activeStartDate', 'deleted:', null])
            await rejects(() => api.permanentlyDeleteSchedule(invalidId), 'Permanent removal accepted a non-recovery key.');
        IDBObjectStore.prototype.delete = function (...args) {
            const request = originalDelete.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.permanentlyDeleteSchedule(purging.id), 'Aborted permanent removal reported success.');
        IDBObjectStore.prototype.delete = originalDelete;
        check(JSON.stringify(await api.exportBackup()) === JSON.stringify(beforePurge), 'Failed permanent removal changed journal or history.');
        await api.permanentlyDeleteSchedule(purging.id);
        const afterPurge = await api.exportBackup();
        check(afterPurge.activeStartDate === beforePurge.activeStartDate
            && JSON.stringify(afterPurge.schedules) === JSON.stringify(beforePurge.schedules), 'Permanent removal changed saved schedules or active selection.');
        check(JSON.stringify(afterPurge.deletedSchedules) === JSON.stringify(beforePurge.deletedSchedules.filter(copy => copy.id !== purging.id)), 'Permanent removal affected another recovery copy.');
        await rejects(() => api.restoreDeletedSchedule(purging.id), 'Removed copy remained recoverable in the browser.');
        await api.permanentlyDeleteSchedule(purging.id);
        check(JSON.stringify(await api.exportBackup()) === JSON.stringify(afterPurge), 'Repeated permanent removal changed unrelated data.');
        await api.restoreBackup(JSON.stringify(beforePurge));
        check((await api.listDeletedSchedules()).some(copy => copy.id === purging.id), 'An existing backup could not recover the removed copy.');
        for (const copy of await api.listDeletedSchedules()) await api.permanentlyDeleteSchedule(copy.id);
        check((await api.load()).startDate === '2031-01-01' && (await api.listDeletedSchedules()).length === 0, 'Removing final history copy changed the active schedule.');
        await api.deleteSchedule('2031-01-01');
        await api.permanentlyDeleteSchedule((await api.listDeletedSchedules())[0].id);
        check(await api.load() === null && (await api.listDeletedSchedules()).length === 0, 'Final permanent removal did not leave an empty journal.');
        for (const start of ['2032-01-01', '2032-02-01']) {
            await api.select(start);
            await api.save(start, [{ ...record, date: start + 'T00:00:00' }]);
            await api.deleteSchedule(start);
        }
        await api.select('2033-01-01');
        await api.save('2033-01-01', [{ ...record, date: '2033-01-01T00:00:00' }]);
        const confirmedIds = (await api.listDeletedSchedules()).map(copy => copy.id);
        await api.select('2032-03-01');
        await api.deleteSchedule('2032-03-01');
        const batchBefore = await api.exportBackup();
        for (const invalid of [null, 'deleted:copy', ['activeStartDate'], ['schedule:2033-01-01'], ['deleted:'], [confirmedIds[0], confirmedIds[0]]])
            await rejects(() => api.emptyDeletedSchedules(invalid), 'Empty history accepted invalid or duplicate recovery IDs.');
        await api.emptyDeletedSchedules([]);
        check(JSON.stringify(await api.exportBackup()) === JSON.stringify(batchBefore), 'Validation or empty batch modified data.');
        IDBObjectStore.prototype.delete = function (...args) {
            const request = originalDelete.apply(this, args);
            request.addEventListener('success', () => this.transaction.abort());
            return request;
        };
        await rejects(() => api.emptyDeletedSchedules(confirmedIds), 'Aborted batch removal reported success.');
        IDBObjectStore.prototype.delete = originalDelete;
        check(JSON.stringify(await api.exportBackup()) === JSON.stringify(batchBefore), 'Failed batch partially removed recovery history.');
        await api.emptyDeletedSchedules(confirmedIds);
        const batchAfter = await api.exportBackup();
        check(JSON.stringify(batchAfter.schedules) === JSON.stringify(batchBefore.schedules)
            && batchAfter.activeStartDate === batchBefore.activeStartDate, 'Empty history changed saved schedules or selection.');
        check(JSON.stringify(batchAfter.deletedSchedules) === JSON.stringify(batchBefore.deletedSchedules.filter(copy => !confirmedIds.includes(copy.id))), 'Empty history removed a recovery copy outside confirmation.');
        check(batchAfter.deletedSchedules.length === 1, 'Copy added after confirmation did not survive.');
        await api.emptyDeletedSchedules(confirmedIds);
        check(JSON.stringify(await api.exportBackup()) === JSON.stringify(batchAfter), 'Repeated batch removal changed unrelated data.');
        await api.emptyDeletedSchedules((await api.listDeletedSchedules()).map(copy => copy.id));
        check((await api.load()).progress[0].isPracticed && (await api.listDeletedSchedules()).length === 0, 'Empty list damaged active progress.');
        await api.deleteSchedule('2033-01-01');
        await api.emptyDeletedSchedules((await api.listDeletedSchedules()).map(copy => copy.id));
        check(await api.load() === null && (await api.listDeletedSchedules()).length === 0, 'Empty history recreated a schedule in an empty journal.');
        await api.restoreBackup(JSON.stringify(batchBefore));
        check((await api.listDeletedSchedules()).length === batchBefore.deletedSchedules.length, 'An existing backup could not recover emptied history.');
        return 'PASS: IndexedDB/backup checks plus atomic empty-history batches, confirmation scope, validation, rollback, idempotence, saved-progress preservation and backup recovery.';
    } finally {
        Storage.prototype.getItem = originalGet;
        Storage.prototype.setItem = originalSet;
        IDBObjectStore.prototype.put = originalPut;
        IDBObjectStore.prototype.delete = originalDelete;
        IDBObjectStore.prototype.add = originalAdd;
    }
}
