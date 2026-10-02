"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const REST_WIDTH = 192;
const REST_HEIGHT = 128;
const MIN_EDGE = 32;
/** Paper between halves so a same-colour split stays readable. */
const SPLIT_GAP = 4;
/** Fraction of the smaller piece that must actually overlap. Edge contact is not enough. */
const OVERLAP_RATIO = 0.2;

/** Pointer travel (px) before a press becomes a drag. */
const DRAG_THRESHOLD = 5;
const DRAG_THRESHOLD_TOUCH = 10;

/** Hold to grow. Rate is a fraction of the canvas per second, so both axes finish together. */
const HOLD_DELAY = 380;
const GROW_RATE = 0.2;
const TAKEOVER_COVERAGE = 0.96;

/** Stretch / squish, as a fraction of the piece's own dimension. */
const STRETCH_MAX = 0.1;
const STRETCH_SPEED = 2.2; // px/ms for full stretch
const SQUISH_MAX = 0.14;
const SQUISH_RANGE = 60; // px pushed past the wall for full squish
const FX_SMOOTHING = 70; // ms
const SQUISH_DECAY = 110; // ms

/** Throw: exponential deceleration, no bounce. */
const VELOCITY_WINDOW = 80; // ms of pointer history used for velocity
const THROW_MIN = 0.7; // px/ms
const THROW_MAX = 3;
const THROW_TAU = 170; // ms
const THROW_STOP = 0.04;

/** Cutting: a fast swipe that enters and leaves a piece. */
const CUT_WINDOW = 140; // ms
const CUT_MIN_DISTANCE = 56;
const CUT_MIN_SPEED = 1.1; // px/ms

type OrangeRect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};

type Sample = { t: number; x: number; y: number };

type DragState = {
  id: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  /** Press point in canvas coordinates. */
  downX: number;
  downY: number;
  offsetX: number;
  offsetY: number;
  mode: "pending" | "grow" | "drag";
  timer: number;
  trail: Sample[];
  el: HTMLDivElement;
};

type ThrowState = { id: string; el: HTMLElement; vx: number; vy: number };

type SwipeState = { pointerId: number; trail: Sample[] };

/** Visual-only deformation of one piece. lx/rx/ty/by are edge offsets in px. */
type Fx = {
  id: string;
  el: HTMLElement;
  inner: HTMLElement;
  lx: number;
  rx: number;
  ty: number;
  by: number;
  /** Signed wall pressure, -1..1. Negative = left / top wall. */
  sqX: number;
  sqY: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function createInitial(cw: number, ch: number): OrangeRect {
  const width = Math.round(Math.min(REST_WIDTH, cw, Math.max(MIN_EDGE, cw - 48)));
  const height = Math.round(
    Math.min(REST_HEIGHT, ch, Math.max(MIN_EDGE, ch - 48)),
  );
  return {
    id: "origin",
    x: Math.round((cw - width) / 2),
    y: Math.round((ch - height) / 2),
    width,
    height,
    z: 1,
  };
}

function clampPiece(piece: OrangeRect, cw: number, ch: number): OrangeRect {
  const width = Math.min(piece.width, cw);
  const height = Math.min(piece.height, ch);
  return {
    ...piece,
    width: Math.round(width),
    height: Math.round(height),
    x: Math.round(Math.min(Math.max(0, piece.x), Math.max(0, cw - width))),
    y: Math.round(Math.min(Math.max(0, piece.y), Math.max(0, ch - height))),
  };
}

function trySplit(
  piece: OrangeRect,
  axis: "x" | "y",
  nextId: () => string,
): [OrangeRect, OrangeRect] | null {
  if (axis === "x") {
    const available = piece.width - SPLIT_GAP;
    const left = Math.floor(available / 2);
    const right = available - left;
    if (left < MIN_EDGE || right < MIN_EDGE) return null;
    return [
      { ...piece, id: nextId(), width: left },
      {
        ...piece,
        id: nextId(),
        x: piece.x + left + SPLIT_GAP,
        width: right,
      },
    ];
  }

  const available = piece.height - SPLIT_GAP;
  const top = Math.floor(available / 2);
  const bottom = available - top;
  if (top < MIN_EDGE || bottom < MIN_EDGE) return null;
  return [
    { ...piece, id: nextId(), height: top },
    {
      ...piece,
      id: nextId(),
      y: piece.y + top + SPLIT_GAP,
      height: bottom,
    },
  ];
}

function splitPiece(
  piece: OrangeRect,
  nextId: () => string,
): [OrangeRect, OrangeRect] | null {
  const preferX = piece.width >= piece.height;
  return (
    trySplit(piece, preferX ? "x" : "y", nextId) ??
    trySplit(piece, preferX ? "y" : "x", nextId)
  );
}

/**
 * Cut at an arbitrary position. "x" makes a vertical cut line at canvas x = pos,
 * "y" a horizontal one at canvas y = pos. Same gap and minimum as a click split.
 */
function cutPiece(
  piece: OrangeRect,
  axis: "x" | "y",
  pos: number,
  nextId: () => string,
): [OrangeRect, OrangeRect] | null {
  if (axis === "x") {
    const leftWidth = Math.round(pos - SPLIT_GAP / 2 - piece.x);
    const rightX = Math.round(pos + SPLIT_GAP / 2);
    const rightWidth = piece.x + piece.width - rightX;
    if (leftWidth < MIN_EDGE || rightWidth < MIN_EDGE) return null;
    return [
      { ...piece, id: nextId(), width: leftWidth },
      { ...piece, id: nextId(), x: rightX, width: rightWidth },
    ];
  }
  const topHeight = Math.round(pos - SPLIT_GAP / 2 - piece.y);
  const bottomY = Math.round(pos + SPLIT_GAP / 2);
  const bottomHeight = piece.y + piece.height - bottomY;
  if (topHeight < MIN_EDGE || bottomHeight < MIN_EDGE) return null;
  return [
    { ...piece, id: nextId(), height: topHeight },
    { ...piece, id: nextId(), y: bottomY, height: bottomHeight },
  ];
}

/** Liang–Barsky: parametric span of segment a→b inside the rect, or null. */
function clipSegment(a: Sample, b: Sample, r: OrangeRect) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy];
  const q = [
    a.x - r.x,
    r.x + r.width - a.x,
    a.y - r.y,
    r.y + r.height - a.y,
  ];
  let t0 = 0;
  let t1 = 1;
  for (let i = 0; i < 4; i += 1) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
      continue;
    }
    const t = q[i] / p[i];
    if (p[i] < 0) {
      if (t > t1) return null;
      if (t > t0) t0 = t;
    } else {
      if (t < t0) return null;
      if (t < t1) t1 = t;
    }
  }
  return { t0, t1 };
}

