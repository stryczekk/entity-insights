// A made-up home for the browser test and the README screenshots: no data
// from a real installation. Deterministic - a seeded generator, so every run
// (and every screenshot) shows the same history, ending "now".

const DAY = 86400e3;
const DAYS = 200;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const midnight = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const at = (day, h, m = 0) => day + (h * 60 + m) * 60000;

// on/off periods per day -> rows [t, state]
function onOff(seed, plan) {
  const r = rng(seed);
  const rows = [];
  const today = midnight(Date.now());
  for (let i = DAYS; i >= 0; i--) {
    const day = today - i * DAY;
    const wd = new Date(day).getDay();
    for (const [h1, m1, h2, m2, p, jitter] of plan(wd, r)) {
      if (r() > p) continue;
      const a = at(day, h1, m1 + Math.round((r() - 0.5) * jitter));
      const b = at(day, h2, m2 + Math.round((r() - 0.5) * jitter));
      if (b <= a || a > Date.now()) continue;
      rows.push([a, "on"], [Math.min(b, Date.now() + 1), "off"]);
    }
  }
  return rows.filter(([t]) => t <= Date.now()).sort((x, y) => x[0] - y[0]);
}

// Names as a user would give them, in the language of the screenshot.
const NAMES = {
  en: { kitchen: "Kitchen ceiling", lamp: "Living room lamp", dining1: "Dining room · 1 bulb", dining3: "Dining room · 3 bulbs",
        hall: "Hallway", porch: "Porch", coffee: "Coffee maker", living: "Living room window", bedroom: "Bedroom window",
        office: "Office window", morning: "Morning covers", evening: "Evening covers", anna: "Anna", tom: "Tom",
        temp: "Living room temperature" },
  pl: { kitchen: "Kuchnia sufit", lamp: "Lampa w salonie", dining1: "Jadalnia · 1 żarówka", dining3: "Jadalnia · 3 żarówki",
        hall: "Korytarz", porch: "Ganek", coffee: "Ekspres do kawy", living: "Okno w salonie", bedroom: "Okno w sypialni",
        office: "Okno w gabinecie", morning: "Rolety rano", evening: "Rolety wieczorem", anna: "Anna", tom: "Tomek",
        temp: "Temperatura w salonie" },
};

// cover moves -> rows [t, state, position] plus logbook entries
function cover(seed, plan, people, n) {
  const r = rng(seed);
  const rows = [];
  const log = [];
  const today = midnight(Date.now());
  let pos = 0;
  const move = (t, to, ctx) => {
    if (t > Date.now() || to === pos) return;
    const up = to > pos;
    rows.push([t, up ? "opening" : "closing", pos]);
    pos = to;
    rows.push([t + 25000, to === 0 ? "closed" : "open", to]);
    log.push(Object.assign({ when: t / 1000, state: up ? "opening" : "closing" }, ctx));
  };
  for (let i = DAYS; i >= 0; i--) {
    const day = today - i * DAY;
    for (const [h, m, to, who] of plan(new Date(day).getDay(), r)) {
      const t = at(day, h, m + Math.round((r() - 0.5) * 20));
      let ctx = {};
      if (who === "auto") ctx = { context_event_type: "automation_triggered", context_name: to ? n.morning : n.evening };
      else if (who === "app") ctx = { context_user_id: people[Math.floor(r() * people.length)] };
      else if (who === "google") ctx = { context_event_type: "google_assistant_command", context_user_id: people[0] };
      move(t, to, ctx);
    }
  }
  return { rows: rows, log: log };
}

export function buildHome(lang = "en") {
  const n = NAMES[lang] || NAMES.en;
  const evening = (wd, r) => [[6, 40, 7, 25, wd > 0 && wd < 6 ? 0.9 : 0.3, 20], [17, 50, 22, 20, 0.95, 50], [12, 30, 13, 10, 0.25, 30]];
  const lamp = (wd, r) => [[19, 30, 23, 0, 0.85, 60]];
  const dining = (wd, r) => [[18, 30, 19, 40, 0.8, 30]];
  const diningBig = (wd, r) => [[13, 0, 14, 0, wd === 0 || wd === 6 ? 0.8 : 0.05, 30], [19, 0, 19, 30, 0.2, 20]];
  const hall = (wd, r) => [[6, 30, 6, 40, 0.9, 10], [21, 50, 22, 5, 0.9, 20], [2, 10, 2, 15, 0.15, 30]];
  const porch = (wd, r) => [[18, 0, 23, 30, 0.7, 40]];
  const coffee = (wd, r) => [[6, 45, 7, 5, 0.95, 10], [14, 0, 14, 15, 0.4, 20]];

  const lights = {
    "light.kitchen_ceiling": { name: n.kitchen, rows: onOff(1, evening), dim: false },
    "light.living_room_lamp": { name: n.lamp, rows: onOff(2, lamp), dim: true },
    "light.dining_small": { name: n.dining1, rows: onOff(3, dining), dim: false },
    "light.dining_large": { name: n.dining3, rows: onOff(4, diningBig), dim: false },
    "light.hallway": { name: n.hall, rows: onOff(5, hall), dim: false },
    "light.porch": { name: n.porch, rows: onOff(6, porch), dim: false },
  };
  const switches = { "switch.coffee_maker": { name: n.coffee, rows: onOff(7, coffee) } };
  const people = ["user-anna", "user-tom"];
  const covers = {
    "cover.living_room": { name: n.living, ...cover(8, (wd, r) => [
      [wd === 0 || wd === 6 ? 8 : 7, 0, 100, "auto"],
      ...(r() < 0.3 ? [[13, 30, 40, "app"], [16, 0, 100, r() < 0.5 ? "app" : "device"]] : []),
      ...(r() < 0.1 ? [[11, 0, 0, "google"], [12, 0, 100, "device"]] : []),
      [20, 30, 0, "auto"]], people, n) },
    "cover.bedroom": { name: n.bedroom, ...cover(9, (wd, r) => [
      [wd === 0 || wd === 6 ? 8 : 6, 50, 100, r() < 0.8 ? "auto" : "device"],
      [22, 0, 0, r() < 0.6 ? "device" : "app"]], people, n) },
    "cover.office": { name: n.office, ...cover(10, (wd, r) => [
      [8, 30, 100, "device"], ...(r() < 0.4 ? [[12, 0, 50, "device"], [15, 0, 100, "device"]] : []), [19, 0, 0, "device"]], people, n) },
  };
  return { lights, switches, covers, people, names: n };
}

