export const TILE = 16;
export type Point = { x: number; y: number };
export type Building = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  roof: string;
  wall: string;
  entrance: { tile: Point; destination: string };
  exit: Point; // where the player stands after leaving the interior
};

// Tile coordinates and collision stay independent of the replaceable artwork.
export const town = {
  id: "mossbend",
  width: 38,
  height: 28,
  spawn: { x: 8.5 * TILE, y: 12.5 * TILE },
  buildings: [
    { id: "garage", label: "GARAGE", x: 5, y: 5, w: 7, h: 6, roof: "#597779", wall: "#d4c9a2", entrance: { tile: { x: 8, y: 11 }, destination: "garage-interior" }, exit: { x: 8, y: 12 } },
    { id: "work", label: "WORK", x: 25, y: 4, w: 8, h: 7, roof: "#ac7155", wall: "#e0ce9f", entrance: { tile: { x: 29, y: 11 }, destination: "work-interior" }, exit: { x: 29, y: 12 } },
    { id: "bike-shop", label: "BIKE SHOP", x: 24, y: 19, w: 9, h: 6, roof: "#6a6b93", wall: "#d2c5ae", entrance: { tile: { x: 28, y: 25 }, destination: "bike-shop-interior" }, exit: { x: 27, y: 25 } },
  ] satisfies Building[],
  pond: { x: 5, y: 21, w: 7, h: 5 },
  trees: [
    { x: 3, y: 4 }, { x: 14, y: 7 }, { x: 16, y: 5 },
    { x: 23, y: 7 }, { x: 35, y: 5 }, { x: 3, y: 12 },
    { x: 14, y: 22 }, { x: 16, y: 25 }, { x: 35, y: 21 },
    { x: 23, y: 25 }, { x: 34, y: 13 },
  ],
};

export const center = (p: Point): Point => ({ x: (p.x + 0.5) * TILE, y: (p.y + 0.5) * TILE });
export const cell = (p: Point): Point => ({ x: Math.floor(p.x / TILE), y: Math.floor(p.y / TILE) });

export function blocked(x: number, y: number): boolean {
  if (x < 2 || y < 2 || x >= town.width - 2 || y >= town.height - 2) return true;
  if (town.buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)) return true;
  const p = town.pond;
  return (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h)
    || town.trees.some(t => t.x === x && t.y === y);
}

// Anything the player can walk around in: the town or an interior.
export type Area = {
  id: string;
  width: number;
  height: number;
  blocked: (x: number, y: number) => boolean;
  goal?: (click: Point) => Point | undefined;
};

export const townArea: Area = {
  id: town.id,
  width: town.width,
  height: town.height,
  blocked,
  goal: click => town.buildings.find(b => click.x >= b.x * TILE && click.x < (b.x + b.w) * TILE && click.y >= b.y * TILE && click.y < (b.y + b.h) * TILE)?.entrance.tile,
};

export function canStand(area: Area, p: Point): boolean {
  // Feet, rather than the whole sprite, define the player's collision box.
  return [-4, 4].every(dx => [-4, 4].every(dy => !area.blocked(Math.floor((p.x + dx) / TILE), Math.floor((p.y + dy) / TILE))));
}

export function isPath(x: number, y: number): boolean {
  return (y >= 14 && y <= 17) || (x >= 18 && x <= 20)
    || (x === 8 && y >= 11 && y <= 14)
    || (x === 29 && y >= 11 && y <= 14)
    || (y === 25 && x >= 20 && x <= 28);
}

export function entranceAt(p: Point): Building | undefined {
  return town.buildings.find(b => Math.hypot(p.x - center(b.entrance.tile).x, p.y - center(b.entrance.tile).y) < 13);
}

// Breadth-first search is plenty for this little map. Blocked clicks resolve to
// the nearest reachable tile; building clicks resolve to their entrance.
export function walkPath(area: Area, from: Point, click: Point): Point[] {
  const start = cell(from);
  const goal = area.goal?.(click) ?? cell(click);
  const key = (p: Point) => p.y * area.width + p.x;
  const queue = [start];
  const parents = new Map<number, Point | null>([[key(start), null]]);
  let nearest = start;
  let best = Infinity;
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    const distance = (current.x - goal.x) ** 2 + (current.y - goal.y) ** 2;
    if (distance < best) { best = distance; nearest = current; }
    if (distance === 0) break;
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const next = { x: current.x + dx, y: current.y + dy };
      if (!area.blocked(next.x, next.y) && !parents.has(key(next))) {
        parents.set(key(next), current);
        queue.push(next);
      }
    }
  }
  const path = [];
  let cursor: Point | null = nearest;
  while (cursor) { path.push(center(cursor)); cursor = parents.get(key(cursor)) ?? null; }
  return path.reverse();
}
