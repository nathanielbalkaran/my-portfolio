// The café minigame's whole state model. A drink is just an ordered list of
// ingredients in a cup; an order is correct when the list equals the recipe.

export type Ingredient = "espresso" | "water" | "milk" | "foam";
export type DrinkId = "espresso" | "americano" | "latte" | "cappuccino";
export type Drink = { id: DrinkId; name: string; recipe: Ingredient[] };

export const drinks: Drink[] = [
  { id: "espresso", name: "Espresso", recipe: ["espresso"] },
  { id: "americano", name: "Americano", recipe: ["espresso", "water"] },
  { id: "latte", name: "Latte", recipe: ["espresso", "milk"] },
  { id: "cappuccino", name: "Cappuccino", recipe: ["espresso", "foam"] },
];

export const ingredientNames: Record<Ingredient, string> = {
  espresso: "espresso",
  water: "hot water",
  milk: "milk",
  foam: "foamed milk",
};

export const PAY = 75;
export const ORDERS = 3;
export const CUP_SIZE = 3; // most things a cup can hold

export type Shift = {
  phase: "ready" | "making" | "accepted" | "done";
  orders: DrinkId[]; // the shift's drinks, in the order they are asked for
  index: number; // current order
  cup: Ingredient[] | null; // null: no cup on the counter
  note: string;
};

export const drinkById = (id: DrinkId) => drinks.find(d => d.id === id) ?? drinks[0];
export const describeRecipe = (items: Ingredient[]) => items.map(i => ingredientNames[i]).join(" + ");

export const openShift = (): Shift => ({ phase: "ready", orders: [], index: 0, cup: null, note: "" });

export function startShift(): Shift {
  const orders: DrinkId[] = [];
  while (orders.length < ORDERS) {
    const pick = drinks[Math.floor(Math.random() * drinks.length)].id;
    if (pick !== orders.at(-1)) orders.push(pick);
  }
  return { phase: "making", orders, index: 0, cup: null, note: "Take a cup, then build the drink." };
}

export const takeCup = (s: Shift): Shift => s.phase === "making" ? { ...s, cup: [], note: "" } : s;

export function addIngredient(s: Shift, item: Ingredient): Shift {
  if (s.phase !== "making" || !s.cup || s.cup.length >= CUP_SIZE) return s;
  return { ...s, cup: [...s.cup, item], note: "" };
}

export function serve(s: Shift): { shift: Shift; paid: number } {
  if (s.phase !== "making" || !s.cup?.length) return { shift: s, paid: 0 };
  const recipe = drinkById(s.orders[s.index]).recipe;
  const correct = recipe.length === s.cup.length && recipe.every((item, i) => item === s.cup![i]);
  if (!correct) return { shift: { ...s, cup: null, note: "Wrong drink. The cup was emptied. Try again." }, paid: 0 };
  const last = s.index === s.orders.length - 1;
  return {
    shift: { ...s, phase: last ? "done" : "accepted", note: last ? "Shift complete." : "Order accepted." },
    paid: PAY,
  };
}

export const nextOrder = (s: Shift): Shift =>
  s.phase === "accepted" ? { ...s, phase: "making", index: s.index + 1, cup: null, note: "" } : s;