const last = (rows) => rows[rows.length - 1];

// The fake `hass` the module sees. `calls` records websocket/API/service calls.
export function fakeHass(home, language, { influx = true, now = Date.now() } = {}) {
  const calls = [];
  const states = {};
  const lc = (rows) => new Date(rows.length ? last(rows)[0] : now - DAY).toISOString();
  for (const [id, l] of Object.entries(home.lights)) {
    const on = l.rows.length && last(l.rows)[1] === "on";
    states[id] = { entity_id: id, state: on ? "on" : "off", last_changed: lc(l.rows), last_updated: lc(l.rows),
      attributes: Object.assign({ friendly_name: l.name, supported_color_modes: [l.dim ? "brightness" : "onoff"] },
        l.dim && on ? { brightness: 166 } : {}) };
  }
  for (const [id, s] of Object.entries(home.switches)) {
    states[id] = { entity_id: id, state: last(s.rows)[1], last_changed: lc(s.rows), last_updated: lc(s.rows),
      attributes: { friendly_name: s.name } };
  }
  for (const [id, c] of Object.entries(home.covers)) {
    const l = last(c.rows);
    states[id] = { entity_id: id, state: l[1], last_changed: lc(c.rows), last_updated: lc(c.rows),
      attributes: { friendly_name: c.name, current_position: l[2], supported_features: 15 } };
  }
  states["person.anna"] = { entity_id: "person.anna", state: "home", attributes: { friendly_name: home.names.anna, user_id: "user-anna" } };
  states["person.tom"] = { entity_id: "person.tom", state: "home", attributes: { friendly_name: home.names.tom, user_id: "user-tom" } };
  states["sensor.living_room_temperature"] = { entity_id: "sensor.living_room_temperature", state: "21.4",
    attributes: { friendly_name: home.names.temp, unit_of_measurement: "°C", state_class: "measurement" } };

  const rowsOf = (id) => (home.lights[id] || home.switches[id] || home.covers[id] || { rows: [] }).rows;

  const hass = {
    calls,
    language,
    locale: { language },
    states,
    entities: {},
    config: { components: influx ? ["influx_proxy", "history", "logbook"] : ["history", "logbook"], time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    connection: {
      subscribeEvents: async (cb, type) => { calls.push({ subscribe: type }); return () => calls.push({ unsubscribe: type }); },
    },
    async callWS(msg) {
      calls.push(msg);
      if (msg.type === "history/history_during_period") {
        const a = Date.parse(msg.start_time), b = Date.parse(msg.end_time);
        const out = {};
        for (const id of msg.entity_ids) {
          const rows = rowsOf(id);
          if (!rows.length) continue;
          const before = rows.filter((r) => r[0] < a).pop();
          const inside = rows.filter((r) => r[0] >= a && r[0] <= b);
          const all = (before ? [[a, before[1], before[2]]] : []).concat(inside);
          out[id] = all.map(([t, s, p]) => (msg.minimal_response
            ? { s: s, lu: t / 1000 }
            : { s: s, a: p === undefined ? {} : { current_position: p }, lu: t / 1000 }));
        }
        return out;
      }
      if (msg.type === "logbook/get_events") {
        const a = Date.parse(msg.start_time) / 1000, b = Date.parse(msg.end_time) / 1000;
        const c = home.covers[msg.entity_ids[0]];
        return c ? c.log.filter((e) => e.when >= a && e.when <= b).map((e) => Object.assign({ entity_id: msg.entity_ids[0] }, e)) : [];
      }
      throw new Error("unexpected websocket call " + msg.type);
    },
    async callApi(method, path) {
      calls.push({ method, path });
      const u = new URL(path, "http://x/");
      if (u.pathname !== "/influx_proxy/states") throw new Error("unexpected API call " + path);
      const days = Number(u.searchParams.get("days"));
      const a = now - days * DAY;
      const withPos = u.searchParams.get("attributes") === "current_position";
      const out = {};
      for (const id of u.searchParams.get("entities").split(",")) {
        const rows = rowsOf(id);
        const before = rows.filter((r) => r[0] <= a).pop();
        const res = (before ? [before] : []).concat(rows.filter((r) => r[0] > a));
        if (res.length) out[id] = res.map(([t, s, p]) => (withPos ? [t, s, p === undefined ? null : p] : [t, s]));
      }
      return out;
    },
    async callService(domain, service, data) { calls.push({ domain, service, data }); },
  };
  return hass;
}
