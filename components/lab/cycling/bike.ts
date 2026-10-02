// Layered bike renderer. Each part category is its own drawing layer that reads
// one slot of the loadout. Only `wheels` is swappable today; adding a category
// later means adding a loadout key, a small catalog, and reading it in its layer.

export type WheelId = "alloy-35" | "carbon-50" | "carbon-65";
export type Loadout = { wheels: WheelId };
export type Wheelset = {
  id: WheelId;
  name: string;
  price: number;
  depth: number; // rim band thickness in sprite pixels (exaggerated so depth reads at a glance)
  spokes: number;
  // Physical properties for Free Ride (internal; never shown as stats).
  mass: number; // kg for the pair
  cda: number; // m² for rider + bike with this wheelset
  crr: number; // rolling resistance coefficient
  rim: string; light: string; dark: string; spoke: string; hub: string;
  decal?: string;
};

export const wheelsets: Wheelset[] = [
  { id: "alloy-35", name: "35 mm alloy", price: 0, depth: 2, spokes: 14, mass: 1.95, cda: 0.340, crr: 0.0052, rim: "#a9b3b2", light: "#e1e7e2", dark: "#6f7b7b", spoke: "#cdd3cc", hub: "#c3cbc8" },
  { id: "carbon-50", name: "50 mm carbon", price: 400, depth: 4, spokes: 12, mass: 1.35, cda: 0.322, crr: 0.0046, rim: "#2b3135", light: "#56626a", dark: "#14181a", spoke: "#59636a", hub: "#4a545a", decal: "#c96f4a" },
  { id: "carbon-65", name: "65 mm carbon", price: 700, depth: 6, spokes: 10, mass: 1.85, cda: 0.312, crr: 0.0047, rim: "#2b3135", light: "#56626a", dark: "#14181a", spoke: "#59636a", hub: "#4a545a", decal: "#4f9ba4" },
];

export const starterLoadout: Loadout = { wheels: "alloy-35" };
export const wheelsetById = (id: WheelId) => wheelsets.find(w => w.id === id) ?? wheelsets[0];

export const BIKE = { width: 80, height: 42 };
const R = 15; // wheel radius, tire included

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];
type Shades = [body: string, light: string, dark: string];

function dot(c: Ctx, color: string, x: number, y: number, size = 1) {
  c.fillStyle = color;
  c.fillRect(Math.round(x), Math.round(y), size, size);
}

function line(c: Ctx, x0: number, y0: number, x1: number, y1: number, color: string, size = 1, yOff = 0) {
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  let err = dx + dy;
  for (;;) {
    dot(c, color, x0, y0 + yOff, size);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

// A tube is a dark underside, a body, and a one-pixel highlight along the polyline.
function tube(c: Ctx, pts: Pt[], size: number, [body, light, dark]: Shades) {
  const pass = (color: string, s: number, off: number) =>
    pts.slice(1).forEach((p, i) => line(c, pts[i][0], pts[i][1], p[0], p[1], color, s, off));
  pass(dark, size, 1);
  pass(body, size, 0);
  pass(light, 1, 0);
}

function disc(c: Ctx, cx: number, cy: number, r: number, color: string, inner = -1) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = Math.hypot(x, y);
    if (d <= r + 0.5 && d > inner) dot(c, color, cx + x, cy + y);
  }
}

function drawWheel(c: Ctx, cx: number, cy: number, w: Wheelset) {
  const rimOut = R - 2;
  const rimIn = rimOut - w.depth;
  for (let k = 0; k < w.spokes; k++) {
    const a = (k / w.spokes) * Math.PI * 2 + 0.2;
    line(c, cx + Math.round(Math.cos(a) * 2.5), cy + Math.round(Math.sin(a) * 2.5),
      cx + Math.round(Math.cos(a) * (rimIn + 1)), cy + Math.round(Math.sin(a) * (rimIn + 1)), w.spoke);
  }
  for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
    const d = Math.hypot(x, y);
    if (d > R + 0.5) continue;
    const lit = x + y < 0;
    if (d > rimOut + 0.5) {
      dot(c, d > R - 0.5 && lit ? "#4a5855" : "#2f3a3a", cx + x, cy + y); // tire
    } else if (d > rimIn + 0.5) {
      let color = w.rim;
      if (d > rimOut - 0.5) color = lit ? w.light : w.rim;
      else if (d <= rimIn + 1.5) color = w.dark;
      else if (w.decal && Math.floor((Math.atan2(y, x) + Math.PI) / (Math.PI * 2) * 16) % 4 === 0) color = w.decal;
      dot(c, color, cx + x, cy + y);
    }
  }
  disc(c, cx, cy, 2, w.hub);
  dot(c, "#20262a", cx, cy);
}

