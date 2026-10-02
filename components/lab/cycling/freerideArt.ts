import { label, rect, treeAt } from "./art";
import { WheelId, wheelsetById } from "./bike";
import {
  FENCE_OFFSET, Item, lightAt, LIGHT, nearest, PAVED_HALF, Pothole, PX_PER_M, Ride, Route, SEGMENTS,
} from "./freeride";
import { VIEW } from "./simulation";

// Original, temporary pixel art for Free Ride. The ground is painted lazily in
// chunks from the route; scenery and the rider are sprites sorted by their feet.

const CHUNK = 256;
const CELL = 2;
const chunks = new Map<string, { canvas: HTMLCanvasElement; cx: number; cy: number }>();

const hash = (a: number, b: number) => (Math.imul(a, 73856093) ^ Math.imul(b, 19349663)) >>> 0;

function field(px: number, py: number, h: number) {
  const patch = hash(Math.floor(px / 128), Math.floor(py / 96)) % 100;
  if (patch < 13) return (px >> 2) % 3 === 0 ? "#aaa66d" : "#b9b57c"; // dry crop rows
  const meadow = patch < 32;
  const s = h % 97;
  if (s < 4) return meadow ? "#6f8a56" : "#7f9961";
  if (s < 7) return "#a9bd7f";
  if (s === 9) return "#d7cda2";
  return meadow ? "#86a068" : "#91aa72";
}

// Position of a point in a crossing landmark's frame: u across the road, w along it (metres).
function band(c: Route["crossings"][number], px: number, py: number) {
  const dx = px - c.x;
  const dy = py - c.y;
  return { u: (dx * Math.cos(c.h) + dy * Math.sin(c.h)) / PX_PER_M, w: (dx * Math.sin(c.h) - dy * Math.cos(c.h)) / PX_PER_M };
}

// The level crossing's rails and sleepers, painted over anything at that spot.
function railAt(route: Route, px: number, py: number) {
  const c = route.crossings[1];
  const { u, w } = band(c, px, py);
  const aw = Math.abs(w);
  if (aw > 1.5 || Math.abs(u) > 70) return null;
  if (Math.abs(aw - 0.55) < 0.14) return "#aab0b0";
  if (aw < 0.95 && Math.floor(u * 2) % 2 === 0) return "#5e4a33";
  return "#8d8a7a";
}

// The creek, a gently wandering band that the bridge crosses.
function creekAt(route: Route, px: number, py: number, h: number) {
  const { u, w } = band(route.crossings[0], px, py);
  if (Math.abs(u) > 48) return null;
  const d = Math.abs(w - Math.sin(u * 0.3) * 0.6);
  if (d < 2.4) return h % 13 === 0 ? "#89aba8" : "#688e95";
  return d < 2.8 ? "#6d886c" : null;
}

