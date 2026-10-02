import { WheelId, wheelsetById } from "./bike";
import { createRival, draftAmount, spawnRival, stepRival } from "./rival";
import { loadBest, saveBest } from "./save";
import { VIEW } from "./simulation";

// Free Ride: one quiet countryside road and a deliberately small riding model.
// World units are pixels; the model works in metres and seconds (PX_PER_M converts).
// Heading 0 faces up the screen and grows clockwise.

export const PX_PER_M = 8;
const LENGTH = 5750; // metres of authored road; a few more metres of straight tail follow
const TAIL = 40;
const START = 60; // metres of pre-roll behind the starting line
const HALF = 3.5; // normal paved half width, m
const GRAVEL = 4.6; // paved edge + shoulder; beyond this it is grass
const FENCE_LAT = 5.4;
const RAD = Math.PI / 180;

export type Pothole = { s: number; lat: number; r: number; severity: number; x: number; y: number };
export type Patch = { s0: number; s1: number; lat0: number; lat1: number };
export type ItemKind =
  | "tree" | "bush" | "rock" | "hay" | "barn" | "garage" | "cone" | "post" | "barrier"
  | "signUp" | "signDown" | "signLeft" | "signRight" | "signWork" | "signStart" | "signFinish" | "signSignal" | "signal" | "silo" | "deck" | "shelter" | "signRail";
export type Item = { kind: ItemKind; x: number; y: number; v: number };

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const smooth = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c); };
const wrap = (a: number) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));

// The route as a plan of [length m, turn degrees] pieces (positive turns right).
// Rhythm: calm road -> bends -> short climb -> dip into the Hill -> long climb ->
// long winding descent -> punchy climb -> open flat road -> tighter finish.
// Pieces of 46 m or less turning 56 degrees or more count as tight bends (they get a warning sign).
const PLAN: [number, number][] = [
  [260, 0], [180, 32], [55, -24], [55, 24], [120, 0], [160, -40], [130, 0], // start, sweeper, S-bend, sweeper
  [38, 64], [110, -34], [90, 0], [70, -28], [60, 24], [100, 0], [62, -12], // tight right, medium bends, lead-in
  [200, 20], [150, 0], [36, -62], [200, 26], [220, -20], [160, 30], [140, 0], [144, 15], // Mossbend Hill
  [90, 0], [160, -38], [100, 0], [46, 58], [70, -20], [70, 20], [100, 0], [40, -64], [70, 30], // the descent
  [134, 0], [120, 0], [190, 16], // run-out and the signal's straight
  [300, 0], [260, -16], [300, 8], [240, 0], // Mossbend Straight
  [120, -30], [50, 24], [50, -24], [40, 62], [120, -36], [100, 0], [90, -14], // tighter finish
];

// Climbs and descents: gradient as a fraction, eased in and out over up to 45 m.
const TERRAIN = [
  { at: 250, len: 110, g: 0.025 }, { at: 380, len: 110, g: -0.03 },
  { at: 560, len: 170, g: 0.045 }, // short climb
  { at: 760, len: 190, g: -0.04 }, { at: 960, len: 120, g: 0.02 },
  { at: 1090, len: 170, g: 0.05 }, { at: 1270, len: 170, g: -0.04 }, // climb, then a dip straight into the Hill
  { at: 1490, len: 1250, g: 0.064 }, // Mossbend Hill: a long, steady climb
  { at: 2760, len: 720, g: -0.055 }, // the long descent
  { at: 3480, len: 150, g: 0.05 }, // punchy climb out of it
  { at: 3900, len: 200, g: 0.008 }, { at: 4200, len: 250, g: -0.008 }, // Mossbend Straight: flat, barely rolling
  { at: 4600, len: 260, g: 0.01 }, { at: 4900, len: 150, g: -0.008 },
  { at: 5060, len: 150, g: 0.05 }, { at: 5230, len: 140, g: -0.045 }, { at: 5400, len: 110, g: 0.035 }, { at: 5520, len: 120, g: -0.03 },
];

