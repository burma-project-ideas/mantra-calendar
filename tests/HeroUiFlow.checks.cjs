const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    await context.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw Error("No localStorage writes allowed");
      };
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const requests = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("http://localhost:5094/manifest.webmanifest");
    await page.evaluate(async () => {
      const api = await import("/js/practice-db.js");
      await api.select("2030-01-01");
      await api.save("2030-01-01", [
        { date: "2030-01-01T00:00:00", mantraName: "အရဟံ", isPracticed: true },
      ]);
      await api.restoreBackup(
        JSON.stringify({
          format: "mantra-practice-calendar",
          version: 2,
          activeStartDate: "2030-01-01",
          schedules: [
            {
              startDate: "2030-01-01",
              progress: [
                {
                  date: "2030-01-01T00:00:00",
                  mantraName: "အရဟံ",
                  isPracticed: true,
                },
              ],
            },
            { startDate: "2031-01-01", progress: [] },
          ],
          deletedSchedules: [
            {
              id: "deleted:hero-seed",
              startDate: "2029-01-01",
              deletedAt: "2026-11-07T00:00:00.000Z",
              progress: [],
            },
          ],
        }),
      );
    });
    const snapshot = () =>
      page.evaluate(async () =>
        (await import("/js/practice-db.js")).exportBackup(),
      );
    const waitReady = () =>
      page.waitForFunction(() => {
        const button = document.querySelector("#ui-language");
        return (
          button &&
          !button.disabled &&
          document.querySelector(".practice-calendar")
        );
      });
    const choose = async (trigger, option) => {
      await trigger.click();
      if (typeof option === "string")
        await page.getByRole("option", { name: option, exact: true }).click();
      else await option.click();
    };
    const dialog = () => page.getByRole("dialog");
    const download = async (scope) => {
      const event = page.waitForEvent("download");
      await scope
        .getByRole("button", { name: "Export backup", exact: true })
        .click();
      const file = await event;
      return fs.readFile(await file.path(), "utf8");
    };
    const importText = async (text) => {
      await page.locator("input[type=file]").setInputFiles({
        name: "backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(text),
      });
      await dialog()
        .getByRole("button", { name: "Restore backup", exact: true })
        .click();
      await dialog().waitFor({ state: "hidden" });
      await waitReady();
    };
    const before = await snapshot();
    await page.goto("http://localhost:5094/");
    await waitReady();
    assert.equal(await page.locator("html").getAttribute("lang"), "my");
    assert.match(await page.locator(".calendar-month").innerText(), /ဇန်နဝါရီ/);
    await choose(page.locator("#ui-language"), "English");
    await page
      .getByRole("button", { name: "Record practice", exact: true })
      .waitFor();
    assert.deepEqual(await snapshot(), before);
    await page.reload();
    await waitReady();
    assert.match(await page.locator("#ui-language").innerText(), /English/);
    await page
      .getByRole("button", { name: "Continue practice", exact: true })
      .click();
    await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
    await dialog().waitFor({ state: "hidden" });
    assert.deepEqual(await snapshot(), before);
    await page.locator('[data-practice-day="2030-01-01"]').click();
    await dialog().locator(".checkbox__content").nth(1).click();
    await dialog()
      .getByRole("button", { name: "Save practice", exact: true })
      .click();
    await dialog().waitFor({ state: "hidden" });
    await waitReady();
    assert.equal(
      (await snapshot()).schedules
        .find((s) => s.startDate === "2030-01-01")
        .progress.filter((m) => m.isPracticed).length,
      2,
    );
    const practiceBefore = await snapshot();
    await page.locator('[data-practice-day="2030-01-02"]').focus();
    await page.keyboard.press("Enter");
    await dialog().locator(".checkbox__content").first().click();
    await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
    await dialog().waitFor({ state: "hidden" });
    assert.deepEqual(await snapshot(), practiceBefore);
    for (const name of ["Planner", "Timeline", "Year", "Month"]) {
      await page.getByRole("tab", { name, exact: true }).click();
    }
    const output = path.resolve("outputs/heroui");
    await fs.mkdir(output, { recursive: true });
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      if (width === 320) {
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
        await page
          .getByRole("menuitem", { name: "Backups", exact: true })
          .click();
        await page.waitForFunction(
          () => document.activeElement?.id === "backups",
        );
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
        await page
          .getByRole("menuitem", { name: "Calendar", exact: true })
          .click();
        await page.waitForFunction(
          () => document.activeElement?.id === "calendar",
        );
      }
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Page overflow " + width,
      );
      assert.ok(
        await page.evaluate(() =>
          Array.from(document.images).every(
            (image) => image.complete && image.naturalWidth > 0,
          ),
        ),
        "Broken logo",
      );
      await page.screenshot({
        path: path.join(output, `english-${width}.png`),
        fullPage: true,
      });
    }
    const savedBackup = await download(page.locator("#backups"));
    assert.equal(JSON.parse(savedBackup).version, 2);
    await page
      .getByRole("button", { name: "Delete selected schedule", exact: true })
      .click();
    assert.equal(
      await dialog()
        .getByRole("button", { name: "Keep schedule", exact: true })
        .evaluate((e) => e === document.activeElement),
      true,
    );
    await page.keyboard.press("Escape");
    await dialog().waitFor({ state: "hidden" });
    assert.deepEqual(await snapshot(), practiceBefore);
    const softDelete = async () => {
      await page
        .getByRole("button", { name: "Delete selected schedule", exact: true })
        .click();
      await dialog()
        .getByRole("button", { name: "Delete schedule", exact: true })
        .click();
      await dialog().waitFor({ state: "hidden" });
      await waitReady();
    };
    await softDelete();
    let data = await snapshot(),
      copy = data.deletedSchedules.find((c) => c.startDate === "2030-01-01");
    assert.ok(copy);
    assert.equal(copy.progress.filter((p) => p.isPracticed).length, 2);
    await choose(
      page.locator("#recovery .select__trigger"),
      page.getByRole("option").filter({ hasText: "1 Jan 2030" }),
    );
    await page
      .getByRole("button", { name: "Restore selected schedule", exact: true })
      .click();
    await waitReady();
    assert.ok(
      (await snapshot()).schedules.some((s) => s.startDate === "2030-01-01"),
    );
    await softDelete();
    data = await snapshot();
    copy = data.deletedSchedules.find((c) => c.startDate === "2030-01-01");
    await choose(
      page.locator("#recovery .select__trigger"),
      page.getByRole("option").filter({ hasText: "1 Jan 2030" }),
    );
    await page
      .getByRole("button", {
        name: "Permanently delete selected copy",
        exact: true,
      })
      .click();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    assert.match(
      await dialog().locator("[role=alert]").innerText(),
      /have changed since/,
    );
    const recoveryBackup = await download(dialog());
    await dialog()
      .getByText(
        "Backup download started. Save the JSON file before confirming deletion.",
        { exact: true },
      )
      .waitFor();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    await page.screenshot({
      path: path.join(output, "single-confirmation.png"),
      fullPage: true,
    });
    await dialog()
      .getByRole("button", { name: "Permanently delete", exact: true })
      .click();
    await dialog().waitFor({ state: "hidden" });
    await waitReady();
    assert.ok(
      !(await snapshot()).deletedSchedules.some((c) => c.id === copy.id),
    );
    await page.reload();
    await waitReady();
    assert.ok(
      !(await snapshot()).deletedSchedules.some((c) => c.id === copy.id),
    );
    await importText(recoveryBackup);
    assert.ok(
      (await snapshot()).deletedSchedules.some((c) => c.id === copy.id),
    );
    await page
      .getByRole("button", { name: "Empty recently deleted", exact: true })
      .click();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    const fullBackup = await download(dialog());
    await dialog()
      .getByText(
        "Backup download started. Save the JSON file before confirming deletion.",
        { exact: true },
      )
      .waitFor();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    await page.screenshot({
      path: path.join(output, "empty-confirmation.png"),
      fullPage: true,
    });
    await dialog()
      .getByRole("button", { name: "Empty recently deleted", exact: true })
      .click();
    await dialog().waitFor({ state: "hidden" });
    await waitReady();
    assert.equal((await snapshot()).deletedSchedules.length, 0);
    assert.equal(
      (await snapshot()).schedules.length,
      JSON.parse(fullBackup).schedules.length,
    );
    await importText(fullBackup);
    assert.equal(
      (await snapshot()).deletedSchedules.length,
      JSON.parse(fullBackup).deletedSchedules.length,
    );
    await page.locator("input[type=file]").setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{}"),
    });
    await page
      .getByRole("alert")
      .filter({ hasText: "valid Mantra Practice Calendar backup" })
      .waitFor();
    await choose(page.locator("#ui-language"), "မြန်မာ");
    await page
      .getByRole("button", { name: "ရွတ်ဖတ်မှု မှတ်သားရန်", exact: true })
      .waitFor();
    await page.reload();
    await waitReady();
    assert.equal(await page.locator("html").getAttribute("lang"), "my");
    await page.screenshot({
      path: path.join(output, "myanmar-final.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    assert.ok(
      !requests.some((url) =>
        /_framework|Radzen|blazor\.webassembly/i.test(url),
      ),
      "The active UI must not load Blazor or Radzen",
    );
    console.log(
      "PASS: real HeroUI components, preserved IndexedDB data, default Myanmar and EN persistence, practice save/cancel/keyboard, all views, 320–1440px layouts/logos, backup files, confirmed single/bulk deletion, reload and backup recovery.",
    );
    await context.close();
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
