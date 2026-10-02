import type { Metadata } from "next";
import { OrangeExperiment } from "@/components/lab/OrangeExperiment";

export const metadata: Metadata = {
  title: "Orange",
};

export default function OrangePage() {
  return <OrangeExperiment />;
}
