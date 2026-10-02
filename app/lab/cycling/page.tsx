import type { Metadata } from "next";
import { CyclingGame } from "@/components/lab/cycling/CyclingGame";

export const metadata: Metadata = { title: "Mossbend · Lab" };

export default function CyclingPage() {
  return <CyclingGame />;
}