function paint(route: Route, px: number, py: number, gx: number, gy: number) {
  const h = hash(gx, gy);
  const rail = railAt(route, px, py);
  if (rail) return rail;
  const i = nearest(route, px, py);
  const far = () => creekAt(route, px, py, h) ?? field(px, py, h);
  if (i < 0) return far();
  const dx = px - route.x[i];
  const dy = py - route.y[i];
  const hd = route.hd[i];
  const along = dx * Math.sin(hd) - dy * Math.cos(hd);
  if ((i === 0 && along < 0) || (i === route.n - 1 && along > 0)) return far();
  const lat = (dx * Math.cos(hd) + dy * Math.sin(hd)) / PX_PER_M;
  const s = i + along / PX_PER_M;
  const abs = Math.abs(lat);
  const side = lat < 0 ? 1 : 2;
  if (route.fence[i] & side && Math.abs(abs - FENCE_OFFSET) < 0.17) return s % 3 < 0.3 ? "#5e4a33" : "#b59d6c";
  const left = route.edgeL[i];
  const right = route.edgeR[i];
  if (lat >= left && lat <= right) {
    for (const g of SEGMENTS) {
      if (Math.abs(s - g.start) < 0.5) return "#f2ecd8";
      if (Math.abs(s - g.end) < 0.5) return (Math.floor(lat * 4) + Math.floor(s * 2)) & 1 ? "#26352f" : "#f2ecd8";
    }
    if (Math.abs(s - LIGHT.stopS) < 0.35) return "#f2ecd8";
    if (s > LIGHT.stopS + 0.6 && s < LIGHT.stopS + 1.3 && Math.floor(lat * 2) % 2 === 0) return "#e8e2c8";
    if (lat < left + 0.3 || lat > right - 0.3) return "#e8e2c8";
    const patch = route.rough[i] ? route.patches[route.rough[i] - 1] : null;
    if (patch && lat >= patch.lat0 && lat <= patch.lat1) {
      const c = h % 7;
      return c < 2 ? "#40454a" : c === 2 ? "#8d9396" : "#666c70";
    }
    if (abs < 0.14 && s % 8 < 4 && left === -PAVED_HALF && right === PAVED_HALF) return "#d8c46a";
    const g = route.grade[i];
    const base = g > 0.025 ? "#70767a" : g < -0.025 ? "#868c8e" : "#7b8286";
    const f = h % 29;
    return f === 0 ? "#8d9396" : f === 1 ? "#6b7175" : base;
  }
  if (route.bridge[i] && abs < (lat < 0 ? -left : right) + 0.4) return "#8a7a5a"; // parapet
  const creek = creekAt(route, px, py, h);
  if (creek) return creek;
  const ds = Math.abs(s - LIGHT.s);
  if (ds < 3 && abs < LIGHT.reach) return ds > 2.65 ? "#e8e2c8" : h % 29 === 0 ? "#8d9396" : "#7b8286";
  if (abs <= (lat < 0 ? route.limL[i] : route.limR[i])) return h % 5 === 0 ? "#a8996f" : "#bcab80";
  return field(px, py, h);
}

function chunk(route: Route, cx: number, cy: number) {
  const key = `${cx},${cy}`;
  let entry = chunks.get(key);
  if (!entry) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = CHUNK;
    const ctx = canvas.getContext("2d")!;
    const x0 = cx * CHUNK;
    const y0 = cy * CHUNK;
    for (let gy = 0; gy < CHUNK / CELL; gy++) for (let gx = 0; gx < CHUNK / CELL; gx++) {
      ctx.fillStyle = paint(route, x0 + gx * CELL + 1, y0 + gy * CELL + 1, Math.floor(x0 / CELL) + gx, Math.floor(y0 / CELL) + gy);
      ctx.fillRect(gx * CELL, gy * CELL, CELL, CELL);
    }
    entry = { canvas, cx, cy };
    chunks.set(key, entry);
  }
  return entry.canvas;
}

// --- Scenery ---------------------------------------------------------------

const ink = "#344b45";
let signalState: "green" | "yellow" | "red" = "green";
const shadow = "#53674b66";
const arrows: Record<string, string[]> = {
  signUp: ["00100", "01110", "10101", "00100", "00100"],
  signDown: ["00100", "00100", "10101", "01110", "00100"],
  signLeft: ["00100", "01000", "11111", "01000", "00100"],
  signRight: ["00100", "00010", "11111", "00010", "00100"],
  signWork: ["11111", "00000", "11111", "00000", "11111"],
  signSignal: ["01110", "01010", "01110", "01010", "01110"],
};

function sign(ctx: CanvasRenderingContext2D, x: number, y: number, kind: string) {
  rect(ctx, "#594f38", x - 1, y - 12, 2, 12);
  const color = kind === "signWork" ? "#d9803c" : "#e6c34f";
  for (let dy = 0; dy <= 12; dy++) {
    const half = 6 - Math.abs(dy - 6);
    rect(ctx, ink, x - half - 1, y - 26 + dy, half * 2 + 3, 1);
    rect(ctx, color, x - half, y - 26 + dy, half * 2 + 1, 1);
  }
  arrows[kind].forEach((row, dy) => [...row].forEach((c, dx) => { if (c === "1") rect(ctx, ink, x - 2 + dx, y - 22 + dy, 1, 1); }));
}

