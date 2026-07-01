import { Accessor, createEffect, onMount } from "solid-js";

// FLIP (First, Last, Invert, Play) animation for a container whose direct
// children get reordered. The directive owns all DOM measurement so components
// that use it stay purely declarative.
const DURATION_MS = 600;
const EASING = "cubic-bezier(0.25, 0.8, 0.25, 1)";

export function flip(el: HTMLElement, value: Accessor<unknown>) {
  const measure = () => {
    const rects = new Map<Element, DOMRect>();
    for (const child of Array.from(el.children)) {
      rects.set(child, child.getBoundingClientRect());
    }
    return rects;
  };

  let previous = new Map<Element, DOMRect>();
  onMount(() => {
    previous = measure();
  });

  createEffect(() => {
    // Re-run whenever the reactive source (e.g. the sorted list) changes.
    value();

    // "Last": positions after the DOM has been updated by the reactive change.
    const current = measure();

    current.forEach((last, child) => {
      const first = previous.get(child);
      if (!first) return;
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (dx === 0 && dy === 0) return;

      const node = child as HTMLElement;
      // "Invert": jump back to the old position without animating.
      node.style.transition = "none";
      node.style.transform = `translate(${dx}px, ${dy}px)`;

      // "Play": on the next frame, release to the natural position.
      requestAnimationFrame(() => {
        node.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
        node.style.transform = "";
        const cleanup = () => {
          node.style.transition = "";
          node.removeEventListener("transitionend", cleanup);
        };
        node.addEventListener("transitionend", cleanup);
      });
    });

    previous = current;
  });
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      flip: unknown;
    }
  }
}