// Axle positions in sprite space; frame, fork and drivetrain are built around these.
const REAR = { x: 17, y: 25 };
const FRONT = { x: 62, y: 25 };
const BB = { x: 36, y: 28 };

const FRAME: Shades = ["#b4573f", "#d98b66", "#7a3a2f"];
const FORK: Shades = ["#2f383b", "#566366", "#171d1f"];
const BARS: Shades = ["#2a3033", "#4c565a", "#171b1d"];
const METAL: Shades = ["#9aa4a4", "#d3dad6", "#69726f"];
const CHAIN = "#4a5154";

type Layer = { id: string; draw: (c: Ctx, loadout: Loadout) => void };

// Back to front.
const layers: Layer[] = [
  {
    id: "wheels",
    draw: (c, l) => {
      const w = wheelsetById(l.wheels);
      drawWheel(c, REAR.x, REAR.y, w);
      drawWheel(c, FRONT.x, FRONT.y, w);
    },
  },
  {
    id: "drivetrain",
    draw: c => {
      disc(c, REAR.x, REAR.y, 4, "#59626a");
      disc(c, REAR.x, REAR.y, 2, "#8b9496");
      line(c, BB.x, 23, REAR.x, 21, CHAIN);
      line(c, BB.x, 33, 19, 31, CHAIN);
      line(c, 19, 31, REAR.x, 29, CHAIN);
      tube(c, [[16, 25], [17, 30]], 1, METAL);
      dot(c, "#2c3235", 16, 30, 3);
      disc(c, BB.x, BB.y, 5, "#a8b1b1", 4);
      disc(c, BB.x, BB.y, 3, "#6b7476");
      tube(c, [[BB.x, BB.y], [39, 35]], 2, METAL);
      line(c, 37, 36, 42, 36, "#252a2c", 2);
    },
  },
  {
    id: "frame",
    draw: c => {
      tube(c, [[BB.x, BB.y], [30, 11]], 2, FRAME); // seat tube
      tube(c, [[30, 11], [55, 10]], 2, FRAME); // top tube
      tube(c, [[57, 15], [BB.x, BB.y]], 2, FRAME); // down tube
      tube(c, [[55, 10], [57, 15]], 3, FRAME); // head tube
      tube(c, [[BB.x, BB.y], [REAR.x, REAR.y]], 1, FRAME); // chainstay
      tube(c, [[30, 13], [REAR.x, REAR.y]], 1, FRAME); // seatstay
      line(c, 49, 21, 45, 23, "#e9dcae"); // downtube decal
    },
  },
  {
    id: "fork",
    draw: c => {
      tube(c, [[57, 18], [60, 23], [FRONT.x, FRONT.y]], 2, FORK);
      dot(c, FORK[0], 56, 17, 4);
    },
  },
  {
    id: "cockpit",
    draw: c => {
      tube(c, [[55, 10], [54, 7]], 1, METAL); // steerer
      tube(c, [[54, 7], [59, 7]], 2, BARS); // stem
      tube(c, [[59, 7], [63, 6], [66, 8], [66, 11], [63, 13], [60, 13]], 2, BARS); // drop bar
      dot(c, BARS[1], 64, 5, 3); // hood
    },
  },
  {
    id: "saddle",
    draw: c => {
      tube(c, [[29, 5], [30, 11]], 1, METAL); // seatpost
      for (let x = 24; x <= 31; x++) dot(c, "#53585a", x, 3);
      for (let x = 23; x <= 36; x++) dot(c, "#34383a", x, 4);
      for (let x = 25; x <= 33; x++) dot(c, "#1d2123", x, 5);
    },
  },
];

const sprites = new Map<string, HTMLCanvasElement>();

function build(key: string, width: number, height: number, draw: (c: Ctx) => void) {
  let sprite = sprites.get(key);
  if (!sprite) {
    sprite = document.createElement("canvas");
    sprite.width = width;
    sprite.height = height;
    draw(sprite.getContext("2d")!);
    sprites.set(key, sprite);
  }
  return sprite;
}

export function bikeSprite(loadout: Loadout) {
  return build(`bike:${loadout.wheels}`, BIKE.width, BIKE.height, c => layers.forEach(l => l.draw(c, loadout)));
}

export function wheelSprite(id: WheelId) {
  return build(`wheel:${id}`, R * 2 + 1, R * 2 + 1, c => drawWheel(c, R, R, wheelsetById(id)));
}

export function drawBike(ctx: Ctx, loadout: Loadout, x: number, y: number, scale = 1) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(bikeSprite(loadout), Math.round(x), Math.round(y), BIKE.width * scale, BIKE.height * scale);
}
