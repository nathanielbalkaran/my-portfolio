"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import photos from "@/data/collection.json";
import styles from "./Collection.module.css";

const storageKey = "nb-collection-order-v1";
const photoIds = photos.map((photo) => photo.id);
let sequence: string[] | null = null;
const listeners = new Set<() => void>();

function shuffled(ids: string[]) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function saveSequence() {
  try { sessionStorage.setItem(storageKey, JSON.stringify(sequence)); } catch { /* In-memory order still works without storage. */ }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!sequence) {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (Array.isArray(stored) && stored.length === photoIds.length && new Set(stored).size === photoIds.length && stored.every((id) => photoIds.includes(id))) sequence = stored;
    } catch { /* Ignore unavailable or invalid visit storage. */ }
    sequence ??= shuffled(photoIds);
    saveSequence();
    listeners.forEach((notify) => notify());
  }
  return () => { listeners.delete(listener); };
}
function getSnapshot() { return sequence; }
function getServerSnapshot() { return null; }
const number = (value: number) => String(value).padStart(3, "0");

function Photo({ photo, gallery = false }: { photo: typeof photos[number]; gallery?: boolean }) {
  return (
    // Local files already have responsive variants and stripped metadata.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={gallery ? photo.image.src : photo.image.thumbnail}
      srcSet={photo.image.srcSet}
      sizes={gallery ? "(min-width: 1440px) 1344px, 94vw" : "(min-width: 1200px) 17vw, (min-width: 720px) 23vw, (min-width: 480px) 30vw, 44vw"}
      width={photo.image.width} height={photo.image.height}
      alt={`${photo.id}${photo.location ? ` — ${photo.location.place}, ${photo.location.country}` : " — Minecraft"}`}
      loading={gallery ? "eager" : "lazy"} decoding="async"
      className={gallery ? styles.largeImage : styles.thumbnail}
    />
  );
}

export function Collection() {
  const order = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [view, setView] = useState<"index" | "gallery">("index");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const indexScroll = useRef(0);
  const previousControl = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<string | null>(null);
  const previousView = useRef(view);
  const orderedPhotos = (order || photoIds).map((id) => photos.find((photo) => photo.id === id)!);
  const selected = Math.max(0, orderedPhotos.findIndex((photo) => photo.id === selectedId));
  const photo = orderedPhotos[selected];

  function changeView(next: "index" | "gallery", id?: string) {
    if (id) { setSelectedId(id); returnFocus.current = id; }
    if (next === view) return;
    if (view === "index") indexScroll.current = window.scrollY;
    setView(next);
  }
  useLayoutEffect(() => {
    if (previousView.current === view) return;
    previousView.current = view;
    window.scrollTo({ top: view === "index" ? indexScroll.current : 0, behavior: "instant" });
    if (view === "index" && returnFocus.current) document.getElementById(`photo-${returnFocus.current}`)?.focus({ preventScroll: true });
    if (view === "gallery") previousControl.current?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    if (view !== "gallery") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)))) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      setSelectedId(orderedPhotos[(selected + direction + orderedPhotos.length) % orderedPhotos.length].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, selected, orderedPhotos]);
  function shuffle() {
    setSelectedId(photo.id);
    let next = shuffled(photoIds);
    while (next.length > 1 && next.every((id, i) => id === sequence?.[i])) next = shuffled(photoIds);
    sequence = next;
    saveSequence();
    listeners.forEach((notify) => notify());
    setAnnouncement("Photographs shuffled.");
  }
  const details = [
    ["TIME", photo.capture.time], ["CAMERA", photo.technical.camera],
    ["FOCAL LENGTH", photo.technical.focalLength], ["APERTURE", photo.technical.aperture],
    ["EXPOSURE", photo.technical.exposure], ["ISO", photo.technical.iso], ["ALTITUDE", photo.technical.altitude],
  ].filter(([, value]) => value);
  return (
    <div className={styles.collection}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Collection</h1>
        <nav className={styles.views} aria-label="Collection views">
          <button type="button" className={styles.control} aria-pressed={view === "index"} onClick={() => changeView("index")}><span className="link">Index</span></button>
          <span aria-hidden="true">/</span>
          <button type="button" className={styles.control} aria-pressed={view === "gallery"} onClick={() => changeView("gallery")}><span className="link">Gallery</span></button>
          <span aria-hidden="true">/</span>
          <button type="button" className={styles.control} onClick={shuffle}><span className="link">Shuffle</span></button>
        </nav>
      </div>
      <p className="sr-only" role="status">{announcement}</p>
      <div hidden={view !== "index"}>
        <div className={styles.grid} style={{ visibility: order ? "visible" : "hidden" }} aria-label="Photographic index" aria-busy={!order}>
          {orderedPhotos.map((item) => (
            <button type="button" id={`photo-${item.id}`} key={item.id} className={styles.cell} aria-label={`Open ${item.id}${item.location ? `, ${item.location.place}` : ", Minecraft"} in Gallery`} onClick={() => changeView("gallery", item.id)}><Photo photo={item} /></button>
          ))}
        </div>
      </div>
      {view === "gallery" && (
        <section aria-label="Photograph gallery">
          <div className={styles.galleryNavigation}>
            <div className={styles.steps}>
              <button ref={previousControl} type="button" className={styles.control} onClick={() => setSelectedId(orderedPhotos[(selected - 1 + orderedPhotos.length) % orderedPhotos.length].id)}><span className="link">Previous</span></button>
              <button type="button" className={styles.control} onClick={() => setSelectedId(orderedPhotos[(selected + 1) % orderedPhotos.length].id)}><span className="link">Next</span></button>
            </div>
            <span className={styles.counter} aria-live="polite" aria-atomic="true">{number(selected + 1)} / {number(photos.length)}</span>
          </div>
          <div className={styles.stage}><Photo key={photo.id} photo={photo} gallery /></div>
          <div className={styles.details}>
            <div className={styles.archiveHeading}><span>{photo.id}</span><span className={styles.counter}>{number(selected + 1)} / {number(photos.length)}</span></div>
            {photo.location ? <h2 className={styles.location}>{photo.location.place}<span>{photo.location.country}</span></h2> : photo.kind === "game-screenshot" ? <h2 className={styles.location}>Minecraft</h2> : null}
            {photo.capture.date && <p className={styles.date}><span className={styles.label}>Captured</span>{photo.capture.date}</p>}
            {details.length > 0 && <dl className={styles.technical}>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
          </div>
        </section>
      )}
    </div>
  );
}