function drawItem(ctx: CanvasRenderingContext2D, item: Item) {
  const x = Math.round(item.x);
  const y = Math.round(item.y);
  switch (item.kind) {
    case "tree": treeAt(ctx, x, y); break;
    case "bush":
      rect(ctx, shadow, x - 8, y - 1, 16, 4);
      rect(ctx, "#3d6652", x - 8, y - 8, 16, 8);
      rect(ctx, "#507c59", x - 6, y - 10, 12, 6);
      rect(ctx, "#6c915f", x - 5, y - 9, 4, 3);
      if (item.v === 1) rect(ctx, "#d98b66", x + 2, y - 7, 2, 2);
      break;
    case "rock":
      rect(ctx, shadow, x - 7, y - 1, 14, 3);
      rect(ctx, "#78796b", x - 6, y - 5, 12, 6);
      rect(ctx, "#a4a590", x - 5, y - 6, 9, 4);
      rect(ctx, "#d0cfb2", x - 3, y - 6, 3, 1);
      break;
    case "hay":
      rect(ctx, shadow, x - 8, y - 1, 16, 4);
      rect(ctx, "#8f7a3f", x - 7, y - 9, 14, 10);
      rect(ctx, "#d2bd74", x - 6, y - 10, 12, 8);
      rect(ctx, "#b59f55", x - 4, y - 8, 8, 1);
      rect(ctx, "#b59f55", x - 3, y - 5, 6, 1);
      break;
    case "barn":
      rect(ctx, shadow, x - 25, y - 2, 52, 5);
      rect(ctx, ink, x - 22, y - 30, 44, 31);
      rect(ctx, "#a9523b", x - 20, y - 18, 40, 17);
      rect(ctx, "#7a3a2f", x - 20, y - 4, 40, 3);
      rect(ctx, "#e9dcae", x - 7, y - 15, 14, 14);
      rect(ctx, "#7a3a2f", x - 5, y - 13, 10, 12);
      rect(ctx, ink, x - 24, y - 36, 48, 20);
      rect(ctx, "#7e8a8a", x - 22, y - 35, 44, 16);
      rect(ctx, "#b4bfbb", x - 22, y - 35, 44, 2);
      for (let row = y - 30; row < y - 20; row += 5) rect(ctx, "#00000022", x - 22, row, 44, 1);
      break;
    case "garage":
      rect(ctx, shadow, x - 28, y - 2, 60, 5);
      rect(ctx, ink, x - 26, y - 30, 52, 31);
      rect(ctx, "#d4c9a2", x - 24, y - 20, 48, 19);
      rect(ctx, ink, x - 11, y - 18, 22, 17);
      rect(ctx, "#786849", x - 9, y - 16, 18, 15);
      rect(ctx, "#a48d62", x - 7, y - 14, 14, 6);
      rect(ctx, ink, x - 28, y - 38, 56, 22);
      rect(ctx, "#597779", x - 26, y - 37, 52, 18);
      rect(ctx, "#8ba5a0", x - 26, y - 37, 52, 2);
      label(ctx, "GARAGE", x - 12, y - 31);
      break;
    case "cone":
      rect(ctx, shadow, x - 3, y - 1, 7, 3);
      rect(ctx, "#d9803c", x - 2, y - 5, 5, 5);
      rect(ctx, "#d9803c", x - 1, y - 7, 3, 3);
      rect(ctx, "#f0e8cc", x - 1, y - 4, 3, 1);
      break;
    case "post":
      rect(ctx, shadow, x - 2, y - 1, 5, 3);
      rect(ctx, "#e8e2c8", x - 1, y - 7, 3, 7);
      rect(ctx, "#9c9a8a", x + 1, y - 7, 1, 7);
      rect(ctx, "#c4543a", x - 1, y - 6, 3, 1);
      break;
    case "barrier":
      for (let dx = -36; dx < 36; dx += 6) rect(ctx, (dx / 6) % 2 === 0 ? "#e8e2c8" : "#c4543a", x + dx, y - 11, 6, 5);
      rect(ctx, "#00000030", x - 36, y - 6, 72, 2);
      rect(ctx, "#594f38", x - 38, y - 12, 3, 12);
      rect(ctx, "#594f38", x + 35, y - 12, 3, 12);
      break;
    case "signal": {
      rect(ctx, shadow, x - 3, y - 1, 8, 3);
      rect(ctx, "#2a3033", x - 1, y - 12, 2, 12);
      rect(ctx, ink, x - 4, y - 32, 8, 20);
      const lamps: [string, string, string][] = [["red", "#e0503a", "#4a2c28"], ["yellow", "#e6c34f", "#4a4530"], ["green", "#6fcf6a", "#2c4430"]];
      lamps.forEach(([name, on, off], k) => {
        const lit = name === signalState;
        if (lit) rect(ctx, on + "55", x - 6, y - 31 + k * 6 - 1, 12, 8);
        rect(ctx, lit ? on : off, x - 2, y - 30 + k * 6, 4, 4);
      });
      break;
    }
    case "silo":
      rect(ctx, shadow, x - 11, y - 2, 24, 5);
      rect(ctx, ink, x - 10, y - 38, 20, 38);
      rect(ctx, "#c9c2a4", x - 8, y - 36, 16, 35);
      rect(ctx, "#e6dfc0", x - 7, y - 36, 4, 35);
      rect(ctx, "#a89f80", x + 4, y - 36, 4, 35);
      for (let row = y - 30; row < y - 4; row += 8) rect(ctx, "#00000022", x - 8, row, 16, 1);
      rect(ctx, ink, x - 9, y - 44, 18, 8);
      rect(ctx, "#7e8a8a", x - 7, y - 43, 14, 5);
      break;
    case "deck":
      rect(ctx, shadow, x - 20, y - 1, 42, 4);
      rect(ctx, "#5e4a33", x - 19, y - 14, 38, 14);
      rect(ctx, "#a98a5e", x - 17, y - 12, 34, 10);
      for (let col = x - 13; col < x + 17; col += 6) rect(ctx, "#8b6c48", col, y - 12, 1, 10);
      rect(ctx, "#594f38", x - 19, y - 20, 38, 3); // rail along the back
      rect(ctx, "#594f38", x - 19, y - 20, 3, 8);
      rect(ctx, "#594f38", x + 16, y - 20, 3, 8);
      rect(ctx, "#6e5638", x - 12, y - 8, 12, 3); // bench
      rect(ctx, ink, x + 6, y - 24, 3, 14); // viewer
      rect(ctx, "#8ba5a0", x + 4, y - 26, 7, 4);
      rect(ctx, ink, x - 14, y - 36, 30, 9);
      text(ctx, "LOOKOUT", x - 13, y - 34, 1, "#f2ecd8");
      break;
    case "shelter":
      rect(ctx, shadow, x - 14, y - 1, 30, 4);
      rect(ctx, "#594f38", x - 12, y - 14, 3, 14);
      rect(ctx, "#594f38", x + 10, y - 14, 3, 14);
      rect(ctx, "#a48d62", x - 10, y - 12, 20, 8);
      rect(ctx, "#6e5638", x - 8, y - 6, 16, 3);
      rect(ctx, ink, x - 15, y - 22, 31, 9);
      rect(ctx, "#597779", x - 14, y - 21, 29, 6);
      rect(ctx, "#8ba5a0", x - 14, y - 21, 29, 1);
      break;
    case "signRail":
      rect(ctx, "#594f38", x - 1, y - 12, 2, 12);
      for (let k = -6; k <= 6; k++) {
        rect(ctx, ink, x + k - 1, y - 20 + k - 1, 3, 3);
        rect(ctx, ink, x + k - 1, y - 20 - k - 1, 3, 3);
      }
      for (let k = -6; k <= 6; k++) {
        rect(ctx, "#f2ecd8", x + k, y - 20 + k, 1, 1);
        rect(ctx, "#f2ecd8", x + k, y - 20 - k, 1, 1);
      }
      break;
    case "signStart":
    case "signFinish": {
      const word = item.kind === "signStart" ? "START" : SEGMENTS[item.v].finish;
      rect(ctx, "#594f38", x - 1, y - 10, 2, 10);
      rect(ctx, ink, x - 12, y - 20, 25, 10);
      text(ctx, word, x - Math.floor((word.length * 4 - 1) / 2), y - 18, 1, "#f2ecd8");
      break;
    }
    default: sign(ctx, x, y, item.kind);
  }
}

