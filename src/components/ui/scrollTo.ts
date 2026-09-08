/**
 * Velocity-based rAF scroller (the reference's nav scroll): speed ramps by
 * 0.6px/frame², capped at 20% of the remaining distance so it eases out.
 * Any wheel / touch / key input cancels it.
 */

const ACCEL = 0.6;
const CAP = 0.2;

let raf = 0;
let cleanup: (() => void) | null = null;

export function cancelScroll() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  cleanup?.();
  cleanup = null;
}

export function scrollToY(target: number) {
  cancelScroll();
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const dest = Math.min(Math.max(0, target), max);
  let v = 0;

  const onInput = () => cancelScroll();
  const opts: AddEventListenerOptions = { passive: true };
  window.addEventListener("wheel", onInput, opts);
  window.addEventListener("touchstart", onInput, opts);
  window.addEventListener("keydown", onInput, opts);
  cleanup = () => {
    window.removeEventListener("wheel", onInput);
    window.removeEventListener("touchstart", onInput);
    window.removeEventListener("keydown", onInput);
  };

  const step = () => {
    const cur = window.scrollY;
    const remaining = dest - cur;
    const dist = Math.abs(remaining);
    if (dist <= 1) {
      window.scrollTo(0, dest);
      cancelScroll();
      return;
    }
    v = Math.min(v + ACCEL, dist * CAP);
    const px = Math.min(dist, Math.max(v, 1));
    window.scrollTo(0, cur + Math.sign(remaining) * px);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

/** Scroll to an element by id (`"top"` → 0). */
export function scrollToId(id: string) {
  if (id === "top") return scrollToY(0);
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY);
}