// Timed segments: crossing `start` begins timing, crossing `end` stops it.
// Potholes and rough patches are kept out of them so time differences come from the bike.
export const SEGMENTS = [
  { id: "hill", name: "MOSSBEND HILL", start: 1490, end: 2740, finish: "TOP" },
  { id: "straight", name: "MOSSBEND STRAIGHT", start: 3930, end: 5030, finish: "FINISH" },
] as const;
const inSegment = (s: number, pad = 0) => SEGMENTS.some(g => s > g.start - pad && s < g.end + pad);

// One signal-controlled crossing on a straight stretch. The stop line sits just before it.
export const LIGHT = { s: 3680, stopS: 3675.8, from: 3620, to: 3740, reach: 7.6 };
const CYCLE = { green: 10, yellow: 3, red: 7 };
export function lightAt(time: number): "green" | "yellow" | "red" {
  const p = (time + 2) % (CYCLE.green + CYCLE.yellow + CYCLE.red);
  return p < CYCLE.green ? "green" : p < CYCLE.green + CYCLE.yellow ? "yellow" : "red";
}

// Road width changes. left/right are the usable lateral edges (m) while the change holds.
// margin is the gravel left beyond the pavement; pinches keep the normal closed lane.
const ROADS = [
  { kind: "pinch", at: 640, len: 55, left: -0.8, right: HALF },
  { kind: "bridge", at: 853, len: 22, left: -3, right: 3, taper: 3, margin: 0.4 },
  { kind: "lane", at: 1130, len: 150, left: -2.3, right: 2.3, margin: 0.6 }, // wooded lane
  { kind: "pinch", at: 2430, len: 55, left: -0.8, right: HALF },
  { kind: "wide", at: 4350, len: 450, left: -5, right: 5, taper: 40, margin: 1.1 }, // open road on the Straight
  { kind: "pinch", at: 5170, len: 40, left: -1.2, right: HALF }, // beside the bus shelter
] as { kind: "pinch" | "bridge" | "lane" | "wide"; at: number; len: number; left: number; right: number; taper?: number; margin?: number }[];
const nearRoadWork = (s: number, pad: number) => ROADS.some(w => s > w.at - pad - (w.taper ?? 14) && s < w.at + w.len + pad + (w.taper ?? 14));

// Landmarks that cross the road at a right angle are painted straight into the ground.
const CREEK_S = 864;
const RAIL_S = 1385;

// Fence runs: bit 1 = left side, bit 2 = right side.
const FENCES: [number, number, number][] = [
  [150, 400, 1], [470, 640, 2], [900, 1100, 3], [1330, 1440, 2], [1900, 2150, 1],
  [2300, 2560, 2], [2800, 2950, 1], [3500, 3600, 2], [3780, 3900, 3], [5060, 5160, 2],
];