function drawPothole(ctx: CanvasRenderingContext2D, p: Pothole) {
  const rx = Math.round(p.r * PX_PER_M * 1.15);
  const ry = Math.round(p.r * PX_PER_M * 0.9);
  const x = Math.round(p.x);
  const y = Math.round(p.y);
  for (let dy = -ry - 1; dy <= ry + 1; dy++) {
    const outer = Math.floor((rx + 1) * Math.sqrt(Math.max(0, 1 - (dy / (ry + 1)) ** 2)));
    const inner = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    rect(ctx, dy < 0 ? "#a2a8aa" : "#565c60", x - outer, y + dy, outer * 2 + 1, 1);
    if (Math.abs(dy) <= ry) rect(ctx, dy < -ry / 2 ? "#202426" : "#2d3235", x - inner, y + dy, inner * 2 + 1, 1);
  }
}

// --- Rider -----------------------------------------------------------------
// Top-down bike drawn facing up, then pre-rotated into 32 headings (nearest
// neighbour, so it stays crisp). The wheels use the equipped wheelset: rim
// width follows depth, and carbon rims are dark with their decal stripe.

const ANGLES = 32;
const SRC = { w: 16, h: 28, cx: 8, cy: 14 };
const rotated = new Map<string, { sprite: HTMLCanvasElement; shade: HTMLCanvasElement }>();

