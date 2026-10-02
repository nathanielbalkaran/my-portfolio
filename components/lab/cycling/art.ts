import { Game, VIEW } from "./simulation";
import { Building, center, isPath, Point, TILE, town } from "./town";

// Original, temporary pixel drawings. Nothing in movement relies on these shapes.
const colors = { grass: "#91aa72", grassDark: "#7f9961", dark: "#344b45", path: "#cfbd91", edge: "#b09c75" };
const letters: Record<string, string[]> = {
  A: ["010", "101", "111", "101", "101"], B: ["110", "101", "110", "101", "110"],
  C: ["111", "100", "100", "100", "111"], F: ["111", "100", "110", "100", "100"],
  E: ["111", "100", "110", "100", "111"], G: ["111", "100", "101", "101", "111"],
  H: ["101", "101", "111", "101", "101"], I: ["111", "010", "010", "010", "111"],
  K: ["101", "101", "110", "101", "101"], L: ["100", "100", "100", "100", "111"], O: ["111", "101", "101", "101", "111"],
  P: ["110", "101", "110", "100", "100"], R: ["110", "101", "110", "101", "101"],
  S: ["111", "100", "111", "001", "111"], W: ["101", "101", "101", "111", "101"],
};

export function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  [...text].forEach((letter, i) => letters[letter]?.forEach((row, dy) => [...row].forEach((pixel, dx) => {
    if (pixel === "1") rect(ctx, "#eee3b9", x + i * 4 + dx, y + dy, 1, 1);
  })));
}

function building(ctx: CanvasRenderingContext2D, b: Building) {
  const x = b.x * TILE;
  const y = b.y * TILE;
  const w = b.w * TILE;
  const h = b.h * TILE;
  const roofH = Math.floor(h * 0.48);
  rect(ctx, "#70855e", x + 5, y + 7, w, h);
  rect(ctx, colors.dark, x, y + roofH - 2, w, h - roofH + 2);
  rect(ctx, b.wall, x + 3, y + roofH, w - 6, h - roofH - 4);
  for (let row = y + roofH + 10; row < y + h - 6; row += 9) {
    rect(ctx, "#b3a582", x + 3, row, w - 6, 1);
  }
  rect(ctx, colors.dark, x - 2, y + 6, w + 4, roofH - 3);
  rect(ctx, b.roof, x, y + 5, w, roofH - 5);
  rect(ctx, b.roof, x + 5, y, w - 10, 7);
  rect(ctx, "#dfd6b0", x + 6, y + 2, w - 12, 2);
  for (let row = y + 11; row < y + roofH - 3; row += 8) {
    rect(ctx, "#00000022", x + 1, row, w - 2, 2);
    for (let col = x + 8 + (row % 3) * 3; col < x + w - 5; col += 16) rect(ctx, "#00000022", col, row - 5, 1, 5);
  }
  const doorX = center(b.entrance.tile).x;
  rect(ctx, colors.dark, doorX - 8, y + h - 25, 16, 25);
  rect(ctx, "#786849", doorX - 6, y + h - 23, 12, 22);
  rect(ctx, "#a48d62", doorX - 4, y + h - 21, 8, 12);
  rect(ctx, "#ead5a1", doorX + 3, y + h - 10, 2, 2);
  rect(ctx, "#e2d5ae", doorX - 10, y + h, 20, 3);
  const plateW = b.label.length * 4 + 9;
  rect(ctx, colors.dark, doorX - Math.floor(plateW / 2), y + h - 37, plateW, 10);
  label(ctx, b.label, doorX - Math.floor(b.label.length * 4 / 2) + 1, y + h - 35);
  for (const windowX of [x + 12, x + w - 28]) {
    rect(ctx, colors.dark, windowX, y + h - 28, 16, 19);
    rect(ctx, "#739696", windowX + 2, y + h - 26, 12, 14);
    rect(ctx, "#bacdb7", windowX + 3, y + h - 25, 3, 5);
    rect(ctx, b.wall, windowX + 7, y + h - 26, 2, 14);
    rect(ctx, b.wall, windowX + 2, y + h - 19, 12, 2);
    rect(ctx, "#f0deb0", windowX - 1, y + h - 10, 18, 2);
  }
  if (b.id === "work") {
    rect(ctx, colors.dark, x + w - 24, y - 8, 10, 20);
    rect(ctx, "#bb997c", x + w - 22, y - 8, 6, 18);
  }
  if (b.id === "garage") {
    // A wonky little repair patch on the roof.
    rect(ctx, "#809595", x + 13, y + 15, 18, 11);
    rect(ctx, "#c7c7a5", x + 15, y + 17, 2, 2);
    rect(ctx, "#c7c7a5", x + 27, y + 22, 2, 2);
  }
}

function tree(ctx: CanvasRenderingContext2D, tile: Point) {
  const { x, y } = center(tile);
  treeAt(ctx, x, y);
}

export function treeAt(ctx: CanvasRenderingContext2D, x: number, y: number) {
  rect(ctx, "#6e865a", x - 9, y + 3, 20, 5);
  rect(ctx, "#594f38", x - 3, y - 8, 6, 14);
  rect(ctx, "#998057", x - 1, y - 7, 2, 12);
  rect(ctx, "#3d6652", x - 12, y - 22, 24, 14);
  rect(ctx, "#3d6652", x - 8, y - 29, 16, 24);
  rect(ctx, "#507c59", x - 10, y - 24, 20, 12);
  rect(ctx, "#507c59", x - 6, y - 30, 12, 8);
  rect(ctx, "#6c915f", x - 6, y - 25, 7, 7);
  rect(ctx, "#6c915f", x - 9, y - 18, 4, 3);
  rect(ctx, "#305747", x + 5, y - 17, 5, 7);
}

