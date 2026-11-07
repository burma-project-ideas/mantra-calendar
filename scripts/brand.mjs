import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";

await mkdir("public/brand", { recursive: true });
const source = await sharp("docs/brand/logo-source.png")
  .trim()
  .png()
  .toBuffer();
for (const [name, size] of [
  ["logo", 256],
  ["favicon", 48],
  ["apple-touch-icon", 180],
  ["icon-192", 192],
  ["icon-512", 512],
]) {
  const inner = Math.round(size * 0.78);
  const padding = Math.floor((size - inner) / 2);
  const graphic = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: "#ffffff00" })
    .png()
    .toBuffer();
  await sharp(graphic)
    .extend({
      top: padding,
      bottom: size - inner - padding,
      left: padding,
      right: size - inner - padding,
      background: "#ffffff00",
    })
    .png()
    .toFile(`public/brand/${name}.png`);
}
await sharp(source)
  .resize(320, 320, { fit: "contain", background: "#f7f9f6" })
  .flatten({ background: "#f7f9f6" })
  .extend({ top: 96, bottom: 96, left: 96, right: 96, background: "#f7f9f6" })
  .png()
  .toFile("public/brand/maskable-512.png");
await copyFile(
  "public/brand/favicon.png",
  "legacy/BlazorWasm.MantraCalendarApp/wwwroot/favicon.png",
);
await copyFile(
  "public/brand/icon-192.png",
  "legacy/BlazorWasm.MantraCalendarApp/wwwroot/icon-192.png",
);
await copyFile(
  "public/brand/icon-512.png",
  "legacy/BlazorWasm.MantraCalendarApp/wwwroot/icon-512.png",
);
