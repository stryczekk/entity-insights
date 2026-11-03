// Unit tests for the pure helpers of the module - no browser needed.
//   node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";

// Minimal browser stand-ins so the module file can be imported as-is.
globalThis.HTMLElement = class {};
globalThis.window = globalThis;
globalThis.customElements = { _d: new Map(), get(n) { return this._d.get(n); }, define(n, c) { this._d.set(n, c); } };
globalThis.addEventListener = () => {};

const m = await import("../entity-insights.js");
const H = 3600e3;
// local time, so the tests pass in any time zone
const at = (d, h, min = 0) => new Date(2026, 9, d, h, min).getTime();

test("registers the dialog, the card and the API once", () => {
  assert.equal(customElements.get("entity-insights"), m.EntityInsightsCard);
  assert.equal(customElements.get("entity-insights-dialog"), m.EntityInsightsDialog);
  assert.equal(window.entityInsights.version, m.VERSION);
  assert.equal(window.customCards.filter((c) => c.type === "entity-insights").length, 1);
});

test("tr: domain overrides, fallback to English, placeholders", () => {
  assert.equal(m.tr("pl", "sum_on", { n: 3 }, "light"), "świeciła · 3×");
  assert.equal(m.tr("pl", "sum_on", { n: 3 }, "switch"), "włączone · 3×");
  assert.equal(m.tr("en", "sum_on", { n: 3 }, "light"), "lit · 3×");
  assert.equal(m.tr("fr", "close"), "Close");
  assert.equal(m.tr("de", "close"), "Schließen");
  assert.equal(m.tr("de", "switch", null, "light"), "Licht");
  assert.equal(m.tr("en", "of", { n: 2 }), "2 of {d}");
});

test("langOf follows the HA locale", () => {
  assert.equal(m.langOf({ locale: { language: "pl" } }), "pl");
  assert.equal(m.langOf({ language: "pl-PL" }), "pl");
  assert.equal(m.langOf({ locale: { language: "fr" } }), "en");
  assert.equal(m.langOf({ locale: { language: "de" } }), "de");
  assert.equal(m.langOf(null), "en");
});

test("plural: Polish 1 / 2-4 / 5+ / 12-14", () => {
  const f = m.STRINGS.pl.moves;
  assert.equal(m.plural("pl", 1, f), "1 ruch");
  assert.equal(m.plural("pl", 3, f), "3 ruchy");
  assert.equal(m.plural("pl", 5, f), "5 ruchów");
  assert.equal(m.plural("pl", 12, f), "12 ruchów");
  assert.equal(m.plural("pl", 22, f), "22 ruchy");
  assert.equal(m.plural("pl", 0, f), "0 ruchów");
  assert.equal(m.plural("en", 1, m.STRINGS.en.moves), "1 move");
  assert.equal(m.plural("en", 2, m.STRINGS.en.moves), "2 moves");
});

test("esc escapes markup", () => {
  assert.equal(m.esc('<img src=x onerror="a">'), "&lt;img src=x onerror=&quot;a&quot;&gt;");
  assert.equal(m.esc(null), "");
});

test("parseRequest: string, list, object; rejects junk", () => {
  assert.deepEqual(m.parseRequest("light.a").ids, ["light.a"]);
  assert.deepEqual(m.parseRequest(["light.a", "light.b"]).ids, ["light.a", "light.b"]);
  const r = m.parseRequest({ entities: [{ entity: "light.a" }, "light.b"], name: "Salon", labels: ["x1", "x3"] });
  assert.deepEqual(r.ids, ["light.a", "light.b"]);
  assert.equal(r.name, "Salon");
  assert.deepEqual(r.labels, ["x1", "x3"]);
  assert.equal(m.parseRequest({ entity: "light.a", kind: "bogus" }).kind, null);
  for (const bad of [null, "", "nope", ["light.a", "x"], { entity: "light.a<b>" }, { entities: [] }, 42]) {
    assert.equal(m.parseRequest(bad), null, JSON.stringify(bad));
  }
});

test("kindOf picks the view by domain", () => {
  const s = (id, state = "on", attributes = {}) => ({ entity_id: id, state, attributes });
  assert.equal(m.kindOf(s("light.a")), "onoff");
  assert.equal(m.kindOf(s("binary_sensor.door")), "onoff");
  assert.equal(m.kindOf(s("cover.a", "open")), "cover");
  assert.equal(m.kindOf(s("sensor.t", "21.5", { unit_of_measurement: "°C" })), "chart");
  // a sensor of words: time in each state; dates / timestamps are not
  assert.equal(m.kindOf(s("sensor.phase", "rinse", {})), "states");
  assert.equal(m.kindOf(s("sensor.end", "2026-11-03T10:30:00Z", { device_class: "timestamp" })), null);
  assert.equal(m.kindOf(s("sensor.bin", "2026-11-10", { device_class: "date" })), null);
  // things with an "on" of their own: a thermostat at work, a lock open, a player playing, a robot out
  for (const id of ["climate.a", "water_heater.a", "lock.a", "alarm_control_panel.a", "media_player.a", "vacuum.a", "lawn_mower.a"])
    assert.equal(m.kindOf(s(id, "x")), "onoff", id);
  assert.equal(m.kindOf(s("weather.home", "sunny")), null);
  assert.equal(m.kindOf(s("camera.door", "streaming")), null);
  assert.equal(m.kindOf(undefined), null);
});

