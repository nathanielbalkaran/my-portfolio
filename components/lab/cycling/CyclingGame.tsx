"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createBackdrop, render } from "./art";
import { WheelId, wheelsetById, wheelsets } from "./bike";
import { renderCoffee } from "./coffeeArt";
import { createRide, getRoute, Ride, stepRide } from "./freeride";
import { renderRide } from "./freerideArt";
import {
  addIngredient, describeRecipe, drinkById, Ingredient, nextOrder, openShift, ORDERS, PAY, serve, Shift, startShift, takeCup,
} from "./coffee";
import { createRoomBackdrop, renderInspect, renderRoom } from "./interiors";
import { rooms } from "./rooms";
import { earn, loadSave, persist, purchase, Save } from "./save";
import { aim, createGame, Game, interact, nearSpot, stop, update, VIEW } from "./simulation";
import { entranceAt } from "./town";
import styles from "./CyclingGame.module.css";

const movementKeys = new Set(["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"]);
const outside = "A quiet afternoon in Mossbend.";
type RideUi = null | "offer" | "riding" | "summary";
type Summary = { distance: number; time: number; top: number };
const clock = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

function describe(game: Game, save: Save) {
  if (!game.room) return entranceAt(game.player) ? "Work · A small coffee shop." : outside;
  if (game.room.id === "work") return nearSpot(game) ? "Coffee station · Press E or click to start a shift." : "Work · Walk around the counter to the coffee station. Step down to leave.";
  if (game.room.id === "garage") return nearSpot(game) ? "Bike · Press E or click to ride." : `Garage · Your bike, on ${wheelsetById(save.equipped).name} wheels. Walk up to it to ride.`;
  return nearSpot(game) ? "Wheel display · Press E or click to inspect." : "Bike Shop · Walk to the wheel display. Step down to leave.";
}

