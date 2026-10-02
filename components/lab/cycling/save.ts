import { starterLoadout, WheelId, wheelsetById, wheelsets } from "./bike";

export type Save = { cash: number; owned: WheelId[]; equipped: WheelId };

const KEY = "mossbend:save:v1";
const isWheel = (id: unknown): id is WheelId => wheelsets.some(w => w.id === id);

export const freshSave = (): Save => ({ cash: 120, owned: [starterLoadout.wheels], equipped: starterLoadout.wheels });

export function loadSave(): Save {
  if (typeof window === "undefined") return freshSave();
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (!raw || typeof raw.cash !== "number" || !Number.isFinite(raw.cash) || !Array.isArray(raw.owned)) return freshSave();
    const owned: WheelId[] = [starterLoadout.wheels, ...raw.owned.filter(isWheel)].filter((id, i, all) => all.indexOf(id) === i);
    return { cash: Math.max(0, raw.cash), owned, equipped: isWheel(raw.equipped) && owned.includes(raw.equipped) ? raw.equipped : starterLoadout.wheels };
  } catch {
    return freshSave();
  }
}

export function persist(save: Save) {
  try { window.localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* storage unavailable; play on */ }
}

export const earn = (save: Save, amount: number): Save => ({ ...save, cash: save.cash + amount });

// Equips an owned wheelset, or buys and equips one if the player can afford it.
export function purchase(save: Save, id: WheelId): Save {
  if (save.owned.includes(id)) return { ...save, equipped: id };
  const price = wheelsetById(id).price;
  if (save.cash < price) return save;
  return { cash: save.cash - price, owned: [...save.owned, id], equipped: id };
}

// Best segment times in seconds. Kept apart from the save so they never touch shop state.
// "hill" keeps its original key so earlier personal bests carry over.
export type SegmentId = "hill" | "straight";
const BEST_KEYS: Record<SegmentId, string> = { hill: "mossbend:hill-best:v1", straight: "mossbend:straight-best:v1" };

export function loadBest(id: SegmentId): number | null {
  if (typeof window === "undefined") return null;
  try {
    const value = Number(window.localStorage.getItem(BEST_KEYS[id]));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function saveBest(id: SegmentId, seconds: number) {
  try { window.localStorage.setItem(BEST_KEYS[id], String(seconds)); } catch { /* storage unavailable; play on */ }
}