test("computeRange: today, yesterday, n days, previous period", () => {
  const now = at(6, 15, 30);
  const t = m.computeRange("today", now, { recorderDays: 14 });
  assert.deepEqual([t.a, t.b, t.days, t.day], [at(6, 0), now, 1, true]);
  assert.deepEqual(t.prev, [at(5, 0), now - 24 * H]);
  const y = m.computeRange("yesterday", now, { recorderDays: 14 });
  assert.deepEqual([y.a, y.b], [at(5, 0), at(6, 0)]);
  assert.deepEqual(y.prev, [at(4, 0), at(5, 0)]);
  const w = m.computeRange("7", now, { recorderDays: 14 });
  assert.deepEqual([w.a, w.days, w.day], [at(0, 0), 7, false]);
  assert.deepEqual(w.prev, [new Date(2026, 9, -7).getTime(), at(0, 0)]);
  assert.equal(m.computeRange("bogus", now).k, "14");
});

test("computeRange: recorder when it keeps the range and the one before, else InfluxDB when present", () => {
  const now = at(6, 12);
  const r7 = m.computeRange("7", now, { recorderDays: 14, influx: true });
  assert.equal(r7.recorder, true);  // 7 + 7 days fit in 14
  assert.equal(r7.fetchFrom, r7.prev[0]);
  // 7 + 7 days do not fit in 10: InfluxDB, so the comparison has data
  const r7s = m.computeRange("7", now, { recorderDays: 10, influx: true });
  assert.equal(r7s.recorder, false);
  assert.equal(r7s.fetchFrom, r7s.prev[0]);
  // without InfluxDB: the recorder, the previous days cut to what it keeps
  const r7n = m.computeRange("7", now, { recorderDays: 10 });
  assert.equal(r7n.recorder, true);
  assert.equal(r7n.fetchFrom, r7n.recFrom);
  const r14 = m.computeRange("14", now, { recorderDays: 14 });
  assert.equal(r14.recorder, true);
  assert.equal(r14.fetchFrom, r14.recFrom);  // the previous 14 days are gone from the recorder
  assert.equal(m.computeRange("14", now, { recorderDays: 14, influx: true }).recorder, false);
  const r30 = m.computeRange("30", now, { recorderDays: 14, influx: true });
  assert.equal(r30.recorder, false);
  assert.equal(r30.fetchFrom, r30.prev[0]);
  assert.equal(m.computeRange("30", now, { recorderDays: 14 }).recorder, true);
});

test("availableRanges hides what the recorder does not keep", () => {
  assert.deepEqual(m.availableRanges({ recorderDays: 10 }), ["today", "yesterday", "7"]);
  assert.deepEqual(m.availableRanges({ recorderDays: 14 }), ["today", "yesterday", "7", "14"]);
  assert.deepEqual(m.availableRanges({ recorderDays: 10, influx: true }), m.RANGES);
});

test("onPeriods: on spans clipped to the range, open at the end", () => {
  const rows = [{ t: at(5, 22), s: "on" }, { t: at(6, 1), s: "off" }, { t: at(6, 8), s: "on" }, { t: at(6, 9), s: "on" }];
  const p = m.onPeriods(rows, at(6, 0), at(6, 12));
  // the first one was on before the range: clipped, not turned on in it
  assert.deepEqual(p, [{ from: at(6, 0), to: at(6, 1), clipped: true }, { from: at(6, 8), to: at(6, 12), open: true }]);
  assert.equal(m.within(p, at(6, 0), at(6, 12), at(6, 12)).count, 1);
  assert.equal(m.within(p, at(6, 0), at(6, 12), at(6, 12)).ms, 5 * 3600e3);
  // the union keeps it
  const u = m.unionPeriods([p, [{ from: at(6, 0, 30), to: at(6, 2) }]], at(6, 12));
  assert.equal(u[0].clipped, true);
  assert.equal(m.within(u, at(6, 0), at(6, 12), at(6, 12)).count, 1);
});