function intersection(a: OrangeRect, b: OrangeRect) {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (w < 1 || h < 1) return null;
  return w * h;
}

function findMergePartner(piece: OrangeRect, others: OrangeRect[]) {
  const pieceArea = piece.width * piece.height;
  let best: { piece: OrangeRect; area: number } | null = null;

  for (const other of others) {
    const area = intersection(piece, other);
    if (area === null) continue;
    const smaller = Math.min(pieceArea, other.width * other.height);
    if (area < smaller * OVERLAP_RATIO) continue;
    if (
      !best ||
      area > best.area ||
      (area === best.area && other.id < best.piece.id)
    ) {
      best = { piece: other, area };
    }
  }

  return best?.piece ?? null;
}

function boundingBox(a: OrangeRect, b: OrangeRect) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

function withOrder(pieces: OrangeRect[]) {
  return pieces.map((piece, index) => ({ ...piece, z: index + 1 }));
}

/** Pointer velocity in px/ms over the last VELOCITY_WINDOW ms. Stale history reads as zero. */
function velocityOf(trail: Sample[], now: number) {
  let first: Sample | null = null;
  let last: Sample | null = null;
  for (const sample of trail) {
    if (now - sample.t > VELOCITY_WINDOW) continue;
    if (!first) first = sample;
    last = sample;
  }
  if (!first || !last || last.t - first.t < 10) return { vx: 0, vy: 0 };
  const dt = last.t - first.t;
  return { vx: (last.x - first.x) / dt, vy: (last.y - first.y) / dt };
}

function pruneTrail(trail: Sample[], now: number, window: number) {
  while (trail.length > 0 && now - trail[0].t > window) trail.shift();
}

function place(el: HTMLElement, piece: OrangeRect) {
  el.style.width = `${piece.width}px`;
  el.style.height = `${piece.height}px`;
  el.style.transform = `translate(${piece.x}px, ${piece.y}px)`;
}

