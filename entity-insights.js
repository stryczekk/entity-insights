// Entity Insights for Home Assistant
// https://github.com/stryczekk/entity-insights
//
// A history dialog for any entity, opened from any card: how long a light
// was on, when, how often, who moved a cover (automation, a person in the
// app, Google, the wall button), the hours of the day, fun facts and the
// place among the other lights / covers of the house - for today,
// yesterday, 7, 14, 30 days or 3 months.
//
// Not a card - a module. Load it as a dashboard resource, then:
//
//   # any card with actions (tile, button, picture-elements, floor plans...)
//   hold_action:
//     action: fire-dom-event
//     entity_insights:
//       entity: light.kitchen
//
//   # or: replace Home Assistant's entity dialog for some domains on a
//   # dashboard (an invisible card - the takeover lives as long as it does)
//   type: custom:entity-insights
//   more_info: [light, cover]
//
//   // or from your own card
//   window.entityInsights.open({ entity: "light.kitchen" }, hass);
//
// History up to the recorder's keep days comes from Home Assistant; longer
// ranges from InfluxDB through the InfluxDB Proxy integration
// (https://github.com/stryczekk/ha-influx-proxy) when it is installed.
// See README.md for all options.

export const NAME = "entity-insights";
export const VERSION = "0.9.1";

// ---- Strings -----------------------------------------------------------
// "{x}" is replaced from vars. A key "light.xyz" overrides "xyz" for lights
// (a lamp "shines" in Polish; a switch is just "on").
export const STRINGS = {
  en: {
    r_today: "Today", r_yesterday: "Yesterday", r_7: "7 days", r_14: "14 days", r_30: "30 days", r_90: "3 months",
    // range buttons: six in one row on a phone
    c_7: "7d", c_14: "14d", c_30: "30d", c_90: "3 mo",
    vs_today: "vs yesterday so far", vs_yesterday: "vs the day before", vs_days: "vs previous {n} days",
    loading: "Loading history…", failed: "Could not load the history.", failed_influx: "Could not load the history from InfluxDB.",
    close: "Close", standard: "Entity settings",
    no_entity: "entity not found", on_since: "on since {t}", off_since: "off since {t}",
    switch: "On / off", "light.switch": "Light", dim_off: "off",
    sum_on: "on · {n}×", "light.sum_on": "lit · {n}×", sum_count: "times on", avg_day: "average / day",
    bars_h: "On by hour", bars_d: "Hours on per day", bars_w: "Hours on per week",
    "light.bars_h": "Lit by hour", "light.bars_d": "Hours lit per day", "light.bars_w": "Hours lit per week",
    tip_off: "off", hours_title: "When it is on ({range})", "light.hours_title": "When it is lit ({range})",
    in_days_avg: "on {n} of {d} days · avg {dur}", in_days: "on {n} of {d} days", never: "never",
    facts: "Fun facts", f_top_hour: "Most often on", "light.f_top_hour": "Most often lit",
    f_usual_on: "Usually turned on", f_usual_off: "Usually turned off", about: "about {t}",
    f_longest: "Longest", date_from: "{date} from {t}", f_avg_one: "Average session",
    f_night: "Turned on at night (0–5)", not_once: "not once", f_dark_days: "Days never on", of: "{n} of {d}",
    f_rank: "Place in the house ({range})", counting: "counting…",
    tl_today: "Today since midnight", tl_yesterday: "Yesterday",
    recent: "Recently turned on", is_on: "on", until: "until {t}", none_on: "Not on in this period.",
    yesterday_at: "yesterday {t}",
    cv_none: "no reading", cv_opening: "Opening… {p}%", cv_closing: "Closing… {p}%", cv_open: "Open",
    cv_closed: "Closed", cv_partly: "{p}% closed", cv_since: " since {t}",
    cv_open_btn: "Open", cv_stop_btn: "Stop", cv_close_btn: "Close", cv_slide_closed: "closed", cv_slide_open: "open",
    cv_sum: "closed", cv_longest: "longest in one go", cv_avg: "closed on average / day",
    cv_bars_h: "Closed by hour", cv_bars_d: "Hours closed per day", cv_bars_w: "Hours closed per week",
    cv_tip_open: "open", cv_hours: "When it is closed ({range})",
    f_usual_down: "Usually closed at", f_usual_up: "Usually opened at", f_longest_closed: "Longest closed",
    f_who: "Who moves it", f_who_days: "Who moves it ({n} days)", f_partial: "Partial positions", f_moves_vs: "Moves {vs}",
    f_rank_moves: "Place in the house (moves, {range})", cv_legend: "— closed",
    recent_moves: "Recent moves", up: "up", down: "down", at_pos: "at {p}%", no_moves: "Did not move in this period.",
    src_automation: "automation", src_script: "script", src_app: "app", src_device: "device",
    moves: { one: "move", other: "moves" },
    chart_temp: "Temperature", chart_hum: "Humidity",
    config_title: "Entity Insights", config_takeover: "Opens instead of the entity dialog for: {list}",
    config_none: "Loaded. Add more_info: [light, cover] to open it instead of the entity dialog.",
  },
  pl: {
    r_today: "Dziś", r_yesterday: "Wczoraj", r_7: "7 dni", r_14: "14 dni", r_30: "30 dni", r_90: "3 mies.",
    vs_today: "vs wczoraj o tej porze", vs_yesterday: "vs przedwczoraj", vs_days: "vs poprzednie {n} dni",
    loading: "Wczytywanie historii…", failed: "Nie udało się wczytać historii.", failed_influx: "Nie udało się wczytać historii z InfluxDB.",
    close: "Zamknij", standard: "Ustawienia encji",
    no_entity: "brak encji", on_since: "włączone od {t}", off_since: "wyłączone od {t}",
    "light.on_since": "świeci od {t}", "light.off_since": "zgaszone od {t}",
    switch: "Wł. / wył.", "light.switch": "Światło", dim_off: "wył.",
    sum_on: "włączone · {n}×", "light.sum_on": "świeciła · {n}×", sum_count: "włączeń", "light.sum_count": "zapaleń",
    avg_day: "średnio / dzień",
    bars_h: "Włączenie w godzinach", bars_d: "Godziny włączenia na dzień", bars_w: "Godziny włączenia na tydzień",
    "light.bars_h": "Świecenie w godzinach", "light.bars_d": "Godziny świecenia na dzień", "light.bars_w": "Godziny świecenia na tydzień",
    tip_off: "wyłączone", "light.tip_off": "nie świeciła",
    hours_title: "O której włączone ({range})", "light.hours_title": "O której świeci ({range})",
    in_days_avg: "w {n} z {d} dni · śr. {dur}", in_days: "w {n} z {d} dni", never: "nigdy",
    facts: "Ciekawostki", f_top_hour: "Najczęściej włączone", "light.f_top_hour": "Najczęściej świeci",
    f_usual_on: "Zwykle włączane", f_usual_off: "Zwykle wyłączane",
    "light.f_usual_on": "Zwykle zapalana", "light.f_usual_off": "Zwykle gaszona", about: "ok. {t}",
    f_longest: "Najdłużej", date_from: "{date} od {t}", f_avg_one: "Średnio jedno włączenie", "light.f_avg_one": "Średnio jedno świecenie",
    f_night: "Włączenia w nocy (0–5)", "light.f_night": "Zapalenia w nocy (0–5)", not_once: "ani razu",
    f_dark_days: "Dni bez włączenia", "light.f_dark_days": "Dni bez świecenia", of: "{n} z {d}",
    f_rank: "Miejsce w domu ({range})", counting: "liczę…",
    tl_today: "Dziś od północy", tl_yesterday: "Wczoraj",
    recent: "Ostatnie włączenia", "light.recent": "Ostatnie zapalenia", is_on: "włączone", "light.is_on": "świeci",
    until: "do {t}", none_on: "Nie było włączone w tym okresie.", "light.none_on": "Nie świeciła w tym okresie.",
    yesterday_at: "wczoraj {t}",
    cv_none: "brak odczytu", cv_opening: "Podnosi się… {p}%", cv_closing: "Opuszcza się… {p}%", cv_open: "Otwarta",
    cv_closed: "Zamknięta", cv_partly: "Zasłonięta w {p}%", cv_since: " od {t}",
    cv_open_btn: "Otwórz", cv_stop_btn: "Stop", cv_close_btn: "Zamknij", cv_slide_closed: "zamknięta", cv_slide_open: "otwarta",
    cv_sum: "zasłonięta", cv_longest: "najdłużej bez przerwy", cv_avg: "średnio zasłonięta / dzień",
    cv_bars_h: "Zasłonięcie w godzinach", cv_bars_d: "Godziny zasłonięcia na dzień", cv_bars_w: "Godziny zasłonięcia na tydzień",
    cv_tip_open: "otwarta", cv_hours: "O której zasłonięta ({range})",
    f_usual_down: "Zwykle opuszczana", f_usual_up: "Zwykle podnoszona", f_longest_closed: "Najdłużej zasłonięta",
    f_who: "Kto rusza", f_who_days: "Kto rusza ({n} dni)", f_partial: "Ustawienia pośrednie", f_moves_vs: "Ruchy {vs}",
    f_rank_moves: "Miejsce w domu (ruchy, {range})", cv_legend: "— zasłonięta",
    recent_moves: "Ostatnie ruchy", up: "w górę", down: "w dół", at_pos: "na {p}%", no_moves: "Nie ruszała się w tym okresie.",
    src_automation: "automatyzacja", src_script: "skrypt", src_app: "aplikacja", src_device: "przycisk",
    moves: { one: "ruch", few: "ruchy", many: "ruchów", other: "ruchu" },
    chart_temp: "Temperatura", chart_hum: "Wilgotność",
    config_title: "Entity Insights", config_takeover: "Otwiera się zamiast okna encji dla: {list}",
    config_none: "Wczytany. Dopisz more_info: [light, cover], żeby zastąpił okno encji.",
  },
};

