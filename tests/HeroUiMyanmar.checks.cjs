const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const messages = require("../src/data/myanmar.json");
const t = (text) => messages[text] ?? text;
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        reducedMotion: "reduce",
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://localhost:5094/manifest.webmanifest");
    await page.evaluate(async () => {
      const api = await import("/js/practice-db.js");
      await api.select("2030-01-01");
      await api.select("2031-01-01");
      await api.select("2030-01-01");
    });
    const snapshot = () =>
      page.evaluate(async () =>
        (await import("/js/practice-db.js")).exportBackup(),
      );
    const dialog = () => page.getByRole("dialog");
    const action = (text, scope = page) =>
      scope.getByRole("button", { name: t(text), exact: true });
    const ready = () =>
      page.waitForFunction(
        () =>
          document.querySelector(".practice-calendar") &&
          !document.querySelector("#ui-language").disabled,
      );
    const download = async (scope) => {
      const pending = page.waitForEvent("download");
      await action("Export backup", scope).click();
      const file = await pending;
      const text = await fs.readFile(await file.path(), "utf8");
      assert.equal(JSON.parse(text).version, 2);
      return text;
    };
    const importFile = async (text) => {
      await page
        .locator("input[type=file]")
        .setInputFiles({
          name: "myanmar-backup.json",
          mimeType: "application/json",
          buffer: Buffer.from(text),
        });
      await action("Restore backup", dialog()).click();
      await dialog().waitFor({ state: "hidden" });
      await ready();
    };
    const softDelete = async () => {
      await action("Delete selected schedule").click();
      await action("Delete schedule", dialog()).click();
      await dialog().waitFor({ state: "hidden" });
      await ready();
    };
    await page.goto("http://localhost:5094/");
    await ready();
    assert.equal(await page.locator("html").getAttribute("lang"), "my");
    await page.locator('[data-practice-day="2030-01-01"]').click();
    await dialog().locator(".checkbox__content").first().click();
    await action("Save practice", dialog()).click();
    await dialog().waitFor({ state: "hidden" });
    assert.equal(
      (await snapshot()).schedules
        .find((s) => s.startDate === "2030-01-01")
        .progress.filter((p) => p.isPracticed).length,
      1,
    );
    const before = await snapshot();
    await download(page.locator("#backups"));
    await action("Delete selected schedule").click();
    await action("Keep schedule", dialog()).click();
    await dialog().waitFor({ state: "hidden" });
    assert.deepEqual(await snapshot(), before);
    await softDelete();
    assert.ok(
      (await snapshot()).deletedSchedules.some(
        (copy) => copy.startDate === "2030-01-01",
      ),
    );
    await action("Restore selected schedule").click();
    await ready();
    assert.ok(
      (await snapshot()).schedules.some(
        (schedule) => schedule.startDate === "2030-01-01",
      ),
    );
    await softDelete();
    await action("Permanently delete selected copy").click();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    await fs.mkdir("outputs/heroui-validation", { recursive: true });
    for (const [width, height] of [
      [320, 640],
      [390, 844],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Confirmation overflow " + width,
      );
      await action("Keep recovery copy", dialog()).scrollIntoViewIfNeeded();
      assert.ok(await action("Keep recovery copy", dialog()).isVisible());
      assert.ok(await action("Permanently delete", dialog()).isVisible());
      await page.screenshot({
        path: `outputs/heroui-validation/mm-confirmation-${width}x${height}.png`,
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const recoveryBackup = await download(dialog());
    await dialog()
      .getByRole("status")
      .filter({
        hasText: t(
          "Backup download started. Save the JSON file before confirming deletion.",
        ),
      })
      .waitFor();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    await action("Permanently delete", dialog()).click();
    await dialog().waitFor({ state: "hidden" });
    await ready();
    assert.equal((await snapshot()).deletedSchedules.length, 0);
    await importFile(recoveryBackup);
    assert.equal((await snapshot()).deletedSchedules.length, 1);
    await action("Empty recently deleted").click();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    const fullBackup = await download(dialog());
    await dialog()
      .getByRole("status")
      .filter({
        hasText: t(
          "Backup download started. Save the JSON file before confirming deletion.",
        ),
      })
      .waitFor();
    await dialog().locator(".checking-indicator").waitFor({ state: "hidden" });
    await action("Empty recently deleted", dialog()).click();
    await dialog().waitFor({ state: "hidden" });
    await ready();
    assert.equal((await snapshot()).deletedSchedules.length, 0);
    await page.reload();
    await ready();
    assert.equal((await snapshot()).deletedSchedules.length, 0);
    await importFile(fullBackup);
    assert.equal((await snapshot()).deletedSchedules.length, 1);
    const beforeLanguage = await snapshot();
    await page.locator("#ui-language").click();
    await page.getByRole("option", { name: "English", exact: true }).click();
    await page
      .getByRole("button", { name: "Record practice", exact: true })
      .waitFor();
    assert.deepEqual(await snapshot(), beforeLanguage);
    await page.reload();
    await ready();
    assert.match(await page.locator("#ui-language").innerText(), /English/);
    await page.locator("#ui-language").click();
    await page.getByRole("option", { name: "မြန်မာ", exact: true }).click();
    await page
      .getByRole("button", { name: "ရွတ်ဖတ်မှု မှတ်သားရန်", exact: true })
      .waitFor();
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Myanmar page overflow " + width,
      );
      assert.ok(
        await page.evaluate(() =>
          [...document.images].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        ),
        "Broken brand image",
      );
      await page.screenshot({
        path: `outputs/heroui-validation/mm-mobile-${width}.png`,
        fullPage: true,
      });
    }
    assert.equal(
      (
        await page.request.get("http://localhost:5094/brand/favicon.png")
      ).status(),
      200,
    );
    assert.equal(
      (
        await page.request.get(
          "http://localhost:5094/brand/apple-touch-icon.png",
        )
      ).status(),
      200,
    );
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      "PASS: complete Myanmar save/export/import/restore/final single and bulk delete flow, EN/MM data-preserving switch/reload, mobile and landscape confirmations, 320–768px page/logo checks.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