test("rangeBuckets across clock changes (Europe/Warsaw)", { skip: process.env.TZ !== "Europe/Warsaw" }, () => {
  // 25 October 2026: 25 hours
  const now = new Date(2026, 9, 26, 12).getTime();
  const y = m.rangeBuckets(m.computeRange("yesterday", now, {}), now, "en");
  assert.equal(y.list.length, 25);
  assert.equal(y.list[y.list.length - 1].b, m.midnight(0, now));
  assert.equal(y.list.filter((b) => b.axis !== "").map((b) => b.axis).join(), "0,6,12,18");
  // 3 months over the change: weeks start at midnight, the last ends now
  const now2 = new Date(2026, 10, 20, 12).getTime();
  const w = m.rangeBuckets(m.computeRange("90", now2, { influx: true }), now2, "en");
  for (const b of w.list) assert.equal(new Date(b.a).getHours(), 0, new Date(b.a).toString());
  assert.equal(w.list[w.list.length - 1].b, now2);
  for (let i = 1; i < w.list.length; i++) assert.equal(w.list[i].a, w.list[i - 1].b);
});

test("unionPeriods: two circuits of one lamp count once", () => {
  const a = [{ from: at(6, 8), to: at(6, 10) }];
  const b = [{ from: at(6, 9), to: at(6, 11) }, { from: at(6, 12), to: at(6, 13) }];
  assert.deepEqual(m.unionPeriods([a, b], at(6, 13)), [{ from: at(6, 8), to: at(6, 11) }, { from: at(6, 12), to: at(6, 13), open: true }]);
});

test("within and hourDays", () => {
  const p = [{ from: at(6, 7, 30), to: at(6, 9) }, { from: at(6, 20), open: true, to: at(6, 20) }];
  const w = m.within(p, at(6, 0), at(7, 0), at(6, 21));
  assert.deepEqual(w, { ms: 2.5 * H, count: 2 });
  const hd = m.hourDays(p, at(6, 0), at(7, 0), at(6, 21));
  assert.equal(hd.days[7], 1);
  assert.equal(hd.days[8], 1);
  assert.equal(hd.days[20], 1);
  assert.equal(hd.days[9], 0);
  assert.equal(hd.ms[7], 0.5 * H);
});

test("rangeBuckets: 24 hours, days, weeks", () => {
  const now = at(6, 15, 30);
  const d = m.rangeBuckets(m.computeRange("today", now), now, "en");
  assert.equal(d.unit, "h");
  assert.equal(d.list.length, 24);
  assert.equal(d.list[15].now, true);
  assert.equal(d.list[20].b, d.list[20].a);  // still to come: empty
  const w = m.rangeBuckets(m.computeRange("7", now, { influx: true }), now, "en");
  assert.equal(w.unit, "d");
  assert.equal(w.list.length, 7);
  assert.equal(w.list[6].tip, "today");
  const q = m.rangeBuckets(m.computeRange("90", now, { influx: true }), now, "pl");
  assert.equal(q.unit, "w");
  assert.equal(q.list.length, 13);
});

test("coverPos and coverMoves", () => {
  assert.equal(m.coverPos("closed", {}), 0);
  assert.equal(m.coverPos("open", { current_position: 40 }), 40);
  assert.equal(m.coverPos("unavailable", {}), null);
  const rows = [
    { t: at(6, 7), s: "open", pos: 100 },
    { t: at(6, 8), s: "closing", pos: 80 }, { t: at(6, 8, 1), s: "closing", pos: 30 },
    { t: at(6, 8, 2), s: "closed", pos: 0 },
    { t: at(6, 9), s: "opening", pos: 20 }, { t: at(6, 9, 1), s: "open", pos: 50 },
  ];
  const mv = m.coverMoves(rows, at(6, 0));
  assert.equal(mv.length, 2);
  assert.deepEqual([mv[0].up, mv[0].pos, mv[1].up, mv[1].pos], [false, 0, true, 50]);
  const cp = m.coveredPeriods(rows, at(6, 10));
  assert.deepEqual(cp, [{ from: at(6, 8), to: at(6, 10), open: true }]);
});

test("rankEntities skips groups, hidden and unavailable", () => {
  const st = (id, attributes = {}, state = "off") => ({ entity_id: id, state, attributes });
  const hass = {
    states: { "light.a": st("light.a"), "light.g": st("light.g", { entity_id: ["light.a"] }),
              "light.h": st("light.h"), "light.u": st("light.u", {}, "unavailable"), "switch.x": st("switch.x") },
    entities: { "light.h": { hidden: true } },
  };
  assert.deepEqual(m.rankEntities(hass, "light"), ["light.a"]);
});

test("median", () => {
  assert.equal(m.median([3, 1, 2]), 2);
  assert.equal(m.median([]), null);
});