export function createBackdrop(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = town.width * TILE;
  canvas.height = town.height * TILE;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < town.height; y++) for (let x = 0; x < town.width; x++) {
    const px = x * TILE;
    const py = y * TILE;
    const path = isPath(x, y);
    const seed = (x * 71 + y * 137) % 97;
    rect(ctx, path ? colors.path : colors.grass, px, py, TILE, TILE);
    if (path) {
      if (!isPath(x, y - 1)) rect(ctx, colors.edge, px, py, 16, 1);
      if (!isPath(x - 1, y)) rect(ctx, colors.edge, px, py, 1, 16);
      rect(ctx, "#bba77e", px + seed % 11 + 2, py + seed % 9 + 3, 2, 1);
      if (seed % 4 === 0) rect(ctx, "#e2cfa1", px + 3, py + 11, 4, 1);
    } else {
      rect(ctx, colors.grassDark, px + seed % 12, py + seed % 10 + 2, 2, 2);
      rect(ctx, "#a9bd7f", px + seed % 9 + 5, py + 12, 3, 1);
      if (seed % 17 === 0) {
        rect(ctx, "#d7cda2", px + 7, py + 5, 2, 2);
        rect(ctx, "#657d52", px + 7, py + 7, 1, 3);
      }
    }
  }
  const p = town.pond;
  rect(ctx, "#6d886c", p.x * TILE - 2, p.y * TILE - 2, p.w * TILE + 4, p.h * TILE + 4);
  rect(ctx, "#688e95", p.x * TILE, p.y * TILE, p.w * TILE, p.h * TILE);
  rect(ctx, "#89aba8", p.x * TILE + 2, p.y * TILE + 2, p.w * TILE - 4, 3);
  for (let i = 0; i < 16; i++) {
    const x = p.x * TILE + (i * 37 + 8) % (p.w * TILE - 12);
    const y = p.y * TILE + (i * 23 + 11) % (p.h * TILE - 10);
    rect(ctx, "#91b1af", x, y, 5, 1);
  }
  // A single inexplicable stone in the water.
  rect(ctx, colors.dark, 139, 377, 13, 8);
  rect(ctx, "#b2b49a", 141, 374, 9, 8);
  rect(ctx, "#d6d2b1", 143, 374, 4, 2);
  for (let y = 0; y < town.height; y += 2) for (let x = 0; x < town.width; x += 2) {
    if (x === 0 || y === 0 || x >= town.width - 2 || y >= town.height - 2) tree(ctx, { x, y: y + 1 });
  }
  town.buildings.forEach(b => building(ctx, b));
  return canvas;
}

export function player(ctx: CanvasRenderingContext2D, game: Game) {
  const x = Math.round(game.player.x);
  const y = Math.round(game.player.y);
  const step = game.walking ? Math.floor(game.stride) % 2 : 0;
  rect(ctx, "#53674b66", x - 6, y - 1, 12, 4);
  rect(ctx, "#303e47", x - 4, y - 7, 3, 8 - step);
  rect(ctx, "#303e47", x + 1, y - 7, 3, 7 + step);
  rect(ctx, "#e4d9b6", x - 5, y - 1 - step, 4, 2);
  rect(ctx, "#e4d9b6", x + 1, y - 2 + step, 4, 2);
  rect(ctx, "#733f32", x - 6, y - 15, 12, 9);
  rect(ctx, "#c57b52", x - 4, y - 15, 8, 8);
  rect(ctx, "#dcab78", x - 7, y - 11 + step, 2, 5);
  rect(ctx, "#dcab78", x + 5, y - 11 - step, 2, 5);
  rect(ctx, "#3e4136", x - 5, y - 23, 10, 9);
  rect(ctx, "#dcab78", x - 4, y - 21, 8, 7);
  rect(ctx, "#476469", x - 5, y - 24, 10, 5);
  rect(ctx, "#8ba5a0", x - 3, y - 24, 6, 1);
  if (game.facing === "up") {
    rect(ctx, "#476469", x - 4, y - 20, 8, 5);
    rect(ctx, "#d0b887", x - 3, y - 13, 6, 6);
    rect(ctx, "#9a8662", x - 2, y - 12, 4, 1);
  } else {
    const offset = game.facing === "left" ? -2 : game.facing === "right" ? 2 : 0;
    rect(ctx, "#343e3c", x - 2 + offset, y - 18, 1, 2);
    if (game.facing === "down") rect(ctx, "#343e3c", x + 2, y - 18, 1, 2);
    rect(ctx, "#476469", x - 4 + offset, y - 20, 8, 1);
  }
}

export function render(ctx: CanvasRenderingContext2D, backdrop: HTMLCanvasElement, game: Game) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.save();
  ctx.translate(-Math.round(game.camera.x), -Math.round(game.camera.y));
  ctx.drawImage(backdrop, 0, 0);
  const goal = game.path.at(-1);
  if (goal) {
    for (const dx of [-5, 4]) for (const dy of [-5, 4]) rect(ctx, "#fff0bc", goal.x + dx, goal.y + dy, 2, 2);
  }
  // Sort tall sprites by their feet so the player can walk behind trees.
  const sprites = [
    ...town.trees.map(t => ({ y: center(t).y, draw: () => tree(ctx, t) })),
    { y: game.player.y, draw: () => player(ctx, game) },
  ];
  sprites.sort((a, b) => a.y - b.y).forEach(s => s.draw());
  ctx.restore();
}