export function CyclingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState(outside);
  const [save, setSave] = useState<Save>(loadSave);
  const [preview, setPreview] = useState<WheelId | null>(null);
  // The canvas loop reads this instead of React state.
  const [shift, setShift] = useState<Shift | null>(null);
  const [rideUi, setRideUi] = useState<RideUi>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const live = useRef<{ save: Save; preview: WheelId | null; shift: Shift | null; rideUi: RideUi; ride: Ride | null }>({ save, preview, shift, rideUi: null, ride: null });

  const setMode = useCallback((mode: RideUi) => {
    live.current.rideUi = mode;
    setRideUi(mode);
  }, []);
  const startRide = () => {
    live.current.ride = createRide(getRoute(), live.current.save.equipped);
    setMode("riding");
    canvasRef.current?.focus({ preventScroll: true });
  };
  const endRide = useCallback(() => {
    const ride = live.current.ride;
    if (!ride) return;
    live.current.ride = null;
    setSummary({ distance: ride.distance, time: ride.time, top: ride.top });
    setMode("summary");
  }, [setMode]);
  const closeRide = useCallback(() => {
    live.current.ride = null;
    setMode(null);
    canvasRef.current?.focus({ preventScroll: true });
  }, [setMode]);
  const rideOpen = rideUi !== null;
  useEffect(() => {
    if (!rideOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (live.current.rideUi === "riding") endRide(); else closeRide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rideOpen, endRide, closeRide]);

  const updateShift = useCallback((next: Shift | null) => {
    live.current.shift = next;
    setShift(next);
  }, []);
  const openCoffee = useCallback(() => updateShift(openShift()), [updateShift]);
  const act = (fn: (s: Shift) => Shift) => { if (live.current.shift) updateShift(fn(live.current.shift)); };
  const serveDrink = () => {
    const current = live.current.shift;
    if (!current) return;
    const result = serve(current);
    updateShift(result.shift);
    if (result.paid) {
      // The same save the Bike Shop reads, so the money is spendable right away.
      const next = earn(live.current.save, result.paid);
      live.current.save = next;
      persist(next);
      setSave(next);
    }
  };

  const openDisplay = useCallback(() => {
    live.current.preview = live.current.save.equipped;
    setPreview(live.current.save.equipped);
  }, []);
  const closeDisplay = useCallback(() => {
    live.current.preview = null;
    setPreview(null);
    updateShift(null);
    canvasRef.current?.focus({ preventScroll: true });
  }, [updateShift]);
  const choose = (id: WheelId) => {
    live.current.preview = id;
    setPreview(id);
  };
  const confirm = () => {
    if (!preview) return;
    const next = purchase(live.current.save, preview);
    live.current.save = next;
    persist(next);
    setSave(next);
  };

  const inspecting = preview !== null || shift !== null;
  useEffect(() => {
    if (!inspecting) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeDisplay(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspecting, closeDisplay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const game = createGame();
    const backdrop = createBackdrop();
    const interiors: Record<string, HTMLCanvasElement> = {};
    for (const room of Object.values(rooms)) interiors[room.id] = createRoomBackdrop(room);
    update(game, 0, true);
    const route = getRoute();
    let frame = 0;
    let last = performance.now();
    let lastStatus = outside;

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.04);
      last = now;
      const { save: current, preview: viewing, shift: working, rideUi: riding, ride } = live.current;
      let nextStatus: string;
      if (riding === "riding" && ride) {
        stepRide(route, ride, dt);
        renderRide(ctx!, route, ride);
        nextStatus = "Free Ride · A quiet road out of Mossbend.";
        if (ride.finished) endRide();
      } else if (working) {
        renderCoffee(ctx!, working);
        nextStatus = "Coffee station.";
      } else if (viewing) {
        renderInspect(ctx!, { wheels: viewing });
        nextStatus = `Previewing ${wheelsetById(viewing).name}.`;
      } else {
        if (!riding) update(game, dt);
        if (game.opened) {
          const spot = game.opened;
          game.opened = null;
          stop(game);
          if (spot.id === "coffee") openCoffee();
          else if (spot.id === "bike") setMode("offer");
          else openDisplay();
        }
        const loadout = { wheels: current.equipped };
        if (game.room) renderRoom(ctx!, interiors[game.room.id], game, loadout);
        else render(ctx!, backdrop, game);
        nextStatus = describe(game, current);
      }
      if (lastStatus !== nextStatus) { lastStatus = nextStatus; setStatus(nextStatus); }
      frame = requestAnimationFrame(tick);
    }

    function pointer(event: PointerEvent) {
      if (event.button !== 0 || live.current.preview || live.current.shift || live.current.rideUi) return;
      canvas!.focus({ preventScroll: true });
      const bounds = canvas!.getBoundingClientRect();
      aim(game, {
        x: (event.clientX - bounds.left) * VIEW.width / bounds.width + Math.round(game.camera.x),
        y: (event.clientY - bounds.top) * VIEW.height / bounds.height + Math.round(game.camera.y),
      });
    }

    function keyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      if (live.current.rideUi) {
        if (live.current.rideUi === "riding" && live.current.ride && movementKeys.has(key)) { event.preventDefault(); live.current.ride.keys.add(key); live.current.ride.taps.add(key); }
        return;
      }
      if (live.current.preview || live.current.shift) return;
      if (movementKeys.has(key)) { event.preventDefault(); game.keys.add(key); game.path = []; }
      if (key === "e" || key === "enter" || key === " ") { event.preventDefault(); interact(game); }
      if (key === "escape") { event.preventDefault(); stop(game); }
    }
    function keyUp(event: KeyboardEvent) {
      game.keys.delete(event.key.toLowerCase());
      live.current.ride?.keys.delete(event.key.toLowerCase());
    }
    function clear() { stop(game); live.current.ride?.keys.clear(); }

    canvas.addEventListener("pointerdown", pointer);
    canvas.addEventListener("keydown", keyDown);
    canvas.addEventListener("blur", clear);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", pointer);
      canvas.removeEventListener("keydown", keyDown);
      canvas.removeEventListener("blur", clear);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [openDisplay, openCoffee, setMode, endRide]);

  const chosen = preview ? wheelsetById(preview) : null;
  const owned = chosen ? save.owned.includes(chosen.id) : false;
  const action = !chosen ? "" : save.equipped === chosen.id ? "Equipped" : owned ? "Equip" : save.cash >= chosen.price ? `Buy · ${money(chosen.price)}` : "Not enough cash";

  return (
    <section className={`lab ${styles.experiment}`}>
      <Link href="/lab" className="link">← Lab</Link>
      <div className={styles.heading}>
        <h1>Mossbend</h1>
        <span>A cycling game, beginning with a place.</span>
      </div>
      <canvas
        className={styles.world}
        ref={canvasRef}
        width={VIEW.width}
        height={VIEW.height}
        tabIndex={0}
        aria-label="Mossbend town. Walk between the Garage, Work, and Bike Shop."
        aria-describedby="cycling-controls cycling-status"
      >
        This prototype needs a browser with Canvas support.
      </canvas>
      {chosen && (
        <div className={styles.display} role="group" aria-label="Wheel display">
          <div className={styles.displayHead}>
            <span>Wheel display</span>
            <span>Cash {money(save.cash)}</span>
          </div>
          <div className={styles.options}>
            {wheelsets.map(w => (
              <button key={w.id} type="button" className={styles.option} aria-pressed={w.id === preview} onClick={() => choose(w.id)}>
                <span>{w.name}</span>
                <span>{save.equipped === w.id ? "Equipped" : save.owned.includes(w.id) ? "Owned" : money(w.price)}</span>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} disabled={action === "Equipped" || action === "Not enough cash"} onClick={confirm}>{action}</button>
            <button type="button" className={styles.back} onClick={closeDisplay}>Back</button>
          </div>
        </div>
      )}
      {rideUi === "offer" && (
        <div className={styles.display} role="group" aria-label="Garage bike">
          <div className={styles.displayHead}>
            <span>Garage · Your bike</span>
            <span>{wheelsetById(save.equipped).name} wheels</span>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={startRide}>RIDE</button>
            <button type="button" className={styles.back} onClick={closeRide}>Back</button>
          </div>
        </div>
      )}
      {rideUi === "summary" && summary && (
        <div className={styles.display} role="group" aria-label="Ride summary">
          <div className={styles.displayHead}><span>Free Ride · Summary</span></div>
          <p className={styles.line}>Distance: <strong>{(summary.distance / 1000).toFixed(2)} km</strong></p>
          <p className={styles.line}>Time: <strong>{clock(summary.time)}</strong></p>
          <p className={styles.line}>Top speed: <strong>{Math.round(summary.top * 3.6)} km/h</strong></p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={closeRide}>Back to the Garage</button>
          </div>
        </div>
      )}
      {shift && <CoffeePanel shift={shift} cash={save.cash} act={act} serveDrink={serveDrink} onStart={() => updateShift(startShift())} onClose={closeDisplay} />}
      <div className={styles.notes}>
        <p id="cycling-controls">{rideUi === "riding" ? "Hold W / ↑ to pedal, longer for harder · release to coast · S / ↓ brake · A D / ← → steer · Esc to end the ride" : rideUi ? "Esc to go back" : shift ? "Build the drink in the order shown, then SERVE · Esc to leave" : preview ? "Pick a wheelset to preview it · Esc to go back" : "Click to walk · WASD / arrows to move · E to use · Esc to stop"}</p>
        <p id="cycling-status" role="status">{status}</p>
      </div>
      {rideUi === "riding" && <div className={styles.actions}><button type="button" className={styles.back} onClick={endRide}>End ride</button></div>}
      <p className={styles.caption}>First sketch · The Garage, Work, and the Bike Shop are open. More doors later.</p>
    </section>
  );
}

const stations: { label: string; item: Ingredient }[] = [
  { label: "ESPRESSO", item: "espresso" },
  { label: "HOT WATER", item: "water" },
  { label: "MILK", item: "milk" },
  { label: "FOAMED MILK", item: "foam" },
];

type PanelProps = {
  shift: Shift;
  cash: number;
  act: (fn: (s: Shift) => Shift) => void;
  serveDrink: () => void;
  onStart: () => void;
  onClose: () => void;
};

function CoffeePanel({ shift, cash, act, serveDrink, onStart, onClose }: PanelProps) {
  const { phase, cup } = shift;
  const drink = shift.orders.length ? drinkById(shift.orders[shift.index]) : null;
  return (
    <div className={styles.display} role="group" aria-label="Coffee station">
      <div className={styles.displayHead}>
        <span>{drink ? `Coffee station · Order ${shift.index + 1} of ${ORDERS}` : "Coffee station"}</span>
        <span>Cash {money(cash)}</span>
      </div>
      {phase === "ready" && (
        <>
          <p className={styles.line}>One shift is {ORDERS} orders at {money(PAY)} each.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onStart}>Start shift</button>
            <button type="button" className={styles.back} onClick={onClose}>Back</button>
          </div>
        </>
      )}
      {drink && (phase === "making" || phase === "accepted") && (
        <>
          <p className={styles.line}>Order: <strong>{drink.name}</strong> · {describeRecipe(drink.recipe)}</p>
          <p className={styles.line}>Cup: {cup ? (cup.length ? describeRecipe(cup) : "empty") : "none yet"}</p>
          <p className={styles.line} role="status">{shift.note || "\u00a0"}{phase === "accepted" && ` +${money(PAY)}`}</p>
          {phase === "making" ? (
            <div className={styles.options}>
              <button type="button" className={styles.option} onClick={() => act(takeCup)}>CUP</button>
              {stations.map(st => (
                <button key={st.item} type="button" className={styles.option} disabled={!cup || cup.length >= 3} onClick={() => act(s => addIngredient(s, st.item))}>{st.label}</button>
              ))}
              <button type="button" className={`${styles.option} ${styles.serve}`} disabled={!cup?.length} onClick={serveDrink}>SERVE</button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={() => act(nextOrder)}>Next order</button>
            </div>
          )}
          {phase === "making" && <div className={styles.actions}><button type="button" className={styles.back} onClick={onClose}>Leave</button></div>}
        </>
      )}
      {phase === "done" && (
        <>
          <p className={styles.line} role="status">Shift complete · {money(ORDERS * PAY)} earned.</p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onClose}>Back to café</button>
          </div>
        </>
      )}
    </div>
  );
}
