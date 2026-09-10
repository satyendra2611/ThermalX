import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Thermometer, Droplets, Wind, Sun, AlertTriangle, MapPin, Users,
  Activity, Radio, MessageSquare, SlidersHorizontal, Building2,
  ChevronRight, Send, TrendingUp, ShieldAlert, LayoutGrid, Map as MapIcon,
  BrainCircuit, CalendarClock, HeartPulse, Snowflake, MegaphoneIcon,
  FlaskConical, Bot, Settings, ArrowRight, Navigation, X, Menu,
} from "lucide-react";

/* ============================================================
   DEMO DATA — ward risk grid modeled on Ahmedabad (simulated for
   SIH prototype); live weather below now defaults to Gonda, UP.
   The ward grid itself is unchanged — see note in useLiveWeather.
   ============================================================ */

const CITY = import.meta.env.VITE_DEFAULT_CITY || "Gonda";

const RISK_LEVELS = [
  { key: "LOW", color: "#4F9E7A", from: 0 },
  { key: "MODERATE", color: "#C9A227", from: 35 },
  { key: "HIGH", color: "#D9752E", from: 58 },
  { key: "VERY HIGH", color: "#C1432A", from: 76 },
  { key: "EXTREME", color: "#8E2430", from: 90 },
];

function riskFromScore(score) {
  let r = RISK_LEVELS[0];
  for (const lvl of RISK_LEVELS) if (score >= lvl.from) r = lvl;
  return r;
}

const WARDS = [
  { id: "W-04", name: "Vatva", temp: 43.6, hum: 61, wind: 0.9, solar: 812, pop: 91200, vulnPop: 24100, workers: 11800, score: 93 },
  { id: "W-09", name: "Bapunagar", temp: 42.9, hum: 58, wind: 1.1, solar: 790, pop: 118400, vulnPop: 29700, workers: 9600, score: 88 },
  { id: "W-11", name: "Naroda", temp: 43.1, hum: 55, wind: 1.4, solar: 805, pop: 104300, vulnPop: 21300, workers: 14200, score: 86 },
  { id: "W-06", name: "Maninagar", temp: 41.8, hum: 47, wind: 2.6, solar: 760, pop: 132900, vulnPop: 27100, workers: 6800, score: 71 },
  { id: "W-14", name: "Isanpur", temp: 42.4, hum: 52, wind: 1.8, solar: 774, pop: 78600, vulnPop: 15900, workers: 8100, score: 76 },
  { id: "W-02", name: "Sabarmati", temp: 41.2, hum: 44, wind: 2.9, solar: 741, pop: 96700, vulnPop: 18200, workers: 5200, score: 62 },
  { id: "W-17", name: "Vastrapur", temp: 40.9, hum: 39, wind: 3.4, solar: 728, pop: 61400, vulnPop: 9800, workers: 2100, score: 48 },
  { id: "W-19", name: "Bodakdev", temp: 40.6, hum: 37, wind: 3.6, solar: 715, pop: 54200, vulnPop: 8100, workers: 1600, score: 42 },
  { id: "W-12", name: "Ghatlodia", temp: 41.5, hum: 45, wind: 2.4, solar: 752, pop: 88300, vulnPop: 16700, workers: 4900, score: 58 },
  { id: "W-21", name: "Chandkheda", temp: 41.0, hum: 41, wind: 2.8, solar: 733, pop: 73100, vulnPop: 12400, workers: 3800, score: 51 },
  { id: "W-08", name: "Nikol", temp: 42.7, hum: 56, wind: 1.3, solar: 796, pop: 109800, vulnPop: 25600, workers: 10900, score: 84 },
  { id: "W-15", name: "Odhav", temp: 43.2, hum: 59, wind: 1.0, solar: 808, pop: 87600, vulnPop: 20200, workers: 12400, score: 90 },
];

const TOTAL_EXPOSED = WARDS.reduce((s, w) => s + w.pop, 0);
const TOTAL_VULN = WARDS.reduce((s, w) => s + w.vulnPop, 0);
const CRITICAL_ZONES = WARDS.filter((w) => w.score >= 85).length;
const CITY_SCORE = Math.round(WARDS.reduce((s, w) => s + w.score, 0) / WARDS.length);
const CITY_RISK = riskFromScore(CITY_SCORE);

const FORECAST_120H = [
  { t: "Now", hour: 0, day: "Today", temp: 43.6, wbgt: 34.1, utci: 44.8, score: 91, exposure: 1.84 },
  { t: "+24h", hour: 24, day: "Day 2", temp: 44.1, wbgt: 34.9, utci: 45.9, score: 93, exposure: 1.91 },
  { t: "+48h", hour: 48, day: "Day 3", temp: 44.8, wbgt: 35.8, utci: 47.1, score: 96, exposure: 2.03 },
  { t: "+72h", hour: 72, day: "Day 4", temp: 45.3, wbgt: 36.4, utci: 47.9, score: 98, exposure: 2.14 },
  { t: "+96h", hour: 96, day: "Day 5", temp: 44.7, wbgt: 35.6, utci: 46.6, score: 95, exposure: 2.02 },
  { t: "+120h", hour: 120, day: "Day 6", temp: 43.9, wbgt: 34.7, utci: 45.2, score: 90, exposure: 1.88 },
];

const ESCALATION_PROB = 81;

const EXPLAIN_FACTORS = [
  { label: "Relative humidity", pct: 31 },
  { label: "Low wind speed", pct: 22 },
  { label: "Solar radiation load", pct: 18 },
  { label: "Elderly population exposure", pct: 16 },
  { label: "Outdoor-worker exposure", pct: 13 },
];

const VULN_GROUPS = [
  { key: "Outdoor workers", score: 91, icon: Building2 },
  { key: "Elderly (65+)", score: 78, icon: Users },
  { key: "Healthcare load", score: 74, icon: HeartPulse },
  { key: "Children (<5)", score: 63, icon: Users },
  { key: "Low-income households", score: 69, icon: Users },
  { key: "Chronic patients", score: 72, icon: HeartPulse },
];

const HOSPITAL_LOAD = [
  { period: "Today", pct: 8 },
  { period: "Tomorrow", pct: 17 },
  { period: "+48h", pct: 31 },
  { period: "+72h", pct: 44 },
];

const COOLING_CENTRES = [
  { id: 12, name: "Community Hall, Vatva Sector 4", capacity: 500, current: 327, status: "OPEN", distance: 1.2, water: "Adequate", power: "Backup active" },
  { id: 7, name: "Naroda Municipal School", capacity: 350, current: 340, status: "NEAR FULL", distance: 2.4, water: "Low — refill requested", power: "Backup active" },
  { id: 3, name: "Odhav Ward Office Annexe", capacity: 260, current: 90, status: "OPEN", distance: 3.1, water: "Adequate", power: "Grid" },
  { id: 19, name: "Bapunagar Sports Complex", capacity: 600, current: 588, status: "NEAR FULL", distance: 1.8, water: "Adequate", power: "Backup active" },
  { id: 22, name: "Isanpur Primary Health Centre", capacity: 180, current: 40, status: "OPEN", distance: 4.0, water: "Adequate", power: "Grid" },
];

const ACTIONS_LEVEL2 = [
  "Open 3 additional cooling centres in Vatva & Odhav",
  "Push extreme-heat alert to Wards 04, 09, 11, 15",
  "Shift outdoor labour hours to before 11:00 / after 17:00",
  "Notify Naroda & Bapunagar hospitals of projected admission rise",
  "Increase ambulance and paramedic staffing by 20%",
  "Monitor grid power demand in high-AC-load zones",
  "Push multilingual public advisory across SMS & WhatsApp",
];

const LANGUAGES = ["English", "Hindi", "Gujarati", "Marathi", "Bengali", "Tamil"];

/* ============================================================
   WEATHER DATA LAYER — Open-Meteo (live, no API key)
   ------------------------------------------------------------
   This block ONLY fetches and shapes raw weather observations
   (temperature, humidity, wind, precipitation probability).
   It never computes risk/vulnerability itself — those stay in
   the existing WARDS / risk-engine mock layer above and below,
   so that layer can later be swapped for the real ML model
   without touching this file's weather-fetching code.
   ============================================================ */

const DEFAULT_LOCATION = { name: CITY, country: "India", lat: 27.1333, lon: 81.9667 };
const GEO_API_URL = import.meta.env.VITE_GEO_API_URL || "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = import.meta.env.VITE_WEATHER_API_URL || "https://api.open-meteo.com/v1/forecast";

/** Small helper so every failure carries a clear category — surfaced
 *  both to the console and, via onError, to the UI. */
function taggedError(category, detail) {
  const e = new Error(`[${category}] ${detail}`);
  e.category = category;
  return e;
}

/** Get live weather for any city — geocodes the name, then fetches
 *  current + hourly + daily conditions from Open-Meteo.
 *  Every failure is logged to console under one of four categories:
 *    1. Geocoding request failure  (geocoding API responded with an error status)
 *    2. Weather API request failure (forecast API responded with an error status)
 *    3. Network / CORS failure      (fetch() itself never got a response)
 *    4. City not found              (geocoding succeeded, zero results)
 *  Returns null on failure (caller decides what to show/keep) and, if
 *  given, calls onError(error) so the UI can display the real cause. */
