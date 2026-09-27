"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FEATURED_SHOT,
  GALLERY_ROWS,
  SHOTS,
  type GalleryPlaceholder,
  type GalleryRow,
  type GalleryShot,
} from "@/content/shots";
import { FillText } from "@/components/ui/FillText";
import { Lightbox } from "./Lightbox";
import styles from "./GalleryGrid.module.scss";

const SMALL_SIZES = "(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 320px";
const WIDE_SIZES = "(max-width: 1023px) 100vw, 640px";

export function GalleryGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const featured = SHOTS[FEATURED_SHOT.index];

  return (
    <>
      <figure className={styles.featured}>
        <div className={styles.featuredFrame}>
          <Image
            src={featured.image.src}
            width={featured.image.width}
            height={featured.image.height}
            alt={featured.alt}
            className={styles.featuredImage}
            sizes="(max-width: 1320px) 100vw, 1272px"
            loading="eager"
            fetchPriority="high"
          />
          <span className={styles.featuredShade} aria-hidden="true" />
          <figcaption className={styles.featuredCaption}>
            <span className={styles.featuredTitle}>{FEATURED_SHOT.title}</span>
            <span className={styles.featuredSubtitle}>{FEATURED_SHOT.subtitle}</span>
          </figcaption>
          <OpenButton label={FEATURED_SHOT.title} onOpen={() => setOpenIndex(FEATURED_SHOT.index)} />
        </div>
      </figure>

      <div className={styles.rows}>
        {GALLERY_ROWS.map((row, i) => (
          <Row key={i} row={row} onOpen={setOpenIndex} />
        ))}
      </div>

      <Lightbox index={openIndex} onChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}

function Row({ row, onOpen }: { row: GalleryRow; onOpen: (index: number) => void }) {
  switch (row.layout) {
    case "wide-pair":
      return (
        <div className={styles.widePair}>
          <Shot shot={row.wide} wide area="wide" onOpen={onOpen} />
          <Shot shot={row.pair[0]} area="a" onOpen={onOpen} />
          <Shot shot={row.pair[1]} area="b" onOpen={onOpen} />
          <Note note={row.note} area="note" />
        </div>
      );
    case "flanked":
      return (
        <div className={styles.flanked}>
          <Shot shot={row.left} area="a" onOpen={onOpen} />
          {row.left.note && <Note note={row.left.note} area="na" />}
          <Shot shot={row.wide} wide area="wide" onOpen={onOpen} />
          <Shot shot={row.right} area="b" onOpen={onOpen} />
          {row.right.note && <Note note={row.right.note} area="nb" />}
        </div>
      );
    case "grid":
      return (
        <div className={styles.plainGrid}>
          {row.shots.map((shot, i) =>
            "placeholder" in shot ? (
              <PlaceholderShot key={`placeholder-${i}`} slot={shot} />
            ) : (
              <Shot key={shot.index} shot={shot} onOpen={onOpen} />
            ),
          )}
        </div>
      );
  }
}

type ShotProps = {
  shot: GalleryShot;
  wide?: boolean;
  /** Grid area name inside the row layout. */
  area?: string;
  onOpen: (index: number) => void;
};

function Shot({ shot: { index, caption }, wide = false, area, onOpen }: ShotProps) {
  const { image, alt } = SHOTS[index];
  return (
    <figure className={wide ? styles.wideFigure : styles.figure} style={area ? { gridArea: area } : undefined}>
      <div className={styles.frame}>
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          alt={alt}
          className={styles.image}
          sizes={wide ? WIDE_SIZES : SMALL_SIZES}
        />
        <OpenButton label={caption} onOpen={() => onOpen(index)} />
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}

/** Reserved frame for a photo still to come: same size as a small shot, not clickable. */
function PlaceholderShot({ slot }: { slot: GalleryPlaceholder }) {
  return (
    <figure className={styles.figure}>
      <div className={`${styles.frame} ${styles.placeholderFrame}`}>
        <span className={styles.placeholderLabel}>
          <span className={styles.placeholderLine} aria-hidden="true" />
          Coming soon
        </span>
      </div>
      <figcaption className={styles.caption}>{slot.caption}</figcaption>
    </figure>
  );
}

function Note({ note, area }: { note: { lead?: string; text: string }; area: string }) {
  return (
    <FillText lead={note.lead} fill="desktop" className={styles.note} style={{ gridArea: area }}>
      {note.text}
    </FillText>
  );
}

/** Transparent button over an image frame: the zoom cursor and keyboard target. */
function OpenButton({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={styles.openButton}
      aria-label={`Open “${label}” full screen`}
      aria-haspopup="dialog"
      onClick={onOpen}
    />
  );
}