export function OrangeExperiment() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const piecesRef = useRef<OrangeRect[]>([]);
  const alteredRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const throwRef = useRef<ThrowState | null>(null);
  const swipeRef = useRef<SwipeState | null>(null);
  const fxRef = useRef<Fx | null>(null);
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const idRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [pieces, setPieces] = useState<OrangeRect[]>([]);
  const [altered, setAltered] = useState(false);
  const [takeover, setTakeover] = useState(false);

  const commit = useCallback((next: OrangeRect[], nextAltered: boolean) => {
    const ordered = withOrder(next);
    piecesRef.current = ordered;
    alteredRef.current = nextAltered;
    setPieces(ordered);
    setAltered(nextAltered);
  }, []);

  const nextId = useCallback(() => {
    idRef.current += 1;
    return `r${idRef.current}`;
  }, []);

  /** Stop every in-flight gesture and animation. Does not touch piece state. */
  const cancelActivity = useCallback(() => {
    const drag = dragRef.current;
    if (drag) {
      window.clearTimeout(drag.timer);
      if (drag.el.hasPointerCapture(drag.pointerId)) {
        drag.el.releasePointerCapture(drag.pointerId);
      }
    }
    dragRef.current = null;
    throwRef.current = null;
    swipeRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (fxRef.current) fxRef.current.inner.style.transform = "";
    fxRef.current = null;
    document.documentElement.classList.remove("orange-dragging");
  }, []);

  /** Clamp a released / settled piece, then merge it with a clearly overlapping one. */
  const dropPiece = useCallback(
    (id: string) => {
      const current = piecesRef.current;
      const piece = current.find((item) => item.id === id);
      if (!piece) return;

      const { w: cw, h: ch } = sizeRef.current;
      const placed = clampPiece(piece, cw, ch);
      const others = current.filter((item) => item.id !== placed.id);
      const partner = findMergePartner(placed, others);

      if (!partner) {
        commit([...others, placed], true);
        return;
      }

      const merged = clampPiece(
        { id: nextId(), z: 1, ...boundingBox(placed, partner) },
        cw,
        ch,
      );
      commit(
        [...others.filter((item) => item.id !== partner.id), merged],
        true,
      );
    },
    [commit, nextId],
  );

  const enterTakeover = useCallback(() => {
    const drag = dragRef.current;
    if (drag) {
      window.clearTimeout(drag.timer);
      if (drag.el.hasPointerCapture(drag.pointerId)) {
        drag.el.releasePointerCapture(drag.pointerId);
      }
      dragRef.current = null;
    }
    document.documentElement.classList.remove("orange-dragging");
    commit(piecesRef.current, true);
    setTakeover(true);
  }, [commit]);

  /** Single rAF loop for grow, throw and the stretch / squish visuals. Stops when idle. */
  const ensureLoop = useCallback(() => {
    if (rafRef.current) return;
    lastFrameRef.current = performance.now();

    const growStep = (drag: DragState, dt: number) => {
      const piece = piecesRef.current.find((item) => item.id === drag.id);
      if (!piece) return;
      const { w: cw, h: ch } = sizeRef.current;
      const width = Math.min(cw, piece.width + (cw * GROW_RATE * dt) / 1000);
      const height = Math.min(ch, piece.height + (ch * GROW_RATE * dt) / 1000);
      const grown: OrangeRect = {
        ...piece,
        width,
        height,
        x: clamp(piece.x - (width - piece.width) / 2, 0, cw - width),
        y: clamp(piece.y - (height - piece.height) / 2, 0, ch - height),
      };
      piecesRef.current = piecesRef.current.map((item) =>
        item.id === grown.id ? grown : item,
      );
      place(drag.el, grown);
      drag.offsetX = drag.downX - grown.x;
      drag.offsetY = drag.downY - grown.y;

      if (width >= cw * TAKEOVER_COVERAGE && height >= ch * TAKEOVER_COVERAGE) {
        enterTakeover();
      }
    };

    /** Returns true once the throw has come to rest. */
    const throwStep = (th: ThrowState, dt: number) => {
      const piece = piecesRef.current.find((item) => item.id === th.id);
      if (!piece) return true;
      const { w: cw, h: ch } = sizeRef.current;
      const fx = fxRef.current?.id === th.id ? fxRef.current : null;

      let x = piece.x + th.vx * dt;
      let y = piece.y + th.vy * dt;
      const maxX = Math.max(0, cw - piece.width);
      const maxY = Math.max(0, ch - piece.height);

      if (x < 0 || x > maxX) {
        if (fx) fx.sqX = (x < 0 ? -1 : 1) * Math.min(Math.abs(th.vx) / 2.5, 1);
        x = clamp(x, 0, maxX);
        th.vx = 0;
      }
      if (y < 0 || y > maxY) {
        if (fx) fx.sqY = (y < 0 ? -1 : 1) * Math.min(Math.abs(th.vy) / 2.5, 1);
        y = clamp(y, 0, maxY);
        th.vy = 0;
      }

      const decay = Math.exp(-dt / THROW_TAU);
      th.vx *= decay;
      th.vy *= decay;

      const moved = { ...piece, x, y };
      piecesRef.current = piecesRef.current.map((item) =>
        item.id === moved.id ? moved : item,
      );
      th.el.style.transform = `translate(${x}px, ${y}px)`;
      return Math.hypot(th.vx, th.vy) < THROW_STOP;
    };

    /** Eases the visual deformation toward its target. Returns true while still moving. */
    const fxStep = (fx: Fx, dt: number, vx: number, vy: number, pressed: boolean) => {
      const w = fx.el.offsetWidth || 1;
      const h = fx.el.offsetHeight || 1;

      if (!pressed) {
        const decay = Math.exp(-dt / SQUISH_DECAY);
        fx.sqX *= decay;
        fx.sqY *= decay;
      }

      const axis = (size: number, v: number, sq: number) => {
        const stretch = Math.min(Math.abs(v) / STRETCH_SPEED, 1) * STRETCH_MAX * size;
        const squish = Math.abs(sq) * SQUISH_MAX * size;
        const free = 1 - Math.abs(sq);
        // Stretch grows the leading edge; squish pushes the wall-side edge inward.
        const start = (v < 0 ? -stretch * free : 0) + (sq < 0 ? squish : 0);
        const end = (v > 0 ? stretch * free : 0) - (sq > 0 ? squish : 0);
        return [start, end];
      };

      const [tl, tr] = axis(w, vx, fx.sqX);
      const [tt, tb] = axis(h, vy, fx.sqY);
      const k = 1 - Math.exp(-dt / FX_SMOOTHING);
      fx.lx += (tl - fx.lx) * k;
      fx.rx += (tr - fx.rx) * k;
      fx.ty += (tt - fx.ty) * k;
      fx.by += (tb - fx.by) * k;

      const settled =
        Math.abs(fx.lx) + Math.abs(fx.rx) + Math.abs(fx.ty) + Math.abs(fx.by) <
          0.4 && Math.abs(fx.sqX) + Math.abs(fx.sqY) < 0.02;

      if (settled) {
        fx.lx = fx.rx = fx.ty = fx.by = 0;
        fx.inner.style.transform = "";
        return false;
      }

      const sx = (w + fx.rx - fx.lx) / w;
      const sy = (h + fx.by - fx.ty) / h;
      fx.inner.style.transform = `translate(${fx.lx}px, ${fx.ty}px) scale(${sx}, ${sy})`;
      return true;
    };

    const step = (now: number) => {
      const dt = Math.min(48, now - lastFrameRef.current);
      lastFrameRef.current = now;
      let active = false;
      let vx = 0;
      let vy = 0;
      let pressed = false;

      const drag = dragRef.current;
      if (drag?.mode === "grow") {
        active = true;
        growStep(drag, dt);
      } else if (drag?.mode === "drag") {
        active = true;
        pressed = true;
        ({ vx, vy } = velocityOf(drag.trail, performance.now()));
      }

      const th = throwRef.current;
      if (th) {
        if (throwStep(th, dt)) {
          throwRef.current = null;
          dropPiece(th.id);
        } else {
          active = true;
          vx = th.vx;
          vy = th.vy;
        }
      }

      const fx = fxRef.current;
      if (fx && fxStep(fx, dt, vx, vy, pressed)) active = true;

      rafRef.current = active ? requestAnimationFrame(step) : 0;
    };

    rafRef.current = requestAnimationFrame(step);
  }, [dropPiece, enterTakeover]);

  const reset = useCallback(() => {
    cancelActivity();
    setTakeover(false);
    idRef.current = 0;
    const { w, h } = sizeRef.current;
    if (w < 1 || h < 1) return;
    commit([createInitial(w, h)], false);
  }, [cancelActivity, commit]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const apply = () => {
      const header = document.querySelector(".site-header");
      const headerH = header?.getBoundingClientRect().height ?? 0;
      const viewportH = window.visualViewport?.height ?? window.innerHeight;
      const height = Math.max(256, Math.round(viewportH - headerH));
      if (canvas.style.height !== `${height}px`) {
        canvas.style.height = `${height}px`;
      }

      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (
        sizeRef.current.w === cw &&
        sizeRef.current.h === ch &&
        piecesRef.current.length > 0
      ) {
        return;
      }

      sizeRef.current = { w: cw, h: ch };
      if (dragRef.current || throwRef.current || cw < 1 || ch < 1) return;

      if (!alteredRef.current || piecesRef.current.length === 0) {
        commit([createInitial(cw, ch)], false);
        return;
      }

      commit(
        piecesRef.current.map((piece) => clampPiece(piece, cw, ch)),
        true,
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(canvas);
    const header = document.querySelector(".site-header");
    if (header) observer.observe(header);
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      cancelActivity();
    };
  }, [commit, cancelActivity]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") reset();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || dragRef.current || swipeRef.current) return;
    const canvas = canvasRef.current;
    const target = event.currentTarget;
    if (!canvas || !piecesRef.current.some((item) => item.id === target.dataset.id)) {
      return;
    }

    // Grabbing a piece mid-throw stops it where it is.
    throwRef.current = null;

    const { w: cw, h: ch } = sizeRef.current;
    const current = piecesRef.current.map((item) => clampPiece(item, cw, ch));
    const piece = current.find((item) => item.id === target.dataset.id);
    if (!piece) return;

    // Raise via state (z-order = array order) so stacking never gets stuck.
    commit(
      [...current.filter((item) => item.id !== piece.id), piece],
      alteredRef.current,
    );

    const inner = target.firstElementChild as HTMLElement | null;
    if (inner) {
      if (fxRef.current && fxRef.current.id !== piece.id) {
        fxRef.current.inner.style.transform = "";
      }
      if (fxRef.current?.id !== piece.id) {
        fxRef.current = {
          id: piece.id,
          el: target,
          inner,
          lx: 0,
          rx: 0,
          ty: 0,
          by: 0,
          sqX: 0,
          sqY: 0,
        };
      }
    }

    const bounds = canvas.getBoundingClientRect();
    target.setPointerCapture(event.pointerId);
    event.preventDefault();
    document.documentElement.classList.add("orange-dragging");

    const downX = event.clientX - bounds.left;
    const downY = event.clientY - bounds.top;
    const drag: DragState = {
      id: piece.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      downX,
      downY,
      offsetX: downX - piece.x,
      offsetY: downY - piece.y,
      mode: "pending",
      timer: 0,
      trail: [],
      el: target,
    };
    drag.timer = window.setTimeout(() => {
      if (dragRef.current === drag && drag.mode === "pending") {
        drag.mode = "grow";
        ensureLoop();
      }
    }, HOLD_DELAY);
    dragRef.current = drag;
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    const canvas = canvasRef.current;
    const piece = piecesRef.current.find((item) => item.id === drag.id);
    if (!canvas || !piece) return;

    if (drag.mode !== "drag") {
      const threshold =
        event.pointerType === "touch" ? DRAG_THRESHOLD_TOUCH : DRAG_THRESHOLD;
      const distance = Math.hypot(
        event.clientX - drag.startClientX,
        event.clientY - drag.startClientY,
      );
      if (distance < threshold) return;
      // Moving far enough cancels hold-to-grow and starts a drag.
      window.clearTimeout(drag.timer);
      drag.mode = "drag";
      drag.offsetX = drag.downX - piece.x;
      drag.offsetY = drag.downY - piece.y;
      ensureLoop();
    }

    const now = performance.now();
    drag.trail.push({ t: now, x: event.clientX, y: event.clientY });
    pruneTrail(drag.trail, now, VELOCITY_WINDOW * 2);

    const bounds = canvas.getBoundingClientRect();
    const { w: cw, h: ch } = sizeRef.current;
    const wantX = event.clientX - bounds.left - drag.offsetX;
    const wantY = event.clientY - bounds.top - drag.offsetY;
    const maxX = Math.max(0, cw - piece.width);
    const maxY = Math.max(0, ch - piece.height);
    const x = Math.round(clamp(wantX, 0, maxX));
    const y = Math.round(clamp(wantY, 0, maxY));

    const fx = fxRef.current;
    if (fx?.id === drag.id) {
      // How far the pointer is pushing past the wall drives the squish.
      fx.sqX = clamp((wantX - x) / SQUISH_RANGE, -1, 1);
      fx.sqY = clamp((wantY - y) / SQUISH_RANGE, -1, 1);
    }

    piecesRef.current = piecesRef.current.map((item) =>
      item.id === drag.id ? { ...item, x, y } : item,
    );
    drag.el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function endGesture(
    event: React.PointerEvent<HTMLDivElement>,
    cancelled: boolean,
  ) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    window.clearTimeout(drag.timer);
    document.documentElement.classList.remove("orange-dragging");
    if (drag.el.hasPointerCapture(event.pointerId)) {
      drag.el.releasePointerCapture(event.pointerId);
    }

    const current = piecesRef.current;
    const piece = current.find((item) => item.id === drag.id);
    if (!piece) return;
    const others = current.filter((item) => item.id !== piece.id);

    if (drag.mode === "pending") {
      // A quick press-and-release is a click.
      if (cancelled) return;
      const split = splitPiece(piece, nextId);
      if (!split) return;
      commit([...others, ...split], true);
      return;
    }

    if (drag.mode === "grow") {
      const { w: cw, h: ch } = sizeRef.current;
      commit([...others, clampPiece(piece, cw, ch)], true);
      return;
    }

    if (!cancelled) {
      const { vx, vy } = velocityOf(drag.trail, performance.now());
      const speed = Math.hypot(vx, vy);
      if (speed >= THROW_MIN) {
        const scale = Math.min(speed, THROW_MAX) / speed;
        throwRef.current = {
          id: piece.id,
          el: drag.el,
          vx: vx * scale,
          vy: vy * scale,
        };
        // Merge is decided where the throw comes to rest.
        commit([...others, piece], true);
        ensureLoop();
        return;
      }
    }

    dropPiece(piece.id);
    ensureLoop(); // let stretch / squish settle
  }

  function onCanvasPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Only gestures that begin on empty canvas can cut.
    if (event.target !== event.currentTarget) return;
    if (event.button !== 0 || dragRef.current || swipeRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    swipeRef.current = {
      pointerId: event.pointerId,
      trail: [
        {
          t: performance.now(),
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        },
      ],
    };
  }

  function onCanvasPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current;
    if (!swipe || event.pointerId !== swipe.pointerId) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const now = performance.now();
    swipe.trail.push({
      t: now,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    pruneTrail(swipe.trail, now, CUT_WINDOW);
    if (swipe.trail.length < 2) return;

    const a = swipe.trail[0];
    const b = swipe.trail[swipe.trail.length - 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    const dt = b.t - a.t;
    if (dt < 10 || distance < CUT_MIN_DISTANCE || distance / dt < CUT_MIN_SPEED) {
      return;
    }

    // The cut runs along the swipe, snapped to the dominant axis so pieces stay rectangles.
    const axis = Math.abs(dy) > Math.abs(dx) ? "x" : "y";
    let next = piecesRef.current;
    let changed = false;

    for (const piece of piecesRef.current) {
      const span = clipSegment(a, b, piece);
      // Must enter and leave: both ends of the swipe window are outside the piece.
      if (!span || span.t0 <= 0 || span.t1 >= 1) continue;
      const mid = (span.t0 + span.t1) / 2;
      const pos = axis === "x" ? a.x + dx * mid : a.y + dy * mid;
      const halves = cutPiece(piece, axis, pos, nextId);
      if (!halves) continue;
      if (throwRef.current?.id === piece.id) throwRef.current = null;
      next = next.filter((item) => item.id !== piece.id).concat(halves);
      changed = true;
    }

    if (changed) {
      commit(next, true);
      swipe.trail = [b];
    }
  }

  function onCanvasPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const swipe = swipeRef.current;
    if (!swipe || event.pointerId !== swipe.pointerId) return;
    swipeRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div className="lab">
      <h1 className="sr-only">Orange</h1>
      <div
        className="orange-canvas"
        ref={canvasRef}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerEnd}
        onPointerCancel={onCanvasPointerEnd}
      >
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className="orange-piece"
            data-id={piece.id}
            style={{
              width: piece.width,
              height: piece.height,
              transform: `translate(${piece.x}px, ${piece.y}px)`,
              zIndex: piece.z,
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => endGesture(event, false)}
            onPointerCancel={(event) => endGesture(event, true)}
            onLostPointerCapture={(event) => endGesture(event, true)}
          >
            <div className="orange-fill" />
          </div>
        ))}
        {altered && !takeover ? (
          <button type="button" className="link orange-reset" onClick={reset}>
            Reset
          </button>
        ) : null}
        {takeover ? (
          <button
            type="button"
            className="orange-takeover"
            aria-label="Reset"
            onClick={reset}
          />
        ) : null}
      </div>
    </div>
  );
}
