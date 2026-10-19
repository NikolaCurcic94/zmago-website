"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's animation: a seamless 19.5 s loop recorded from the live model (HeroModel), played as video.
 * Video carries no transparency in Safari, so each file holds the picture twice, stacked: the colour on top
 * (already multiplied by its alpha) and the alpha below, as grey. A tiny WebGL shader puts the two back
 * together on a transparent canvas, so the hero's gradient, glow and particles show through as before.
 * Hardware-decoded video and one textured square per new video frame: far lighter than drawing the 3D model.
 */

type Variant = { src: string; type: string };

/** Per size, best first: AV1 (Chrome, Edge, Firefox, Android), HEVC (Safari), H.264 (anything else). */
const VARIANTS: Record<"small" | "large", Variant[]> = {
  small: [
    { src: "/videos/hero-loop-960.webm", type: 'video/webm; codecs="av01.0.08M.08"' },
    { src: "/videos/hero-loop-960-hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L120.90"' },
    { src: "/videos/hero-loop-960.mp4", type: 'video/mp4; codecs="avc1.640028"' },
  ],
  large: [
    { src: "/videos/hero-loop-1440.webm", type: 'video/webm; codecs="av01.0.12M.08"' },
    { src: "/videos/hero-loop-1440-hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L150.90"' },
    { src: "/videos/hero-loop-1440.mp4", type: 'video/mp4; codecs="avc1.640032"' },
  ],
};

/**
 * Device pixels the dragon's box spans from which the 1440 px file is worth its extra ~0.8 MB (high-density desktop
 * screens). Phones (up to ~1300 px across even at 3×) and tablets keep the 960 px one.
 */
const LARGE_FROM = 1400;

const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Top half: colour × alpha; bottom half: alpha. Output stays premultiplied, as the canvas expects.
const FRAGMENT = `
precision mediump float;
uniform sampler2D frame;
varying vec2 uv;
void main() {
  vec3 colour = texture2D(frame, vec2(uv.x, uv.y * 0.5)).rgb;
  float alpha = texture2D(frame, vec2(uv.x, 0.5 + uv.y * 0.5)).g;
  gl_FragColor = vec4(min(colour, vec3(alpha)), alpha);
}`;

function pickVariant(boxWidth: number): Variant | null {
  const probe = document.createElement("video");
  const size = boxWidth * window.devicePixelRatio >= LARGE_FROM ? "large" : "small";
  return VARIANTS[size].find((variant) => probe.canPlayType(variant.type) !== "") ?? null;
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

type HeroVideoProps = {
  /** The hero is on screen: play. Off screen the video is paused. */
  active: boolean;
  /** First frame drawn: the hero can cross-fade to it. */
  onReady: () => void;
  /** Cannot play here (no WebGL, no codec, autoplay refused, load error): the still render stays. */
  onFail: () => void;
};

export function HeroVideo({ active, onReady, onFail }: HeroVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeRef = useRef(active);
  const callbacks = useRef({ onReady, onFail });
  const loopControl = useRef<{ start: () => void; stop: () => void } | null>(null);
  useEffect(() => {
    callbacks.current = { onReady, onFail };
  }, [onReady, onFail]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fail = (reason?: unknown) => {
      if (process.env.NODE_ENV !== "production") console.warn("HeroVideo: falling back to the still render", reason);
      callbacks.current.onFail();
    };

    const variant = pickVariant(canvas.clientWidth);
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" });
    if (!variant || !gl) return fail(variant ? "no WebGL" : "no playable video format");

    // A remount (React's development double run) gets the same context back: it must still be alive.
    if (gl.isContextLost()) return fail("context lost");
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return fail("shader");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fail("shader link");
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.preload = "auto";
    videoRef.current = video;

    let disposed = false;
    let drawn = false;
    let frameRequest = 0;
    let lastTime = -1;
    // Checked once per display frame; the texture is uploaded only when the video has moved on to a new frame.
    const tick = () => {
      frameRequest = requestAnimationFrame(tick);
      if (disposed || video.readyState < 2 || (drawn && video.currentTime === lastTime)) return;
      lastTime = video.currentTime;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!drawn) {
        drawn = true;
        callbacks.current.onReady();
      }
    };
    loopControl.current = {
      start: () => {
        if (!frameRequest) frameRequest = requestAnimationFrame(tick);
      },
      stop: () => {
        cancelAnimationFrame(frameRequest);
        frameRequest = 0;
      },
    };
    const onMetadata = () => {
      // The drawing buffer at the video's own size (one half of it); CSS scales it to the dragon's box.
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight / 2;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const play = () => {
      if (activeRef.current && !document.hidden) video.play().catch(fail);
    };
    const onVisibility = () => (document.hidden ? video.pause() : play());

    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("canplay", play, { once: true });
    video.addEventListener("error", fail);
    canvas.addEventListener("webglcontextlost", fail);
    document.addEventListener("visibilitychange", onVisibility);
    video.src = variant.src;
    loopControl.current.start();

    return () => {
      disposed = true;
      loopControl.current?.stop();
      loopControl.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", fail);
      video.removeEventListener("error", fail);
      video.pause();
      video.removeAttribute("src");
      video.load();
      videoRef.current = null;
    };
  }, []);

  // On screen it plays, off screen it pauses (the last frame stays on the canvas).
  useEffect(() => {
    activeRef.current = active;
    const video = videoRef.current;
    if (active) loopControl.current?.start();
    else loopControl.current?.stop();
    if (!video || video.readyState < 2) return;
    if (active && !document.hidden) video.play().catch(() => callbacks.current.onFail());
    else video.pause();
  }, [active]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} aria-hidden="true" />;
}