type Kit = { jersey: string; dark: string; light: string; helmet: string; helmetLight: string };
const PLAYER_KIT: Kit = { jersey: "#d9b34e", dark: "#b08f38", light: "#f0d98a", helmet: "#2f4a52", helmetLight: "#6c9aa0" };
const RIVAL_KIT: Kit = { jersey: "#4f7ea0", dark: "#37607c", light: "#8fb7cc", helmet: "#e4d9b6", helmetLight: "#ffffff" };

function baseBike(wheels: WheelId, frame: number, kit: Kit) {
  const canvas = document.createElement("canvas");
  canvas.width = SRC.w;
  canvas.height = SRC.h;
  const g = canvas.getContext("2d")!;
  const w = wheelsetById(wheels);
  const tireW = 3 + w.depth / 2;
  const x0 = 8 - Math.floor(tireW / 2);
  const wheel = (y0: number) => {
    for (let yy = 0; yy < 9; yy++) {
      const inset = yy === 0 || yy === 8 ? 1 : 0;
      for (let xx = inset; xx < tireW - inset; xx++) {
        const tire = xx === 0 || xx === tireW - 1 || yy === 0 || yy === 8;
        let color = "#2f3a3a";
        if (!tire) {
          color = xx === 1 ? w.light : w.rim;
          if (w.decal && xx === Math.floor(tireW / 2) && yy % 4 < 2) color = w.decal;
        }
        rect(g, color, x0 + xx, y0 + yy, 1, 1);
      }
    }
  };
  wheel(1);
  wheel(19);
  rect(g, "#2f383b", 8, 9, 1, 2);
  rect(g, "#7a3a2f", 6, 20, 1, 3);
  rect(g, "#7a3a2f", 10, 20, 1, 3);
  rect(g, "#b4573f", 7, 9, 2, 11);
  rect(g, "#d98b66", 7, 10, 1, 9);
  rect(g, "#1d2123", 7, 19, 2, 2);
  rect(g, "#2a3033", 3, 9, 10, 1);
  // legs: one forward, one back, swapping with `frame` while pedalling
  const left = 14 + (frame ? 2 : 0);
  const right = 14 + (frame ? 0 : 2);
  rect(g, "#303e47", 4, left, 2, 5);
  rect(g, "#e4d9b6", 4, left + 5, 2, 1);
  rect(g, "#303e47", 11, right, 2, 5);
  rect(g, "#e4d9b6", 11, right + 5, 2, 1);
  // jersey, arms, hands, helmet
  rect(g, kit.jersey, 4, 11, 8, 3);
  rect(g, kit.jersey, 5, 14, 6, 5);
  rect(g, kit.dark, 10, 12, 1, 6);
  rect(g, kit.light, 7, 13, 2, 4);
  rect(g, kit.jersey, 4, 10, 2, 2);
  rect(g, kit.jersey, 10, 10, 2, 2);
  rect(g, "#dcab78", 4, 9, 2, 1);
  rect(g, "#dcab78", 10, 9, 2, 1);
  rect(g, kit.helmet, 6, 10, 4, 4);
  rect(g, kit.helmetLight, 6, 10, 2, 1);
  return canvas;
}

