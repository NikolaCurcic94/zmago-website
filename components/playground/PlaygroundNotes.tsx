import styles from "./PlaygroundNotes.module.scss";

const NOTES = [
  {
    title: "What ships here later",
    body: "The GLB loads into this stage with orbit, zoom and reset bound to the camera, and the four sliders bound to the head, arm and wing nodes of the rig.",
  },
  {
    title: "Behaviour",
    body: "Poses animate between saved joint sets. Idle breathing runs until the visitor touches a control, then hands over.",
  },
  {
    title: "On mobile",
    body: "The panel drops to a bottom bar, one row of poses and a sheet for joints, so the model keeps the upper two thirds of the screen.",
  },
];

export function PlaygroundNotes() {
  return (
    <div className={styles.notes}>
      {NOTES.map(({ title, body }) => (
        <div key={title}>
          <div className={styles.title}>{title}</div>
          <p className={styles.body}>{body}</p>
        </div>
      ))}
    </div>
  );
}
