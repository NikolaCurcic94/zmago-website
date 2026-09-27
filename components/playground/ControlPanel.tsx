"use client";

import { JOINT_SLIDERS, PAWS, type Joint, type ModelState } from "@/content/playground";
import styles from "./ControlPanel.module.scss";

export type ControlKey = Joint | "zoom" | "poses" | "paws" | "fingers";

type LimbControl = {
  /** Which paw this box moves (index into PAWS). */
  selected: number;
  onSelect: (index: number) => void;
  onChange: (value: number) => void;
};

type ControlPanelProps = {
  model: ModelState;
  onChange: (key: Joint | "zoom", value: number) => void;
  paw: LimbControl;
  fingers: LimbControl;
  /** Controls not yet wired to the 3D model are shown but disabled. Defaults to all enabled. */
  isEnabled?: (key: ControlKey) => boolean;
};

export function ControlPanel({ model, onChange, paw, fingers, isEnabled = () => true }: ControlPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.joints}>
        {JOINT_SLIDERS.map(({ key, label, min, max, step }) => (
          <label key={key} className={styles.slider}>
            {label}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={model[key]}
              disabled={!isEnabled(key)}
              onChange={(e) => onChange(key, Number(e.target.value))}
            />
          </label>
        ))}
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <LimbBox title="Paw" name="zm-paw" values={model.paws} control={paw} disabled={!isEnabled("paws")} />

      <div className={styles.divider} aria-hidden="true" />

      <LimbBox
        title="Fingers"
        name="zm-fingers"
        values={model.fingers}
        control={fingers}
        disabled={!isEnabled("fingers")}
      />
    </div>
  );
}

/** Pill labels, in PAWS order: front left, front right, back left, back right. */
const PAW_SHORT = ["FL", "FR", "BL", "BR"] as const;

/** One slider for the selected paw, and four radio pills (FL, FR, BL, BR — the paws) below it. */
function LimbBox({
  title,
  name,
  values,
  control,
  disabled,
}: {
  title: string;
  name: string;
  values: readonly number[];
  control: LimbControl;
  disabled: boolean;
}) {
  const { selected, onSelect, onChange } = control;
  return (
    <div className={styles.paws}>
      <label className={styles.slider}>
        <span>
          {title} <span className={styles.pawName}>· {PAWS[selected].label}</span>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={values[selected]}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </label>
      <div className={styles.pawPicker} role="radiogroup" aria-label={`${title}: paw to move`}>
        {PAWS.map(({ label }, i) => (
          <label key={label} className={styles.pawOption} title={label}>
            <input
              type="radio"
              name={name}
              value={i}
              checked={i === selected}
              disabled={disabled}
              aria-label={label}
              onChange={() => onSelect(i)}
            />
            <span aria-hidden="true">{PAW_SHORT[i]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
