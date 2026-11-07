const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const storageContext = await browser.newContext(),
      storagePage = await storageContext.newPage();
    await storagePage.goto("http://localhost:5094/manifest.webmanifest");
    const checks = await fs.readFile("tests/IndexedDb.checks.js", "utf8");
    console.log(await storagePage.evaluate(`(${checks})()`));
    await storageContext.close();
    const context = await browser.newContext({
        viewport: { width: 320, height: 850 },
        reducedMotion: "reduce",
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:5094/manifest.webmanifest");
    await page.evaluate(async () => {
      const api = await import("/js/practice-db.js");
      await api.setLanguage("en");
      await api.select("2030-01-01");
      await api.restoreBackup(
        JSON.stringify({
          format: "mantra-practice-calendar",
          version: 2,
          activeStartDate: "2030-01-01",
          schedules: [{ startDate: "2030-01-01", progress: [] }],
          deletedSchedules: [
            {
              id: "deleted:safety",
              startDate: "2029-01-01",
              progress: [],
              deletedAt: "2026-11-07T00:00:00.000Z",
            },
          ],
        }),
      );
    });
    await page.goto("http://localhost:5094/");
    await page.locator(".practice-calendar").waitFor();
    const snapshot = () =>
      page.evaluate(async () =>
        JSON.stringify(
          await (await import("/js/practice-db.js")).exportBackup(),
        ),
      );
    const baseline = await snapshot();
    const hold = () =>
      page.evaluate(async () => {
        const db = await new Promise((resolve) => {
          const r = indexedDB.open("mantra-practice-calendar", 1);
          r.onsuccess = () => resolve(r.result);
        });
        const tx = db.transaction("journal", "readwrite"),
          store = tx.objectStore("journal");
        window.holdStatus = true;
        const pump = () => {
          const r = store.get("activeStartDate");
          r.onsuccess = () => {
            if (window.holdStatus) pump();
          };
        };
        pump();
        tx.oncomplete = () => db.close();
      });
    const dialog = () => page.getByRole("dialog");
    for (const mode of [
      {
        open: "Permanently delete selected copy",
        final: "Permanently delete",
        keep: "Keep recovery copy",
      },
      {
        open: "Empty recently deleted",
        final: "Empty recently deleted",
        keep: "Keep recovery history",
      },
    ]) {
      await hold();
      await page.getByRole("button", { name: mode.open, exact: true }).click();
      await dialog().locator(".checking-indicator").waitFor();
      assert.equal(
        await dialog()
          .getByRole("button", { name: mode.final, exact: true })
          .isDisabled(),
        true,
      );
      assert.equal(
        await dialog()
          .getByRole("button", { name: "Export backup", exact: true })
          .isDisabled(),
        true,
      );
      assert.equal(
        await dialog()
          .getByRole("button", { name: mode.keep, exact: true })
          .isEnabled(),
        true,
      );
      await dialog()
        .getByRole("button", { name: mode.keep, exact: true })
        .click();
      await dialog().waitFor({ state: "hidden" });
      await page.evaluate(() => (window.holdStatus = false));
      assert.equal(await snapshot(), baseline);
      await page.getByRole("button", { name: mode.open, exact: true }).click();
      await dialog()
        .locator(".checking-indicator")
        .waitFor({ state: "hidden" });
      await hold();
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));
      await dialog().locator(".checking-indicator").waitFor();
      assert.equal(
        await dialog()
          .getByRole("button", { name: mode.final, exact: true })
          .isDisabled(),
        true,
      );
      await page.evaluate(() => {
        window.dispatchEvent(new Event("focus"));
        window.holdStatus = false;
      });
      await dialog()
        .locator(".checking-indicator")
        .waitFor({ state: "hidden" });
      await page.evaluate(() => {
        window.originalURL = URL.createObjectURL;
        URL.createObjectURL = () => {
          throw Error("Simulated export failure");
        };
      });
      await dialog()
        .getByRole("button", { name: "Export backup", exact: true })
        .click();
      await dialog()
        .getByRole("alert")
        .filter({ hasText: "Nothing was deleted" })
        .waitFor();
      assert.equal(await snapshot(), baseline);
      await page.evaluate(() => (URL.createObjectURL = window.originalURL));
      const downloaded = page.waitForEvent("download");
      await dialog()
        .getByRole("button", { name: "Export backup", exact: true })
        .click();
      await downloaded;
      await dialog()
        .getByRole("status")
        .filter({ hasText: "Save the JSON file" })
        .waitFor();
      await dialog()
        .locator(".checking-indicator")
        .waitFor({ state: "hidden" });
      assert.equal(await dialog().getByRole("alert").count(), 0);
      await page.keyboard.press("Escape");
      await dialog().waitFor({ state: "hidden" });
      assert.equal(await snapshot(), baseline);
    }
    await page
      .getByRole("button", {
        name: "Permanently delete selected copy",
        exact: true,
      })
      .click();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    const other = await context.newPage();
    await other.goto("http://localhost:5094/manifest.webmanifest");
    await other.evaluate(async () => {
      await (
        await import("/js/practice-db.js")
      ).save("2030-01-01", [
        { date: "2030-01-01T00:00:00", mantraName: "အရဟံ", isPracticed: true },
      ]);
    });
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await dialog()
      .getByRole("alert")
      .filter({ hasText: "have changed since" })
      .waitFor({ timeout: 1500 });
    const otherDownload = other.waitForEvent("download");
    await other.evaluate(async () => {
      await (await import("/js/practice-db.js")).downloadBackup();
    });
    await otherDownload;
    await page.evaluate(() =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await dialog()
      .getByRole("alert")
      .waitFor({ state: "hidden", timeout: 1500 });
    await page.evaluate(() => {
      window.originalGet = IDBObjectStore.prototype.get;
      IDBObjectStore.prototype.get = function (key) {
        if (key === "lastBackupFingerprint")
          throw Error("Simulated check failure");
        return window.originalGet.call(this, key);
      };
      window.dispatchEvent(new Event("focus"));
    });
    await dialog()
      .getByRole("alert")
      .filter({ hasText: "could not be checked" })
      .waitFor();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    assert.equal(
      await dialog()
        .getByRole("button", { name: "Permanently delete", exact: true })
        .isEnabled(),
      true,
    );
    await page.evaluate(
      () => (IDBObjectStore.prototype.get = window.originalGet),
    );
    await dialog()
      .getByRole("button", { name: "Keep recovery copy", exact: true })
      .click();
    await dialog().waitFor({ state: "hidden" });
    await page.locator('[data-practice-day="2030-01-01"]').click();
    await page.evaluate(() => {
      window.originalPut = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (value, key) {
        if (String(key).startsWith("schedule:"))
          throw Error("Simulated save failure");
        return window.originalPut.call(this, value, key);
      };
    });
    await dialog().locator(".checkbox__content").nth(1).click();
    await dialog()
      .getByRole("button", { name: "Save practice", exact: true })
      .click();
    await dialog().getByRole("alert").waitFor();
    await page.evaluate(
      () => (IDBObjectStore.prototype.put = window.originalPut),
    );
    await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
    await dialog().waitFor({ state: "hidden" });
    assert.equal(
      JSON.parse(await snapshot()).schedules[0].progress.filter(
        (item) => item.isPracticed,
      ).length,
      1,
    );
    assert.deepEqual(errors, []);
    await other.close();
    await context.close();
    console.log(
      "PASS: original IndexedDB rollback/backup tests; HeroUI check/export busy guards; cancellation; export failure/retry; return-to-tab stale/fresh warnings; check failure; inline failed-save error with preserved progress.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
