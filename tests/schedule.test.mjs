import test from "node:test";
import assert from "node:assert/strict";
import { makeDays, addDays, toProgress } from "../src/schedule.mjs";

test("preserves original 90-day sequence and 162 entries", () => {
  const days = makeDays("2025-07-09");
  assert.equal(days.length, 90);
  assert.equal(days.at(-1).date, "2025-10-06");
  assert.equal(toProgress(days).length, 162);
  assert.equal(days[0].mantras[0].name, "အရဟံ");
  days[0].mantras[0].isPracticed = true;
  assert.equal(days[1].mantras[0].isPracticed, false);
  assert.equal(
    makeDays("2030-01-01", toProgress(days))[0].mantras[0].isPracticed,
    false,
  );
  assert.equal(
    makeDays("2025-07-09", toProgress(days))[0].mantras[0].isPracticed,
    true,
  );
});
test("date shifting is timezone independent across leap years and years", () => {
  assert.equal(addDays("2028-02-28", 1), "2028-02-29");
  assert.equal(addDays("2028-12-31", 1), "2029-01-01");
  assert.equal(makeDays("2028-12-31").at(-1).date, "2029-03-30");
});