export function langOf(hass) {
  const l = String((hass && ((hass.locale && hass.locale.language) || hass.language)) || "en").slice(0, 2);
  return STRINGS[l] ? l : "en";
}

export function tr(lang, key, vars, domain) {
  const s = STRINGS[lang] || STRINGS.en;
  let v = (domain && s[domain + "." + key]) || s[key];
  if (v === undefined) v = (domain && STRINGS.en[domain + "." + key]) || STRINGS.en[key] || key;
  if (vars) v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return v;
}

// "1 move", "2 moves"; Polish: 1 ruch, 2-4 ruchy, 5+ ruchów (12-14 too).
export function plural(lang, n, forms) {
  let cat;
  try { cat = new Intl.PluralRules(lang).select(n); } catch (e) { cat = n === 1 ? "one" : "other"; }
  return n + " " + (forms[cat] || forms.other);
}

export function esc(s) {
  return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const ENTITY_ID = /^(?!.+__)(?!_)[\da-z_]+(?<!_)\.(?!_)[\da-z_]+(?<!_)$/;
export function validEntityId(id) {
  return typeof id === "string" && ENTITY_ID.test(id);
}

// ---- Ranges ------------------------------------------------------------
export const RANGES = ["today", "yesterday", "7", "14", "30", "90"];

export function midnight(daysBack, now = Date.now()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysBack);
  return d.getTime();
}

// The range [a, b], its days and the period before it (to compare with):
// yesterday up to this hour for "today", the day before for "yesterday",
// the same number of days before for the rest. Up to recorderDays the data
// comes from the recorder, longer from InfluxDB when there is one.
export function computeRange(k, now, opts = {}) {
  const recorderDays = opts.recorderDays || 10;
  if (!RANGES.includes(k)) k = "14";
  const mid = (n) => midnight(n, now);
  let r;
  // yesterday at the same clock time (23 or 25 hours ago when the clock changed)
  const sameTime = new Date(now);
  sameTime.setDate(sameTime.getDate() - 1);
  if (k === "today") r = { a: mid(0), b: now, days: 1, prev: [mid(1), sameTime.getTime()], vs: "vs_today" };
  else if (k === "yesterday") r = { a: mid(1), b: mid(0), days: 1, prev: [mid(2), mid(1)], vs: "vs_yesterday" };
  else {
    const n = Number(k);
    r = { a: mid(n - 1), b: now, days: n, prev: [mid(2 * n - 1), mid(n - 1)], vs: "vs_days" };
  }
  r.k = k;
  r.day = k === "today" || k === "yesterday";
  const recFrom = mid(recorderDays - 1);
  // the recorder when it keeps the range AND the period before it (for the
  // comparison), else InfluxDB when it is there; without it the recorder,
  // and no comparison for what it has lost
  r.recorder = r.prev[0] >= recFrom || !opts.influx;
  r.fetchFrom = r.recorder ? Math.max(r.prev[0], recFrom) : r.prev[0];
  r.recFrom = recFrom;
  return r;
}

// Ranges offered: all with InfluxDB, else only what the recorder keeps.
export function availableRanges(opts = {}) {
  const days = opts.recorderDays || 10;
  return RANGES.filter((k) => opts.influx || k === "today" || k === "yesterday" || Number(k) <= days);
}

// ---- History arithmetic -------------------------------------------------
// rows: [{t, s, pos}] oldest first; the first row is the state the range
// starts in (it may lie before start).

// Periods with state "on", clipped to [start, end]. A period already on at
// `start` is marked `clipped`: it was not turned on inside the range.
export function onPeriods(rows, start, end) {
  const out = [];
  rows.forEach((r, i) => {
    if (r.s !== "on") return;
    const from = Math.max(r.t, start);
    const to = i + 1 < rows.length ? rows[i + 1].t : end;
    if (to <= from) return;
    const last = out[out.length - 1];
    if (last && last.to === from) last.to = to;
    else out.push(r.t < start ? { from: from, to: to, clipped: true } : { from: from, to: to });
  });
  if (out.length && out[out.length - 1].to >= end - 1000) out[out.length - 1].open = true;
  return out;
}

// Any of several period lists "on" (a chandelier with two circuits).
export function unionPeriods(lists, end) {
  const edges = [];
  for (const list of lists) for (const p of list) edges.push([p.from, 1, !!p.clipped], [p.to, -1, false]);
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out = [];
  let n = 0, since = 0, clipped = false;
  for (const [t, d, c] of edges) {
    if (d > 0 && n++ === 0) { since = t; clipped = c; }
    if (d < 0 && --n === 0 && t > since) {
      const last = out[out.length - 1];
      if (last && last.to === since) last.to = t;
      else out.push(clipped ? { from: since, to: t, clipped: true } : { from: since, to: t });
    }
  }
  if (out.length && out[out.length - 1].to >= end - 1000) out[out.length - 1].open = true;
  return out;
}

// Time inside [a, b] covered by the periods, and how many of them start there.
export function within(periods, a, b, now) {
  let ms = 0, count = 0;
  for (const p of periods) {
    const f = Math.max(p.from, a), t = Math.min(p.open ? now : p.to, b);
    if (t > f) ms += t - f;
    if (!p.clipped && p.from >= a && p.from < b) count++;
  }
  return { ms: ms, count: count };
}

// Hours of the day: on how many days of [a, b] the periods touched each hour.
export function hourDays(periods, a, b, now) {
  const days = Array.from({ length: 24 }, () => new Set());
  const ms = new Array(24).fill(0);
  for (const p of periods) {
    let f = Math.max(p.from, a);
    const t = Math.min(p.open ? now : p.to, b);
    while (f < t) {
      const d = new Date(f);
      const next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1).getTime();
      const e = Math.min(next, t);
      ms[d.getHours()] += e - f;
      if (e - f >= 60000) days[d.getHours()].add(d.toDateString());
      f = e;
    }
  }
  return { days: days.map((s) => s.size), ms: ms };
}

const pad = (x) => String(x).padStart(2, "0");

// Bars for the range: hours for one day, days up to 30 days, weeks for 3 months.
export function rangeBuckets(r, now, lang) {
  const out = [];
  if (r.day) {
    // every hour of the day, the ones still to come empty - 23 or 25 of
    // them on the days the clock changes
    const d0 = new Date(r.a);
    const dayEnd = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1).getTime();
    for (let a = r.a; a < dayEnd; a += 3600e3) {
      const h = new Date(a).getHours();
      out.push({ a: a, b: Math.max(a, Math.min(a + 3600e3, r.b)), axis: h % 6 || out.some((x) => x.h === h) ? "" : String(h), h: h,
                 tip: pad(h) + ":00–" + pad(new Date(a + 3600e3).getHours()) + ":00", now: r.k === "today" && a <= r.b && a + 3600e3 > r.b });
    }
    return { unit: "h", list: out };
  }
  const wd = (d) => d.toLocaleDateString(lang, { weekday: "short" }).replace(".", "");
  const dm = (d) => d.getDate() + "." + (d.getMonth() + 1);
  if (r.days <= 30) {
    for (let k = r.days - 1; k >= 0; k--) {
      const a = midnight(k, now), b = k ? midnight(k - 1, now) : r.b;
      const d = new Date(a);
      const every = r.days > 14 ? 5 : 2;
      out.push({ a: a, b: b, axis: k % every ? "" : dm(d), now: k === 0,
                 tip: k === 0 ? tr(lang, "r_today").toLowerCase() : k === 1 ? tr(lang, "r_yesterday").toLowerCase() : wd(d) + " " + dm(d) });
    }
    return { unit: "d", list: out };
  }
  for (let a = r.a; a < r.b;) {
    const n = new Date(a);
    n.setDate(n.getDate() + 7);  // a calendar week, 167 or 169 hours across a clock change
    const b = Math.min(n.getTime(), r.b);
    const d = new Date(a), e = new Date(b - 1);
    out.push({ a: a, b: b, axis: out.length % 3 ? "" : dm(d), now: b >= r.b, tip: dm(d) + "–" + dm(e) });
    a = b;
  }
  return { unit: "w", list: out };
}

export function median(arr) {
  const a = arr.slice().sort((x, y) => x - y);
  return a.length ? a[Math.floor(a.length / 2)] : null;
}

// Cover position in % open (HA: 100 = open); null when there is no reading.
export function coverPos(state, attrs) {
  if (!state || state === "unavailable" || state === "unknown") return null;
  const p = attrs && attrs.current_position;
  if (typeof p === "number") return p;
  return state === "closed" ? 0 : 100;
}

// Moves = changes into opening / closing (repeated rows while moving, and
// rows written again at HA restarts, are one move).
export function coverMoves(rows, start) {
  const moves = [];
  let last = null;
  for (const r of rows) {
    if (r.s === "unavailable" || r.s === "unknown") continue;
    if ((r.s === "opening" || r.s === "closing") && r.s !== last && r.t >= start) {
      moves.push({ t: r.t, up: r.s === "opening", src: null, pos: null });
    }
    last = r.s;
  }
  for (const m of moves) {
    const end = rows.find((x) => x.t > m.t && (x.s === "open" || x.s === "closed"));
    m.pos = end ? end.pos : null;
  }
  return moves;
}

