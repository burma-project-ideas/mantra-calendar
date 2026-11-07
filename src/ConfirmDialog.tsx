import { useEffect, useRef, useState } from "react";
import { Button, Modal, Spinner } from "@heroui/react";
import { ArchiveRestore, Download, Trash2 } from "lucide-react";
import { db } from "./db";
import {
  dateLabel,
  format,
  localeFor,
  translator,
  type Language,
} from "./i18n";
import { addDays } from "./schedule.mjs";
import { Notice } from "./ui";

export type Confirmation = {
  kind: "schedule" | "copy" | "empty";
  startDate?: string;
  completedCount?: number;
  ids: string[];
};
export function ConfirmDialog({
  request,
  language,
  busy,
  error,
  onClose,
  onConfirm,
}: {
  request: Confirmation;
  language: Language;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const t = translator(language),
    permanent = request.kind !== "schedule";
  const [checking, setChecking] = useState(permanent),
    [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null),
    [warning, setWarning] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null),
    [exportStatus, setExportStatus] = useState<string | null>(null);
  const refreshRef = useRef<() => Promise<void>>(async () => {}),
    keepRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!permanent) return;
    let active = true,
      running = false,
      pending = false;
    const refresh = async () => {
      if (!active) return;
      if (running) {
        pending = true;
        return;
      }
      running = true;
      setChecking(true);
      try {
        do {
          pending = false;
          try {
            const [time, message] = await Promise.all([
              db.lastBackupExportedAt(localeFor(language)),
              db.backupChangesWarning(),
            ]);
            if (active) {
              setLastExport(time);
              setWarning(message);
            }
          } catch {
            if (active)
              setWarning(
                "Backup coverage could not be checked. Export a new backup before permanently deleting recovery history.",
              );
          }
        } while (pending && active);
      } finally {
        running = false;
        if (active) setChecking(false);
      }
    };
    refreshRef.current = refresh;
    const onReturn = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2000);
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [language, permanent]);
  async function exportBackup() {
    if (checking || exporting) return;
    setExporting(true);
    setExportError(null);
    setExportStatus(null);
    try {
      await db.downloadBackup(localeFor(language));
      await refreshRef.current();
      setExportStatus(
        "Backup download started. Save the JSON file before confirming deletion.",
      );
    } catch {
      setExportError(
        "The backup could not be exported. Nothing was deleted. Check browser storage and download access, and the 5 MiB backup limit, then try again.",
      );
    } finally {
      setExporting(false);
      keepRef.current?.focus();
    }
  }
  const title =
    request.kind === "empty"
      ? "Empty recently deleted?"
      : permanent
        ? "Permanently delete recovery copy?"
        : "Delete saved schedule?";
  const keep =
    request.kind === "empty"
      ? "Keep recovery history"
      : permanent
        ? "Keep recovery copy"
        : "Keep schedule";
  const confirm =
    request.kind === "empty"
      ? "Empty recently deleted"
      : permanent
        ? "Permanently delete"
        : "Delete schedule";
  return (
    <Modal
      isOpen
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Modal.Backdrop isDismissable={false}>
        <Modal.Container scroll="inside" size="lg">
          <Modal.Dialog className="safety-dialog">
            <Modal.CloseTrigger aria-label={t("Close")} isDisabled={busy} />
            <Modal.Header>
              <div className="dialog-symbol danger-symbol">
                <Trash2 size={23} />
              </div>
              <Modal.Heading>{t(title)}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {error && <Notice error>{t(error)}</Notice>}
              {request.kind === "empty" ? (
                <>
                  <p className="confirmation-question">
                    {format(
                      t,
                      "Permanently remove {0} recovery copies from Recently deleted?",
                      request.ids.length,
                    )}
                  </p>
                  <p>
                    {t(
                      "The listed recovery history will be permanently removed from this browser and cannot be restored from Recently deleted afterward. Saved schedules and exported backup files will be kept. Recovery would require a backup that already contains these copies. Copies added elsewhere while this confirmation is open will be kept.",
                    )}
                  </p>
                </>
              ) : (
                <>
                  <p className="confirmation-question">
                    {t(
                      permanent
                        ? "Permanently delete the recovery copy for"
                        : "Delete the schedule from",
                    )}{" "}
                    <strong>
                      {dateLabel(request.startDate!, language)} —{" "}
                      {dateLabel(addDays(request.startDate!, 89), language)}
                    </strong>
                    ?
                  </p>
                  <p>
                    {permanent
                      ? format(
                          t,
                          "This copy contains {0} completed mantras. Its recovery history will be permanently removed from this browser. It cannot be restored from Recently deleted afterward. Saved schedules, other deleted copies and exported backup files will be kept. Recovery would require a backup that already contains this copy.",
                          request.completedCount ?? 0,
                        )
                      : t(
                          "This schedule and its progress will move to Recently deleted schedules, where you can restore them later, even after reloading. Other saved schedules, deleted schedules and exported backup files will be kept.",
                        )}
                  </p>
                </>
              )}
              {permanent && (
                <div className="backup-safety" aria-busy={checking}>
                  <div className="section-kicker">
                    <ArchiveRestore size={16} />
                    {t("Backups")}
                  </div>
                  {checking && (
                    <div className="checking-indicator" role="status">
                      <Spinner size="sm" />
                      {t("Checking backup status…")}
                    </div>
                  )}
                  <p className="last-backup">
                    {lastExport
                      ? format(
                          t,
                          "Last backup exported: {0} (local time).",
                          lastExport,
                        )
                      : t("No backup export recorded in this browser.")}
                  </p>
                  {warning && <Notice error>{t(warning)}</Notice>}
                  <Button
                    variant="secondary"
                    className="wide"
                    onPress={() => void exportBackup()}
                    isDisabled={checking || exporting || busy}
                  >
                    <Download size={17} />
                    {t(exporting ? "Exporting backup…" : "Export backup")}
                  </Button>
                  <p className="fine-print">
                    {t(
                      "Export time records when a download started in this browser; it does not confirm the file was saved or includes later changes.",
                    )}
                  </p>
                  {exportError && <Notice error>{t(exportError)}</Notice>}
                  {exportStatus && <Notice>{t(exportStatus)}</Notice>}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                autoFocus
                ref={keepRef}
                onPress={onClose}
                isDisabled={busy}
              >
                {t(keep)}
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  if (!checking && !exporting && !busy) void onConfirm();
                }}
                isDisabled={checking || exporting || busy}
              >
                {busy ? <Spinner size="sm" /> : <Trash2 size={16} />}{" "}
                {t(confirm)}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
