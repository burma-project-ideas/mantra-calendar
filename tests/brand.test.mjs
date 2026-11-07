import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

test("logo variants and manifest point to valid generated assets", async () => {
  for (const [name, size] of [
    ["logo", 256],
    ["favicon", 48],
    ["apple-touch-icon", 180],
    ["icon-192", 192],
    ["icon-512", 512],
    ["maskable-512", 512],
  ]) {
    const metadata = await sharp(`public/brand/${name}.png`).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    if (name === "maskable-512") assert.equal(metadata.hasAlpha, false);
    else assert.equal(metadata.hasAlpha, true);
  }
  const manifest = JSON.parse(
    await readFile("public/manifest.webmanifest", "utf8"),
  );
  assert.equal(manifest.name, "Mantra Practice Calendar");
  for (const icon of manifest.icons)
    assert.ok((await readFile(`public${icon.src}`)).length > 0);
});