// Closed = more than 2% shut. rows: positions only (no null pos).
export function coveredPeriods(rows, end) {
  const out = [];
  rows.forEach((x, i) => {
    if (x.pos >= 98) return;
    const to = i + 1 < rows.length ? rows[i + 1].t : end;
    const last = out[out.length - 1];
    if (last && last.to === x.t) last.to = to;
    else if (to > x.t) out.push({ from: x.t, to: to });
  });
  if (out.length && out[out.length - 1].to >= end - 1000) out[out.length - 1].open = true;
  return out;
}

// ---- What to show ------------------------------------------------------
export const ONOFF_DOMAINS = ["light", "switch", "fan", "input_boolean", "binary_sensor", "siren", "humidifier"];
const TOGGLE_DOMAINS = ["light", "switch", "fan", "input_boolean", "siren", "humidifier"];

export function kindOf(stateObj) {
  if (!stateObj) return null;
  const domain = stateObj.entity_id.split(".")[0];
  if (domain === "cover") return "cover";
  if (ONOFF_DOMAINS.includes(domain)) return "onoff";
  if (domain === "sensor" && (stateObj.attributes.state_class || stateObj.attributes.unit_of_measurement) &&
      !isNaN(parseFloat(stateObj.state))) return "chart";
  return null;
}

// The payload of a fire-dom-event action, or the argument of open():
// "light.x" | ["light.a", "light.b"] | {entity | entities, name, labels, ...}
export function parseRequest(x) {
  if (!x) return null;
  if (typeof x === "string" || Array.isArray(x)) x = { entities: [].concat(x) };
  if (typeof x !== "object") return null;
  const ids = [].concat(x.entities || x.entity || []).map((e) => (typeof e === "object" && e ? e.entity : e));
  if (!ids.length || !ids.every(validEntityId)) return null;
  return {
    ids: ids,
    name: typeof x.name === "string" ? x.name : null,
    labels: Array.isArray(x.labels) ? x.labels.map(String) : null,
    kind: ["onoff", "cover", "chart"].includes(x.kind) ? x.kind : null,
    rank: x.rank === undefined ? null : x.rank,
    chart: x.chart && typeof x.chart === "object" ? x.chart : null,
    // the entities to rank against ("place in the house"); default: the domain
    rankWith: Array.isArray(x.rank_with) && x.rank_with.every(validEntityId) ? x.rank_with.slice() : null,
  };
}

// ---- The dialog ----------------------------------------------------------
const STYLE = `
  :host { all: initial; }
  #dialog { position: fixed; inset: 0; z-index: 1000; display: none;
            align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
            background: rgba(8, 12, 18, 0.62); line-height: normal;
            font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
            --ei-muted: var(--secondary-text-color, #7c8ca3);
            --ei-soft: rgba(127, 127, 127, 0.12);
            --ei-line: rgba(127, 127, 127, 0.14); }
  #dialog.open { display: flex; }
  #panel { width: 100%; max-width: 760px; height: 100%; max-height: 100%; overflow: auto; box-sizing: border-box;
           background: var(--card-background-color, var(--ha-card-background, #1b2433));
           color: var(--primary-text-color, #c3cfdf);
           border: 1px solid var(--divider-color, #2a3547); border-radius: 12px;
           box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5); }
  #panel.auto { height: auto; }
  #head { display: flex; align-items: center; gap: 8px; padding: 12px 10px 0 16px; }
  #title { flex: 1 1 auto; margin: 0; font-size: 17px; font-weight: 500; }
  #close { width: 34px; height: 34px; border-radius: 8px; border: none; background: transparent; cursor: pointer;
           color: var(--ei-muted); font-size: 22px; line-height: 1; }
  #close:hover { color: inherit; background: var(--ei-soft); }
  #foot { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 14px; }
  #foot:empty { display: none; }
  #foot button { border: 1px solid var(--divider-color, #2a3547); border-radius: 6px; background: transparent;
                 color: var(--ei-muted); font: inherit; font-size: 12px; padding: 5px 10px; cursor: pointer; }
  #foot button:hover { border-color: var(--primary-color, #03a9f4); color: inherit; }
  #body long-term-chart-card { --ha-card-background: transparent; --ha-card-box-shadow: none; --ha-card-border-width: 0; }
  .box { position: relative; padding: 12px 16px 4px; --ei-accent: var(--primary-color, #03a9f4);
         --ei-accent-soft: color-mix(in srgb, var(--ei-accent) 75%, transparent); }
  .box.light { --ei-accent: #ffc300; }
  .box.cv { --ei-accent: #8ea1ba; }
  .muted { font-size: 13px; color: var(--ei-muted); }
  .sec { font-size: 13px; color: var(--ei-muted); margin-top: 12px; }
  .row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
  .row .name { flex: 1; font-size: 15px; }
  .since { font-size: 12px; color: var(--ei-muted); }
  .switch { position: relative; width: 46px; height: 26px; flex: none; border: none; border-radius: 13px;
            cursor: pointer; padding: 0; background: rgba(127, 127, 127, 0.3); transition: background 0.2s; }
  .switch::after { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
                   background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); transition: transform 0.2s, background 0.2s; }
  .switch.on { background: color-mix(in srgb, var(--ei-accent) 45%, transparent); }
  .switch.on::after { transform: translateX(20px); background: var(--ei-accent); }
  /* as wide as the label, sharing what is left; a too long label is cut, never overlaps */
  .chips { display: flex; gap: 3px; margin: 10px 0 4px; }
  .chips button { flex: 1 1 auto; min-width: 0; border: none; border-radius: 14px; padding: 6px 4px; cursor: pointer;
                  font: inherit; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                  background: var(--ei-soft); color: inherit; }
  .chips button.sel { background: var(--primary-color, #03a9f4); color: var(--text-primary-color, #fff); }
  .stats { transition: opacity 0.15s; }
  .stats.loading { opacity: 0.4; pointer-events: none; }
  .sums { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 8px 0 4px; }
  .sums div { background: var(--ei-soft); border-radius: 8px; padding: 8px 10px; }
  .sums b { display: block; font-size: 17px; font-weight: 500; font-variant-numeric: tabular-nums; }
  .sums span { font-size: 11px; color: var(--ei-muted); }
  .bars { display: flex; align-items: flex-end; gap: 3px; height: 70px; margin-top: 10px; }
  .bars i { flex: 1; min-height: 1px; border-radius: 2px 2px 0 0; background: var(--ei-accent-soft); cursor: pointer; }
  .bars i.now { background: var(--ei-accent); }
  .hours { display: flex; align-items: flex-end; gap: 2px; height: 50px; margin-top: 8px; }
  .hours i { flex: 1; min-height: 1px; border-radius: 2px 2px 0 0; background: rgba(95, 214, 232, 0.75); cursor: pointer; }
  .bars i.sel, .hours i.sel { outline: 2px solid var(--primary-text-color, #fff); outline-offset: -1px; }
  .axis { display: flex; gap: 3px; font-size: 9px; text-align: center; color: var(--ei-muted); font-variant-numeric: tabular-nums; }
  /* a label may be wider than its bar (30 bars on a phone): centred, spilling over the empty neighbours */
  .axis span { flex: 1; min-width: 0; display: flex; justify-content: center; white-space: nowrap; }
  .axis.tl { justify-content: space-between; }
  .axis.tl span { flex: none; }
  .tip { position: absolute; z-index: 5; transform: translate(-50%, calc(-100% - 6px)); background: #0d1219; color: #fff;
         font-size: 12px; padding: 4px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none;
         box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4); font-variant-numeric: tabular-nums; }
  .facts { margin-top: 6px; }
  .facts div, .ev { display: flex; gap: 10px; padding: 4px 0; font-size: 13px; border-bottom: 1px solid var(--ei-line); }
  .facts div span:first-child { flex: none; }
  .facts div span:last-child { margin-left: auto; font-variant-numeric: tabular-nums; text-align: right; }
  .ev { font-variant-numeric: tabular-nums; }
  .ev .w { color: var(--ei-muted); min-width: 74px; }
  .ev .d { margin-left: auto; color: var(--ei-muted); text-align: right; }
  .timeline { position: relative; height: 14px; margin: 8px 0 2px; border-radius: 4px; overflow: hidden; background: var(--ei-soft); }
  .timeline span { position: absolute; top: 0; bottom: 0; background: var(--ei-accent); }
  .cv-ctl { display: flex; align-items: center; gap: 12px; padding: 4px 0 8px; }
  .cv-state { flex: 1; font-size: 15px; }
  .cv-btns { display: flex; gap: 8px; }
  .cv-btns button { width: 44px; height: 40px; border: none; border-radius: 10px; cursor: pointer; font-size: 16px;
                    background: var(--ei-soft); color: inherit; }
  .cv-btns button.act { background: color-mix(in srgb, var(--ei-accent) 45%, transparent); }
  .cv-slide { display: flex; align-items: center; gap: 10px; font-size: 11px; color: var(--ei-muted); }
  .cv-slide input { flex: 1; height: 28px; margin: 0; -webkit-appearance: none; appearance: none; background: transparent; }
  .cv-slide input::-webkit-slider-runnable-track { height: 8px; border-radius: 4px;
    background: linear-gradient(to right, var(--ei-accent) var(--p, 0%), var(--ei-soft) var(--p, 0%)); }
  .cv-slide input::-moz-range-track { height: 8px; border-radius: 4px;
    background: linear-gradient(to right, var(--ei-accent) var(--p, 0%), var(--ei-soft) var(--p, 0%)); }
  .cv-slide input::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; margin-top: -8px;
    border-radius: 50%; background: #fff; border: none; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); }
  .cv-slide input::-moz-range-thumb { width: 24px; height: 24px; border-radius: 50%; background: #fff; border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); }
  .cv-legend { font-size: 11px; }
  .dim { padding: 0 0 6px; }
  .dim .pct { min-width: 38px; text-align: right; font-variant-numeric: tabular-nums; }
`;

