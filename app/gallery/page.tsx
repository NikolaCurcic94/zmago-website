import { MAIN_ID } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import styles from "./page.module.scss";

export const metadata = pageMetadata({
  title: "Gallery",
  description: "Zmago from every side: renders of the fan-made LEGO dragon, from its head and claws to the tail and wings.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <main id={MAIN_ID} className={styles["gallery-page"]}>
      <GalleryHeader />
      <GalleryGrid />
    </main>
  );
}
