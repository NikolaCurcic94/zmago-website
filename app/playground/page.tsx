import { MAIN_ID } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { PlaygroundStage } from "@/components/playground/PlaygroundStage";

export const metadata = pageMetadata({
  title: "Playground",
  description: "Handle the model: orbit, zoom and pose Zmago, a fan-made LEGO dragon, in 3D, from its jaw and head to its claws, wings and tail.",
  path: "/playground",
});

export default function PlaygroundPage() {
  return (
    <main id={MAIN_ID} style={{ position: "relative" }}>
      {/* The page's title for screen readers and search engines; the stage shows it as a small label. */}
      <h1 className="sr-only">Playground: handle Zmago the Dragon in 3D</h1>
      <PlaygroundStage />
    </main>
  );
}