function bikeSprite(wheels: WheelId, frame: number, angle: number, rival = false) {
  const idx = ((Math.round(angle / (Math.PI * 2) * ANGLES) % ANGLES) + ANGLES) % ANGLES;
  const key = `${rival ? "rival" : "rider"}:${wheels}:${frame}:${idx}`;
  let entry = rotated.get(key);
  if (!entry) {
    const size = 40;
    const src = baseBike(wheels, frame, rival ? RIVAL_KIT : PLAYER_KIT).getContext("2d")!.getImageData(0, 0, SRC.w, SRC.h);
    const out = new ImageData(size, size);
    const shade = new ImageData(size, size);
    const a = idx / ANGLES * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    for (let dy = 0; dy < size; dy++) for (let dx = 0; dx < size; dx++) {
      const rx = dx + 0.5 - size / 2;
      const ry = dy + 0.5 - size / 2;
      const sx = Math.floor(rx * cos + ry * sin + SRC.cx);
      const sy = Math.floor(-rx * sin + ry * cos + SRC.cy);
      if (sx < 0 || sy < 0 || sx >= SRC.w || sy >= SRC.h) continue;
      const from = (sy * SRC.w + sx) * 4;
      if (src.data[from + 3] === 0) continue;
      const to = (dy * size + dx) * 4;
      out.data.set(src.data.subarray(from, from + 4), to);
      shade.data.set([30, 45, 35, 70], to);
    }
    const make = (data: ImageData) => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      c.getContext("2d")!.putImageData(data, 0, 0);
      return c;
    };
    entry = { sprite: make(out), shade: make(shade) };
    rotated.set(key, entry);
  }
  return entry;
}

// --- HUD: speed, distance, time -------------------------------------------

const glyphs: Record<string, string> = {
  "0": "111101101101111", "1": "010110010010111", "2": "111001111100111", "3": "111001111001111",
  "4": "101101111001001", "5": "111100111001111", "6": "111100111101111", "7": "111001001010010",
  "8": "111101111101111", "9": "111101111001111", ":": "000010000010000", ".": "000000000000010",
  "/": "001001010100100", S: "111100111001111", P: "111101111100100", E: "111100110100111",
  D: "110101101101110", I: "111010010010111", T: "111010010010010", M: "101111111101101",
  K: "101101110101101", H: "101101111101101", A: "010101111101101", N: "110101101101101",
  C: "111100100100111", O: "111101101101111", B: "110101110101110", L: "100100100100111",
  R: "110101110101101", W: "101101101111101", Y: "101101010010010", "+": "000010111010000", "-": "000000111000000", "%": "101001010100101", U: "101101101101111", G: "111100101101111", F: "111100110100100",
};

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, scale: number, color: string) {
  ctx.fillStyle = color;
  [...value].forEach((ch, i) => {
    const glyph = glyphs[ch];
    if (!glyph) return;
    for (let k = 0; k < 15; k++) if (glyph[k] === "1") ctx.fillRect(x + (i * 4 + (k % 3)) * scale, y + Math.floor(k / 3) * scale, scale, scale);
  });
}