function buildRoute() {
  const r = rng(1881);
  const n = LENGTH + TAIL + 1;

  // 1. Centerline, from the plan's per-metre curvature.
  const curv = new Float64Array(n);
  const bends: { s: number; len: number; dir: number }[] = [];
  let pos = 0;
  for (const [len, deg] of PLAN) {
    for (let i = pos; i < Math.min(n, pos + len); i++) curv[i] = deg * RAD / len;
    if (len <= 46 && Math.abs(deg) >= 56) bends.push({ s: pos, len, dir: Math.sign(deg) });
    pos += len;
  }
  const x = new Float64Array(n);
  const y = new Float64Array(n);
  const hd = new Float64Array(n);
  let h = 0;
  let px = 0;
  let py = 0;
  for (let i = 0; i < n; i++) {
    x[i] = px; y[i] = py; hd[i] = h;
    h += curv[i];
    px += Math.sin(h) * PX_PER_M;
    py -= Math.cos(h) * PX_PER_M;
  }
  const at = (s: number, lat = 0) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(s)));
    const d = (s - i) * PX_PER_M;
    return {
      x: x[i] + Math.sin(hd[i]) * d + Math.cos(hd[i]) * lat * PX_PER_M,
      y: y[i] - Math.cos(hd[i]) * d + Math.sin(hd[i]) * lat * PX_PER_M,
    };
  };

  // 2. Gradient and pavement edges.
  const grade = new Float64Array(n);
  for (const t of TERRAIN) {
    const ramp = Math.min(45, t.len / 2);
    for (let i = Math.floor(t.at); i <= Math.min(n - 1, t.at + t.len); i++) {
      grade[i] += t.g * Math.min(smooth((i - t.at) / ramp), smooth((t.at + t.len - i) / ramp));
    }
  }
  const edgeL = new Float64Array(n).fill(-HALF);
  const edgeR = new Float64Array(n).fill(HALF);
  const limL = new Float64Array(n).fill(GRAVEL); // how far the gravel shoulder reaches, m
  const limR = new Float64Array(n).fill(GRAVEL);
  const bridge = new Uint8Array(n);
  for (const w of ROADS) {
    const taper = w.taper ?? 14;
    for (let i = Math.max(0, Math.floor(w.at - taper)); i <= Math.min(n - 1, Math.ceil(w.at + w.len + taper)); i++) {
      const f = Math.min(smooth((i - w.at + taper) / taper), smooth((w.at + w.len + taper - i) / taper));
      edgeL[i] = -HALF + (w.left + HALF) * f;
      edgeR[i] = HALF + (w.right - HALF) * f;
      if (w.margin !== undefined) {
        limL[i] = GRAVEL + (-w.left + w.margin - GRAVEL) * f;
        limR[i] = GRAVEL + (w.right + w.margin - GRAVEL) * f;
      }
      if (w.kind === "bridge" && i >= w.at && i <= w.at + w.len) bridge[i] = 1;
    }
  }
  const nearBend = (s: number) => bends.some(b => s > b.s - 45 && s < b.s + b.len + 15);

  // 3. Hazards: sparse potholes (sometimes a short run) and rough patches, never in bends,
  // road works, the signal's straight or a timed segment.
  const clearRoad = (s: number, pad: number) => !nearRoadWork(s, 25) && !inSegment(s, pad) && !nearBend(s) && !(s > LIGHT.from - 20 && s < LIGHT.to + 20);
  const potholes: Pothole[] = [];
  for (let s = START + 160; s < LENGTH - 120;) {
    s += 160 + r() * 200;
    while (s < LENGTH - 120 && !clearRoad(s, 15)) s += 25; // slide past bends, road works and segments
    if (s >= LENGTH - 120) break;
    const count = r() < 0.2 ? 2 + (r() < 0.4 ? 1 : 0) : 1;
    let prev = 0;
    for (let c = 0; c < count; c++) {
      const ps = s + c * (5 + r() * 7);
      if (!clearRoad(ps, 15)) break;
      const i = Math.floor(ps);
      const lo = edgeL[i] + 0.9;
      const hi = edgeR[i] - 0.9;
      const raw = c === 0 ? (r() * 2 - 1) * 2.6 : (prev > 0 ? -1 : 1) * (0.6 + r() * 2);
      const lat = Math.min(hi, Math.max(lo, raw));
      prev = lat;
      potholes.push({ s: ps, lat, r: 0.55 + r() * 0.25, severity: 0.8 + r() * 0.4, ...at(ps, lat) });
    }
  }
  const patches: Patch[] = [];
  const rough = new Uint8Array(n);
  for (let s = START + 300; s < LENGTH - 150;) {
    s += 300 + r() * 220;
    const len = 14 + r() * 16;
    while (s < LENGTH - 150 && !(clearRoad(s, 40) && clearRoad(s + len, 40))) s += 25;
    if (s >= LENGTH - 150) break;
    const side = r();
    const patch: Patch = side < 0.35 ? { s0: s, s1: s + len, lat0: -HALF, lat1: HALF } : side < 0.68 ? { s0: s, s1: s + len, lat0: -HALF, lat1: 0.5 } : { s0: s, s1: s + len, lat0: -0.5, lat1: HALF };
    patches.push(patch);
    for (let i = Math.floor(patch.s0); i <= patch.s1; i++) rough[i] = patches.length;
  }

  // 4. Scenery, landmarks, signs and cones. Nothing here sits on the road.
  const fence = new Uint8Array(n);
  for (const [a, b, bits] of FENCES) for (let i = a; i <= b; i++) fence[i] |= bits;
  const grid = new Map<number, number[]>();
  const cellKey = (bx: number, by: number) => (bx + 2048) * 4096 + (by + 2048);
  for (let i = 0; i < n; i++) {
    const key = cellKey(Math.floor(x[i] / 64), Math.floor(y[i] / 64));
    (grid.get(key) ?? grid.set(key, []).get(key)!).push(i);
  }
  const roadDistance = (wx: number, wy: number) => {
    let best = Infinity;
    const bx = Math.floor(wx / 64);
    const by = Math.floor(wy / 64);
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (const i of grid.get(cellKey(bx + dx, by + dy)) ?? []) {
      best = Math.min(best, Math.hypot(x[i] - wx, y[i] - wy));
    }
    return best / PX_PER_M;
  };
  const items: Item[] = [];
  const place = (kind: ItemKind, s: number, lat: number, v = 0) => items.push({ kind, v, ...at(s, lat) });
  const placeFree = (kind: ItemKind, s: number, lat: number, v = 0) => {
    const p = at(s, lat);
    if (roadDistance(p.x, p.y) >= 6.4) items.push({ kind, v, ...p });
  };
  for (let s = 20; s < LENGTH + TAIL - 10; s += 24 + r() * 44) {
    if (r() < 0.25) continue;
    const side = r() < 0.5 ? -1 : 1;
    const lat = side * (6.6 + r() * 10);
    const roll = r();
    if (roll < 0.4) {
      placeFree("tree", s, lat);
      if (r() < 0.35) for (let c = 0; c < 2; c++) placeFree("tree", s + (r() - 0.5) * 9, lat + side * (1 + r() * 5));
    } else if (roll < 0.62) placeFree("bush", s, lat, Math.floor(r() * 3));
    else if (roll < 0.74) placeFree("rock", s, lat);
    else if (roll < 0.86) placeFree("hay", s, side * (7.5 + r() * 8));
    else placeFree("tree", s, lat);
  }
  // Landmarks: a farm, lone barns, the lookout at the top of the Hill, a bus shelter, the creek and level crossing.
  place("barn", 330, 15);
  place("silo", 322, 21);
  place("hay", 345, 10);
  place("hay", 352, 11.5);
  placeFree("barn", 1960, -14);
  placeFree("barn", 4120, 15);
  place("deck", 2700, -9.5);
  place("shelter", 5170, -6.8);
  place("signRail", RAIL_S - 8, 5.4);
  place("signRail", RAIL_S - 8, -5.4);
  place("bush", CREEK_S - 7, 6.5, 1);
  place("bush", CREEK_S + 8, -6.8, 0);
  for (const w of ROADS) {
    if (w.kind === "lane") for (let s = w.at - 10; s <= w.at + w.len + 10; s += 7) {
      place("tree", s + r() * 3, -4.7 - r() * 1.2);
      place("tree", s + 3 + r() * 3, 4.7 + r() * 1.2);
    }
    if (w.kind === "pinch") {
      place("signWork", w.at - 80, 5.4);
      for (let s = w.at - 14; s <= w.at + w.len + 14; s += 4) {
        const i = Math.round(s);
        if (edgeL[i] > -HALF + 0.1) place("cone", s, edgeL[i] - 0.2);
        if (edgeR[i] < HALF - 0.1) place("cone", s, edgeR[i] + 0.2);
      }
    }
  }
  place("garage", START + 4, -10.5);
  place("signSignal", LIGHT.s - 90, 5.4);
  place("signal", LIGHT.s + 3.8, 5.3);
  place("signal", LIGHT.s + 3.8, -5.3);
  for (const t of TERRAIN) if (Math.abs(t.g) >= 0.05 && t.len >= 150) place(t.g > 0 ? "signUp" : "signDown", t.at - 70, 5.4);
  for (const b of bends) place(b.dir > 0 ? "signRight" : "signLeft", b.s - 50, -b.dir * 5.4);
  SEGMENTS.forEach((g, k) => {
    for (const side of [-5.4, 5.4]) { place("signStart", g.start, side, k); place("signFinish", g.end, side, k); }
  });
  place("barrier", LENGTH - 2, 0);
  items.sort((a, b) => a.y - b.y);

  const crossings = [
    { kind: "creek" as const, ...at(CREEK_S), h: hd[CREEK_S] },
    { kind: "rail" as const, ...at(RAIL_S), h: hd[RAIL_S] },
  ];
  return { n, x, y, hd, grade, edgeL, edgeR, limL, limR, bridge, rough, patches, potholes, fence, items, crossings, at, grid, cellKey, startS: START, endS: LENGTH - 14 };
}

