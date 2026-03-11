"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const CARD_HOVER_ROTATIONS = [1, -1, 1, -1, 1] as const;
const NEO_SHADOW = "6px 6px 0px rgba(0,0,0,1)";
const NEO_SHADOW_ACTIVE = "0px 0px 0px rgba(0,0,0,1)";

export default function MarketingBento() {
  return (
    <div
      className="grid grid-flow-dense auto-rows-[minmax(0,1fr)] grid-cols-1 gap-6 font-sans font-bold md:grid-cols-3 lg:grid-cols-4"
      style={{ fontFamily: "var(--font-body-sans)" }}
    >
      {/* Card 1: TikTok / Vertical Video — col-span-1 row-span-2, 9:16 */}
      <motion.div
        className="col-span-1 row-span-2 overflow-hidden rounded-xl bg-[#E85D04]"
        style={{ boxShadow: NEO_SHADOW }}
        whileHover={{ scale: 0.97, rotate: CARD_HOVER_ROTATIONS[0] }}
        whileTap={{
          boxShadow: NEO_SHADOW_ACTIVE,
          scale: 0.98,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative h-full w-full">
          <video
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover object-center"
            style={{ aspectRatio: "9/16" }}
          />
        </div>
      </motion.div>

      {/* Card 2: YouTube Short Film — col-span-2 row-span-2, 16:9, title overlay */}
      <motion.div
        className="group col-span-2 row-span-2 overflow-hidden rounded-xl bg-[#0066FF]"
        style={{ boxShadow: NEO_SHADOW }}
        whileHover={{ scale: 0.97, rotate: CARD_HOVER_ROTATIONS[1] }}
        whileTap={{
          boxShadow: NEO_SHADOW_ACTIVE,
          scale: 0.98,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative h-full w-full">
          <video
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            style={{ aspectRatio: "16/9" }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-left font-black uppercase tracking-tight text-white drop-shadow-md">
              Brand Short Film — 16:9
            </h3>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Album Art — col-span-1 row-span-1, square, Image */}
      <motion.div
        className="col-span-1 row-span-1 overflow-hidden rounded-xl bg-[#CCFF00]"
        style={{ boxShadow: NEO_SHADOW }}
        whileHover={{ scale: 0.97, rotate: CARD_HOVER_ROTATIONS[2] }}
        whileTap={{
          boxShadow: NEO_SHADOW_ACTIVE,
          scale: 0.98,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="relative h-full w-full">
          <Image
            src="https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400&h=400&fit=crop"
            alt="Promo / Album art"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </motion.div>

      {/* Card 4: Instagram Grid — col-span-2 row-span-1, masonry mini-grid */}
      <motion.div
        className="col-span-2 row-span-1 overflow-hidden rounded-xl bg-[#FF10F0] p-2"
        style={{ boxShadow: NEO_SHADOW }}
        whileHover={{ scale: 0.97, rotate: CARD_HOVER_ROTATIONS[3] }}
        whileTap={{
          boxShadow: NEO_SHADOW_ACTIVE,
          scale: 0.98,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="grid h-full grid-cols-4 grid-rows-2 gap-1">
          <div className="rounded bg-black/20" />
          <div className="row-span-2 rounded bg-black/20" />
          <div className="rounded bg-black/20" />
          <div className="rounded bg-black/20" />
          <div className="rounded bg-black/20" />
          <div className="row-span-2 rounded bg-black/20" />
        </div>
      </motion.div>

      {/* Card 5: Campaign Strategy — col-span-1 row-span-1, text block */}
      <motion.div
        className="group col-span-1 row-span-1 flex flex-col justify-start rounded-xl bg-[#000000] px-5 py-4 text-white"
        style={{ boxShadow: NEO_SHADOW }}
        whileHover={{ scale: 0.97, rotate: CARD_HOVER_ROTATIONS[4] }}
        whileTap={{
          boxShadow: NEO_SHADOW_ACTIVE,
          scale: 0.98,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <p className="font-black uppercase leading-tight tracking-tight">
          E-commerce Campaign
        </p>
        <p className="mt-1 text-2xl font-black text-[#CCFF00]">
          300% Growth
        </p>
      </motion.div>
    </div>
  );
}