function hud(ctx: CanvasRenderingContext2D, ride: Ride) {
  const mins = Math.floor(ride.time / 60);
  const secs = Math.floor(ride.time % 60);
  const pct = ride.grade * 100;
  const grade = Math.abs(pct) < 0.05 ? "0.0" : `${pct > 0 ? "+" : "-"}${Math.abs(pct).toFixed(1)}`;
  const panels: [string, string, string, number][] = [
    ["SPEED", (ride.v * 3.6).toFixed(1), "KM/H", 62],
    ["POWER", String(Math.round(ride.power)), "W", 40],
    ["GRADE", grade, "%", 48],
    ["ENERGY", "", "", 48],
    ["DISTANCE", (ride.distance / 1000).toFixed(2), "KM", 52],
    ["TIME", `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`, "", 50],
  ];
  let x = 6;
  for (const [name, value, unit, width] of panels) {
    rect(ctx, "#26352fcc", x, 6, width, 25);
    text(ctx, name, x + 4, 9, 1, "#b9c4a4");
    if (name === "ENERGY") {
      // A plain bar; it only turns a muted amber when the reserve is nearly gone.
      rect(ctx, "#3d4a43", x + 4, 18, 40, 7);
      rect(ctx, ride.energy < 20 ? "#c9894a" : "#a9c47a", x + 4, 18, Math.round(40 * ride.energy / 100), 7);
    } else {
      text(ctx, value, x + 4, 17, 2, "#f2ecd8");
      if (unit) text(ctx, unit, x + 4 + (value.length * 4 + 1) * 2, 22, 1, "#b9c4a4");
    }
    x += width + 3;
  }
  segmentPanel(ctx, ride);
  signalChip(ctx, ride);
  if (ride.draft > 0.04) {
    rect(ctx, "#26352fcc", 6, 239, 25, 11);
    text(ctx, "DRAFT", 9, 242, 1, "#8fb7cc");
  }
}

// A small lamp and distance for the signal ahead, since it is further away than the view reaches.
function signalChip(ctx: CanvasRenderingContext2D, ride: Ride) {
  const d = LIGHT.stopS - ride.s;
  if (d < -2 || d > 220) return;
  const state = lightAt(ride.time);
  const label = `${Math.max(0, Math.round(d))}M`;
  const w = 30 + label.length * 4;
  const x = VIEW.width - 6 - w;
  rect(ctx, "#26352fcc", x, 35, w, 11);
  (["red", "yellow", "green"] as const).forEach((name, k) => {
    const on = { red: "#e0503a", yellow: "#e6c34f", green: "#6fcf6a" }[name];
    const off = { red: "#4a2c28", yellow: "#4a4530", green: "#2c4430" }[name];
    rect(ctx, state === name ? on : off, x + 4 + k * 6, 38, 4, 5);
  });
  text(ctx, label, x + 26, 38, 1, "#b9c4a4");
}

const stamp = (t: number) => `${Math.floor(t / 60)}:${(Math.floor(t % 60 * 10) / 10).toFixed(1).padStart(4, "0")}`;

// Timed segments: a small timer while on one, and a brief result after its finish line.
function segmentPanel(ctx: CanvasRenderingContext2D, ride: Ride) {
  SEGMENTS.forEach((def, k) => {
    const { active, t0, result } = ride.segments[k];
    const width = Math.max(60, def.name.length * 4 + 8);
    if (active) {
      rect(ctx, "#26352fcc", 6, 35, width, 22);
      text(ctx, def.name, 10, 38, 1, "#b9c4a4");
      text(ctx, stamp(ride.time - t0), 10, 46, 2, "#f2ecd8");
    } else if (result && ride.time < result.until) {
      rect(ctx, "#26352fcc", 6, 35, Math.max(78, width), 36);
      text(ctx, def.name, 10, 38, 1, "#b9c4a4");
      text(ctx, stamp(result.time), 10, 46, 2, "#f2ecd8");
      text(ctx, result.pb ? "PB" : `PB ${stamp(result.best ?? result.time)}`, 10, 60, 1, result.pb ? "#e6c34f" : "#b9c4a4");
    }
  });
}

