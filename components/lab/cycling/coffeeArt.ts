import { rect } from "./art";
import { drinkById, Ingredient, Shift } from "./coffee";
import { VIEW } from "./simulation";

const ink = "#344b45";
const paper = "#f0e6c0";
const countertop = "#ac7155";

const fills: Record<Ingredient, { color: string; top: string }> = {
  espresso: { color: "#4a2c1e", top: "#9a6a45" },
  water: { color: "#8fb4b4", top: "#bacdb7" },
  milk: { color: "#e9dfc4", top: "#f6efd8" },
  foam: { color: "#fbf7ea", top: "#ddd2b0" },
};

function cup(ctx: CanvasRenderingContext2D, items: Ingredient[], x: number, y: number) {
  const u = 6;
  const r = (color: string, cx: number, cy: number, w: number, h: number) => rect(ctx, color, x + cx * u, y + cy * u, w * u, h * u);
  r("#00000030", -1, 14, 22, 1);
  r(ink, 0, 0, 16, 14);
  r("#f2ecd8", 1, 1, 14, 12);
  r("#a9a48a", 2, 2, 12, 10);
  // The handle is a small ring on the right.
  r(ink, 16, 3, 4, 8);
  r("#f2ecd8", 16, 4, 3, 6);
  r(countertop, 17, 5, 1, 4);
  items.forEach((item, i) => {
    const top = 9 - i * 3;
    const f = fills[item];
    r(f.color, 2, top, 12, 3);
    r(f.top, 2, top, 12, 1);
    if (item === "foam") { r(f.top, 4, top + 1, 1, 1); r(f.top, 9, top + 2, 2, 1); r(f.top, 12, top + 1, 1, 1); }
  });
}

function ticket(ctx: CanvasRenderingContext2D, shift: Shift) {
  const x = 28;
  const y = 30;
  rect(ctx, "#00000022", x + 3, y + 3, 84, 108);
  rect(ctx, ink, x, y, 84, 108);
  rect(ctx, paper, x + 2, y + 2, 80, 104);
  rect(ctx, "#d8c98e", x + 30, y - 4, 24, 8);
  const drink = shift.orders.length ? drinkById(shift.orders[shift.index]) : null;
  if (!drink) return;
  // The recipe as stacked bars, bottom to top, matching the cup.
  drink.recipe.forEach((item, i) => {
    const bottom = y + 98 - i * 14;
    rect(ctx, ink, x + 17, bottom - 14, 50, 14);
    rect(ctx, fills[item].color, x + 19, bottom - 12, 46, 10);
    rect(ctx, fills[item].top, x + 19, bottom - 12, 46, 2);
  });
  if (shift.phase === "accepted" || shift.phase === "done") {
    const tick = [[0, 4], [1, 5], [2, 6], [3, 5], [4, 4], [5, 3], [6, 2], [7, 1], [8, 0]];
    tick.forEach(([dx, dy]) => rect(ctx, "#4f7f59", x + 22 + dx * 4, y + 14 + dy * 4, 6, 6));
  }
}

// The focused counter view used while a shift is running.
export function renderCoffee(ctx: CanvasRenderingContext2D, shift: Shift) {
  const floor = 170;
  ctx.imageSmoothingEnabled = false;
  rect(ctx, "#e0ce9f", 0, 0, VIEW.width, floor);
  for (let y = 12; y < floor - 6; y += 12) rect(ctx, "#00000012", 0, y, VIEW.width, 1);
  rect(ctx, ink, 0, floor - 6, VIEW.width, 6);
  rect(ctx, countertop, 0, floor, VIEW.width, VIEW.height - floor);
  rect(ctx, "#e6d9b0", 0, floor, VIEW.width, 4);
  rect(ctx, "#8c5a42", 0, floor + 40, VIEW.width, 3);
  rect(ctx, "#8c5a42", 0, floor + 72, VIEW.width, 14);
  ticket(ctx, shift);
  if (shift.cup) cup(ctx, shift.cup, 180, floor + 10 - 84);
  else if (shift.phase === "making") {
    // An empty marked spot where the cup goes.
    for (let i = 0; i < 6; i++) rect(ctx, "#8c5a42", 190 + i * 18, floor + 12, 10, 3);
  }
}