const LOGBOOK_SOURCES = (lang) => ({
  automation: tr(lang, "src_automation"), script: tr(lang, "src_script"),
  app: tr(lang, "src_app"), device: tr(lang, "src_device"),
});

export class EntityInsightsDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = "<style>" + STYLE + "</style>" +
      '<div id="dialog" role="dialog" aria-modal="true" aria-labelledby="title"><div id="panel">' +
      '<div id="head"><h2 id="title"></h2><button id="close">&times;</button></div>' +
      '<div id="body"></div><div id="foot"></div></div></div>';
    this._dialog = this.shadowRoot.getElementById("dialog");
    this._body = this.shadowRoot.getElementById("body");
    // Only a press that STARTED on the backdrop closes: a dialog opened by
    // a tap gets the browser's own click a few ms later at the same spot.
    this._dialog.addEventListener("pointerdown", (e) => { this._backdropDown = e.target === this._dialog; });
    this._dialog.addEventListener("click", (e) => {
      const ok = this._backdropDown;
      this._backdropDown = false;
      if (e.target === this._dialog && ok) this.close();
    });
    this.shadowRoot.getElementById("close").addEventListener("click", () => this.close());
    this._onKey = (e) => { if (e.key === "Escape") this.close(); };
    this._rangeKey = null;
  }

  // ---- Lifecycle --------------------------------------------------------
  set hass(hass) {
    if (!hass) return;
    this._hass = hass;
    if (this._view && this.isOpen) this._view();
  }

  get hass() { return this._hass; }

  get isOpen() { return this._dialog.classList.contains("open"); }

  get lang() { return langOf(this._hass); }

  t(key, vars, domain) { return tr(this.lang, key, vars, domain); }

  // opts: { recorderDays }
  open(request, hass) {
    if (hass) this._hass = hass;
    const req = parseRequest(request);
    if (!req || !this._hass) return false;
    const st = this._hass.states[req.ids[0]];
    const kind = req.kind || kindOf(st);
    if (!kind) return false;
    this._reset();
    this._cur = Object.assign(req, { kind: kind, domain: req.ids[0].split(".")[0] });
    this._title(req.name || (st && st.attributes.friendly_name) || req.ids[0]);
    this._footStandard(req.ids[0]);
    if (kind === "chart") return this._openChart();
    this._panel(true);
    this._view = kind === "cover" ? () => this._renderCover() : () => this._renderOnOff();
    this._fetch = kind === "cover" ? () => this._fetchCover() : () => this._fetchOnOff();
    this._show();
    this._view();
    this._fetch();
    this._schedule();
    return true;
  }

  // Refresh the history as often as the range can change: today every
  // minute, longer ranges every 5 minutes, yesterday never - a 3-month range
  // from InfluxDB is not fetched again every minute.
  _schedule() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    const k = this._range().k;
    if (k === "yesterday") return;
    this._timer = setInterval(() => this._fetch && this._fetch(), k === "today" ? 60000 : 300000);
  }

  // A dialog with content from another card: render(body) draws it now and
  // on every hass update - it decides itself whether anything changed.
  openCustom(title, render, opts = {}) {
    this._reset();
    this._cur = { kind: "custom" };
    this._title(title);
    this._panel(opts.tall !== false);
    if (opts.css) {
      const s = document.createElement("style");
      s.textContent = opts.css;
      this._customStyle = s;
      this.shadowRoot.appendChild(s);
    }
    this._view = () => render(this._body, this._hass);
    this._show();
    this._view();
    return this._body;
  }

  close() {
    if (!this.isOpen) return;
    this._dialog.classList.remove("open");
    window.removeEventListener("keydown", this._onKey);
    this._reset();
    this.dispatchEvent(new CustomEvent("closed"));
  }

  _reset() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    if (this._unsub) { this._unsub.then((u) => u && u()).catch(() => {}); this._unsub = null; }
    if (this._customStyle) { this._customStyle.remove(); this._customStyle = null; }
    this._cur = null;
    this._hist = null;
    this._view = null;
    this._fetch = null;
    this._viewKey = null;
    this._drag = false;
    this._body.replaceChildren();
    this.shadowRoot.getElementById("foot").replaceChildren();
  }

  _title(text) { this.shadowRoot.getElementById("title").textContent = text; }

  _panel(tall) { this.shadowRoot.getElementById("panel").classList.toggle("auto", !tall); }

  _show() {
    this.shadowRoot.getElementById("close").title = this.t("close");
    this._dialog.classList.add("open");
    window.addEventListener("keydown", this._onKey);
    this._follow();
  }

  // Without a card feeding hass, follow the state changes of our entities
  // (subscribe_entities: filtered by Home Assistant, only these entities come
  // over the wire) and take the fresh hass from the page.
  _follow() {
    const conn = this._hass && this._hass.connection;
    const cur = this._cur;
    if (!conn || !cur || !cur.ids) return;
    let first = true;
    this._unsub = conn.subscribeMessage(() => {
      if (first) { first = false; return; }  // the first message is the current state, already shown
      if (this._cur !== cur) return;
      setTimeout(() => {
        const ha = document.querySelector("home-assistant");
        if (ha && ha.hass) this._hass = ha.hass;
        if (this._cur === cur && this._view) this._view();
      }, 120);
    }, { type: "subscribe_entities", entity_ids: cur.ids }).catch(() => null);
  }

  _footStandard(id) {
    const foot = this.shadowRoot.getElementById("foot");
    const b = document.createElement("button");
    b.textContent = this.t("standard");
    b.addEventListener("click", () => {
      this.close();
      openStandardMoreInfo(id);
    });
    foot.appendChild(b);
  }

  // ---- Shared pieces ----------------------------------------------------
  _opts() {
    const comps = (this._hass.config && this._hass.config.components) || [];
    return { recorderDays: settings.recorderDays, influx: comps.includes("influx_proxy") };
  }

  _range() {
    const opts = this._opts();
    const avail = availableRanges(opts);
    let k = this._rangeKey;
    if (!k) { try { k = localStorage.getItem("entity-insights-range"); } catch (e) { k = null; } }
    if (!avail.includes(k)) k = avail.includes("14") ? "14" : avail[avail.length - 1];
    this._rangeKey = k;
    const r = computeRange(k, Date.now(), opts);
    r.avail = avail;
    r.label = this.t("r_" + k);
    r.vsText = this.t(r.vs, { n: r.days });
    return r;
  }

  _chipsHtml(r) {
    // a short button label where the language has one, else the range name
    const short = STRINGS[this.lang] || {};
    return '<div class="chips">' + r.avail.map((k) =>
      '<button data-r="' + k + '"' + (k === r.k ? ' class="sel"' : "") + ' title="' + esc(this.t("r_" + k)) + '">' +
      esc(short["c_" + k] || this.t("r_" + k)) + "</button>").join("") + "</div>";
  }

  _wireChips(box) {
    for (const b of box.querySelectorAll(".chips button")) {
      b.addEventListener("click", () => {
        if (b.dataset.r === this._rangeKey) return;
        this._rangeKey = b.dataset.r;
        try { localStorage.setItem("entity-insights-range", b.dataset.r); } catch (e) { /* private mode */ }
        this._hist = null;
        this._viewKey = null;
        this._view();
        this._fetch();
        if (this._fetch) this._schedule();
      });
    }
  }

  _statsBody(hist, stats) {
    if (!hist) return '<div class="stats empty"><div class="muted">' + esc(this.t("loading")) + "</div></div>";
    if (hist.error) return '<div class="stats"><div class="muted">' + esc(this.t(hist.influx ? "failed_influx" : "failed")) + "</div></div>";
    return '<div class="stats">' + stats() + "</div>";
  }

  // Another range is loading: keep the old stats on screen, dimmed, with the
  // new chip selected - no jumping. False when there is nothing to keep.
  _keepStats(r) {
    const st = this._body.querySelector(".stats:not(.empty)");
    if (!st) return false;
    st.classList.add("loading");
    for (const b of this._body.querySelectorAll(".chips button")) b.classList.toggle("sel", b.dataset.r === r.k);
    return true;
  }

  // State rows from `start` to now: {rows: {id: [{t, s, pos}]}, from} -
  // `from` = since when the data really covers.
  async _stateRows(ids, start, withPos, r) {
    const out = {};
    let from = start;
    if (start >= r.recFrom || !this._opts().influx) {
      const result = await this._hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(start).toISOString(), end_time: new Date().toISOString(),
        entity_ids: ids, minimal_response: !withPos, no_attributes: !withPos, significant_changes_only: false,
      });
      for (const id of ids) {
        out[id] = (result[id] || []).map((x) => {
          const s = x.s !== undefined ? x.s : x.state;
          return { t: x.lu !== undefined ? x.lu * 1000 : new Date(x.last_updated || x.last_changed).getTime(),
                   s: s, pos: withPos ? coverPos(s, x.a || x.attributes) : null };
        });
        const first = out[id][0];
        // a row at or before `start` (the state the range starts in) leaves `from` at
        // `start`; a later first row means the data only begins there
        from = Math.max(from, first ? first.t : Date.now());
      }
      // the recorder keeps only so much: what it has not got, we have not got
      if (start < r.recFrom) from = Math.max(from, r.recFrom);
    } else {
      const days = ((Date.now() - start) / 86400e3 + 0.05).toFixed(2);
      // the proxy takes up to 40 entities at a time
      for (let i = 0; i < ids.length; i += 40) {
        const part = ids.slice(i, i + 40);
        const res = await this._hass.callApi("GET", "influx_proxy/states?entities=" + part.join(",") + "&days=" + days +
          (withPos ? "&attributes=current_position" : ""));
        for (const id of part) {
          out[id] = (res[id] || []).map(([t, s, p]) => ({ t: t, s: s, pos: withPos ? coverPos(s, { current_position: p }) : null }));
          const first = out[id][0];
          from = Math.max(from, first ? first.t : Date.now());
        }
      }
    }
    return { rows: out, from: from };
  }

  _fmt() {
    const lang = this.lang;
    const now = Date.now();
    const hhmm = (t) => { const d = new Date(t); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
    return {
      hhmm: hhmm,
      dur: (ms) => {
        const min = Math.round(ms / 60000);
        if (min < 60) return min + " min";
        const h = Math.floor(min / 60);
        return h + " h" + (min % 60 ? " " + (min % 60) + " min" : "");
      },
      // short, so the sums fit one line on a phone
      hours: (ms) => (ms < 3600e3 ? Math.round(ms / 60000) + " min"
        : (ms / 3600e3).toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " h"),
      clockOf: (m) => pad(Math.floor(m / 60) % 24) + ":" + pad(Math.round(m % 60) % 60),
      minuteOfDay: (t) => { const d = new Date(t); return d.getHours() * 60 + d.getMinutes(); },
      date: (t) => { const d = new Date(t); return d.getDate() + "." + (d.getMonth() + 1); },
      when: (t) => {
        if (t >= midnight(0, now)) return hhmm(t);
        if (t >= midnight(1, now)) return tr(lang, "yesterday_at", { t: hhmm(t) });
        const d = new Date(t);
        return d.getDate() + "." + pad(d.getMonth() + 1) + " " + hhmm(t);
      },
      change: (cur, prev) => {
        if (!prev) return "—";
        const ch = Math.round((cur / prev - 1) * 100);
        return (ch > 0 ? "+" : "") + ch + "%";
      },
    };
  }

  _timelineDay(r) {
    const t0 = r.k === "yesterday" ? r.a : midnight(0);
    return { t0: t0, end: Math.min(t0 + 86400e3, Date.now()), title: this.t(r.k === "yesterday" ? "tl_yesterday" : "tl_today") };
  }

  _timelineHtml(tl, spans) {
    return '<div class="sec">' + tl.title + '</div><div class="timeline">' + spans + "</div>" +
      '<div class="axis tl"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>';
  }

  _seg(tl, s, t) {
    return "left:" + ((s - tl.t0) / 864e5 * 100).toFixed(3) + "%;width:" + Math.max((t - s) / 864e5 * 100, 0.3).toFixed(3) + "%";
  }

  _barsHtml(title, buckets, values, max, tips) {
    return '<div class="sec">' + esc(title) + '</div><div class="bars">' + buckets.list.map((bk, i) =>
      '<i class="' + (bk.now ? "now" : "") + '" style="height:' + (values[i] / max * 100).toFixed(1) +
      '%" data-tip="' + esc(bk.tip + " · " + tips[i]) + '"></i>').join("") + "</div>" +
      '<div class="axis">' + buckets.list.map((bk) => "<span>" + bk.axis + "</span>").join("") + "</div>";
  }

  _hoursHtml(title, hd, tip) {
    const max = Math.max(1, ...hd.days);
    return '<div class="sec">' + esc(title) + '</div><div class="hours">' + hd.days.map((n, h) =>
      '<i style="height:' + (n / max * 100).toFixed(1) + '%" data-tip="' + esc(pad(h) + ":00–" + pad((h + 1) % 24) + ":00 · " + tip(n, h)) + '"></i>').join("") +
      '</div><div class="axis">' + hd.days.map((n, h) => "<span>" + (h % 6 ? "" : h) + "</span>").join("") + "</div>";
  }

  _factsHtml(facts) {
    return '<div class="sec">' + esc(this.t("facts")) + '</div><div class="facts">' +
      facts.map(([a, b]) => "<div><span>" + esc(a) + "</span><span>" + b + "</span></div>").join("") + "</div>";
  }

  // Tooltips: a tap (phone) or the pointer (desktop) on a bar.
  _wireTips(box) {
    if (!box) return;
    const tip = document.createElement("div");
    tip.className = "tip";
    tip.style.display = "none";
    box.appendChild(tip);
    const show = (bar) => {
      for (const x of box.querySelectorAll("i.sel")) x.classList.remove("sel");
      if (!bar) { tip.style.display = "none"; return; }
      bar.classList.add("sel");
      const r = bar.getBoundingClientRect(), b = box.getBoundingClientRect();
      tip.textContent = bar.dataset.tip;
      tip.style.display = "block";
      tip.style.left = Math.min(Math.max(r.left + r.width / 2 - b.left, 70), b.width - 70) + "px";
      tip.style.top = (r.top - b.top) + "px";
    };
    const at = (e) => e.target.closest && e.target.closest("i[data-tip]");
    box.addEventListener("pointerdown", (e) => show(at(e)));
    box.addEventListener("pointerover", (e) => { if (e.pointerType === "mouse") show(at(e)); });
    box.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") show(null); });
  }

  // "Place in the house": the entity against the others of its domain
  // (lights and covers by default). One query per range, kept 10 minutes.
  _rankFor(value, r, compute) {
    const cur = this._cur;
    const want = cur.rank === null ? ["light", "cover"].includes(cur.domain) : !!cur.rank;
    if (!want) return undefined;
    const key = rankKey(cur, r);
    const c = rankCache.get(key);
    if (!c || Date.now() - c.at > 600000) {
      if (!rankBusy.has(key)) this._fetchRank(key, r, compute);
      if (!c) return null;
    }
    const others = Object.entries(c.values).filter(([id]) => !cur.ids.includes(id)).map(([, v]) => v);
    return this.t("of", { n: 1 + others.filter((v) => v > value).length, d: others.length + 1 });
  }

  async _fetchRank(key, r, compute) {
    const cur = this._cur;
    rankBusy.add(key);
    try {
      const ids = cur.rankWith ? cur.rankWith.filter((id) => this._hass.states[id]) : rankEntities(this._hass, cur.domain);
      const { rows } = await this._stateRows(ids, r.a, false, r);
      const values = {};
      for (const id of ids) values[id] = compute(rows[id] || [], r);
      rankCache.set(key, { at: Date.now(), values: values });
    } catch (err) {
      console.warn("ENTITY-INSIGHTS: ranking failed", err);
    } finally {
      rankBusy.delete(key);
    }
    if (this._cur === cur) { this._viewKey = null; this._view(); }
  }

  // ---- On / off (light, switch, fan, ...) -------------------------------
  async _fetchOnOff() {
    const cur = this._cur;
    const r = this._range();
    const end = Date.now();
    try {
      const { rows, from } = await this._stateRows(cur.ids, r.fetchFrom, false, r);
      if (this._cur !== cur || this._rangeKey !== r.k) return;
      const periods = {};
      for (const id of cur.ids) periods[id] = onPeriods(rows[id] || [], r.fetchFrom, end);
      this._hist = { k: r.k, from: from, end: end, periods: periods,
                     any: cur.ids.length > 1 ? unionPeriods(Object.values(periods), end) : periods[cur.ids[0]] };
    } catch (err) {
      console.warn("ENTITY-INSIGHTS: history failed", err);
      if (this._cur !== cur || this._rangeKey !== r.k) return;
      this._hist = { k: r.k, error: true, influx: !r.recorder };
    }
    this._viewKey = null;
    this._view();
  }

  _renderOnOff() {
    const cur = this._cur;
    const r = this._range();
    let hist = this._hist;
    if (hist && hist.k !== r.k) hist = null;
    const st = cur.ids.map((id) => this._hass.states[id]);
    const rank = rankCache.get(rankKey(cur, r));
    const key = st.map((s) => (s ? s.state + s.last_changed : "-")).join("|") + "#" + Math.floor(Date.now() / 60000) + "#" + r.k +
      "#" + (hist ? hist.end || "err" : "none") + "#" + (rank ? rank.at : 0) + "#" + this.lang;
    if (key === this._viewKey) { this._dimUpdate(); return; }
    if (!hist && this._keepStats(r)) {
      for (const b of this._body.querySelectorAll(".switch")) b.classList.toggle("on", isOn(this._hass, b.dataset.id));
      this._dimUpdate();
      return;
    }
    this._viewKey = key;
    const f = this._fmt();
    const d = cur.domain;
    const labels = cur.labels || (cur.ids.length > 1
      ? cur.ids.map((id) => { const s = this._hass.states[id]; return (s && s.attributes.friendly_name) || id; })
      : [this.t("switch", null, d)]);
    let html = '<div class="box ' + esc(d) + '">';
    cur.ids.forEach((id, i) => {
      const s = this._hass.states[id];
      const on = !!s && s.state === "on";
      const since = s ? this.t(on ? "on_since" : "off_since", { t: f.hhmm(new Date(s.last_changed)) }, d) : this.t("no_entity");
      html += '<div class="row"><span class="name">' + esc(labels[i] || id) + ' <span class="since">' + esc(since) + "</span></span>" +
        (TOGGLE_DOMAINS.includes(id.split(".")[0]) && s ? '<button class="switch' + (on ? " on" : "") + '" data-id="' + esc(id) + '"></button>' : "") +
        "</div>" +
        // brightness: updated in place (_dimUpdate), not redrawn while held
        (dimmable(s) ? '<div class="cv-slide dim"><input type="range" min="1" max="100" step="1" data-id="' + esc(id) +
          '"><span class="pct"></span></div>' : "");
    });
    html += this._chipsHtml(r) + this._statsBody(hist, () => this._onOffStatsHtml(hist, r, labels)) + "</div>";
    this._body.innerHTML = html;
    const box = this._body.querySelector(".box");
    this._wireTips(box);
    this._wireChips(box);
    for (const b of box.querySelectorAll(".switch")) {
      b.addEventListener("click", () => {
        const on = b.classList.contains("on");
        b.classList.toggle("on", !on);  // at once; the state confirms it
        this._hass.callService("homeassistant", on ? "turn_off" : "turn_on", { entity_id: b.dataset.id });
      });
    }
    for (const sl of box.querySelectorAll(".dim input")) {
      const pct = sl.parentElement.querySelector(".pct");
      sl.addEventListener("pointerdown", () => { this._drag = true; });
      sl.addEventListener("input", () => {
        sl.style.setProperty("--p", sl.value + "%");
        pct.textContent = sl.value + "%";
      });
      sl.addEventListener("change", () => {
        this._drag = false;
        // keep the new value on screen until HA confirms it (other state
        // changes in the house come sooner and would snap it back)
        this._dimPending = { id: sl.dataset.id, v: Number(sl.value), until: Date.now() + 4000 };
        this._hass.callService("light", "turn_on", { entity_id: sl.dataset.id, brightness_pct: Number(sl.value) });
      });
      for (const ev of ["pointerup", "pointercancel"]) sl.addEventListener(ev, () => setTimeout(() => { this._drag = false; }, 0));
    }
    this._dimUpdate();
  }

  // Brightness sliders follow the state, except the one under a finger.
  _dimUpdate() {
    if (this._drag) return;
    for (const sl of this._body.querySelectorAll(".dim input")) {
      const st = this._hass.states[sl.dataset.id];
      const on = !!st && st.state === "on";
      const v = on && typeof st.attributes.brightness === "number" ? Math.max(1, Math.round(st.attributes.brightness / 2.55)) : 0;
      const p = this._dimPending;
      if (p && p.id === sl.dataset.id && Date.now() < p.until && Math.abs(p.v - v) > 1) continue;
      sl.value = Math.max(1, v);
      sl.style.setProperty("--p", v + "%");
      sl.parentElement.querySelector(".pct").textContent = on ? v + "%" : this.t("dim_off");
    }
  }

  _onOffStatsHtml(hist, r, labels) {
    const cur = this._cur;
    const d = cur.domain;
    const t = (k, v) => this.t(k, v, d);
    const f = this._fmt();
    const now = Date.now();
    const any = hist.any;
    const tot = within(any, r.a, r.b, now);
    const prev = hist.from <= r.prev[0] + 60000 ? within(any, r.prev[0], r.prev[1], now) : null;
    let html = '<div class="sums">' +
      "<div><b>" + f.hours(tot.ms) + "</b><span>" + esc(t("sum_on", { n: tot.count })) + "</span></div>" +
      (r.day ? "<div><b>" + tot.count + "×</b><span>" + esc(t("sum_count")) + "</span></div>"
             : "<div><b>" + f.hours(tot.ms / r.days) + "</b><span>" + esc(t("avg_day")) + "</span></div>") +
      "<div><b>" + (prev ? f.change(tot.ms, prev.ms) : "—") + "</b><span>" + esc(r.vsText) + "</span></div></div>";

    const bk = rangeBuckets(r, now, this.lang);
    const vals = bk.list.map((b) => within(any, b.a, b.b, now));
    const max = Math.max(bk.unit === "h" ? 600e3 : 3600e3, ...vals.map((v) => v.ms));
    html += this._barsHtml(t("bars_" + bk.unit), bk, vals.map((v) => v.ms), max,
      vals.map((v) => (v.ms ? f.dur(v.ms) + " · " + v.count + "×" : t("tip_off"))));

    const hd = hourDays(any, r.a, r.b, now);
    if (!r.day) {
      html += this._hoursHtml(t("hours_title", { range: r.label }), hd, (n, h) =>
        n ? t("in_days_avg", { n: n, d: r.days, dur: f.dur(hd.ms[h] / n) }) : t("never"));
    }

    // turned on inside the range (not the one already on when it began)
    const inRange = any.filter((p) => !p.clipped && p.from >= r.a && p.from < r.b);
    const len = (p) => (p.open ? now : p.to) - p.from;
    const facts = [];
    if (!r.day) {
      const top = hd.days.map((n, h) => [n, h]).sort((a, b) => b[0] - a[0])[0];
      if (top && top[0]) facts.push([t("f_top_hour"), pad(top[1]) + ":00–" + pad((top[1] + 1) % 24) + ":00"]);
    }
    const closed = inRange.filter((p) => !p.open);
    if (inRange.length >= 3) {
      facts.push([t("f_usual_on"), t("about", { t: f.clockOf(median(inRange.map((p) => f.minuteOfDay(p.from)))) })]);
      if (closed.length >= 3) facts.push([t("f_usual_off"), t("about", { t: f.clockOf(median(closed.map((p) => f.minuteOfDay(p.to)))) })]);
    }
    if (inRange.length) {
      const longest = inRange.reduce((a, b) => (len(b) > len(a) ? b : a));
      facts.push([t("f_longest"), f.dur(len(longest)) + " · " + t("date_from", { date: f.date(longest.from), t: f.hhmm(longest.from) })]);
      facts.push([t("f_avg_one"), f.dur(inRange.reduce((a, p) => a + len(p), 0) / inRange.length)]);
    }
    const night = inRange.filter((p) => new Date(p.from).getHours() < 5).length;
    facts.push([t("f_night"), night ? night + "×" : t("not_once")]);
    if (!r.day) {
      let dark = 0;
      for (let k = 0; k < r.days; k++) {
        if (!within(any, midnight(k), k ? midnight(k - 1) : now, now).ms) dark++;
      }
      facts.push([t("f_dark_days"), t("of", { n: dark, d: r.days })]);
    }
    const rank = this._rankFor(tot.ms, r, (rows, rr) =>
      within(onPeriods(rows, rr.a, Date.now()), rr.a, rr.b, Date.now()).ms);
    if (rank !== undefined) facts.push([t("f_rank", { range: r.label.toLowerCase() }), rank || t("counting")]);
    html += this._factsHtml(facts);

    const tl = this._timelineDay(r);
    let spans = "";
    for (const p of any) {
      const s = Math.max(p.from, tl.t0), e = Math.min(p.open ? now : p.to, tl.end);
      if (e > s) spans += '<span style="' + this._seg(tl, s, e) + '"></span>';
    }
    html += this._timelineHtml(tl, spans);

    // which circuits, when there are several
    const which = (p) => {
      if (cur.ids.length < 2) return "";
      const on = cur.ids.map((id, i) => (hist.periods[id] || []).some((q) =>
        q.from < (p.open ? now : p.to) && (q.open ? now : q.to) > p.from) ? labels[i] : null).filter(Boolean);
      return " · " + on.join(" + ");
    };
    const recent = inRange.slice(-15).reverse();
    html += '<div class="sec">' + esc(t("recent")) + "</div>" + (recent.length ? recent.map((p) =>
      '<div class="ev"><span class="w">' + f.when(p.from) + "</span><span>" +
      esc((p.open ? t("is_on") : t("until", { t: f.hhmm(p.to) })) + which(p)) + '</span><span class="d">' + f.dur(len(p)) + "</span></div>").join("")
      : '<div class="muted">' + esc(t("none_on")) + "</div>");
    return html;
  }

  // ---- Cover ------------------------------------------------------------
  _source(e) {
    const lang = this.lang;
    const src = LOGBOOK_SOURCES(lang);
    if (e.context_event_type === "automation_triggered") return e.context_name || src.automation;
    if (e.context_domain === "script") return e.context_name || src.script;
    let who = null;
    if (e.context_user_id) {
      for (const s of Object.values(this._hass.states)) {
        if (s.entity_id.startsWith("person.") && s.attributes.user_id === e.context_user_id) {
          who = s.attributes.friendly_name;
          break;
        }
      }
    }
    if (e.context_event_type === "google_assistant_command") return "Google" + (who ? " (" + who + ")" : "");
    if (e.context_event_type === "alexa_smart_home") return "Alexa" + (who ? " (" + who + ")" : "");
    if (e.context_user_id) return who || src.app;
    // no context: the move came from the device itself (a wall button)
    return src.device;
  }

  async _fetchCover() {
    const cur = this._cur;
    const id = cur.ids[0];
    const r = this._range();
    const end = Date.now();
    const logFrom = Math.max(r.fetchFrom, r.recFrom);
    try {
      const [states, log] = await Promise.all([
        this._stateRows([id], r.fetchFrom, true, r),
        this._hass.callWS({ type: "logbook/get_events", entity_ids: [id],
                            start_time: new Date(logFrom).toISOString(), end_time: new Date(end).toISOString() })
          .catch((err) => { console.warn("ENTITY-INSIGHTS: logbook failed", err); return []; }),
      ]);
      if (this._cur !== cur || this._rangeKey !== r.k) return;
      // positions (unavailable rows - restarts - keep the last reading)
      const rows = (states.rows[id] || []).filter((x) => x.pos !== null)
        .map((x) => ({ t: Math.max(x.t, r.fetchFrom), s: x.s, pos: x.pos }));
      const moves = coverMoves(rows, r.fetchFrom);
      const entries = log.filter((e) => e.state === "opening" || e.state === "closing");
      for (const m of moves) {
        if (m.t < logFrom) continue;
        const e = entries.find((x) => Math.abs(x.when * 1000 - m.t) < 5000 && (x.state === "opening") === m.up);
        if (e) m.src = this._source(e);
      }
      this._hist = { k: r.k, from: states.from, logFrom: logFrom, end: end, rows: rows,
                     covered: coveredPeriods(rows, end), moves: moves, log: log };
    } catch (err) {
      console.warn("ENTITY-INSIGHTS: cover history failed", err);
      if (this._cur !== cur || this._rangeKey !== r.k) return;
      this._hist = { k: r.k, error: true, influx: !r.recorder };
    }
    this._viewKey = null;
    this._view();
  }

  // The controls are updated in place on every state change (the position
  // comes in while the cover moves); the history below is redrawn only when
  // it changes, and not while the slider is held.
  _renderCover() {
    const cur = this._cur;
    const r = this._range();
    let hist = this._hist;
    if (hist && hist.k !== r.k) hist = null;
    const rank = rankCache.get(rankKey(cur, r));
    const key = Math.floor(Date.now() / 60000) + "#" + r.k + "#" + (hist ? hist.end || "err" : "none") + "#" +
      (rank ? rank.at : 0) + "#" + this.lang;
    if (key !== this._viewKey && !this._drag && !(!hist && this._keepStats(r))) {
      this._viewKey = key;
      this._body.innerHTML = '<div class="box cv">' + this._coverControlsHtml() + this._chipsHtml(r) +
        this._statsBody(hist, () => this._coverStatsHtml(hist, r)) + "</div>";
      this._coverWire();
    }
    this._coverUpdate();
  }

  _coverControlsHtml() {
    const st = this._hass.states[this._cur.ids[0]];
    const feat = st ? st.attributes.supported_features || 0 : 0;
    const t = (k) => esc(this.t(k));
    return '<div class="cv-ctl"><div class="cv-state"><span class="cv-now"></span><span class="since cv-since"></span></div>' +
      '<div class="cv-btns"><button data-s="open_cover" title="' + t("cv_open_btn") + '">▲</button>' +
      (feat & 8 ? '<button data-s="stop_cover" title="' + t("cv_stop_btn") + '">■</button>' : "") +
      '<button data-s="close_cover" title="' + t("cv_close_btn") + '">▼</button></div></div>' +
      (feat & 4 ? '<div class="cv-slide"><span>' + t("cv_slide_closed") + '</span><input type="range" min="0" max="100" step="1"><span>' +
        t("cv_slide_open") + "</span></div>" : "") + settings.extensions.coverControls(this);
  }

  _coverUpdate() {
    const now = this._body.querySelector(".cv-now");
    if (!now) return;
    const st = this._hass.states[this._cur.ids[0]];
    const pos = st ? coverPos(st.state, st.attributes) : null;
    let text;
    if (!st || pos === null) text = this.t("cv_none");
    else if (st.state === "opening") text = this.t("cv_opening", { p: pos });
    else if (st.state === "closing") text = this.t("cv_closing", { p: pos });
    else if (pos >= 98) text = this.t("cv_open");
    else if (pos <= 0) text = this.t("cv_closed");
    else text = this.t("cv_partly", { p: 100 - pos });
    now.textContent = text;
    this._body.querySelector(".cv-since").textContent = st ? this.t("cv_since", { t: this._fmt().hhmm(new Date(st.last_changed)) }) : "";
    const slider = this._body.querySelector(".cv-slide input");
    if (slider) {
      if (!this._drag && pos !== null) slider.value = pos;
      slider.style.setProperty("--p", (pos === null ? 0 : pos) + "%");
    }
    for (const b of this._body.querySelectorAll(".cv-btns button")) {
      b.classList.toggle("act", !!st && ((b.dataset.s === "open_cover" && st.state === "opening") ||
                                         (b.dataset.s === "close_cover" && st.state === "closing")));
    }
    settings.extensions.coverUpdate(this, this._body);
  }

  _coverWire() {
    const id = this._cur.ids[0];
    for (const b of this._body.querySelectorAll(".cv-btns button")) {
      b.addEventListener("click", () => this._hass.callService("cover", b.dataset.s, { entity_id: id }));
    }
    const slider = this._body.querySelector(".cv-slide input");
    if (slider) {
      slider.addEventListener("pointerdown", () => { this._drag = true; });
      slider.addEventListener("input", () => slider.style.setProperty("--p", slider.value + "%"));
      slider.addEventListener("change", () => {
        this._drag = false;
        this._hass.callService("cover", "set_cover_position", { entity_id: id, position: Number(slider.value) });
      });
      for (const ev of ["pointerup", "pointercancel"]) {
        slider.addEventListener(ev, () => setTimeout(() => { this._drag = false; }, 0));
      }
    }
    const box = this._body.querySelector(".box");
    this._wireTips(box);
    this._wireChips(box);
  }

  _coverStatsHtml(hist, r) {
    const t = (k, v) => this.t(k, v);
    const lang = this.lang;
    const forms = (STRINGS[lang] || STRINGS.en).moves;
    const f = this._fmt();
    const now = Date.now();
    const movesIn = (a, b) => hist.moves.filter((m) => m.t >= a && m.t < b);
    const tot = within(hist.covered, r.a, r.b, now);
    const moves = movesIn(r.a, r.b);
    const prevMoves = hist.from <= r.prev[0] + 60000 ? movesIn(r.prev[0], r.prev[1]).length : null;
    const len = (p) => Math.min(p.open ? now : p.to, r.b) - Math.max(p.from, r.a);
    const inRange = hist.covered.filter((p) => len(p) > 0);
    const longest = inRange.length ? inRange.reduce((a, b) => (len(b) > len(a) ? b : a)) : null;
    let html = '<div class="sums">' +
      "<div><b>" + f.hours(tot.ms) + "</b><span>" + esc(t("cv_sum")) + "</span></div>" +
      "<div><b>" + moves.length + "</b><span>" + esc(plural(lang, moves.length, forms).replace(/^\d+ /, "")) + "</span></div>" +
      (r.day ? "<div><b>" + (longest ? f.hours(len(longest)) : "—") + "</b><span>" + esc(t("cv_longest")) + "</span></div>"
             : "<div><b>" + f.hours(tot.ms / r.days) + "</b><span>" + esc(t("cv_avg")) + "</span></div>") + "</div>";

    const bk = rangeBuckets(r, now, lang);
    const vals = bk.list.map((b) => ({ ms: within(hist.covered, b.a, b.b, now).ms, moves: movesIn(b.a, b.b).length }));
    const max = Math.max(bk.unit === "h" ? 600e3 : 3600e3, ...vals.map((v) => v.ms));
    html += this._barsHtml(t("cv_bars_" + bk.unit), bk, vals.map((v) => v.ms), max,
      vals.map((v) => (v.ms ? f.dur(v.ms) : t("cv_tip_open")) + " · " + plural(lang, v.moves, forms)));

    if (!r.day) {
      const hd = hourDays(hist.covered, r.a, r.b, now);
      html += this._hoursHtml(t("cv_hours", { range: r.label }), hd, (n) => (n ? t("in_days", { n: n, d: r.days }) : t("never")));
    }

    const facts = [];
    const downs = moves.filter((m) => !m.up), ups = moves.filter((m) => m.up);
    if (downs.length >= 3) facts.push([t("f_usual_down"), t("about", { t: f.clockOf(median(downs.map((m) => f.minuteOfDay(m.t)))) })]);
    if (ups.length >= 3) facts.push([t("f_usual_up"), t("about", { t: f.clockOf(median(ups.map((m) => f.minuteOfDay(m.t)))) })]);
    if (longest && !r.day) {
      const from = Math.max(longest.from, r.a);
      facts.push([t("f_longest_closed"), f.dur(len(longest)) + " · " + t("date_from", { date: f.date(from), t: f.hhmm(from) })]);
    }
    const srcs = moves.filter((m) => m.src);
    if (srcs.length) {
      const by = new Map();  // not {}: an automation may be called "constructor"
      for (const m of srcs) by.set(m.src, (by.get(m.src) || 0) + 1);
      const top = [...by.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
      facts.push([r.a < hist.logFrom ? t("f_who_days", { n: settings.recorderDays }) : t("f_who"),
                  top.map(([s, n]) => esc(s) + " · " + Math.round(n / srcs.length * 100) + "%").join("<br>")]);
    }
    const partial = moves.filter((m) => m.pos !== null && m.pos > 2 && m.pos < 98).length;
    facts.push([t("f_partial"), partial ? partial + "×" : t("not_once")]);
    if (prevMoves !== null) facts.push([t("f_moves_vs", { vs: r.vsText }), f.change(moves.length, prevMoves)]);
    const tl = this._timelineDay(r);
    const ext = settings.extensions.coverHistory(this, hist, r, tl) || { facts: [], spans: "", legend: "" };
    facts.push(...ext.facts);
    const rank = this._rankFor(moves.length, r, (rows, rr) => coverMoves(rows, rr.a).filter((m) => m.t < rr.b).length);
    if (rank !== undefined) facts.push([t("f_rank_moves", { range: r.label.toLowerCase() }), rank || t("counting")]);
    html += this._factsHtml(facts);

    // one day: closed (stronger = more shut), and what extensions add
    let spans = "";
    hist.rows.forEach((x, i) => {
      const s = Math.max(x.t, tl.t0), e = Math.min(i + 1 < hist.rows.length ? hist.rows[i + 1].t : now, tl.end);
      if (e <= s || x.pos >= 98) return;
      spans += '<span style="' + this._seg(tl, s, e) + ";opacity:" + (0.35 + 0.65 * (100 - x.pos) / 100).toFixed(2) + '"></span>';
    });
    spans += ext.spans;
    html += this._timelineHtml(Object.assign({}, tl, { title: tl.title +
      (ext.legend ? ' <span class="cv-legend">' + esc(t("cv_legend")) + ", " + ext.legend + "</span>" : "") }), spans);

    const recent = moves.slice(-15).reverse();
    html += '<div class="sec">' + esc(t("recent_moves")) + "</div>" + (recent.length ? recent.map((m) => {
      const where = m.pos === null ? t(m.up ? "up" : "down") : m.pos >= 98 ? t("cv_open").toLowerCase()
        : m.pos <= 0 ? t("cv_closed").toLowerCase() : t("at_pos", { p: m.pos });
      return '<div class="ev"><span class="w">' + f.when(m.t) + "</span><span>" + (m.up ? "▲ " : "▼ ") + esc(where) +
        '</span><span class="d">' + esc(m.src || "") + "</span></div>";
    }).join("") : '<div class="muted">' + esc(t("no_moves")) + "</div>");
    return html;
  }

  // ---- Chart (numeric sensors) through long-term-chart-card --------------
  // Synchronous on purpose: open() has to know at once whether it shows
  // something, or the takeover would swallow the entity dialog for nothing.
  // By the time anyone taps, the dashboard resources are long loaded.
  _openChart() {
    const cur = this._cur;
    const tag = customElements.get("long-term-chart-card") ? "long-term-chart-card" : null;
    if (!tag) {
      console.warn("ENTITY-INSIGHTS: long-term-chart-card is not loaded, showing the entity dialog");
      if (this.isOpen) this.close(); else this._reset();
      return false;
    }
    const entities = cur.ids.map((id, i) => {
      const e = { entity: id };
      if (cur.labels && cur.labels[i]) e.name = cur.labels[i];
      if (i === 1) e.axis = "right";
      return e;
    });
    const chart = document.createElement(tag);
    try {
      chart.setConfig(Object.assign({ source: this._opts().influx ? "influx" : "statistics", days: 1, show_stats: true },
                                    cur.chart || {}, { entities: entities }));
    } catch (err) {  // e.g. wrong `chart` options in the request
      console.warn("ENTITY-INSIGHTS: chart options rejected", err);
      if (this.isOpen) this.close(); else this._reset();
      return false;
    }
    chart.hass = this._hass;
    this._panel(false);
    this._body.replaceChildren(chart);
    this._view = () => { chart.hass = this._hass; };
    this._show();
    return true;
  }
}

// ---- Module state and hooks ----------------------------------------------
const settings = {
  recorderDays: 10,
  // Extension points, for a card that adds its own pieces (e.g. a floor plan
  // showing the sun in the windows): window.entityInsights.configure({extensions}).
  // They return HTML that goes into the dialog as it is: escape your own data.
  extensions: {
    coverControls: () => "",
    coverUpdate: () => {},
    coverHistory: () => null,
  },
};
const rankCache = new Map();
const rankBusy = new Set();
const takeover = new Map();  // owner element -> Set of domains
let bypass = false;
let dialogEl = null;

function rankKey(cur, r) {
  return cur.domain + "#" + r.k + "#" + (cur.rankWith ? cur.rankWith.join(",") : "");
}

// A light with a brightness level (not on/off only).
export function dimmable(stateObj) {
  return !!stateObj && stateObj.entity_id.startsWith("light.") &&
    (stateObj.attributes.supported_color_modes || []).some((m) => m !== "onoff");
}

function isOn(hass, id) {
  const s = hass.states[id];
  return !!s && s.state === "on";
}

// Entities to rank against: the domain, without groups and hidden ones.
export function rankEntities(hass, domain) {
  return Object.keys(hass.states).filter((id) => {
    if (!id.startsWith(domain + ".")) return false;
    const s = hass.states[id];
    if (Array.isArray(s.attributes.entity_id)) return false;  // a group
    if (s.state === "unavailable") return false;
    const reg = hass.entities && hass.entities[id];
    return !(reg && (reg.hidden || reg.entity_category));
  });
}

function haElement() {
  return document.querySelector("home-assistant");
}

function getDialog() {
  if (!dialogEl) {
    dialogEl = document.createElement(NAME + "-dialog");
    document.body.appendChild(dialogEl);
  }
  return dialogEl;
}

export function openStandardMoreInfo(entityId) {
  const ha = haElement();
  if (!ha) return;
  bypass = true;
  try {
    ha.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: entityId }, bubbles: true, composed: true }));
  } finally {
    bypass = false;
  }
}

