import type { Metadata } from "next";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Fifteen looks at one dragon — photographs of Zmago, a fan-made LEGO creation.",
};

export default function GalleryPage() {
  return (
    <main className={styles.main}>
      <GalleryHeader />
      <GalleryGrid />
    </main>
  );
}
