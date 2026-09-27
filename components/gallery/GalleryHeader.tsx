import styles from "./GalleryHeader.module.scss";

export function GalleryHeader() {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.kicker}>Gallery</div>
        <h1 className={styles.title}>Fifteen looks at one dragon</h1>
      </div>
      <p className={styles.hint}>Click any frame to open it full screen. Arrow keys move through the set.</p>
    </div>
  );
}