function currentHass(hass) {
  if (hass) return hass;
  const ha = haElement();
  return ha && ha.hass;
}

const api = {
  version: VERSION,
  open(request, hass) { return getDialog().open(request, currentHass(hass)); },
  openCustom(title, render, opts, hass) {
    const d = getDialog();
    if (hass || !d.hass) d.hass = currentHass(hass);
    return d.openCustom(title, render, opts);
  },
  close() { if (dialogEl) dialogEl.close(); },
  set hass(h) { if (dialogEl && h) dialogEl.hass = h; },
  get dialog() { return getDialog(); },
  // configure({recorder_days, extensions: {coverControls, coverUpdate, coverHistory}})
  configure(opts = {}) {
    if (Number(opts.recorder_days) > 0) settings.recorderDays = Math.round(Number(opts.recorder_days));
    if (opts.extensions) Object.assign(settings.extensions, opts.extensions);
  },
};

// The invisible card: turns the takeover of the entity dialog on for the
// dashboard it is on, and keeps the dialog's hass fresh.
//   type: custom:entity-insights
//   more_info: [light, cover]
//   recorder_days: 10
export class EntityInsightsCard extends HTMLElement {
  setConfig(config) {
    const mi = config.more_info === undefined ? [] : config.more_info;
    if (!Array.isArray(mi) || !mi.every((d) => typeof d === "string" && /^[a-z_]+$/.test(d))) {
      throw new Error("more_info: a list of domains, e.g. [light, cover]");
    }
    this._config = config;
    this._domains = new Set(mi);
    if (config.recorder_days !== undefined) api.configure({ recorder_days: config.recorder_days });
    if (this.isConnected) takeover.set(this, this._domains);
    this._draw();
  }

