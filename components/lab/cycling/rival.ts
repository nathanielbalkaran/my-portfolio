import type { Route } from "./freeride";

// One AI cyclist and the drafting rule. Kept apart from the player's model so
// later group riding can build on it: the rival rides the road by distance
// along it (`s`) and lateral offset (`lat`), with a small steady-power model.

const MASS = 82;
const CDA = 0.34;
const CRR = 0.0052;
const POWER = 200; // W, steady
const EFFICIENCY = 0.975;
const AIR_DENSITY = 1.2;
const G = 9.81;
const COAST_ABOVE = 12.5; // m/s; stops pedalling on fast descents
const CORNER_GRIP = 2.8; // m/s²; how hard the rival is willing to corner
const BRAKE = 3.5;

export type Rival = {
  active: boolean;
  s: number; lat: number; v: number;
  x: number; y: number; heading: number;
  stride: number;
};

export const createRival = (): Rival => ({ active: false, s: 0, lat: 1.0, v: 0, x: 0, y: 0, heading: 0, stride: 0 });

const wrap = (a: number) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));
const at = (route: Route, i: number) => Math.min(route.n - 1, Math.max(0, Math.round(i)));

function place(route: Route, rival: Rival) {
  const i = at(route, rival.s);
  const p = route.at(rival.s, rival.lat);
  rival.x = p.x;
  rival.y = p.y;
  rival.heading = route.hd[i];
}

export function spawnRival(route: Route, rival: Rival, s: number, v: number) {
  rival.active = true;
  rival.s = s;
  rival.v = v;
  rival.lat = 1.0;
  place(route, rival);
}

// `stopS` is the stop line of a red light ahead, or null.
export function stepRival(route: Route, rival: Rival, dt: number, stopS: number | null) {
  const i = at(route, rival.s);
  const grade = route.grade[i];
  const cos = 1 / Math.sqrt(1 + grade * grade);
  let v = rival.v;

  // Fastest speed that still lets the rival slow for the tightest bend ahead (and a red light).
  let cap = 30;
  for (let d = 0; d < 90; d += 3) {
    const j = at(route, rival.s + d);
    const curvature = Math.abs(wrap(route.hd[Math.min(route.n - 1, j + 1)] - route.hd[j]));
    if (curvature > 1e-4) cap = Math.min(cap, Math.sqrt(Math.sqrt(CORNER_GRIP / curvature) ** 2 + 2 * BRAKE * d * 0.8));
  }
  if (stopS !== null && rival.s < stopS) cap = Math.min(cap, Math.sqrt(2 * 5 * Math.max(0, stopS - rival.s)));

  const power = v > COAST_ABOVE || v > cap ? 0 : POWER;
  const push = Math.min(140, power * EFFICIENCY / Math.max(v, 1));
  const drag = 0.5 * AIR_DENSITY * CDA * v * v;
  const rolling = v > 0.05 ? CRR * MASS * G * cos : 0;
  let a = (push - drag - rolling - MASS * G * grade * cos) / (MASS + 2);
  if (v > cap) a = Math.min(a, -BRAKE);
  v = Math.max(0, v + a * dt);
  if (v > cap) v = Math.max(cap, v - 6 * dt);

  rival.v = v;
  rival.s += v * dt;
  rival.stride += v * dt * 0.7;
  // Rides on the right-hand side, clear of any pinched edge.
  const j = at(route, rival.s);
  const want = Math.min(route.edgeR[j] - 0.7, Math.max(route.edgeL[j] + 0.7, 1.0));
  rival.lat += (want - rival.lat) * Math.min(1, dt * 2);
  place(route, rival);
}

// Share of aerodynamic drag removed for a rider sitting behind the rival (0 when not drafting).
// Needs to be close behind, nearly in line, and pointing the same way.
export function draftAmount(route: Route, rider: { s: number; lat: number; v: number; heading: number }, rival: Rival): number {
  if (!rival.active || rider.v < 3) return 0;
  const gap = rival.s - rider.s - 1.8; // wheel to wheel, roughly
  const across = Math.abs(rival.lat - rider.lat);
  if (gap < -0.3 || gap > 9 || across > 1.1) return 0;
  if (Math.abs(wrap(rider.heading - route.hd[at(route, rival.s)])) > 0.5) return 0;
  return 0.3 * (1 - Math.min(Math.max(gap, 0), 9) / 9) * (1 - across / 1.1);
}
