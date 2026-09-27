import type { Metadata } from "next";
import { PlaygroundStage } from "@/components/playground/PlaygroundStage";
import { PlaygroundNotes } from "@/components/playground/PlaygroundNotes";

export const metadata: Metadata = {
  title: "Playground",
  description: "Handle the model — orbit, pose and zoom Zmago, a fan-made LEGO dragon.",
};

export default function PlaygroundPage() {
  return (
    <main style={{ position: "relative" }}>
      <PlaygroundStage />
      <PlaygroundNotes />
    </main>
  );
}