  set hass(hass) {
    this._hass = hass;
    if (dialogEl && dialogEl.isOpen) dialogEl.hass = hass;
    this._draw();
  }

  set editMode(v) { this._edit = v; this._draw(); }

  set preview(v) { this._edit = v; this._draw(); }

  connectedCallback() { if (this._domains) takeover.set(this, this._domains); this._draw(); }

  disconnectedCallback() { takeover.delete(this); }

  _draw() {
    // nothing on the dashboard - only in the editor, to know it is there
    this.style.display = this._edit ? "block" : "none";
    if (!this._edit) { this.innerHTML = ""; return; }
    const lang = langOf(this._hass);
    const list = Array.from(this._domains || []);
    this.innerHTML = '<ha-card style="padding:12px 16px;font-size:13px"><b>' + esc(tr(lang, "config_title")) + "</b><br>" +
      esc(list.length ? tr(lang, "config_takeover", { list: list.join(", ") }) : tr(lang, "config_none")) + "</ha-card>";
  }

  getCardSize() { return this._edit ? 1 : 0; }

  static getStubConfig() { return { more_info: ["light", "cover"] }; }
}

if (typeof window !== "undefined" && typeof customElements !== "undefined" && !customElements.get(NAME)) {
  customElements.define(NAME + "-dialog", EntityInsightsDialog);
  customElements.define(NAME, EntityInsightsCard);
  window.entityInsights = api;

  // fire-dom-event: { action: fire-dom-event, entity_insights: {...} }
  window.addEventListener("ll-custom", (e) => {
    const req = e.detail && e.detail.entity_insights;
    if (!req || api.open(req)) return;
    // nothing of ours for it (e.g. a sensor without long-term-chart-card):
    // Home Assistant's own dialog rather than nothing
    const parsed = parseRequest(req);
    console.warn("ENTITY-INSIGHTS: nothing to show for", req);
    if (parsed) openStandardMoreInfo(parsed.ids[0]);
  });

  // Entity dialog takeover, for the domains a card on the open dashboard asked for.
  window.addEventListener("hass-more-info", (e) => {
    if (bypass || !takeover.size) return;
    const id = e.detail && e.detail.entityId;
    if (!validEntityId(id)) return;
    const domain = id.split(".")[0];
    if (!Array.from(takeover.values()).some((s) => s.has(domain))) return;
    if (api.open({ entity: id })) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: NAME,
    name: "Entity Insights",
    description: "History dialog for lights, switches and covers - opens instead of the entity dialog",
    preview: false,
  });
  console.info("%c ENTITY-INSIGHTS %c " + VERSION, "background:#ffc300;color:#000;font-weight:700", "");
}