// --- Frame -----------------------------------------------------------------

export function renderRide(ctx: CanvasRenderingContext2D, route: Route, ride: Ride) {
  ctx.imageSmoothingEnabled = false;
  signalState = lightAt(ride.time);
  const camX = Math.round(ride.camera.x);
  const camY = Math.round(ride.camera.y) + ride.shake;
  rect(ctx, "#91aa72", 0, 0, VIEW.width, VIEW.height);
  const cx0 = Math.floor(camX / CHUNK);
  const cy0 = Math.floor(camY / CHUNK);
  for (let cy = cy0; cy <= Math.floor((camY + VIEW.height - 1) / CHUNK); cy++) {
    for (let cx = cx0; cx <= Math.floor((camX + VIEW.width - 1) / CHUNK); cx++) ctx.drawImage(chunk(route, cx, cy), cx * CHUNK - camX, cy * CHUNK - camY);
  }
  if (chunks.size > 30) for (const [key, c] of chunks) if (Math.abs(c.cx - cx0) > 2 || Math.abs(c.cy - cy0) > 2) chunks.delete(key);

  ctx.save();
  ctx.translate(-camX, -camY);
  for (const p of route.potholes) {
    if (p.x > camX - 20 && p.x < camX + VIEW.width + 20 && p.y > camY - 20 && p.y < camY + VIEW.height + 20) drawPothole(ctx, p);
  }
  // Scenery in view, binary-searched by foot position, sorted together with the rider.
  let lo = 0;
  let hi = route.items.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (route.items[mid].y < camY - 6) lo = mid + 1; else hi = mid;
  }
  const draws: { y: number; draw: () => void }[] = [];
  for (let i = lo; i < route.items.length && route.items[i].y < camY + VIEW.height + 40; i++) {
    const item = route.items[i];
    if (item.x > camX - 50 && item.x < camX + VIEW.width + 50) draws.push({ y: item.y, draw: () => drawItem(ctx, item) });
  }
  const rival = ride.rival;
  if (rival.active && rival.x > camX - 40 && rival.x < camX + VIEW.width + 40 && rival.y > camY - 40 && rival.y < camY + VIEW.height + 40) {
    draws.push({
      y: rival.y,
      draw: () => {
        const { sprite, shade } = bikeSprite("carbon-50", rival.v > 12.5 ? 0 : Math.floor(rival.stride) % 2, rival.heading, true);
        ctx.drawImage(shade, Math.round(rival.x) - 18, Math.round(rival.y) - 18);
        ctx.drawImage(sprite, Math.round(rival.x) - 20, Math.round(rival.y) - 20);
      },
    });
  }
  draws.push({
    y: ride.y,
    draw: () => {
      const t = ride.time;
      const wobble = ride.recover > 0 ? ride.wobbleDir * Math.sin(t * 26) * 0.3 * (ride.recover / 0.55) : 0;
      const frame = ride.pedalling ? Math.floor(ride.distance * 1.4) % 2 : 0;
      const { sprite, shade } = bikeSprite(ride.wheels, frame, ride.heading + ride.slip * 0.8 + wobble);
      const buzz = ride.rough && ride.v > 0.5 ? Math.round(Math.sin(t * 70)) : 0;
      const jx = ride.recover > 0 ? Math.round(Math.sin(t * 40) * 1.5 * (ride.recover / 0.55)) : 0;
      const x = Math.round(ride.x) - 20 + jx;
      const y = Math.round(ride.y) - 20 + buzz;
      ctx.drawImage(shade, x + 2, y + 2);
      ctx.drawImage(sprite, x, y);
    },
  });
  draws.sort((a, b) => a.y - b.y).forEach(d => d.draw());
  ctx.restore();
  hud(ctx, ride);
  if (ride.fade > 0) {
    ctx.fillStyle = `rgba(38, 53, 47, ${ride.fade})`;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
}
