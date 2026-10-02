import { label, player, rect } from "./art";
import { BIKE, drawBike, Loadout, wheelSprite, wheelsets } from "./bike";
import { Room } from "./rooms";
import { Game, VIEW } from "./simulation";
import { TILE } from "./town";

const ink = "#344b45";

function shell(ctx: CanvasRenderingContext2D, room: Room, wall: string, floor: string, floorLine: string) {
  const w = room.width * TILE;
  const h = room.height * TILE;
  const wallH = room.wallRows * TILE;
  rect(ctx, floor, 0, wallH, w, h - wallH);
  for (let y = wallH; y < h; y += TILE) for (let x = 0; x < w; x += TILE) {
    const seed = (x * 7 + y * 13) % 11;
    rect(ctx, floorLine, x, y, TILE, 1);
    if ((x / TILE + y / TILE) % 2 === 0) rect(ctx, floorLine, x + seed, y + 4 + seed % 6, 3, 1);
  }
  rect(ctx, wall, 0, 0, w, wallH);
  for (let y = 9; y < wallH - 4; y += 9) rect(ctx, "#00000012", 0, y, w, 1);
  rect(ctx, ink, 0, wallH - 4, w, 4);
  rect(ctx, "#00000022", 0, wallH, w, 3);
  // Side walls and the front wall, with a gap for the door.
  rect(ctx, ink, 0, 0, TILE, h);
  rect(ctx, ink, w - TILE, 0, TILE, h);
  rect(ctx, ink, 0, h - TILE, w, TILE);
  const doorX = room.door.x * TILE;
  rect(ctx, "#d9cf9f", doorX, h - TILE, TILE, TILE);
  rect(ctx, "#786849", doorX + 1, h - TILE + 4, TILE - 2, 8);
  rect(ctx, "#a48d62", doorX + 3, h - TILE + 6, TILE - 6, 4);
}

function windowPane(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  rect(ctx, ink, x, y, w, h);
  rect(ctx, "#739696", x + 2, y + 2, w - 4, h - 4);
  rect(ctx, "#bacdb7", x + 3, y + 3, 4, 6);
  rect(ctx, ink, x + Math.floor(w / 2) - 1, y + 2, 2, h - 4);
  rect(ctx, "#e2d5ae", x - 2, y + h, w + 4, 2);
}

function shopBackdrop(ctx: CanvasRenderingContext2D, room: Room) {
  shell(ctx, room, "#d2c5ae", "#c2ac80", "#b39d72");
  // Rug
  rect(ctx, "#5d5e83", 88, 104, 80, 40);
  rect(ctx, "#8e8fb0", 91, 107, 74, 34);
  rect(ctx, "#6a6b93", 95, 111, 66, 26);
  // Wheel display: the three wheelsets hang above a bench, shallow to deep.
  wheelsets.forEach((w, i) => {
    const x = 18 + i * 32;
    rect(ctx, ink, x + 14, 8, 3, 4);
    ctx.drawImage(wheelSprite(w.id), x, 12);
  });
  rect(ctx, "#a98a5e", 16, 50, 96, 4);
  rect(ctx, "#8b6c48", 16, 54, 96, 3);
  rect(ctx, "#6e5638", 16, 57, 96, 23);
  rect(ctx, "#5a452d", 16, 77, 96, 3);
  rect(ctx, ink, 50, 62, 30, 9);
  label(ctx, "WHEELS", 53, 64);
  // Window and sign
  windowPane(ctx, 124, 8, 32, 28);
  rect(ctx, ink, 172, 10, 44, 11);
  label(ctx, "BIKE SHOP", 176, 13);
  // Counter and register
  rect(ctx, "#e0d4ad", 160, 51, 80, 5);
  rect(ctx, "#6a6b93", 160, 56, 80, 24);
  rect(ctx, "#565778", 160, 74, 80, 6);
  rect(ctx, ink, 214, 38, 16, 13);
  rect(ctx, "#a9c4a8", 217, 40, 10, 5);
  rect(ctx, "#c9bd96", 212, 45, 20, 6);
}

function garageBackdrop(ctx: CanvasRenderingContext2D, room: Room) {
  shell(ctx, room, "#d4c9a2", "#a9aca0", "#9ea195");
  // Oil stain
  rect(ctx, "#8d9086", 88, 112, 36, 14);
  rect(ctx, "#8d9086", 96, 108, 20, 22);
  // Pegboard behind the bike, with a shelf under the wheels
  rect(ctx, "#8f7c55", 60, 7, 104, 54);
  rect(ctx, "#a8946a", 62, 9, 100, 50);
  for (let y = 13; y < 57; y += 6) for (let x = 66; x < 160; x += 6) rect(ctx, "#8f7c55", x, y, 1, 1);
  rect(ctx, "#4a3f2d", 72, 54, 80, 3);
  rect(ctx, "#4a3f2d", 86, 57, 3, 3);
  rect(ctx, "#4a3f2d", 135, 57, 3, 3);
  windowPane(ctx, 172, 12, 28, 26);
  // Toolbox
  rect(ctx, "#7a3a2f", 16, 63, 32, 17);
  rect(ctx, "#a9523b", 16, 60, 32, 6);
  rect(ctx, "#d98b66", 16, 60, 32, 1);
  rect(ctx, "#2a3033", 28, 58, 8, 2);
  rect(ctx, "#2a3033", 16, 69, 32, 1);
  // Workbench
  rect(ctx, "#a98a5e", 160, 60, 48, 4);
  rect(ctx, "#8b6c48", 160, 64, 48, 3);
  rect(ctx, "#5e4a33", 160, 67, 48, 13);
  rect(ctx, ink, 166, 54, 6, 6);
  rect(ctx, "#bb997c", 190, 52, 8, 8);
}

