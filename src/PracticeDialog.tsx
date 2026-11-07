import { useState } from "react";
import { Button, Checkbox, Modal, Chip, Spinner } from "@heroui/react";
import { Check, Flower2 } from "lucide-react";
import { translator, dateLabel, type Language } from "./i18n";
import { makeDays } from "./schedule.mjs";
import { Notice } from "./ui";

type Day = ReturnType<typeof makeDays>[number];
export function PracticeDialog({
  day,
  language,
  busy,
  error,
  onClose,
  onSave,
}: {
  day: Day;
  language: Language;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (selected: boolean[]) => Promise<void>;
}) {
  const t = translator(language),
    [selected, setSelected] = useState<boolean[]>(
      day.mantras.map((mantra) => mantra.isPracticed),
    );
  return (
    <Modal
      isOpen
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Modal.Backdrop isDismissable={false}>
        <Modal.Container scroll="inside" size="lg">
          <Modal.Dialog className="practice-dialog">
            <Modal.CloseTrigger aria-label={t("Close")} isDisabled={busy} />
            <Modal.Header>
              <div className="dialog-symbol">
                <Flower2 size={24} />
              </div>
              <div className="section-kicker">
                {t("Day")} {day.index} / 90
              </div>
              <Modal.Heading>
                {dateLabel(day.date, language, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {error && <Notice error>{t(error)}</Notice>}
              <p>
                {t(
                  "Take a moment to reflect. Mark the mantras you practiced today.",
                )}
              </p>
              <div className="mantra-list">
                {day.mantras.map((mantra, index) => (
                  <Checkbox
                    key={mantra.name}
                    isSelected={selected[index]}
                    onChange={(value) =>
                      setSelected((current) =>
                        current.map((item, i) => (i === index ? value : item)),
                      )
                    }
                    isDisabled={busy}
                    className="mantra-checkbox"
                  >
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <span lang="my">{mantra.name}</span>
                    </Checkbox.Content>
                  </Checkbox>
                ))}
              </div>
              <Chip variant="soft" className="practice-count">
                {selected.filter(Boolean).length} / {selected.length}{" "}
                {t("completed")}
              </Chip>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onPress={onClose} isDisabled={busy}>
                {t("Cancel")}
              </Button>
              <Button onPress={() => void onSave(selected)} isDisabled={busy}>
                {busy ? <Spinner size="sm" /> : <Check size={17} />}{" "}
                {t("Save practice")}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
