import styles from "./HeroParticles.module.scss";

// [left %, bottom %, size px, colour, duration s, delay s] — as placed in the design.
const PARTICLES: [number, number, number, string, number, number][] = [
  [5, 8, 3, "#d2cefd", 8, 0],
  [11, 20, 2, "#b5abfc", 9.5, 1.2],
  [17, 4, 2, "#e4e7f5", 7.5, 3.4],
  [22, 34, 3, "#968ae0", 10, 0.6],
  [28, 12, 2, "#d2cefd", 8.8, 4.2],
  [33, 26, 2, "#b5abfc", 11, 2.1],
  [39, 6, 3, "#e4e7f5", 7.8, 5.5],
  [44, 18, 2, "#968ae0", 9.2, 1.8],
  [49, 40, 2, "#d2cefd", 10.5, 3.9],
  [54, 10, 3, "#b5abfc", 8.4, 0.3],
  [59, 28, 2, "#e4e7f5", 9.8, 6.1],
  [64, 2, 2, "#968ae0", 7.2, 2.7],
  [69, 22, 3, "#d2cefd", 10.2, 4.8],
  [74, 36, 2, "#b5abfc", 8.6, 1.5],
  [79, 14, 2, "#e4e7f5", 9.4, 5.2],
  [84, 6, 3, "#968ae0", 7.6, 2.4],
  [89, 30, 2, "#d2cefd", 10.8, 0.9],
  [94, 16, 2, "#b5abfc", 8.2, 3.1],
  [8, 44, 2, "#e4e7f5", 9.6, 6.4],
  [36, 48, 2, "#968ae0", 11.2, 2.9],
  [61, 52, 2, "#d2cefd", 10.6, 5.8],
  [86, 46, 3, "#b5abfc", 9, 1.1],
  [46, 44, 2, "#968ae0", 19, 11],
];

export function HeroParticles() {
  return (
    <div className={styles.field} aria-hidden="true">
      {PARTICLES.map(([left, bottom, size, color, duration, delay], i) => (
        <span
          key={i}
          className={styles.particle}
          style={{
            left: `${left}%`,
            bottom: `${bottom}%`,
            width: size,
            height: size,
            background: color,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}
