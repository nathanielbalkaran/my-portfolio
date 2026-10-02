import { Area, center, Point } from "./town";

export type Rect = { x: number; y: number; w: number; h: number };
export type Spot = Rect & { id: "wheels" | "coffee" | "bike"; label: string };
export type Room = Area & {
  wallRows: number; // rows of back wall above the floor
  door: Point; // walking onto this tile leaves the room
  spawn: Point; // pixels
  solids: Rect[];
  spots: Spot[];
};

const inside = (r: Rect, x: number, y: number) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

function makeRoom(id: string, width: number, height: number, wallRows: number, doorX: number, solids: Rect[], spots: Spot[] = []): Room {
  return {
    id, width, height, wallRows, solids, spots,
    door: { x: doorX, y: height - 1 },
    spawn: center({ x: doorX, y: height - 2 }),
    blocked: (x, y) => x < 1 || x >= width - 1 || y < wallRows || y >= height
      || (y === height - 1 && x !== doorX)
      || solids.some(r => inside(r, x, y)),
  };
}

const wheelBench: Spot = { id: "wheels", label: "Wheel display", x: 1, y: 3, w: 6, h: 2 };

const coffeeStation: Spot = { id: "coffee", label: "Coffee station", x: 3, y: 4, w: 5, h: 1 };

const garageBike: Spot = { id: "bike", label: "Bike", x: 5, y: 3, w: 5, h: 1 };

export const rooms: Record<string, Room> = {
  // The counter runs from the left wall; the gap at its right end leads behind it.
  work: makeRoom("work", 14, 10, 4, 7, [{ x: 1, y: 6, w: 9, h: 1 }], [coffeeStation]),
  "bike-shop": makeRoom("bike-shop", 16, 11, 3, 8, [wheelBench, { x: 10, y: 3, w: 5, h: 2 }], [wheelBench]),
  garage: makeRoom("garage", 14, 10, 4, 7, [{ x: 1, y: 4, w: 2, h: 1 }, { x: 10, y: 4, w: 3, h: 1 }], [garageBike]),
};