async function getLiveWeather(city, onError) {
  function fail(err) {
    // eslint-disable-next-line no-console
    console.error("[THERMAL-X] Live weather fetch failed —", err.category + ":", err.message);
    if (onError) onError(err);
    return null;
  }

  // ---- Step 1: geocode the city name ----
  let location;
  try {
    let geoResponse;
    try {
      geoResponse = await fetch(
        `${GEO_API_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );
    } catch (networkErr) {
      // fetch() itself threw — the request never reached the network.
      // This is almost always a blocked/CORS/offline condition, not an API error.
      return fail(taggedError("Network/CORS failure", `could not reach geocoding service (${networkErr.message})`));
    }
    if (!geoResponse.ok) {
      return fail(taggedError("Geocoding request failure", `Open-Meteo geocoding API responded HTTP ${geoResponse.status}`));
    }
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
      return fail(taggedError("City not found", `no geocoding match for "${city}"`));
    }
    location = geoData.results[0];
  } catch (parseErr) {
    return fail(taggedError("Geocoding request failure", `could not parse geocoding response (${parseErr.message})`));
  }

  // ---- Step 2: fetch current/hourly/daily forecast for that location ----
  try {
    let weatherResponse;
    try {
      weatherResponse = await fetch(
        `${WEATHER_API_URL}?latitude=${location.latitude}&longitude=${location.longitude}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m` +
          `&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,wind_speed_10m` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
          `&forecast_days=7&timezone=auto`
      );
    } catch (networkErr) {
      return fail(taggedError("Network/CORS failure", `could not reach forecast service (${networkErr.message})`));
    }
    if (!weatherResponse.ok) {
      return fail(taggedError("Weather API request failure", `Open-Meteo forecast API responded HTTP ${weatherResponse.status}`));
    }
    const weather = await weatherResponse.json();

    // Raw hourly/daily kept intact so existing chart helpers
    // (nextHours/nextDays) and the existing forecast chart still work.
    return {
      name: location.name,
      country: location.country || "",
      lat: location.latitude,
      lon: location.longitude,

      temperature: weather.current.temperature_2m,
      humidity: weather.current.relative_humidity_2m,
      feelsLike: weather.current.apparent_temperature,
      windSpeed: weather.current.wind_speed_10m,

      current: weather.current,
      hourly: weather.hourly,
      daily: weather.daily,
    };
  } catch (parseErr) {
    return fail(taggedError("Weather API request failure", `could not parse forecast response (${parseErr.message})`));
  }
}

/** Live weather hook — wraps getLiveWeather() and caches the last
 *  successful result so the UI stays usable if a later request fails. */
function useLiveWeather(initialCityName) {
  const [query, setQuery] = useState(initialCityName);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [weather, setWeather] = useState(null); // last known-good payload
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  async function load(cityName) {
    setLoading(true);
    setError(null);
    let caughtErr = null;
    const result = await getLiveWeather(cityName || location.name, (e) => { caughtErr = e; });

    if (result) {
      setLocation({ name: result.name, country: result.country, lat: result.lat, lon: result.lon });
      setWeather(result); // replaces cache only on success
      setStale(false);
      setUpdatedAt(new Date());
    } else {
      // Keep whatever weather/location we already have — the last
      // good fetch remains on screen, just flagged as stale.
      // caughtErr.message already carries its category tag, e.g.
      // "[Network/CORS failure] could not reach api.open-meteo.com (...)"
      setError(caughtErr?.message || `Couldn't load weather for "${cityName || location.name}" (unknown error)`);
      setStale(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(initialCityName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    query, setQuery,
    location, weather, loading, error, stale, updatedAt,
    search: (name) => load(name),
    refresh: () => load(),
  };
}

function nextHours(hourly, count = 24) {
  if (!hourly?.time) return [];
  const now = Date.now();
  let startIdx = hourly.time.findIndex((t) => new Date(t).getTime() >= now);
  if (startIdx < 0) startIdx = 0;
  return hourly.time.slice(startIdx, startIdx + count).map((t, i) => ({
    label: new Date(t).toLocaleTimeString([], { hour: "2-digit" }),
    temp: hourly.temperature_2m?.[startIdx + i],
    apparent: hourly.apparent_temperature?.[startIdx + i],
    precip: hourly.precipitation_probability?.[startIdx + i],
  }));
}

function nextDays(daily) {
  if (!daily?.time) return [];
  return daily.time.map((d, i) => ({
    label: new Date(d).toLocaleDateString([], { weekday: "short" }),
    max: daily.temperature_2m_max?.[i],
    min: daily.temperature_2m_min?.[i],
    precip: daily.precipitation_probability_max?.[i],
  }));
}

/* ============================================================
   SMALL HELPERS
   ============================================================ */

function fmtNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      setVal(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}

function RiskChip({ level, size = "md" }) {
  const r = RISK_LEVELS.find((l) => l.key === level) || RISK_LEVELS[0];
  return (
    <span
      className={`risk-chip risk-chip--${size}`}
      style={{ color: r.color, borderColor: r.color + "55", background: r.color + "14" }}
    >
      <span className="risk-dot" style={{ background: r.color }} />
      {r.key}
    </span>
  );
}

/* ============================================================
   SHELL — SIDEBAR + TOPBAR
   ============================================================ */

const NAV_ITEMS = [
  { key: "command", label: "Command Center", icon: LayoutGrid },
  { key: "map", label: "Heat Map", icon: MapIcon },
  { key: "risk", label: "Risk Intelligence", icon: BrainCircuit },
  { key: "forecast", label: "Forecast", icon: CalendarClock },
  { key: "vulnerability", label: "Vulnerability", icon: Users },
  { key: "health", label: "Health Response", icon: HeartPulse },
  { key: "cooling", label: "Cooling Centres", icon: Snowflake },
  { key: "alerts", label: "Alert Centre", icon: MegaphoneIcon },
  { key: "scenario", label: "Scenario Lab", icon: FlaskConical },
  { key: "copilot", label: "AI Copilot", icon: Bot },
];

function Sidebar({ page, setPage, open, setOpen }) {
  return (
    <>
      {open && <div className="sb-scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sb-brand">
          <div className="sb-mark">TX</div>
          <div>
            <div className="sb-name">THERMAL-X</div>
            <div className="sb-sub">Heat Risk Intelligence</div>
          </div>
          <button className="sb-close" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>

        <nav className="sb-nav">
          {NAV_ITEMS.map((it) => (
            <button
              key={it.key}
              className={`sb-item ${page === it.key ? "sb-item--active" : ""}`}
              onClick={() => { setPage(it.key); setOpen(false); }}
            >
              <it.icon size={16} strokeWidth={1.8} />
              <span>{it.label}</span>
            </button>
          ))}
          <button className="sb-item sb-item--disabled" disabled>
            <Settings size={16} strokeWidth={1.8} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sb-status">
          <div className="sb-status-title">System status</div>
          {[
            ["Weather feed", true],
            ["GIS engine", true],
            ["AI forecast model", true],
            ["Alert service", true],
          ].map(([label, ok]) => (
            <div className="sb-status-row" key={label}>
              <span className={`sb-status-dot ${ok ? "ok" : "down"}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}

function TopBar({ title, setOpen, wx }) {
  const [draft, setDraft] = useState(wx?.location?.name || CITY);

  function submitSearch(e) {
    e.preventDefault();
    if (draft.trim()) wx?.search(draft.trim());
  }

  const label = wx?.location
    ? `${wx.location.name}${wx.location.country ? ", " + wx.location.country : ""}`
    : CITY;

  return (
    <header className="topbar">
      <button className="tb-menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
      <div>
        <div className="tb-eyebrow">{label} · Ward-level risk model is simulated demo data</div>
        <h1 className="tb-title">{title}</h1>
      </div>

      <form className="tb-search" onSubmit={submitSearch}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Search city…"
          aria-label="Search city for live weather"
        />
        <button type="submit" disabled={wx?.loading}>{wx?.loading ? "…" : "Go"}</button>
      </form>

      <div className="tb-right">
        {wx?.error ? (
          <span className="tb-demo-tag tb-demo-tag--warn" title={wx.error}>
            Live weather unavailable — showing last known values
          </span>
        ) : (
          <span className="tb-demo-tag tb-demo-tag--live">
            LIVE WEATHER — Open-Meteo{wx?.stale ? " (cached)" : ""}
          </span>
        )}
        {wx?.error && (
          <div className="tb-error-detail">
            {wx.error}
            <button type="button" className="tb-retry" onClick={() => wx.refresh()}>Retry</button>
          </div>
        )}
        <div className="tb-updated">
          {wx?.updatedAt
            ? <>Weather updated <strong>{wx.updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong></>
            : <>Fetching live weather…</>}
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */

function Landing({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-nav">
        <div className="sb-mark">TX</div>
        <span className="landing-brand">THERMAL-X</span>
      </div>

      <div className="landing-hero">
        <div className="landing-hero-copy">
          <div className="eyebrow">SIH 2026 · SIH26083</div>
          <h1>
            Heat isn't just weather.
            <br />
            It's human risk.
          </h1>
          <p>
            THERMAL-X converts temperature, humidity, wind and solar load into a
            localized human thermal-stress index — then tells authorities exactly
            what to do about it, ward by ward, hour by hour.
          </p>
          <div className="landing-cta">
            <button className="btn btn--primary" onClick={onEnter}>
              Launch Command Center <ArrowRight size={16} />
            </button>
            <button className="btn btn--ghost" onClick={onEnter}>Explore risk intelligence</button>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="hv-grid">
            {WARDS.map((w) => {
              const r = riskFromScore(w.score);
              return (
                <div
                  key={w.id}
                  className="hv-cell"
                  style={{ background: r.color, opacity: 0.35 + (w.score / 100) * 0.6 }}
                  title={`${w.name}: ${w.score}`}
                />
              );
            })}
          </div>
          <div className="hv-caption">{CITY} — live thermal-stress surface (simulated)</div>
        </div>
      </div>

      <div className="landing-flow">
        <div className="flow-title">From weather to action</div>
        <div className="flow-row">
          {["Weather", "Thermal stress", "Vulnerability", "Impact risk", "Action"].map((s, i, arr) => (
            <React.Fragment key={s}>
              <div className="flow-step">{s}</div>
              {i < arr.length - 1 && <ChevronRight size={18} className="flow-arrow" />}
            </React.Fragment>
          ))}
        </div>
        <div className="flow-features">
          {[
            ["5-day predictive intelligence", CalendarClock],
            ["Ward-level risk resolution", MapIcon],
            ["Explainable AI, not a black box", BrainCircuit],
            ["Automated response recommendations", ShieldAlert],
          ].map(([label, Icon]) => (
            <div className="flow-feature" key={label}>
              <Icon size={18} strokeWidth={1.6} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMMAND CENTER
   ============================================================ */

function ThermalEngineVisual({ wx }) {
  const c = wx?.weather?.current;
  const haveLive = !!c && !wx?.loading;
  const inputs = [
    { icon: Thermometer, label: "Temperature", value: haveLive ? `${c.temperature_2m.toFixed(1)}°C` : "—" },
    { icon: Droplets, label: "Humidity", value: haveLive ? `${Math.round(c.relative_humidity_2m)}%` : "—" },
    { icon: Wind, label: "Wind speed", value: haveLive ? `${c.wind_speed_10m.toFixed(1)} m/s` : "—" },
    { icon: Sun, label: "Solar radiation", value: "812 W/m² (demo)" },
  ];
  const locLabel = wx?.location ? `${wx.location.name}` : "Ward 04 · Vatva";
  return (
    <div className="panel engine-panel">
      <div className="panel-head">
        <span className="panel-title">Thermal stress engine</span>
        <span className="panel-note">
          {locLabel} — live conditions{wx?.stale ? " (cached)" : ""}
        </span>
      </div>
      <div className="engine-row">
        <div className="engine-inputs">
          {inputs.map((inp) => (
            <div className="engine-input" key={inp.label}>
              <inp.icon size={16} strokeWidth={1.7} />
              <div>
                <div className="engine-input-label">{inp.label}</div>
                <div className="engine-input-value">{inp.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="engine-arrow">
          <ArrowRight size={20} />
        </div>

        <div className="engine-human">
          <svg viewBox="0 0 80 160" width="72" height="144">
            <defs>
              <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8E2430" />
                <stop offset="100%" stopColor="#D9752E" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="22" r="16" fill="url(#bodyGrad)" opacity="0.92" />
            <rect x="18" y="42" width="44" height="70" rx="18" fill="url(#bodyGrad)" opacity="0.85" />
            <rect x="10" y="46" width="12" height="55" rx="6" fill="url(#bodyGrad)" opacity="0.7" />
            <rect x="58" y="46" width="12" height="55" rx="6" fill="url(#bodyGrad)" opacity="0.7" />
            <rect x="22" y="108" width="14" height="46" rx="7" fill="url(#bodyGrad)" opacity="0.7" />
            <rect x="44" y="108" width="14" height="46" rx="7" fill="url(#bodyGrad)" opacity="0.7" />
          </svg>
          <div className="engine-human-label">Human thermal load</div>
        </div>

        <div className="engine-arrow">
          <ArrowRight size={20} />
        </div>

        <div className="engine-output">
          <div className="engine-output-label">Thermal stress</div>
          <div className="engine-scale">
            {RISK_LEVELS.map((lvl) => (
              <div
                key={lvl.key}
                className={`engine-scale-seg ${lvl.key === "EXTREME" ? "engine-scale-seg--active" : ""}`}
                style={{ background: lvl.color, opacity: lvl.key === "EXTREME" ? 1 : 0.28 }}
              />
            ))}
          </div>
          <div className="engine-output-value">EXTREME</div>
        </div>
      </div>
    </div>
  );
}

function ComparisonSection() {
  const a = { name: "Ward 19 · Bodakdev", temp: 40.6, hum: 37, wind: 3.6, level: "MODERATE" };
  const b = { name: "Ward 04 · Vatva", temp: 40.6, hum: 66, wind: 0.6, level: "EXTREME" };
  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Same temperature. Different danger.</span>
      </div>
      <p className="panel-lede">
        Two wards at the identical air temperature can carry entirely different human
        risk once humidity and wind are accounted for.
      </p>
      <div className="compare-row">
        {[a, b].map((w) => (
          <div className="compare-card" key={w.name}>
            <div className="compare-name">{w.name}</div>
            <div className="compare-temp">{w.temp}°C</div>
            <div className="compare-metrics">
              <span><Droplets size={13} /> {w.hum}% humidity</span>
              <span><Wind size={13} /> {w.wind} m/s wind</span>
            </div>
            <RiskChip level={w.level} />
          </div>
        ))}
      </div>
      <div className="compare-footer">
        <div className="compare-footer-item">
          <span className="compare-footer-label">Temperature alone</span>
          <span className="compare-footer-value muted">Low differentiation</span>
        </div>
        <div className="compare-footer-item">
          <span className="compare-footer-label">Thermal intelligence</span>
          <span className="compare-footer-value accent">High-risk identification</span>
        </div>
      </div>
    </div>
  );
}

function CommandCenter({ goTo, wx }) {
  const exposed = useCountUp(TOTAL_EXPOSED / 1_000_000, 1000);
  const vuln = useCountUp(TOTAL_VULN / 1_000, 1000);
  const c = wx?.weather?.current;
  const feelsLike = c ? `${c.apparent_temperature.toFixed(1)}°C` : "—";

  return (
    <div className="page">
      <div className="status-strip">
        <div className="status-block status-block--main">
          <div className="status-label">City status</div>
          <RiskChip level={CITY_RISK.key} size="lg" />
        </div>
        <div className="status-block">
          <div className="status-label">Feels like (live) / thermal stress (model)</div>
          <div className="status-value">{feelsLike} <span className="status-value-sub">EXTREME</span></div>
        </div>
        <div className="status-block">
          <div className="status-label">Population exposed</div>
          <div className="status-value">{exposed.toFixed(2)}M</div>
        </div>
        <div className="status-block">
          <div className="status-label">High-vulnerability population</div>
          <div className="status-value">{vuln.toFixed(0)}K</div>
        </div>
        <div className="status-block">
          <div className="status-label">Critical zones</div>
          <div className="status-value">{CRITICAL_ZONES}</div>
        </div>
        <div className="status-block">
          <div className="status-label">72h escalation probability</div>
          <div className="status-value accent">{ESCALATION_PROB}%</div>
        </div>
      </div>

      <ThermalEngineVisual wx={wx} />

      <div className="grid-2">
        <ComparisonSection />
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">What happens next</span>
            <button className="link-btn" onClick={() => goTo("risk")}>Full recommendation <ChevronRight size={14} /></button>
          </div>
          <p className="panel-lede">
            Thermal stress is rising, wind is declining, and vulnerable-population
            exposure is high across four wards.
          </p>
          <div className="reco-banner">
            <ShieldAlert size={18} />
            <span>Activate Level-2 Heat Response</span>
          </div>
          <ul className="reco-list">
            {ACTIONS_LEVEL2.slice(0, 4).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <button className="link-btn" onClick={() => goTo("risk")}>View all 7 actions <ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Next 120 hours</span>
            <button className="link-btn" onClick={() => goTo("forecast")}>Open forecast <ChevronRight size={14} /></button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={FORECAST_120H}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9752E" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#D9752E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#22262B" vertical={false} />
              <XAxis dataKey="day" stroke="#6B7480" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} stroke="#6B7480" fontSize={11} tickLine={false} axisLine={false} width={28} />
              <Tooltip contentStyle={{ background: "#14181D", border: "1px solid #262B31", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#D9752E" fill="url(#scoreGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Critical wards right now</span>
            <button className="link-btn" onClick={() => goTo("map")}>Open heat map <ChevronRight size={14} /></button>
          </div>
          <div className="ward-mini-list">
            {WARDS.filter((w) => w.score >= 84).map((w) => {
              const r = riskFromScore(w.score);
              return (
                <div className="ward-mini-row" key={w.id}>
                  <span className="ward-mini-dot" style={{ background: r.color }} />
                  <span className="ward-mini-name">{w.name}</span>
                  <span className="ward-mini-id">{w.id}</span>
                  <span className="ward-mini-score" style={{ color: r.color }}>{w.score}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HEAT MAP
   ============================================================ */

const LAYERS = [
  "Thermal stress", "Population exposure", "Elderly population", "Outdoor workers",
  "Hospitals", "Cooling centres", "Schools", "Power demand",
];

function HeatMapView() {
  const [selected, setSelected] = useState(WARDS[0]);
  const [layers, setLayers] = useState(["Thermal stress", "Outdoor workers"]);

  function toggleLayer(l) {
    setLayers((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  const r = riskFromScore(selected.score);

  return (
    <div className="page">
      <div className="map-layout">
        <div className="panel map-panel">
          <div className="panel-head">
            <span className="panel-title">{CITY} thermal-stress grid</span>
            <span className="panel-note">Click a ward for full intelligence</span>
          </div>
          <div className="map-grid">
            {WARDS.map((w) => {
              const wr = riskFromScore(w.score);
              const active = selected.id === w.id;
              return (
                <button
                  key={w.id}
                  className={`map-cell ${active ? "map-cell--active" : ""}`}
                  style={{ background: wr.color + (active ? "" : "cc") }}
                  onClick={() => setSelected(w)}
                >
                  <span className="map-cell-id">{w.id}</span>
                  <span className="map-cell-name">{w.name}</span>
                  <span className="map-cell-score">{w.score}</span>
                </button>
              );
            })}
          </div>
          <div className="map-legend">
            {RISK_LEVELS.map((l) => (
              <span key={l.key} className="map-legend-item">
                <span className="map-legend-dot" style={{ background: l.color }} /> {l.key}
              </span>
            ))}
          </div>
        </div>

        <div className="panel layer-panel">
          <div className="panel-head"><span className="panel-title">Layers</span></div>
          <div className="layer-list">
            {LAYERS.map((l) => (
              <label className="layer-item" key={l}>
                <input type="checkbox" checked={layers.includes(l)} onChange={() => toggleLayer(l)} />
                <span>{l}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="panel ward-detail">
        <div className="panel-head">
          <span className="panel-title">{selected.name} — {selected.id}</span>
          <RiskChip level={r.key} />
        </div>
        <div className="ward-detail-grid">
          <div><span className="wd-label">Temperature</span><span className="wd-value">{selected.temp}°C</span></div>
          <div><span className="wd-label">Humidity</span><span className="wd-value">{selected.hum}%</span></div>
          <div><span className="wd-label">WBGT</span><span className="wd-value">{(selected.temp - 8.5 + selected.hum / 20).toFixed(1)}°C</span></div>
          <div><span className="wd-label">UTCI</span><span className="wd-value">{(selected.temp + selected.hum / 12).toFixed(1)}°C</span></div>
          <div><span className="wd-label">Risk score</span><span className="wd-value" style={{ color: r.color }}>{selected.score}/100</span></div>
          <div><span className="wd-label">Population</span><span className="wd-value">{fmtNum(selected.pop)}</span></div>
          <div><span className="wd-label">High-risk population</span><span className="wd-value">{fmtNum(selected.vulnPop)}</span></div>
          <div><span className="wd-label">Outdoor workers</span><span className="wd-value">{fmtNum(selected.workers)}</span></div>
        </div>

        {selected.score >= 76 && (
          <div className="wd-action">
            <div className="wd-action-title">
              <AlertTriangle size={16} /> Activate Heat Action Protocol {selected.score >= 90 ? "Level 3" : "Level 2"}
            </div>
            <ul>
              <li>Open nearest cooling centre</li>
              <li>Restrict outdoor work 12:00–16:00</li>
              <li>Push regional public alert</li>
              <li>Increase ambulance readiness</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   RISK INTELLIGENCE (Explainable AI)
   ============================================================ */

const PIPELINE = [
  "Weather data", "Spatial processing", "Thermal stress calculation",
  "AI forecast model", "Vulnerability layer", "Human risk score", "Action recommendation",
];

function RiskIntelligence({ goTo }) {
  return (
    <div className="page">
      <div className="panel">
        <div className="panel-head"><span className="panel-title">AI risk engine pipeline</span></div>
        <div className="pipeline-row">
          {PIPELINE.map((step, i) => (
            <React.Fragment key={step}>
              <div className="pipeline-step">{step}</div>
              {i < PIPELINE.length - 1 && <ChevronRight size={16} className="flow-arrow" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Why is Ward 04 · Vatva HIGH RISK?</span>
          </div>
          <div className="explain-list">
            {EXPLAIN_FACTORS.map((f) => (
              <div className="explain-row" key={f.label}>
                <span className="explain-label">{f.label}</span>
                <div className="explain-bar-track">
                  <div className="explain-bar-fill" style={{ width: `${f.pct * 2.6}%` }} />
                </div>
                <span className="explain-pct">+{f.pct}%</span>
              </div>
            ))}
          </div>
          <div className="explain-result">
            <span>Thermal risk score</span>
            <strong>93/100</strong>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recommended response — Level 2</span>
            <button className="link-btn" onClick={() => goTo("alerts")}>Send alert <ChevronRight size={14} /></button>
          </div>
          <p className="panel-lede">
            Triggered because thermal stress is increasing, wind speed is declining,
            humidity is rising, and vulnerable-population exposure is high.
          </p>
          <ul className="reco-list">
            {ACTIONS_LEVEL2.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FORECAST
   ============================================================ */

const METRICS = [
  { key: "temp", label: "Temperature", unit: "°C", color: "#D9752E" },
  { key: "wbgt", label: "WBGT", unit: "°C", color: "#C9A227" },
  { key: "utci", label: "UTCI", unit: "°C", color: "#C1432A" },
  { key: "score", label: "Risk score", unit: "", color: "#3D8FA0" },
  { key: "exposure", label: "Population exposure", unit: "M", color: "#4F9E7A" },
];

function LiveWeatherPanel({ wx }) {
  const c = wx?.weather?.current;
  const hourly = nextHours(wx?.weather?.hourly, 12);
  const daily = nextDays(wx?.weather?.daily);

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="panel-title">Live weather — Open-Meteo</span>
        <span className="panel-note">
          {wx?.location ? wx.location.name : CITY}
          {wx?.stale ? " · showing cached data" : ""}
        </span>
      </div>

      {wx?.loading && !c && <p className="panel-lede">Fetching live conditions…</p>}
      {wx?.error && (
        <p className="panel-lede" style={{ color: "#C1432A" }}>
          {wx.error}{c ? " — showing last known values below." : ""}
        </p>
      )}

      {c && (
        <>
          <div className="live-stats-row">
            <div><span className="wd-label">Temperature</span><span className="wd-value">{c.temperature_2m.toFixed(1)}°C</span></div>
            <div><span className="wd-label">Feels like</span><span className="wd-value">{c.apparent_temperature.toFixed(1)}°C</span></div>
            <div><span className="wd-label">Humidity</span><span className="wd-value">{Math.round(c.relative_humidity_2m)}%</span></div>
            <div><span className="wd-label">Wind speed</span><span className="wd-value">{c.wind_speed_10m.toFixed(1)} m/s</span></div>
          </div>

          {hourly.length > 0 && (
            <>
              <div className="live-subhead">Next 12 hours — precipitation chance</div>
              <p className="panel-lede" style={{ marginBottom: 6 }}>
                Live hourly temperature is plotted in the timeline chart below (select the "Temperature" tab).
              </p>
              <div className="live-precip-row">
                {hourly.map((h) => (
                  <div className="live-precip-cell" key={h.label} title={`${h.precip ?? 0}% precipitation chance`}>
                    <div className="live-precip-bar" style={{ height: `${Math.max(4, (h.precip ?? 0))}%` }} />
                    <span>{h.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {daily.length > 0 && (
            <>
              <div className="live-subhead">7-day outlook</div>
              <div className="live-daily-row">
                {daily.map((d) => (
                  <div className="live-daily-cell" key={d.label}>
                    <span className="live-daily-day">{d.label}</span>
                    <span className="live-daily-max">{Math.round(d.max)}°</span>
                    <span className="live-daily-min">{Math.round(d.min)}°</span>
                    <span className="live-daily-precip">{Math.round(d.precip ?? 0)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ForecastView({ wx }) {
  const [metric, setMetric] = useState("score");
  const m = METRICS.find((x) => x.key === metric);

  // Weather API → real weather data. This is the ONLY metric backed by
  // live Open-Meteo data; wbgt/utci/score/exposure stay on the existing
  // heatwave-risk model (FORECAST_120H) — the risk layer is untouched.
  const liveHourly = nextHours(wx?.weather?.hourly, 24);
  const usingLive = metric === "temp" && liveHourly.length > 0;
  const chartData = usingLive ? liveHourly : FORECAST_120H;
  const xKey = usingLive ? "label" : "day";
  const yKey = usingLive ? "temp" : metric;

  return (
    <div className="page">
      <LiveWeatherPanel wx={wx} />

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">120-hour heat-risk timeline (risk model)</span>
          <span className="panel-note">
            {usingLive
              ? `Live hourly temperature — Open-Meteo${wx?.stale ? " (cached)" : ""}`
              : `AI predicts ${ESCALATION_PROB}% probability of escalation within 72 hours`}
          </span>
        </div>
        <div className="metric-tabs">
          {METRICS.map((x) => (
            <button
              key={x.key}
              className={`metric-tab ${metric === x.key ? "metric-tab--active" : ""}`}
              onClick={() => setMetric(x.key)}
            >
              {x.label}
            </button>
          ))}
        </div>
        {metric === "temp" && wx?.loading && !usingLive && (
          <p className="panel-lede">Loading live hourly temperature…</p>
        )}
        {metric === "temp" && wx?.error && !usingLive && (
          <p className="panel-lede" style={{ color: "#C1432A" }}>
            {wx.error} — showing risk-model estimate instead.
          </p>
        )}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#22262B" vertical={false} />
            <XAxis dataKey={xKey} stroke="#6B7480" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7480" fontSize={12} tickLine={false} axisLine={false} width={36} unit={m.unit} />
            <Tooltip contentStyle={{ background: "#14181D", border: "1px solid #262B31", borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine y={metric === "score" ? 90 : undefined} stroke="#8E2430" strokeDasharray="4 4" />
            <Line type="monotone" dataKey={yKey} stroke={m.color} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Daily risk escalation</span></div>
        <div className="timeline-row">
          {FORECAST_120H.map((d) => {
            const r = riskFromScore(d.score);
            return (
              <div className="timeline-day" key={d.day}>
                <div className="timeline-day-label">{d.day}</div>
                <div className="timeline-bar" style={{ background: r.color, height: `${30 + d.score}%` }} />
                <div className="timeline-day-score" style={{ color: r.color }}>{r.key}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VULNERABILITY
   ============================================================ */

function VulnerabilityView() {
  return (
    <div className="page">
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Who is most at risk</span></div>
        <div className="vuln-grid">
          {VULN_GROUPS.map((g) => (
            <div className="vuln-card" key={g.key}>
              <g.icon size={18} strokeWidth={1.6} />
              <div className="vuln-card-label">{g.key}</div>
              <div className="vuln-bar-track">
                <div className="vuln-bar-fill" style={{ width: `${g.score}%`, background: g.score > 80 ? "#C1432A" : g.score > 65 ? "#D9752E" : "#C9A227" }} />
              </div>
              <div className="vuln-card-score">{g.score}/100</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Vulnerability by ward</span></div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={WARDS} margin={{ left: -10 }}>
            <CartesianGrid stroke="#22262B" vertical={false} />
            <XAxis dataKey="id" stroke="#6B7480" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7480" fontSize={11} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ background: "#14181D", border: "1px solid #262B31", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => fmtNum(v)}
            />
            <Bar dataKey="vulnPop" radius={[4, 4, 0, 0]} fill="#D9752E" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel">
        <div className="panel-head"><span className="panel-title">Impact-risk formula</span></div>
        <div className="formula-row">
          <span className="formula-box">Thermal hazard</span>
          <span className="formula-op">×</span>
          <span className="formula-box">Human vulnerability</span>
          <span className="formula-op">=</span>
          <span className="formula-box formula-box--result">Impact risk</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   HEALTH RESPONSE
   ============================================================ */

function HealthView() {
  return (
    <div className="page">
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Predicted heat-related hospital load</span>
        </div>
        <p className="panel-lede muted">
          Model estimate based on simulated demo data — not a mortality prediction.
          Expressed as relative health-impact risk against baseline admissions.
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={HOSPITAL_LOAD}>
            <CartesianGrid stroke="#22262B" vertical={false} />
            <XAxis dataKey="period" stroke="#6B7480" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7480" fontSize={12} tickLine={false} axisLine={false} width={36} unit="%" />
            <Tooltip contentStyle={{ background: "#14181D", border: "1px solid #262B31", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]} fill="#3D8FA0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Facility readiness</span></div>
          <div className="health-stats">
            <div><span className="wd-label">ICU availability</span><span className="wd-value">62%</span></div>
            <div><span className="wd-label">Ambulance readiness</span><span className="wd-value">78%</span></div>
            <div><span className="wd-label">Active heat alerts</span><span className="wd-value">6</span></div>
            <div><span className="wd-label">Heat-related admissions (today)</span><span className="wd-value">+8%</span></div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Hospitals notified</span></div>
          <ul className="reco-list">
            <li>Naroda Civil Hospital — capacity brief sent</li>
            <li>Bapunagar Community Health Centre — capacity brief sent</li>
            <li>Vatva Primary Health Centre — ambulance surge requested</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COOLING CENTRES
   ============================================================ */

function CoolingCentresView() {
  return (
    <div className="page">
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Cooling centre network</span></div>
        <div className="cc-grid">
          {COOLING_CENTRES.map((c) => {
            const pct = Math.round((c.current / c.capacity) * 100);
            return (
              <div className="cc-card" key={c.id}>
                <div className="cc-head">
                  <span className="cc-id">Cooling Centre #{c.id}</span>
                  <span className={`cc-status cc-status--${c.status === "OPEN" ? "open" : "full"}`}>{c.status}</span>
                </div>
                <div className="cc-name">{c.name}</div>
                <div className="cc-occ-track">
                  <div className="cc-occ-fill" style={{ width: `${pct}%`, background: pct > 90 ? "#C1432A" : "#4F9E7A" }} />
                </div>
                <div className="cc-occ-label">{c.current} / {c.capacity} occupied</div>
                <div className="cc-meta">
                  <span><MapPin size={12} /> {c.distance} km</span>
                  <span>{c.water}</span>
                  <span>{c.power}</span>
                </div>
                <button className="btn btn--ghost btn--sm"><Navigation size={13} /> Navigate</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ALERT CENTRE
   ============================================================ */

function AlertCentreView() {
  const [ward, setWard] = useState(WARDS[0].id);
  const [lang, setLang] = useState("English");
  const [sent, setSent] = useState(null);
  const w = WARDS.find((x) => x.id === ward);
  const r = riskFromScore(w.score);

  const alertText = `${r.key} HEAT ALERT\n${w.name} is expected to experience dangerous thermal stress between 12:00 PM and 4:00 PM tomorrow.\n\nAvoid prolonged outdoor activity.\nStay hydrated.\nCheck on elderly residents and outdoor workers.\nCooling Centre: Community Hall, ${w.name} Sector 4.`;

  return (
    <div className="page">
      <div className="grid-2">
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Compose alert</span></div>
          <div className="form-grid">
            <label className="form-field">
              <span>Ward</span>
              <select value={ward} onChange={(e) => setWard(e.target.value)}>
                {WARDS.map((w2) => <option key={w2.id} value={w2.id}>{w2.name} — {w2.id}</option>)}
              </select>
            </label>
            <label className="form-field">
              <span>Language</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <div className="form-field">
              <span>Risk level</span>
              <RiskChip level={r.key} />
            </div>
          </div>
          <div className="alert-actions">
            <button className="btn btn--primary btn--sm" onClick={() => setSent("SMS")}>Send SMS</button>
            <button className="btn btn--primary btn--sm" onClick={() => setSent("WhatsApp")}>Send WhatsApp</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setSent("Public")}>Publish public alert</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setSent("Hospitals")}>Notify hospitals</button>
          </div>
          {sent && <div className="alert-sent">✓ {sent} dispatch simulated for {w.name} (demo — no live channel connected)</div>}
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">Preview — {lang}</span></div>
          <div className="alert-preview">
            {alertText.split("\n").map((line, i) => <p key={i}>{line || "\u00A0"}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCENARIO LAB
   ============================================================ */

function computeScenario(temp, hum, wind, solar) {
  const raw =
    (temp - 30) * 3.1 +
    (hum - 30) * 0.55 +
    (4 - wind) * 6.2 +
    (solar - 600) * 0.035;
  const score = Math.max(5, Math.min(100, Math.round(38 + raw)));
  const exposure = +(1.2 + (score - 50) * 0.018).toFixed(2);
  return { score, exposure: Math.max(0.4, exposure) };
}

function ScenarioLab() {
  const [temp, setTemp] = useState(42);
  const [hum, setHum] = useState(55);
  const [wind, setWind] = useState(2.1);
  const [solar, setSolar] = useState(780);

  const base = computeScenario(42, 55, 2.1, 780);
  const now = computeScenario(temp, hum, wind, solar);
  const r0 = riskFromScore(base.score);
  const r1 = riskFromScore(now.score);

  return (
    <div className="page">
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Heat scenario lab</span></div>
        <p className="panel-lede">Adjust conditions to see how thermal stress and exposure respond in real time.</p>

        <div className="scenario-sliders">
          {[
            { label: "Temperature", value: temp, set: setTemp, min: 30, max: 48, step: 0.1, unit: "°C", icon: Thermometer },
            { label: "Humidity", value: hum, set: setHum, min: 10, max: 95, step: 1, unit: "%", icon: Droplets },
            { label: "Wind speed", value: wind, set: setWind, min: 0.2, max: 8, step: 0.1, unit: " m/s", icon: Wind },
            { label: "Solar radiation", value: solar, set: setSolar, min: 400, max: 1000, step: 5, unit: " W/m²", icon: Sun },
          ].map((s) => (
            <div className="scenario-slider" key={s.label}>
              <div className="scenario-slider-head">
                <s.icon size={14} /> <span>{s.label}</span>
                <span className="scenario-slider-val">{s.value.toFixed(s.step < 1 ? 1 : 0)}{s.unit}</span>
              </div>
              <input
                type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                onChange={(e) => s.set(parseFloat(e.target.value))}
              />
            </div>
          ))}
        </div>

        <div className="scenario-result">
          <div className="scenario-result-col">
            <span className="wd-label">Baseline</span>
            <span className="scenario-result-score" style={{ color: r0.color }}>{base.score}</span>
            <RiskChip level={r0.key} />
          </div>
          <ArrowRight size={22} className="flow-arrow" />
          <div className="scenario-result-col">
            <span className="wd-label">Adjusted scenario</span>
            <span className="scenario-result-score" style={{ color: r1.color }}>{now.score}</span>
            <RiskChip level={r1.key} />
          </div>
          <div className="scenario-result-col">
            <span className="wd-label">Population exposed</span>
            <span className="scenario-result-score">{now.exposure.toFixed(2)}M</span>
            <span className="muted small">baseline {base.exposure.toFixed(2)}M</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   AI COPILOT
   ============================================================ */

function answerFor(q) {
  const s = q.toLowerCase();
  if (s.includes("tomorrow") || s.includes("risk") && s.includes("ward")) {
    const top = [...WARDS].sort((a, b) => b.score - a.score).slice(0, 3);
    return `Highest-risk wards for the next cycle: ${top.map((w) => `${w.name} (${w.score})`).join(", ")}. All three exceed the Level-2 activation threshold of 76.`;
  }
  if (s.includes("why") && s.includes("17")) {
    return `Ward 17 · Vastrapur is currently MODERATE, not a top concern. Did you mean Ward 04 (Vatva)? It's EXTREME due to +31% humidity, +22% low wind, and +18% solar load contribution.`;
  }
  if (s.includes("cooling")) {
    return `Recommend opening Cooling Centre #12 (Vatva, 500 capacity, 65% full) and #3 (Odhav, 260 capacity, 35% full). Avoid #7 and #19 — both are near full.`;
  }
  if (s.includes("humidity")) {
    return `A +10% humidity increase at current temperature would raise the city risk score from ${CITY_SCORE} to approximately ${Math.min(100, CITY_SCORE + 7)}, pushing 2–3 additional wards into EXTREME.`;
  }
  if (s.includes("outdoor") || s.includes("worker")) {
    return `Outdoor-worker restrictions are recommended in Vatva, Odhav, Naroda and Bapunagar — combined ~48,900 outdoor workers exposed above the HIGH threshold.`;
  }
  if (s.includes("72") || s.includes("next 72")) {
    return `Next 72 hours: risk escalates from HIGH to EXTREME with 81% confidence. Ward 04, 09, 11 and 15 cross the Level-3 threshold by hour 72.`;
  }
  return `Based on current thermal-stress data across ${CITY}, city-wide risk is ${CITY_RISK.key} (${CITY_SCORE}/100). Ask about a specific ward, cooling centres, or a forecast horizon for more detail.`;
}

const SUGGESTIONS = [
  "Which wards are most at risk tomorrow?",
  "Why is Ward 17 dangerous?",
  "Which cooling centres should we open?",
  "What happens if humidity increases by 10%?",
  "Which areas need outdoor-worker restrictions?",
  "Show me the highest-risk zones for the next 72 hours.",
];

function CopilotView() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Thermal Intelligence Copilot ready. City risk is currently ${CITY_RISK.key} across ${CITY}. Ask me about wards, forecasts, or response actions.` },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function send(q) {
    const text = (q ?? input).trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: answerFor(text) }]);
    setInput("");
  }

  return (
    <div className="page">
      <div className="panel copilot-panel">
        <div className="panel-head"><span className="panel-title">Thermal Intelligence Copilot</span></div>
        <div className="copilot-thread">
          {messages.map((m, i) => (
            <div key={i} className={`copilot-msg copilot-msg--${m.role}`}>
              {m.role === "assistant" && <Bot size={14} className="copilot-msg-icon" />}
              <div>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="copilot-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip-btn" onClick={() => send(s)}>{s}</button>
          ))}
        </div>
        <div className="copilot-input-row">
          <input
            placeholder="Ask about a ward, forecast, or response action…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn btn--primary btn--sm" onClick={() => send()}><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */

const TITLES = {
  command: "Heat Risk Command Center",
  map: "Heat Map",
  risk: "Risk Intelligence",
  forecast: "Forecast",
  vulnerability: "Vulnerability Intelligence",
  health: "Health Response",
  cooling: "Cooling Centres",
  alerts: "Smart Alert Center",
  scenario: "Heat Scenario Lab",
  copilot: "AI Copilot",
};

export default function ThermalX() {
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("command");
  const [navOpen, setNavOpen] = useState(false);
  const wx = useLiveWeather(DEFAULT_LOCATION.name);

  const view = useMemo(() => {
    switch (page) {
      case "command": return <CommandCenter goTo={setPage} wx={wx} />;
      case "map": return <HeatMapView />;
      case "risk": return <RiskIntelligence goTo={setPage} />;
      case "forecast": return <ForecastView wx={wx} />;
      case "vulnerability": return <VulnerabilityView />;
      case "health": return <HealthView />;
      case "cooling": return <CoolingCentresView />;
      case "alerts": return <AlertCentreView />;
      case "scenario": return <ScenarioLab />;
      case "copilot": return <CopilotView />;
      default: return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, wx.weather, wx.loading, wx.error, wx.location]);

  return (
    <div className="tx-root">
      <style>{CSS}</style>
      {!entered ? (
        <Landing onEnter={() => setEntered(true)} />
      ) : (
        <div className="app-shell">
          <Sidebar page={page} setPage={setPage} open={navOpen} setOpen={setNavOpen} />
          <div className="app-main">
            <TopBar title={TITLES[page]} setOpen={setNavOpen} wx={wx} />
            {view}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

.tx-root {
  --bg: #0B0E11;
  --panel: #14181D;
  --panel-2: #171C21;
  --border: #262B31;
  --text: #F1F4F6;
  --muted: #8B95A0;
  --accent: #3D8FA0;
  font-family: 'Inter', sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
}
.tx-root * { box-sizing: border-box; }
.tx-root h1, .tx-root h2, .tx-root h3 { font-family: 'Manrope', sans-serif; margin: 0; }
.tx-root button { font-family: inherit; cursor: pointer; }
.tx-root input, .tx-root select { font-family: inherit; }
.muted { color: var(--muted); }
.small { font-size: 11px; }
.accent { color: var(--accent); }

/* ---- Landing ---- */
.landing { min-height: 100vh; background: radial-gradient(circle at 15% 0%, #171E22 0%, #0B0E11 55%); padding: 28px 32px 60px; }
.landing-nav { display: flex; align-items: center; gap: 10px; margin-bottom: 56px; }
.landing-brand { font-family: 'Manrope', sans-serif; font-weight: 800; letter-spacing: 0.4px; font-size: 15px; }
.sb-mark { width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg, #D9752E, #8E2430); display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 13px; flex-shrink: 0; }
.landing-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; max-width: 1180px; margin: 0 auto; }
.eyebrow { color: var(--accent); font-size: 12.5px; font-weight: 600; margin-bottom: 18px; letter-spacing: 0.2px; }
.landing-hero-copy h1 { font-size: 44px; line-height: 1.12; font-weight: 800; letter-spacing: -0.5px; }
.landing-hero-copy p { color: var(--muted); font-size: 15.5px; line-height: 1.6; max-width: 480px; margin: 22px 0 30px; }
.landing-cta { display: flex; gap: 12px; flex-wrap: wrap; }
.btn { border-radius: 8px; border: 1px solid transparent; padding: 12px 20px; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; transition: transform .15s ease, background .15s ease; }
.btn--primary { background: linear-gradient(135deg, #D9752E, #C1432A); color: #fff; }
.btn--primary:hover { filter: brightness(1.08); }
.btn--ghost { background: transparent; border-color: var(--border); color: var(--text); }
.btn--ghost:hover { background: #1B2027; }
.btn--sm { padding: 8px 14px; font-size: 12.5px; }
.landing-hero-visual { background: var(--panel); border: 1px solid var(--border); border-radius: 14px; padding: 22px; }
.hv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.hv-cell { aspect-ratio: 1; border-radius: 6px; }
.hv-caption { margin-top: 14px; font-size: 11.5px; color: var(--muted); }
.landing-flow { max-width: 1180px; margin: 90px auto 0; border-top: 1px solid var(--border); padding-top: 40px; }
.flow-title { font-size: 12.5px; text-transform: none; color: var(--muted); font-weight: 600; margin-bottom: 18px; }
.flow-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 34px; }
.flow-step { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 10px 16px; font-size: 13.5px; font-weight: 600; }
.flow-arrow { color: var(--muted); flex-shrink: 0; }
.flow-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.flow-feature { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 13px; }
.flow-feature svg { color: var(--accent); flex-shrink: 0; }

/* ---- Shell ---- */
.app-shell { display: flex; min-height: 100vh; }
.sidebar { width: 234px; background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; position: sticky; top: 0; height: 100vh; }
.sb-brand { display: flex; align-items: center; gap: 10px; padding: 18px 16px; border-bottom: 1px solid var(--border); position: relative; }
.sb-name { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; letter-spacing: 0.3px; }
.sb-sub { font-size: 10.5px; color: var(--muted); margin-top: 1px; }
.sb-close { display: none; position: absolute; right: 12px; background: none; border: none; color: var(--muted); }
.sb-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.sb-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 7px; background: none; border: none; color: var(--muted); font-size: 13px; font-weight: 500; text-align: left; }
.sb-item:hover { background: #1B2027; color: var(--text); }
.sb-item--active { background: #1F2229; color: var(--text); }
.sb-item--active svg { color: #D9752E; }
.sb-item--disabled { opacity: 0.4; cursor: default; }
.sb-status { padding: 14px 16px; border-top: 1px solid var(--border); }
.sb-status-title { font-size: 10.5px; color: var(--muted); font-weight: 600; margin-bottom: 8px; }
.sb-status-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); padding: 3px 0; }
.sb-status-dot { width: 6px; height: 6px; border-radius: 50%; }
.sb-status-dot.ok { background: #4F9E7A; }
.sb-scrim { display: none; }

.app-main { flex: 1; min-width: 0; }
.topbar { display: flex; align-items: center; gap: 16px; padding: 18px 28px; border-bottom: 1px solid var(--border); }
.tb-menu { display: none; background: none; border: none; color: var(--text); }
.tb-eyebrow { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
.tb-title { font-size: 19px; font-weight: 800; letter-spacing: -0.2px; }
.tb-right { margin-left: auto; text-align: right; display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.tb-demo-tag { font-size: 10.5px; color: #C9A227; border: 1px solid #C9A22740; background: #C9A22712; padding: 3px 8px; border-radius: 5px; }
.tb-demo-tag--live { color: #4F9E7A; border-color: #4F9E7A40; background: #4F9E7A12; }
.tb-demo-tag--warn { color: #C1432A; border-color: #C1432A45; background: #C1432A14; }
.tb-error-detail { font-size: 10.5px; color: var(--muted); max-width: 340px; text-align: right; line-height: 1.4; margin-top: 4px; display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.tb-retry { background: none; border: 1px solid var(--border); color: #D9752E; border-radius: 5px; padding: 2px 8px; font-size: 10px; font-weight: 700; flex-shrink: 0; }
.tb-retry:hover { background: #D9752E14; }
.tb-updated { font-size: 11.5px; color: var(--muted); }
.tb-search { display: flex; gap: 6px; margin-left: 20px; flex-shrink: 0; }
.tb-search input { background: var(--panel-2); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 7px 10px; font-size: 12.5px; width: 150px; }
.tb-search input:focus { outline: none; border-color: #3D8FA0; }
.tb-search button { background: var(--panel-2); border: 1px solid var(--border); color: var(--muted); border-radius: 6px; padding: 7px 12px; font-size: 12px; font-weight: 600; }
.tb-search button:hover { color: var(--text); border-color: #D9752E55; }

/* ---- Live weather panel ---- */
.live-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.live-stats-row > div { display: flex; flex-direction: column; gap: 4px; }
.live-subhead { font-size: 11.5px; color: var(--muted); font-weight: 600; margin: 14px 0 8px; }
.live-precip-row { display: flex; align-items: flex-end; gap: 4px; height: 46px; margin-top: 8px; }
.live-precip-cell { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; }
.live-precip-cell span { font-size: 8.5px; color: var(--muted); }
.live-precip-bar { width: 100%; background: #3D8FA0; border-radius: 2px 2px 0 0; min-height: 3px; }
.live-daily-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.live-daily-cell { background: var(--panel-2); border: 1px solid var(--border); border-radius: 7px; padding: 8px 4px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.live-daily-day { font-size: 10.5px; color: var(--muted); font-weight: 600; }
.live-daily-max { font-size: 13px; font-weight: 800; font-family: 'Manrope', sans-serif; }
.live-daily-min { font-size: 11px; color: var(--muted); }
.live-daily-precip { font-size: 9.5px; color: #3D8FA0; }

.page { padding: 24px 28px 60px; display: flex; flex-direction: column; gap: 18px; max-width: 1320px; }

/* ---- Shared panel ---- */
.panel { background: var(--panel); border: 1px solid var(--border); border-radius: 10px; padding: 20px; }
.panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.panel-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14.5px; }
.panel-note { font-size: 11.5px; color: var(--muted); margin-left: auto; }
.panel-lede { font-size: 13px; color: var(--muted); line-height: 1.55; margin: 0 0 14px; }
.link-btn { background: none; border: none; color: var(--accent); font-size: 12.5px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; margin-left: auto; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }

/* ---- Risk chip ---- */
.risk-chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px; }
.risk-chip--lg { font-size: 15px; padding: 7px 14px; }
.risk-dot { width: 7px; height: 7px; border-radius: 50%; }

/* ---- Status strip ---- */
.status-strip { display: grid; grid-template-columns: 1.3fr repeat(5, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.status-block { background: var(--panel); padding: 16px 18px; }
.status-label { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
.status-value { font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 800; }
.status-value-sub { font-size: 11px; font-weight: 700; color: #C1432A; margin-left: 6px; vertical-align: middle; }

/* ---- Engine visual ---- */
.engine-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.engine-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex: 1; min-width: 220px; }
.engine-input { display: flex; align-items: center; gap: 9px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; }
.engine-input-label { font-size: 10.5px; color: var(--muted); }
.engine-input-value { font-size: 13.5px; font-weight: 700; }
.engine-arrow { color: var(--muted); flex-shrink: 0; }
.engine-human { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.engine-human-label { font-size: 10.5px; color: var(--muted); text-align: center; max-width: 90px; }
.engine-output { flex-shrink: 0; min-width: 150px; }
.engine-output-label { font-size: 10.5px; color: var(--muted); margin-bottom: 6px; }
.engine-scale { display: flex; gap: 3px; margin-bottom: 8px; }
.engine-scale-seg { flex: 1; height: 8px; border-radius: 3px; }
.engine-output-value { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 17px; color: #C1432A; }

/* ---- Comparison ---- */
.compare-row { display: flex; gap: 14px; margin-bottom: 16px; }
.compare-card { flex: 1; background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px 16px; }
.compare-name { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
.compare-temp { font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 8px; }
.compare-metrics { display: flex; gap: 12px; font-size: 12px; color: var(--muted); margin-bottom: 10px; }
.compare-metrics span { display: inline-flex; align-items: center; gap: 4px; }
.compare-footer { display: flex; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 12px; }
.compare-footer-item { display: flex; flex-direction: column; gap: 3px; }
.compare-footer-label { font-size: 11px; color: var(--muted); }
.compare-footer-value { font-size: 13px; font-weight: 700; }

/* ---- Recommendation ---- */
.reco-banner { display: flex; align-items: center; gap: 8px; background: #D9752E14; border: 1px solid #D9752E45; color: #D9752E; border-radius: 7px; padding: 10px 12px; font-weight: 700; font-size: 13px; margin-bottom: 12px; }
.reco-list { list-style: none; padding: 0; margin: 0 0 10px; display: flex; flex-direction: column; gap: 7px; }
.reco-list li { font-size: 12.5px; color: var(--text); padding-left: 16px; position: relative; }
.reco-list li::before { content: "✓"; position: absolute; left: 0; color: #4F9E7A; font-weight: 700; }

/* ---- Ward mini list ---- */
.ward-mini-list { display: flex; flex-direction: column; gap: 2px; }
.ward-mini-row { display: flex; align-items: center; gap: 10px; padding: 9px 6px; border-bottom: 1px solid var(--border); font-size: 12.5px; }
.ward-mini-row:last-child { border-bottom: none; }
.ward-mini-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.ward-mini-name { font-weight: 600; }
.ward-mini-id { color: var(--muted); font-size: 11px; }
.ward-mini-score { margin-left: auto; font-weight: 800; font-family: 'Manrope', sans-serif; }

/* ---- Heat map ---- */
.map-layout { display: grid; grid-template-columns: 1fr 220px; gap: 18px; }
.map-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
.map-cell { border: 1px solid transparent; border-radius: 8px; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; color: #fff; text-align: left; }
.map-cell--active { border-color: #fff; box-shadow: 0 0 0 2px #0B0E11, 0 0 0 3px #fff; }
.map-cell-id { font-size: 10px; opacity: 0.85; }
.map-cell-name { font-size: 13px; font-weight: 700; }
.map-cell-score { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; margin-top: 4px; }
.map-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; color: var(--muted); }
.map-legend-item { display: inline-flex; align-items: center; gap: 5px; }
.map-legend-dot { width: 7px; height: 7px; border-radius: 50%; }
.layer-list { display: flex; flex-direction: column; gap: 10px; }
.layer-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }
.layer-item input { accent-color: #D9752E; }
.ward-detail-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.ward-detail-grid > div { display: flex; flex-direction: column; gap: 4px; }
.wd-label { font-size: 10.5px; color: var(--muted); }
.wd-value { font-family: 'Manrope', sans-serif; font-size: 17px; font-weight: 800; }
.wd-action { background: #C1432A14; border: 1px solid #C1432A45; border-radius: 8px; padding: 12px 14px; }
.wd-action-title { display: flex; align-items: center; gap: 8px; color: #C1432A; font-weight: 700; font-size: 13px; margin-bottom: 8px; }
.wd-action ul { margin: 0; padding-left: 18px; font-size: 12.5px; color: var(--text); display: flex; flex-direction: column; gap: 4px; }

/* ---- Pipeline ---- */
.pipeline-row { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.pipeline-step { background: var(--panel-2); border: 1px solid var(--border); border-radius: 7px; padding: 9px 13px; font-size: 12px; font-weight: 600; }

/* ---- Explain ---- */
.explain-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.explain-row { display: flex; align-items: center; gap: 10px; }
.explain-label { font-size: 12px; width: 170px; flex-shrink: 0; color: var(--muted); }
.explain-bar-track { flex: 1; height: 7px; background: var(--panel-2); border-radius: 4px; overflow: hidden; }
.explain-bar-fill { height: 100%; background: linear-gradient(90deg, #D9752E, #C1432A); }
.explain-pct { font-size: 12px; font-weight: 700; width: 38px; text-align: right; }
.explain-result { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 12px; font-size: 13px; }
.explain-result strong { font-family: 'Manrope', sans-serif; font-size: 18px; color: #C1432A; }

/* ---- Forecast ---- */
.metric-tabs { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
.metric-tab { background: var(--panel-2); border: 1px solid var(--border); color: var(--muted); border-radius: 6px; padding: 7px 12px; font-size: 12px; font-weight: 600; }
.metric-tab--active { background: #D9752E1F; border-color: #D9752E55; color: #D9752E; }
.timeline-row { display: flex; align-items: flex-end; gap: 12px; height: 160px; }
.timeline-day { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px; height: 100%; }
.timeline-day-label { font-size: 11px; color: var(--muted); }
.timeline-bar { width: 100%; border-radius: 5px 5px 0 0; }
.timeline-day-score { font-size: 10px; font-weight: 700; }

/* ---- Vulnerability ---- */
.vuln-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.vuln-card { background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.vuln-card-label { font-size: 12.5px; font-weight: 600; }
.vuln-bar-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.vuln-bar-fill { height: 100%; }
.vuln-card-score { font-size: 11.5px; color: var(--muted); font-weight: 600; }
.formula-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.formula-box { background: var(--panel-2); border: 1px solid var(--border); border-radius: 7px; padding: 10px 16px; font-size: 13px; font-weight: 700; }
.formula-box--result { background: #D9752E1F; border-color: #D9752E55; color: #D9752E; }
.formula-op { color: var(--muted); font-weight: 700; }

/* ---- Health ---- */
.health-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.health-stats > div { display: flex; flex-direction: column; gap: 4px; }

/* ---- Cooling centres ---- */
.cc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.cc-card { background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.cc-head { display: flex; justify-content: space-between; align-items: center; }
.cc-id { font-size: 11px; color: var(--muted); font-weight: 600; }
.cc-status { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
.cc-status--open { background: #4F9E7A1F; color: #4F9E7A; }
.cc-status--full { background: #C1432A1F; color: #C1432A; }
.cc-name { font-size: 13px; font-weight: 700; }
.cc-occ-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.cc-occ-fill { height: 100%; }
.cc-occ-label { font-size: 11px; color: var(--muted); }
.cc-meta { display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: var(--muted); }
.cc-meta span { display: flex; align-items: center; gap: 5px; }

/* ---- Alert centre ---- */
.form-grid { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.form-field { display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: var(--muted); flex: 1; min-width: 140px; }
.form-field select { background: var(--panel-2); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 8px 10px; font-size: 13px; }
.alert-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.alert-sent { margin-top: 12px; font-size: 12px; color: #4F9E7A; background: #4F9E7A14; border: 1px solid #4F9E7A40; border-radius: 6px; padding: 8px 10px; }
.alert-preview { background: var(--panel-2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6; }
.alert-preview p { margin: 0 0 6px; }
.alert-preview p:first-child { font-weight: 800; color: #C1432A; }

/* ---- Scenario lab ---- */
.scenario-sliders { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px; margin-bottom: 22px; }
.scenario-slider-head { display: flex; align-items: center; gap: 7px; font-size: 12.5px; margin-bottom: 8px; }
.scenario-slider-val { margin-left: auto; font-weight: 700; }
.scenario-slider input[type="range"] { width: 100%; accent-color: #D9752E; }
.scenario-result { display: flex; align-items: center; gap: 22px; border-top: 1px solid var(--border); padding-top: 18px; flex-wrap: wrap; }
.scenario-result-col { display: flex; flex-direction: column; gap: 6px; }
.scenario-result-score { font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; }

/* ---- Copilot ---- */
.copilot-panel { display: flex; flex-direction: column; height: 560px; }
.copilot-thread { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 4px 2px 12px; }
.copilot-msg { display: flex; gap: 8px; font-size: 13px; line-height: 1.55; padding: 10px 13px; border-radius: 8px; max-width: 78%; }
.copilot-msg--assistant { background: var(--panel-2); border: 1px solid var(--border); align-self: flex-start; }
.copilot-msg-icon { color: #D9752E; margin-top: 2px; flex-shrink: 0; }
.copilot-msg--user { background: #3D8FA01F; border: 1px solid #3D8FA045; align-self: flex-end; }
.copilot-suggestions { display: flex; gap: 8px; flex-wrap: wrap; padding: 10px 0; border-top: 1px solid var(--border); }
.chip-btn { background: var(--panel-2); border: 1px solid var(--border); color: var(--muted); border-radius: 14px; padding: 6px 12px; font-size: 11.5px; }
.chip-btn:hover { color: var(--text); border-color: #D9752E55; }
.copilot-input-row { display: flex; gap: 8px; margin-top: 6px; }
.copilot-input-row input { flex: 1; background: var(--panel-2); border: 1px solid var(--border); color: var(--text); border-radius: 7px; padding: 10px 12px; font-size: 13px; }

/* ---- Responsive ---- */
@media (max-width: 980px) {
  .landing-hero { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
  .status-strip { grid-template-columns: repeat(2, 1fr); }
  .map-layout { grid-template-columns: 1fr; }
  .ward-detail-grid { grid-template-columns: repeat(2, 1fr); }
  .vuln-grid, .cc-grid { grid-template-columns: repeat(2, 1fr); }
  .flow-features { grid-template-columns: repeat(2, 1fr); }
  .tb-menu { display: block; }
  .tb-search { margin-left: 0; order: 3; width: 100%; margin-top: 10px; }
  .tb-search input { flex: 1; width: auto; }
  .topbar { flex-wrap: wrap; }
  .live-stats-row { grid-template-columns: repeat(2, 1fr); }
  .live-daily-row { grid-template-columns: repeat(4, 1fr); }
  .sidebar { position: fixed; left: -240px; z-index: 40; transition: left .2s ease; }
  .sidebar--open { left: 0; }
  .sb-close { display: block; }
  .sb-scrim { display: block; position: fixed; inset: 0; background: #000a; z-index: 30; }
}
@media (max-width: 620px) {
  .status-strip { grid-template-columns: 1fr 1fr; }
  .engine-row { flex-direction: column; align-items: stretch; }
  .engine-arrow { transform: rotate(90deg); align-self: center; }
  .compare-row { flex-direction: column; }
  .ward-detail-grid { grid-template-columns: 1fr 1fr; }
  .vuln-grid, .cc-grid { grid-template-columns: 1fr; }
  .scenario-sliders { grid-template-columns: 1fr; }
  .landing-hero-copy h1 { font-size: 32px; }
  .form-grid { flex-direction: column; }
  .live-stats-row { grid-template-columns: 1fr 1fr; }
  .live-daily-row { grid-template-columns: repeat(3, 1fr); }
}
`;