function cafeBackdrop(ctx: CanvasRenderingContext2D, room: Room) {
  shell(ctx, room, "#e0ce9f", "#c9b28a", "#b89f77");
  windowPane(ctx, 28, 8, 32, 28);
  rect(ctx, ink, 156, 10, 34, 11);
  label(ctx, "COFFEE", 160, 13);
  // Shelf of cups
  rect(ctx, "#8b6c48", 140, 36, 40, 3);
  [["#e9e0c4", 144], ["#a9c4a8", 154], ["#e9e0c4", 164], ["#d98b66", 172]].forEach(([c, x]) => {
    rect(ctx, c as string, x as number, 30, 6, 6);
    rect(ctx, "#00000022", x as number, 34, 6, 2);
  });
  // Back counter with a plain espresso machine
  rect(ctx, "#e6d9b0", 40, 50, 100, 4);
  rect(ctx, "#ac7155", 40, 54, 100, 12);
  rect(ctx, "#8c5a42", 40, 63, 100, 3);
  rect(ctx, "#5f6b69", 54, 28, 40, 5);
  rect(ctx, "#8d9693", 54, 33, 40, 17);
  rect(ctx, "#a9b3b0", 56, 35, 36, 2);
  rect(ctx, ink, 62, 39, 24, 6);
  rect(ctx, "#a9c4a8", 64, 41, 4, 2);
  rect(ctx, ink, 66, 46, 16, 2);
  rect(ctx, "#f2ecd8", 71, 44, 6, 6);
  rect(ctx, "#d8d4c4", 108, 40, 9, 10);
  rect(ctx, "#a9a48a", 108, 40, 9, 2);
  // Front counter, open at the right end
  rect(ctx, "#e6d9b0", 16, 94, 144, 4);
  rect(ctx, "#ac7155", 16, 98, 144, 14);
  rect(ctx, "#8c5a42", 16, 108, 144, 4);
  rect(ctx, "#8c5a42", 160, 94, 3, 18);
  rect(ctx, "#e9e0c4", 140, 88, 6, 6);
  rect(ctx, "#e9e0c4", 148, 88, 6, 6);
}

export function createRoomBackdrop(room: Room): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = room.width * TILE;
  canvas.height = room.height * TILE;
  const ctx = canvas.getContext("2d")!;
  if (room.id === "garage") garageBackdrop(ctx, room);
  else if (room.id === "work") cafeBackdrop(ctx, room);
  else shopBackdrop(ctx, room);
  return canvas;
}

export function renderRoom(ctx: CanvasRenderingContext2D, backdrop: HTMLCanvasElement, game: Game, loadout: Loadout) {
  ctx.imageSmoothingEnabled = false;
  rect(ctx, "#26352f", 0, 0, VIEW.width, VIEW.height);
  ctx.save();
  ctx.translate(-Math.round(game.camera.x), -Math.round(game.camera.y));
  ctx.drawImage(backdrop, 0, 0);
  // The garage shows the player's bike with whatever is currently equipped.
  if (game.room?.id === "garage") drawBike(ctx, loadout, 72, 13);
  const goal = game.path.at(-1);
  if (goal) for (const dx of [-5, 4]) for (const dy of [-5, 4]) rect(ctx, "#fff0bc", goal.x + dx, goal.y + dy, 2, 2);
  player(ctx, game);
  ctx.restore();
}

// Big side-on view used by the wheel display.
export function renderInspect(ctx: CanvasRenderingContext2D, loadout: Loadout) {
  const scale = 4;
  const x = (VIEW.width - BIKE.width * scale) / 2;
  const floorY = 200;
  ctx.imageSmoothingEnabled = false;
  rect(ctx, "#bcc7a8", 0, 0, VIEW.width, floorY);
  for (let y = 12; y < floorY - 6; y += 12) rect(ctx, "#00000010", 0, y, VIEW.width, 1);
  rect(ctx, ink, 0, floorY - 6, VIEW.width, 6);
  rect(ctx, "#c2ac80", 0, floorY, VIEW.width, VIEW.height - floorY);
  rect(ctx, "#b39d72", 0, floorY + 24, VIEW.width, 1);
  rect(ctx, "#b39d72", 0, floorY + 48, VIEW.width, 1);
  const bikeY = floorY - 41 * scale;
  rect(ctx, "#00000030", x + 8, floorY, BIKE.width * scale - 16, 5);
  drawBike(ctx, loadout, x, bikeY, scale);
}
