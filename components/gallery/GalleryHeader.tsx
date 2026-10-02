import styles from "./GalleryHeader.module.scss";

export function GalleryHeader() {
  return (
    <div className={styles["gallery-header"]}>
      <div>
        <div className={styles["gallery-header__kicker"]}>Gallery</div>
        <h1 className={styles["gallery-header__title"]}>Fifteen looks at one dragon</h1>
      </div>
      <p className={styles["gallery-header__hint"]}>Click any frame to open it full screen. Arrow keys move through the set.</p>
    </div>
  );
}