let cached: Route | null = null;
export type Route = ReturnType<typeof buildRoute>;
export const getRoute = () => cached ?? (cached = buildRoute());

// Nearest centerline sample to a world point (used by the ground painter).
export function nearest(route: Route, px: number, py: number): number {
  let best = -1;
  let bestD = 64 * 64;
  const bx = Math.floor(px / 64);
  const by = Math.floor(py / 64);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const list = route.grid.get(route.cellKey(bx + dx, by + dy));
    if (!list) continue;
    for (const i of list) {
      const d = (route.x[i] - px) ** 2 + (route.y[i] - py) ** 2;
      if (d < bestD) { bestD = d; best = i; }
    }
  }
  return best;
}

// Where is a point relative to the road? Searches near the previous index only.
function locate(route: Route, wx: number, wy: number, hint: number) {
  let best = hint;
  let bestD = Infinity;
  for (let i = Math.max(0, hint - 25); i <= Math.min(route.n - 1, hint + 25); i++) {
    const d = (route.x[i] - wx) ** 2 + (route.y[i] - wy) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  const dx = wx - route.x[best];
  const dy = wy - route.y[best];
  const h = route.hd[best];
  return { i: best, s: best + (dx * Math.sin(h) - dy * Math.cos(h)) / PX_PER_M, lat: (dx * Math.cos(h) + dy * Math.sin(h)) / PX_PER_M };
}

// 0 pavement, 1 gravel shoulder / closed lane, 2 grass.
const surfaceAt = (route: Route, i: number, lat: number): 0 | 1 | 2 =>
  (lat >= route.edgeL[i] && lat <= route.edgeR[i]) || (Math.abs(i - LIGHT.s) < 3 && Math.abs(lat) < LIGHT.reach) ? 0
    : (lat < 0 ? -lat <= route.limL[i] : lat <= route.limR[i]) ? 1 : 2;

export const FENCE_OFFSET = FENCE_LAT;
export const PAVED_HALF = HALF;

// --- Riding model ---------------------------------------------------------
// A small power-balance model. The rider produces power; that power turns into
// a driving force at the current speed and fights air drag, rolling resistance
// and the slope. What is left accelerates the bike.
// Holding W ramps the target power from easy (150 W) to maximum (400 W) over
// RAMP seconds; releasing W coasts. A separate energy reserve drains at hard
// power, holds steady near 240 W and refills when easing off. When it runs low
// the available maximum falls toward SUSTAIN, never to zero. Units: m, s, kg, W, N.
const RIDER_MASS = 72;
const BIKE_MASS = 8; // with the baseline 35 mm alloy wheels
const BASE_WHEEL_MASS = 1.95;
const AIR_DENSITY = 1.2;
const G = 9.81;
const DRIVE_EFFICIENCY = 0.975;
const EASY_POWER = 150;
const MAX_POWER = 400;
const SUSTAIN_POWER = 245; // the most the rider can hold with an empty reserve
const RAMP = 12; // seconds of holding W to climb from easy to maximum
const RELEASE = 4; // seconds for that ramp to fall back after releasing W
const SOFT_ENERGY = 0.3; // below this fraction of the reserve, the maximum starts to fall
const MAX_PUSH = 140; // N; limits the pull from a standstill, where P / v blows up
// Reserve change per second (of 100) at a given power: refills when coasting or
// easy, steady around 240 W, drains harder as power climbs.
const ENERGY_RATE: [number, number][] = [[0, 3.2], [100, 1.8], [150, 1.0], [200, 0.35], [240, 0], [275, -0.7], [350, -2.2], [400, -5]];
function energyRate(power: number) {
  for (let k = 1; k < ENERGY_RATE.length; k++) {
    const [p1, r1] = ENERGY_RATE[k];
    if (power <= p1) {
      const [p0, r0] = ENERGY_RATE[k - 1];
      return r0 + (r1 - r0) * (power - p0) / (p1 - p0);
    }
  }
  return ENERGY_RATE[ENERGY_RATE.length - 1][1];
}
export const powerCap = (energy: number) => SUSTAIN_POWER + (MAX_POWER - SUSTAIN_POWER) * smooth(energy / 100 / SOFT_ENERGY);
const BRAKE = 4.6; // m/s²
// Cornering grip (max lateral acceleration, m/s²) falls with speed, so a fast entry runs wide.
const GRIP_SLOW = 3.6;
const GRIP_FAST = 2.6;
const RIVAL_SPAWN_S = 700; // the rival joins the road ahead once the rider passes this
const MIN_RADIUS = 4.5;
const RECOVER = 0.55; // seconds of reduced steering after a pothole

export type Ride = ReturnType<typeof createRide>;

export function createRide(route: Route, wheels: WheelId) {
  const i = route.startS;
  const w = wheelsetById(wheels);
  const mass = RIDER_MASS + BIKE_MASS + (w.mass - BASE_WHEEL_MASS);
  const ride = {
    wheels,
    mass,
    massEff: mass + w.mass, // wheels count twice when speeding up (they spin)
    cda: w.cda,
    crr: w.crr,
    x: route.x[i], y: route.y[i], heading: route.hd[i],
    v: 0, steer: 0, power: 0, intensity: 0, energy: 100, pedalling: false,
    s: i, prevS: i, lat: 0, hint: i, grade: 0, surface: 0 as 0 | 1 | 2, rough: false,
    jolt: 0, recover: 0, wobbleDir: 1,
    hit: new Set<number>(),
    distance: 0, time: 0, top: 0, fade: 1, finished: false,
    slip: 0, draft: 0,
    rival: createRival(), rivalSpawned: false,
    segments: SEGMENTS.map(g => ({ active: false, done: false, t0: 0, best: loadBest(g.id), result: null as null | { time: number; pb: boolean; best: number | null; until: number } })),
    keys: new Set<string>(),
    taps: new Set<string>(),
    camera: { x: 0, y: 0 }, lookAngle: route.hd[i], lookDist: 40, shake: 0,
  };
  follow(route, ride, 0, true);
  return ride;
}

function follow(route: Route, ride: Ride, dt: number, snap = false) {
  const ahead = route.hd[Math.min(route.n - 1, Math.round(ride.s + 10 + ride.v * 0.8))];
  const bias = Math.max(-0.6, Math.min(0.6, wrap(ahead - ride.heading))) * 0.5;
  ride.lookAngle += wrap(ride.heading + bias - ride.lookAngle) * (snap ? 1 : 1 - Math.exp(-dt * 3));
  ride.lookDist += (40 + 22 * Math.min(1, ride.v / 14) - ride.lookDist) * (snap ? 1 : 1 - Math.exp(-dt * 2));
  ride.shake = Math.round(Math.sin(ride.time * 60) * 3 * ride.jolt);
  ride.camera.x = ride.x + Math.sin(ride.lookAngle) * ride.lookDist - VIEW.width / 2;
  ride.camera.y = ride.y - Math.cos(ride.lookAngle) * ride.lookDist - VIEW.height / 2;
}

// Segment timing: interpolates the exact crossing moment between frames.
function timeSegment(ride: Ride, dt: number) {
  const span = Math.max(1e-6, ride.s - ride.prevS);
  SEGMENTS.forEach((def, k) => {
    const seg = ride.segments[k];
    const crossed = (line: number) => ride.time - dt * (ride.s - line) / span;
    if (ride.s < def.start - 3) { seg.active = false; seg.done = false; }
    if (!seg.active && !seg.done && ride.prevS < def.start && ride.s >= def.start) {
      seg.active = true;
      seg.t0 = crossed(def.start);
    } else if (seg.active && ride.s >= def.end) {
      const time = crossed(def.end) - seg.t0;
      const pb = seg.best === null || time < seg.best;
      seg.result = { time, pb, best: pb ? null : seg.best, until: ride.time + 7 };
      if (pb) { seg.best = time; saveBest(def.id, time); }
      seg.active = false;
      seg.done = true;
    }
  });
}

export function stepRide(route: Route, ride: Ride, dt: number) {
  // A key counts if it is down now or was pressed and released since the last frame.
  const down = (...names: string[]) => names.some(n => ride.keys.has(n) || ride.taps.has(n));
  const brake = down("s", "arrowdown");
  const pedal = down("w", "arrowup") && !brake;
  const steerIn = Number(down("d", "arrowright")) - Number(down("a", "arrowleft"));
  ride.taps.clear();
  ride.time += dt;
  ride.fade = Math.max(0, ride.fade - dt * 1.8);
  ride.recover = Math.max(0, ride.recover - dt);
  ride.jolt = Math.max(0, ride.jolt - dt * 4);

  // Rider power: W ramps the target up (and a short release lets it fall back slowly, so a
  // quick lift keeps most of the effort); no W is coasting. The reserve limits the maximum.
  ride.intensity = Math.min(1, Math.max(0, ride.intensity + (pedal ? dt / RAMP : -dt / RELEASE)));
  const target = pedal ? Math.min(powerCap(ride.energy), EASY_POWER + (MAX_POWER - EASY_POWER) * ride.intensity) : 0;
  ride.power += (target - ride.power) * Math.min(1, dt * (target > ride.power ? 4 : 10));
  ride.pedalling = ride.power > 60;
  ride.energy = Math.min(100, Math.max(0, ride.energy + energyRate(ride.power) * dt));

  // The rival joins the road ahead, out of sight, once the rider has passed a point; it respects the red light.
  const light = lightAt(ride.time);
  const rival = ride.rival;
  if (!ride.rivalSpawned && ride.s > RIVAL_SPAWN_S && ride.v > 4) {
    spawnRival(route, rival, ride.s + 48, 8.5);
    ride.rivalSpawned = true;
  }
  if (rival.active) {
    stepRival(route, rival, dt, light === "red" ? LIGHT.stopS - 2 : null);
    if (rival.s < ride.s - 350 || rival.s > route.endS - 8) rival.active = false;
  }
  ride.draft += (draftAmount(route, ride, rival) - ride.draft) * Math.min(1, dt * 3);

  // Speed: power balance against drag (less when sitting in a draft), rolling resistance and the slope.
  const off = ride.surface === 1 ? 0.55 : ride.surface === 2 ? 1 : 0;
  let v = ride.v;
  const cos = 1 / Math.sqrt(1 + ride.grade * ride.grade);
  const slope = ride.grade * cos;
  const crr = ride.crr + (ride.surface === 1 ? 0.012 : ride.surface === 2 ? 0.03 : 0) + (ride.rough ? 0.02 : 0);
  const push = Math.min(MAX_PUSH, ride.power * DRIVE_EFFICIENCY / Math.max(v, 1));
  const drag = 0.5 * AIR_DENSITY * ride.cda * (1 - ride.draft) * v * v;
  const rolling = v > 0.05 ? crr * ride.mass * G * cos : 0;
  let a = (push - drag - rolling - ride.mass * G * slope) / ride.massEff;
  if (off) a -= off * (0.6 + 0.7 * Math.max(0, v - 2.5));
  a -= Math.abs(ride.slip) * v * 0.25; // sliding wide scrubs speed
  if (brake) a -= BRAKE;
  v = Math.min(22, Math.max(0, v + a * dt));

  // A red light is a stop line: speed is held to what can still stop at it.
  if (light === "red" && ride.s < LIGHT.stopS + 0.4) {
    const vmax = Math.sqrt(2 * 6 * Math.max(0, LIGHT.stopS - 0.3 - ride.s));
    if (v > vmax) v = Math.max(vmax, v - 12 * dt);
  }

  // Steering: the turn radius widens with speed (v²/grip); worse off the pavement, shaky after a pothole.
  ride.steer += (steerIn - ride.steer) * Math.min(1, dt * 7 / (1 + v * 0.05));
  let eff = ride.steer;
  if (off) eff = eff * (1 - 0.4 * off) + Math.sin(ride.time * 17) * 0.1 * off;
  if (ride.rough) eff += Math.sin(ride.time * 41) * 0.05;
  if (ride.recover > 0) {
    const t = ride.recover / RECOVER;
    eff = eff * (1 - 0.5 * t) + ride.wobbleDir * Math.sin(ride.time * 26) * 0.28 * t;
  }
  // Grip drops as speed rises (3.6 -> 2.6 m/s² between 7 and 16 m/s), so a fast entry runs wide.
  const grip = (GRIP_SLOW - (GRIP_SLOW - GRIP_FAST) * smooth((v - 7) / 9)) * (1 - 0.35 * off);
  const radius = Math.max(MIN_RADIUS, v * v / grip);
  ride.slip += (eff * 0.45 * smooth((v - 8) / 6) - ride.slip) * Math.min(1, dt * 5); // nose points in, bike slides out
  ride.heading += eff * v / radius * dt;
  ride.x += Math.sin(ride.heading) * v * PX_PER_M * dt;
  ride.y -= Math.cos(ride.heading) * v * PX_PER_M * dt;
  ride.v = v;
  ride.distance += v * dt;
  ride.top = Math.max(ride.top, v);

  // Where are we now?
  ride.prevS = ride.s;
  const loc = locate(route, ride.x, ride.y, ride.hint);
  ride.hint = loc.i;
  ride.s = loc.s;
  ride.lat = loc.lat;
  const j = Math.min(route.n - 1, Math.max(0, Math.round(loc.s)));
  ride.grade = route.grade[j];
  ride.surface = surfaceAt(route, j, loc.lat);
  const patch = route.rough[j] ? route.patches[route.rough[j] - 1] : null;
  ride.rough = !!patch && ride.surface === 0 && loc.lat >= patch.lat0 && loc.lat <= patch.lat1;
  if (light === "red" && ride.prevS < LIGHT.stopS - 0.3 && ride.s > LIGHT.stopS - 0.3) {
    const over = ride.s - (LIGHT.stopS - 0.3);
    ride.x -= Math.sin(ride.heading) * over * PX_PER_M;
    ride.y += Math.cos(ride.heading) * over * PX_PER_M;
    ride.s -= over;
    ride.v = 0;
  }
  timeSegment(ride, dt);

  // Potholes: a hit is the front wheel touching one; each can only be hit once.
  const fx = ride.x + Math.sin(ride.heading) * 4;
  const fy = ride.y - Math.cos(ride.heading) * 4;
  route.potholes.forEach((p, idx) => {
    if (ride.hit.has(idx) || Math.abs(p.s - ride.s) > 6) return;
    if (Math.hypot(p.x - fx, p.y - fy) > (p.r + 0.3) * PX_PER_M) return;
    ride.hit.add(idx);
    const loss = Math.min(12, Math.max(6, (4.5 + ride.v * 3.6 * 0.16) * p.severity)); // km/h
    ride.v = Math.max(ride.v * 0.4, ride.v - loss / 3.6);
    ride.recover = RECOVER;
    ride.jolt = 1;
    ride.wobbleDir = Math.random() < 0.5 ? -1 : 1;
  });

  if (ride.s >= route.endS) ride.finished = true;
  follow(route, ride, dt);
}