test("parseRequest: rank_with must be entity ids", () => {
  assert.deepEqual(m.parseRequest({ entity: "cover.a", rank_with: ["cover.a", "cover.b"] }).rankWith, ["cover.a", "cover.b"]);
  assert.equal(m.parseRequest({ entity: "cover.a", rank_with: ["cover.a", "<x>"] }).rankWith, null);
});

test("dimmable: lights with a brightness mode only", () => {
  const s = (id, modes) => ({ entity_id: id, state: "on", attributes: { supported_color_modes: modes } });
  assert.equal(m.dimmable(s("light.a", ["brightness"])), true);
  assert.equal(m.dimmable(s("light.a", ["color_temp", "hs"])), true);
  assert.equal(m.dimmable(s("light.a", ["onoff"])), false);
  assert.equal(m.dimmable(s("switch.a", ["brightness"])), false);
  assert.equal(m.dimmable(undefined), false);
});

test("energy: a lamp's time on times its power, dimmed by brightness", () => {
  const h = 3600e3, rows = [{ t: 0, s: "on", br: 255 }, { t: h, s: "on", br: 128 }, { t: 2 * h, s: "off" }, { t: 3 * h, s: "on" }];
  assert.equal(Math.round(m.energyWh(rows, 0, 4 * h, 4 * h, 10, false)), 30);           // 3 h on x 10 W
  assert.equal(Math.round(m.energyWh(rows, 0, 3 * h, 4 * h, 10, true) * 10), 150);      // 10 + 5.02 (half) Wh
  assert.equal(Math.round(m.energyWh(rows, h / 2, h, 4 * h, 10, false)), 5);             // clipped to the range
});

test("energy: a power meter's watts over time", () => {
  const h = 3600e3, rows = [{ t: 0, s: "100" }, { t: h, s: "0" }, { t: 2 * h, s: "unavailable" }, { t: 3 * h, s: "50" }];
  assert.equal(m.meterWh(rows, 0, 4 * h, 4 * h), 150);
});

test("energy: a meter only on the entity's own device, not on a controller of many", () => {
  const st = (dc, u) => ({ attributes: { device_class: dc, unit_of_measurement: u } });
  const hass = {
    entities: { "light.lamp": { entity_id: "light.lamp", device_id: "plug" }, "sensor.plug_power": { entity_id: "sensor.plug_power", device_id: "plug" },
      "light.a": { entity_id: "light.a", device_id: "board" }, "light.b": { entity_id: "light.b", device_id: "board" },
      "sensor.board_power": { entity_id: "sensor.board_power", device_id: "board" } },
    states: { "sensor.plug_power": st("power", "W"), "sensor.board_power": st("power", "W") },
  };
  assert.equal(m.powerSensorOf(hass, "light.lamp"), "sensor.plug_power");
  assert.equal(m.powerSensorOf(hass, "light.a"), null);
});

test("request: watts for each entity, a price or a price sensor", () => {
  assert.deepEqual(m.parseRequest({ entity: "light.a", watts: 18 }).watts, [18]);
  assert.deepEqual(m.parseRequest({ entities: ["light.a", "light.b"], watts: [10, 30] }).watts, [10, 30]);
  assert.equal(m.parseRequest({ entities: ["light.a", "light.b"], watts: [10] }).watts, null);
  assert.equal(m.parseRequest({ entity: "light.a", price: "sensor.kwh" }).price, "sensor.kwh");
  assert.equal(m.parseRequest({ entity: "light.a", price: 1.12 }).price, 1.12);
});

test("activeNow: the entity's own meaning of on", () => {
  const s = (id, state, attributes = {}) => ({ entity_id: id, state, attributes });
  assert.equal(m.activeNow(s("climate.a", "heat", { hvac_action: "heating" })), true);
  assert.equal(m.activeNow(s("climate.a", "heat", { hvac_action: "idle" })), false);
  assert.equal(m.activeNow(s("climate.ac", "cool", { hvac_action: "cooling" })), true);
  assert.equal(m.activeNow(s("water_heater.b", "eco", { current_temperature: 44, temperature: 55 })), true);
  assert.equal(m.activeNow(s("water_heater.b", "eco", { current_temperature: 54, temperature: 55 })), false);
  assert.equal(m.activeNow(s("lock.door", "unlocked")), true);
  assert.equal(m.activeNow(s("lock.door", "locked")), false);
  assert.equal(m.activeNow(s("alarm_control_panel.h", "armed_night")), true);
  assert.equal(m.activeNow(s("alarm_control_panel.h", "disarmed")), false);
  assert.equal(m.activeNow(s("media_player.tv", "playing")), true);
  assert.equal(m.activeNow(s("media_player.tv", "paused")), false);
  assert.equal(m.activeNow(s("light.a", "on")), true);
});
