import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Calendar,
  Card,
  Chip,
  Form,
  Input,
  Label,
  Link,
  Modal,
  ProgressBar,
  Separator,
  Skeleton,
  Tabs,
  TextField,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate, type CalendarDate } from "@internationalized/date";
import {
  ArchiveRestore,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Download,
  Flower2,
  FolderHeart,
  Leaf,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { db, type DeletedCopy, type Journal } from "./db";
import { addDays, localToday, makeDays, toProgress } from "./schedule.mjs";
import {
  dateLabel,
  format,
  localeFor,
  translator,
  weekdayLabel,
  type Language,
} from "./i18n";
import { Choice, EmptyState, Notice } from "./ui";
import { ConfirmDialog, type Confirmation } from "./ConfirmDialog";
import { PracticeDialog } from "./PracticeDialog";

export default function App() {
  const [language, setLanguage] = useState<Language>("mm"),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false);
  const [journal, setJournal] = useState<Journal | null>(null),
    [schedules, setSchedules] = useState<string[]>([]),
    [deleted, setDeleted] = useState<DeletedCopy[]>([]);
  const [error, setError] = useState<string | null>(null),
    [notice, setNotice] = useState<string | null>(null),
    [storageError, setStorageError] = useState(false);
  const [start, setStart] = useState(localToday()),
    [selected, setSelected] = useState(localToday()),
    [focused, setFocused] = useState<CalendarDate>(parseDate(localToday()));
  const [view, setView] = useState("month"),
    [editingDate, setEditingDate] = useState<string | null>(null),
    [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [selectedCopy, setSelectedCopy] = useState("");
  const [importPreview, setImportPreview] = useState<{
    text: string;
    preview: {
      scheduleCount: number;
      replaceCount: number;
      deletedCount: number;
      existingDeletedCount: number;
    };
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = translator(language),
    locale = localeFor(language);
  const days = useMemo(
    () => (journal ? makeDays(journal.startDate, journal.progress) : []),
    [journal],
  );
  const chosen = days.find((day) => day.date === selected) ?? days[0];
  const editDay = days.find((day) => day.date === editingDate);
  const total = days.reduce((sum, day) => sum + day.mantras.length, 0),
    completed = days.reduce(
      (sum, day) =>
        sum + day.mantras.filter((mantra) => mantra.isPracticed).length,
      0,
    );
  const practicedDays = days.filter((day) =>
    day.mantras.some((mantra) => mantra.isPracticed),
  ).length;
  const disabled =
    busy ||
    !ready ||
    storageError ||
    !!confirmation ||
    !!editingDate ||
    !!importPreview;
  const period = (date: string) =>
    `${dateLabel(date, language)} – ${dateLabel(addDays(date, 89), language)}`;
  async function reloadLists() {
    const [saved, history] = await Promise.all([
      db.listSchedules(),
      db.listDeletedSchedules(),
    ]);
    setSchedules(saved);
    setDeleted(history);
    setSelectedCopy((current) =>
      history.some((copy: DeletedCopy) => copy.id === current)
        ? current
        : (history[0]?.id ?? ""),
    );
  }
  function showJournal(next: Journal | null) {
    setJournal(next);
    if (next) {
      setStart(next.startDate);
      const today = localToday(),
        date =
          today >= next.startDate && today <= addDays(next.startDate, 89)
            ? today
            : next.startDate;
      setSelected(date);
      setFocused(parseDate(date));
    }
  }
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const savedLanguage = await db.getLanguage();
        if (!active) return;
        setLanguage(savedLanguage);
        db.setDocumentLanguage(savedLanguage);
        const saved = await db.load();
        if (!active) return;
        showJournal(saved);
        await reloadLists();
      } catch {
        if (active) {
          setStorageError(true);
          setError(
            "Your IndexedDB journal could not be opened. Existing data was left untouched. Check browser storage access, close other calendar tabs and reload before editing.",
          );
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    // Retire the previous Blazor shell cache, without touching IndexedDB or journal data.
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(
            registrations
              .filter(
                (registration) =>
                  registration.scope === new URL("/", location.origin).href &&
                  registration.active?.scriptURL ===
                    new URL("/service-worker.js", location.origin).href,
              )
              .map((registration) => registration.unregister()),
          ),
        )
        .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    document.title = t("Mantra Practice Calendar");
    document.documentElement.lang = language === "mm" ? "my" : "en";
  }, [language]);
  async function perform(
    action: () => Promise<void>,
    success?: string,
    failure = "Could not complete this action. Check browser storage access and reload to see the latest saved data.",
  ) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      if (success) setNotice(success);
    } catch {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  async function changeLanguage(next: string) {
    await perform(
      async () => {
        await db.setLanguage(next);
        setLanguage(next as Language);
      },
      undefined,
      "Language preference could not be saved. Try again.",
    );
  }
  async function selectSchedule(date: string) {
    await perform(async () => {
      showJournal(await db.select(date));
      await reloadLists();
    });
  }
  async function savePractice(values: boolean[]) {
    if (!editDay || !journal) return;
    await perform(async () => {
      const next = days.map((day) =>
        day.date === editDay.date
          ? {
              ...day,
              mantras: day.mantras.map((mantra, index) => ({
                ...mantra,
                isPracticed: values[index],
              })),
            }
          : day,
      );
      const progress = toProgress(next);
      await db.save(journal.startDate, progress);
      setJournal({ ...journal, progress });
      setEditingDate(null);
    }, "Practice saved.");
  }
  async function exportBackup() {
    await perform(async () => {
      await db.downloadBackup(locale);
    }, "Backup download started. Keep the JSON file somewhere you can find it later.");
  }
  async function previewFile(file: File) {
    await perform(
      async () => {
        if (file.size > 5 * 1024 * 1024) throw new Error("Backup too large");
        const text = await file.text(),
          preview = await db.previewBackup(text);
        setImportPreview({ text, preview });
      },
      undefined,
      "This file could not be read as a valid Mantra Practice Calendar backup. Choose an exported version 1 or 2 JSON file no larger than 5 MiB. Your journal is unchanged.",
    );
  }
  async function confirmDelete() {
    if (!confirmation) return;
    await perform(
      async () => {
        if (confirmation.kind === "schedule")
          showJournal(await db.deleteSchedule(confirmation.startDate));
        if (confirmation.kind === "copy")
          await db.permanentlyDeleteSchedule(confirmation.ids[0]);
        if (confirmation.kind === "empty")
          await db.emptyDeletedSchedules(confirmation.ids);
        await reloadLists();
        setConfirmation(null);
      },
      confirmation.kind === "schedule"
        ? "Deleted schedules appear here."
        : "Confirmed recovery copies permanently deleted. Saved schedules were kept.",
    );
  }
  const recovery = deleted.find((copy) => copy.id === selectedCopy);
  const openDay = (date: string) => {
    if (!disabled && days.some((day) => day.date === date)) {
      setError(null);
      setSelected(date);
      setEditingDate(date);
    }
  };
  const ask = (request: Confirmation) => {
    setError(null);
    setConfirmation(request);
  };
  function renderCalendar() {
    if (!journal) return null;
    return (
      <Calendar
        aria-label={t("Your practice calendar")}
        className="practice-calendar"
        value={null}
        focusedValue={focused}
        onFocusChange={(date) => setFocused(date as CalendarDate)}
        onChange={(date) => {
          if (date) openDay(date.toString());
        }}
        minValue={parseDate(journal.startDate)}
        maxValue={parseDate(addDays(journal.startDate, 89))}
        isDisabled={disabled}
        weeksInMonth={6}
      >
        <Calendar.Header>
          <div className="month-label">
            <Calendar.Heading className="sr-only" />
            <h2 className="calendar-month">
              {dateLabel(focused.toString(), language, {
                month: "long",
                year: "numeric",
              })}
            </h2>
          </div>
          <div className="calendar-navigation">
            <Button
              slot={null}
              variant="ghost"
              size="sm"
              onPress={() => setFocused(parseDate(chosen.date))}
            >
              {t("Selected day")}
            </Button>
            <Calendar.NavButton slot="previous" aria-label={t("Previous")} />
            <Calendar.NavButton slot="next" aria-label={t("Next")} />
          </div>
        </Calendar.Header>
        <Calendar.Grid weekdayStyle="short">
          <Calendar.GridHeader>
            {(day) => (
              <Calendar.HeaderCell>
                {weekdayLabel(day, language)}
              </Calendar.HeaderCell>
            )}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(date) => {
              const day = days.find((item) => item.date === date.toString()),
                count =
                  day?.mantras.filter((mantra) => mantra.isPracticed).length ??
                  0;
              return (
                <Calendar.Cell
                  date={date}
                  aria-label={
                    day
                      ? format(
                          t,
                          "{0}: {1} of {2} completed",
                          dateLabel(day.date, language),
                          count,
                          day.mantras.length,
                        )
                      : dateLabel(date.toString(), language)
                  }
                  data-practice-day={date.toString()}
                  className={`practice-cell ${day ? "has-practice" : ""} ${day && count === day.mantras.length ? "is-complete" : ""} ${date.toString() === selected ? "is-current" : ""}`}
                >
                  {({ formattedDate }) => (
                    <>
                      <span className="day-number">{formattedDate}</span>
                      {day && (
                        <span className="day-progress">
                          <span>
                            {count === day.mantras.length ? (
                              <Check size={12} />
                            ) : (
                              <span className="progress-dot" />
                            )}
                            {count}/{day.mantras.length}
                          </span>
                          <small>
                            {t(
                              count === day.mantras.length
                                ? "Completed"
                                : "Pending",
                            )}
                          </small>
                        </span>
                      )}
                    </>
                  )}
                </Calendar.Cell>
              );
            }}
          </Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>
    );
  }
  function renderOverview(mode: string) {
    const groups = new Map<string, typeof days>();
    for (const day of days) {
      const key =
        mode === "year"
          ? day.date.slice(0, 7)
          : String(Math.floor((day.index - 1) / 7));
      groups.set(key, [...(groups.get(key) ?? []), day]);
    }
    return (
      <div className={`overview ${mode}`}>
        {Array.from(groups, ([group, items]) => (
          <section key={group}>
            <h3>
              {mode === "year"
                ? dateLabel(`${group}-01`, language, {
                    month: "long",
                    year: "numeric",
                  })
                : `${dateLabel(items[0].date, language)} – ${dateLabel(items.at(-1)!.date, language)}`}
            </h3>
            <div className="overview-days">
              {items.map((day) => (
                <Button
                  key={day.date}
                  variant="secondary"
                  className="overview-day"
                  onPress={() => openDay(day.date)}
                  isDisabled={disabled}
                >
                  <span>
                    {dateLabel(day.date, language, {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <Chip size="sm" variant="soft">
                    {day.mantras.filter((mantra) => mantra.isPracticed).length}/
                    {day.mantras.length}
                  </Chip>
                </Button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }
  return (
    <I18nProvider locale={locale}>
      <div className="application">
        <Link href="#calendar" className="skip-link">
          {t("Skip to calendar")}
        </Link>
        <aside className="sidebar">
          <Link
            href="#calendar"
            className="brand"
            aria-label={t("Mantra Practice Calendar home")}
          >
            <img
              src="/brand/logo.png"
              width="46"
              height="46"
              alt="Mantra logo"
            />
            <span>
              mantra<small>{t("A DAILY PRACTICE")}</small>
            </span>
          </Link>
          <div className="sidebar-section-label">{t("YOUR JOURNAL")}</div>
          <nav aria-label={t("Journal tools")}>
            <Link href="#calendar" className="nav-item active">
              <CalendarDays size={19} />
              {t("Calendar")}
              <ChevronRight size={15} />
            </Link>
            <Link href="#journal-tools" className="nav-item">
              <FolderHeart size={19} />
              {t("Saved schedules")}
            </Link>
            <Link href="#backups" className="nav-item">
              <ArchiveRestore size={19} />
              {t("Backups")}
            </Link>
            <Link href="#recovery" className="nav-item">
              <Trash2 size={18} />
              {t("Recovery history")}
              {deleted.length > 0 && (
                <Chip size="sm" variant="soft">
                  {deleted.length}
                </Chip>
              )}
            </Link>
          </nav>
          <div className="sidebar-note">
            <div className="local-icon">
              <ShieldCheck size={20} />
            </div>
            <strong>{t("Saved locally")}</strong>
            <p>{t("No account needed. Your practice stays yours.")}</p>
            <span>
              <span className="status-dot" />
              {t("Stored in this browser")}
            </span>
          </div>
        </aside>
        <main className="main-workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <span>mantra</span>
              <ChevronRight size={14} />
              {t("Practice journal")}
            </div>
            <div className="topbar-tools">
              <span className="storage-chip">
                <ShieldCheck size={15} />
                {t("Saved locally")}
              </span>
              <Choice
                id="ui-language"
                label={t("Language")}
                value={language}
                items={[
                  { id: "mm", label: "မြန်မာ" },
                  { id: "en", label: "English" },
                ]}
                onChange={(value) => void changeLanguage(value)}
                disabled={
                  !ready ||
                  busy ||
                  !!confirmation ||
                  !!editingDate ||
                  !!importPreview
                }
              />
            </div>
          </header>
          <div className="page-content">
            <section className="page-intro">
              <div>
                <div className="section-kicker">
                  <span className="tiny-line" />
                  {t("MANTRA PRACTICE CALENDAR")}
                </div>
                <h1>{t("Your journey, one day at a time.")}</h1>
                <p>{t("A quiet space to show up, reflect, and keep going.")}</p>
              </div>
              <Button
                variant="secondary"
                onPress={() => {
                  document
                    .querySelector("#journal-tools")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Plus size={17} />
                {t("New schedule")}
              </Button>
            </section>
            {error && <Notice error>{t(error)}</Notice>}
            {notice && <Notice>{t(notice)}</Notice>}
            {!ready ? (
              <div className="loading-layout">
                <Skeleton className="loading-hero" />
                <Skeleton className="loading-calendar" />
              </div>
            ) : (
              <>
                <section
                  className="journey-overview"
                  aria-label={t("Overall practice progress")}
                >
                  <Card className="journey-card">
                    <Card.Content>
                      <div className="journey-card-top">
                        <Chip variant="soft">
                          <Leaf size={13} />
                          {t("90-day journey")}
                        </Chip>
                        <span>
                          {journal
                            ? period(journal.startDate)
                            : t("No saved schedules available")}
                        </span>
                      </div>
                      <div className="journey-data">
                        <div>
                          <span className="stat-number">
                            {completed}
                            <span> / {total || 162}</span>
                          </span>
                          <p>{t("mantras completed")}</p>
                        </div>
                        <div className="journey-percent">
                          {total ? Math.round((completed / total) * 100) : 0}
                          <span>%</span>
                        </div>
                      </div>
                      <ProgressBar
                        aria-label={t("Mantras completed")}
                        value={completed}
                        maxValue={total || 162}
                      >
                        <ProgressBar.Track>
                          <ProgressBar.Fill />
                        </ProgressBar.Track>
                      </ProgressBar>
                      <div className="journey-footer">
                        <span>
                          {t("Keep showing up. Every practice counts.")}
                        </span>
                        <Flower2 size={18} />
                      </div>
                    </Card.Content>
                  </Card>
                  <Card className="consistency-card">
                    <Card.Content>
                      <div className="consistency-icon">
                        <CheckCheck size={24} />
                      </div>
                      <div>
                        <span className="stat-number">
                          {practicedDays}
                          <span> / 90</span>
                        </span>
                        <h2>{t("Days practiced")}</h2>
                        <p>{t("Your progress")}</p>
                      </div>
                    </Card.Content>
                  </Card>
                </section>
                <div className="content-grid">
                  <div className="calendar-column" id="calendar" tabIndex={-1}>
                    <Card className="calendar-card">
                      <Card.Header>
                        <div>
                          <div className="section-kicker">
                            {t("YOUR PRACTICE")}
                          </div>
                          <Card.Title>{t("Your practice calendar")}</Card.Title>
                          <Card.Description>
                            {t("Select a day to record your mantras.")}
                          </Card.Description>
                        </div>
                        <CalendarDays className="heading-icon" size={22} />
                      </Card.Header>
                      <Separator />
                      {journal ? (
                        <Tabs
                          selectedKey={view}
                          onSelectionChange={(key) => setView(String(key))}
                          className="calendar-tabs"
                        >
                          <Tabs.ListContainer>
                            <Tabs.List aria-label={t("Calendar")}>
                              {[
                                ["month", "Month"],
                                ["planner", "Planner"],
                                ["timeline", "Timeline"],
                                ["year", "Year"],
                              ].map(([id, label]) => (
                                <Tabs.Tab key={id} id={id}>
                                  {t(label)}
                                  <Tabs.Indicator />
                                </Tabs.Tab>
                              ))}
                            </Tabs.List>
                          </Tabs.ListContainer>
                          {["month", "planner", "timeline", "year"].map(
                            (mode) => (
                              <Tabs.Panel key={mode} id={mode}>
                                {mode === "month"
                                  ? renderCalendar()
                                  : renderOverview(mode)}
                              </Tabs.Panel>
                            ),
                          )}
                        </Tabs>
                      ) : (
                        <EmptyState>
                          {t(
                            "No saved schedules. Choose a practice start date above to create one, or import a backup.",
                          )}
                        </EmptyState>
                      )}
                      <Card.Footer className="calendar-legend">
                        <span>
                          <i />
                          {t("Pending")}
                        </span>
                        <span>
                          <i className="completed-dot" />
                          {t("Completed")}
                        </span>
                        <span className="legend-note">
                          {t("Save your practice after each session.")}
                        </span>
                      </Card.Footer>
                    </Card>
                    <Card className="tools-card" id="backups">
                      <Card.Header>
                        <div className="section-icon">
                          <ArchiveRestore size={21} />
                        </div>
                        <div>
                          <Card.Title>{t("Backups")}</Card.Title>
                          <Card.Description>
                            {t("Keep a copy of your journey.")}
                          </Card.Description>
                        </div>
                      </Card.Header>
                      <Card.Content>
                        <p>
                          {t(
                            "Save your schedules, progress and recovery history to a JSON file.",
                          )}
                        </p>
                        <div className="backup-actions">
                          <Button
                            variant="secondary"
                            onPress={() => void exportBackup()}
                            isDisabled={
                              disabled || (!journal && !deleted.length)
                            }
                          >
                            <Download size={17} />
                            {t("Export backup")}
                          </Button>
                          <Button
                            variant="tertiary"
                            onPress={() => fileRef.current?.click()}
                            isDisabled={
                              busy ||
                              !!confirmation ||
                              !!editingDate ||
                              !!importPreview
                            }
                          >
                            <Upload size={17} />
                            {t("Choose JSON file")}
                          </Button>
                          <input
                            ref={fileRef}
                            type="file"
                            accept=".json,application/json"
                            hidden
                            aria-label={t("Import a backup")}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) void previewFile(file);
                            }}
                          />
                        </div>
                        <p className="fine-print">{t("JSON · up to 5 MiB")}</p>
                      </Card.Content>
                    </Card>
                  </div>
                  <aside className="detail-column">
                    {chosen && (
                      <Card className="selected-day-card">
                        <Card.Content>
                          <div className="section-kicker">
                            {t("Selected day")}
                          </div>
                          <div className="selected-date">
                            <span>
                              {dateLabel(chosen.date, language, {
                                day: "numeric",
                              })}
                            </span>
                            <div>
                              <strong>
                                {dateLabel(chosen.date, language, {
                                  weekday: "long",
                                })}
                              </strong>
                              <small>
                                {dateLabel(chosen.date, language, {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </small>
                            </div>
                            <Chip variant="soft">
                              {t("Day")} {chosen.index}
                            </Chip>
                          </div>
                          <Separator />
                          <div className="selected-mantras">
                            {chosen.mantras.slice(0, 3).map((mantra) => (
                              <div key={mantra.name}>
                                <span
                                  className={`mantra-check ${mantra.isPracticed ? "checked" : ""}`}
                                >
                                  <Check size={12} />
                                </span>
                                <span lang="my">{mantra.name}</span>
                              </div>
                            ))}
                            {chosen.mantras.length > 3 && (
                              <span className="fine-print">
                                +{chosen.mantras.length - 3} {t("More")}
                              </span>
                            )}
                          </div>
                          <Button
                            className="wide"
                            onPress={() => openDay(chosen.date)}
                            isDisabled={disabled}
                          >
                            <Plus size={17} />
                            {t("Record practice")}
                          </Button>
                        </Card.Content>
                      </Card>
                    )}
                    <Card className="schedule-tools" id="journal-tools">
                      <Card.Header>
                        <div>
                          <div className="section-kicker">
                            {t("YOUR JOURNAL")}
                          </div>
                          <Card.Title>{t("Your schedule")}</Card.Title>
                        </div>
                        <FolderHeart size={21} className="heading-icon" />
                      </Card.Header>
                      <Card.Content>
                        <Choice
                          label={t("Saved schedules")}
                          value={journal?.startDate ?? null}
                          items={schedules.map((date) => ({
                            id: date,
                            label: period(date),
                          }))}
                          onChange={(value) => void selectSchedule(value)}
                          disabled={disabled}
                        />
                        <Button
                          variant="ghost"
                          className="quiet-delete"
                          onPress={() => {
                            if (journal)
                              ask({
                                kind: "schedule",
                                startDate: journal.startDate,
                                ids: [],
                              });
                          }}
                          isDisabled={disabled || !journal}
                        >
                          <Trash2 size={15} />
                          {t("Delete selected schedule")}
                        </Button>
                        <Separator />
                        <Form
                          onSubmit={(event) => {
                            event.preventDefault();
                            void selectSchedule(start);
                          }}
                        >
                          <TextField
                            name="startDate"
                            type="date"
                            value={start}
                            onChange={setStart}
                            isRequired
                            isDisabled={disabled}
                          >
                            <Label>{t("Practice start date")}</Label>
                            <Input
                              type="date"
                              min="0001-01-01"
                              max="9999-10-02"
                            />
                          </TextField>
                          <p className="fine-print">
                            {t(
                              "Start a new 90-day practice, or reopen a saved period.",
                            )}
                          </p>
                          <Button
                            type="submit"
                            variant="secondary"
                            className="wide"
                            isDisabled={disabled}
                          >
                            <Plus size={16} />
                            {t("Use schedule")}
                          </Button>
                        </Form>
                      </Card.Content>
                    </Card>
                    <Card className="recovery-card" id="recovery">
                      <Card.Header>
                        <div className="section-icon">
                          <ArchiveRestore size={19} />
                        </div>
                        <div>
                          <Card.Title>{t("Recovery history")}</Card.Title>
                          <Card.Description>
                            {deleted.length} {t("Recently deleted schedules")}
                          </Card.Description>
                        </div>
                      </Card.Header>
                      <Card.Content>
                        {deleted.length ? (
                          <>
                            <Choice
                              label={t("Deleted schedule")}
                              value={selectedCopy || null}
                              items={deleted.map((copy) => ({
                                id: copy.id,
                                label: `${period(copy.startDate)} · ${copy.completedCount} ${t("completed")}`,
                              }))}
                              onChange={setSelectedCopy}
                              disabled={disabled}
                            />
                            <Button
                              variant="secondary"
                              className="wide"
                              onPress={() =>
                                void perform(async () => {
                                  showJournal(
                                    await db.restoreDeletedSchedule(
                                      selectedCopy,
                                    ),
                                  );
                                  await reloadLists();
                                }, "The selected schedule and its progress have been restored. Other deleted schedules were kept.")
                              }
                              isDisabled={disabled}
                            >
                              <ArchiveRestore size={16} />
                              {t("Restore selected schedule")}
                            </Button>
                            <Button
                              variant="ghost"
                              className="quiet-delete"
                              onPress={() => {
                                if (recovery)
                                  ask({
                                    kind: "copy",
                                    startDate: recovery.startDate,
                                    completedCount: recovery.completedCount,
                                    ids: [recovery.id],
                                  });
                              }}
                              isDisabled={disabled}
                            >
                              {t("Permanently delete selected copy")}
                            </Button>
                            <Separator />
                            <Button
                              variant="ghost"
                              className="quiet-delete"
                              onPress={() =>
                                ask({
                                  kind: "empty",
                                  ids: deleted.map((copy) => copy.id),
                                })
                              }
                              isDisabled={disabled}
                            >
                              <Trash2 size={15} />
                              {t("Empty recently deleted")}
                            </Button>
                          </>
                        ) : (
                          <EmptyState>
                            {t("Deleted schedules appear here.")}
                          </EmptyState>
                        )}
                      </Card.Content>
                    </Card>
                  </aside>
                </div>
              </>
            )}
            <footer className="page-footer">
              <div>
                <img src="/brand/logo.png" alt="" width="26" height="26" />
                <span>{t("A practice you can return to.")}</span>
              </div>
              <span>
                <ShieldCheck size={14} />
                {t("Stored in this browser. Export a backup to keep a copy.")}
              </span>
            </footer>
          </div>
        </main>
        {confirmation && (
          <ConfirmDialog
            request={confirmation}
            language={language}
            busy={busy}
            error={error}
            onClose={() => setConfirmation(null)}
            onConfirm={confirmDelete}
          />
        )}
        {editDay && (
          <PracticeDialog
            day={editDay}
            language={language}
            busy={busy}
            error={error}
            onClose={() => setEditingDate(null)}
            onSave={savePractice}
          />
        )}
        {importPreview && (
          <Modal
            isOpen
            onOpenChange={(open) => {
              if (!open && !busy) setImportPreview(null);
            }}
          >
            <Modal.Backdrop isDismissable={false}>
              <Modal.Container scroll="inside" size="lg">
                <Modal.Dialog>
                  <Modal.CloseTrigger
                    aria-label={t("Close")}
                    isDisabled={busy}
                  />
                  <Modal.Header>
                    <div className="dialog-symbol">
                      <Upload size={23} />
                    </div>
                    <Modal.Heading>{t("Review backup restore")}</Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && <Notice error>{t(error)}</Notice>}
                    <p>
                      <strong>
                        {format(
                          t,
                          "{0} schedule(s) ready to restore.",
                          importPreview.preview.scheduleCount,
                        )}
                      </strong>
                    </p>
                    <p>
                      {format(
                        t,
                        "Progress for {0} matching schedule(s) will be replaced. Other schedules will be kept.",
                        importPreview.preview.replaceCount,
                      )}
                    </p>
                    <p>
                      {format(
                        t,
                        "{0} recently deleted recovery copy/copies included. {1} already present will be kept unchanged. Other recovery history will also be kept.",
                        importPreview.preview.deletedCount,
                        importPreview.preview.existingDeletedCount,
                      )}
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      autoFocus
                      onPress={() => setImportPreview(null)}
                      isDisabled={busy}
                    >
                      {t("Cancel")}
                    </Button>
                    <Button
                      onPress={() =>
                        void perform(async () => {
                          showJournal(
                            await db.restoreBackup(importPreview.text),
                          );
                          await reloadLists();
                          setStorageError(false);
                          setImportPreview(null);
                        }, "Backup restored. Your schedules, progress and recovery history are saved in this browser.")
                      }
                      isDisabled={busy}
                    >
                      {t("Restore backup")}
                    </Button>
                  </Modal.Footer>
                </Modal.Dialog>
              </Modal.Container>
            </Modal.Backdrop>
          </Modal>
        )}
      </div>
    </I18nProvider>
  );
}
