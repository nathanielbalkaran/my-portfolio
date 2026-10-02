import { Room, rooms, Spot } from "./rooms";
import { Area, canStand, cell, center, entranceAt, Point, TILE, town, townArea, walkPath } from "./town";

export const VIEW = { width: 384, height: 256 };
export type Game = ReturnType<typeof createGame>;

export function createGame() {
  return {
    player: { ...town.spawn },
    camera: { x: 0, y: 0 },
    facing: "down" as "up" | "down" | "left" | "right",
    walking: false,
    stride: 0,
    path: [] as Point[],
    keys: new Set<string>(),
    room: null as Room | null,
    pending: null as Spot | null, // a spot the player is walking toward
    opened: null as Spot | null, // set when the player uses a spot; the UI consumes it
  };
}

const areaOf = (game: Game): Area => game.room ?? townArea;

function gap(p: Point, r: Spot) {
  const dx = Math.max(r.x * TILE - p.x, 0, p.x - (r.x + r.w) * TILE);
  const dy = Math.max(r.y * TILE - p.y, 0, p.y - (r.y + r.h) * TILE);
  return Math.hypot(dx, dy);
}

export function nearSpot(game: Game): Spot | undefined {
  return game.room?.spots.find(s => gap(game.player, s) < 20);
}

export function interact(game: Game) {
  game.opened = nearSpot(game) ?? null;
}

export function aim(game: Game, point: Point) {
  game.path = walkPath(areaOf(game), game.player, point);
  game.pending = game.room?.spots.find(s => point.x >= s.x * TILE && point.x < (s.x + s.w) * TILE && point.y >= s.y * TILE && point.y < (s.y + s.h) * TILE) ?? null;
  if (game.pending && nearSpot(game)) interact(game);
}

export function stop(game: Game) {
  game.keys.clear();
  game.path = [];
  game.pending = null;
  game.walking = false;
}

function moveTo(game: Game, room: Room | null, at: Point) {
  stop(game);
  game.room = room;
  game.player.x = at.x;
  game.player.y = at.y;
  game.facing = room ? "up" : "down";
}

function follow(game: Game, ease: number) {
  const area = areaOf(game);
  // Rooms smaller than the view are simply centered.
  const axis = (size: number, view: number, p: number) => size <= view ? (size - view) / 2 : Math.max(0, Math.min(size - view, p - view / 2));
  const targetX = axis(area.width * TILE, VIEW.width, game.player.x);
  const targetY = axis(area.height * TILE, VIEW.height, game.player.y);
  game.camera.x += (targetX - game.camera.x) * ease;
  game.camera.y += (targetY - game.camera.y) * ease;
}

export function update(game: Game, dt: number, snapCamera = false) {
  const area = areaOf(game);
  const keys = game.keys;
  let dx = Number(keys.has("d") || keys.has("arrowright")) - Number(keys.has("a") || keys.has("arrowleft"));
  let dy = Number(keys.has("s") || keys.has("arrowdown")) - Number(keys.has("w") || keys.has("arrowup"));
  const keyboard = dx !== 0 || dy !== 0;
  if (keyboard) { game.path = []; game.pending = null; }
  while (!keyboard && game.path.length) {
    const target = game.path[0];
    dx = target.x - game.player.x;
    dy = target.y - game.player.y;
    if (Math.hypot(dx, dy) > 0.1) break;
    game.path.shift();
    dx = dy = 0;
  }
  const distance = Math.hypot(dx, dy);
  const old = { ...game.player };
  if (distance > 0) {
    const step = keyboard ? 62 * dt : Math.min(62 * dt, distance);
    const mx = dx / distance * step;
    const my = dy / distance * step;
    const nextX = { x: game.player.x + mx, y: game.player.y };
    if (canStand(area, nextX)) game.player.x = nextX.x;
    const nextY = { x: game.player.x, y: game.player.y + my };
    if (canStand(area, nextY)) game.player.y = nextY.y;
    game.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  }
  game.walking = Math.hypot(old.x - game.player.x, old.y - game.player.y) > 0.01;
  if (game.walking) game.stride += dt * 9;
  else if (!keyboard && distance > 0) game.path = [];

  if (game.pending && !game.path.length) {
    if (nearSpot(game)) game.opened = game.pending;
    game.pending = null;
  }

  // Doors: walking up to a building's entrance goes in; the room's door tile comes out.
  let moved = false;
  if (!game.room) {
    const door = entranceAt(game.player);
    const room = door && rooms[door.id];
    if (door && room) { moveTo(game, room, room.spawn); moved = true; }
  } else {
    const here = cell(game.player);
    if (here.x === game.room.door.x && here.y === game.room.door.y) {
      const building = town.buildings.find(b => b.id === game.room!.id);
      if (building) { moveTo(game, null, center(building.exit)); moved = true; }
    }
  }

  follow(game, snapCamera || moved ? 1 : 1 - Math.exp(-dt * 9));
}
