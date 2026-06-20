import { Component, For, createSignal, createMemo, createEffect, Show } from "solid-js";
import { User } from "../../common/user";
import { Card } from "../card/card";
import "./board.css";
import { useRoomContext } from "../../pages/room/roomState";

export const Board: Component<{ users: User[]; }> = (props) => {
  const { revealed, sortOrder } = useRoomContext();

  // Keep track of card positions before they update in the DOM
  let firstRects: Map<string, { top: number; left: number }> | null = null;

  const measurePositions = () => {
    const rects = new Map<string, { top: number; left: number }>();
    const elements = document.querySelectorAll(".board .vote");
    elements.forEach((el) => {
      const usernameEl = el.querySelector(".username");
      const username = usernameEl?.textContent;
      if (username) {
        const rect = el.getBoundingClientRect();
        rects.set(username, { top: rect.top, left: rect.left });
      }
    });
    return rects;
  };

  const sortedUsers = createMemo(() => {
    // Measure layout positions BEFORE they are updated in the DOM.
    // Since createMemo runs synchronously during state updates,
    // the DOM elements are still in their previous positions.
    const currentRects = measurePositions();
    if (currentRects.size > 0) {
      firstRects = currentRects;
    }

    const order = sortOrder();
    const users = props.users;
    if (order === "none" || !revealed()) {
      return users;
    }

    return [...users].sort((a, b) => {
      const aVal = a.points;
      const bVal = b.points;

      // Handle cases where players haven't voted (undefined points)
      if (aVal === undefined && bVal === undefined) {
        return a.username.localeCompare(b.username);
      }
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;

      if (aVal !== bVal) {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      return a.username.localeCompare(b.username);
    });
  });

  // Perform FLIP animation after the DOM updates
  createEffect(() => {
    // Depend on sortedUsers so this runs after any sorting change
    const users = sortedUsers();

    if (firstRects) {
      const rects = firstRects;
      firstRects = null; // Clear immediately

      const animationsToPlay: Array<{ el: HTMLElement; dx: number; dy: number }> = [];

      // 1. Measure NEW positions and calculate deltas (Invert step)
      const elements = document.querySelectorAll(".board .vote");
      elements.forEach((el) => {
        const usernameEl = el.querySelector(".username");
        const username = usernameEl?.textContent;
        if (username) {
          const first = rects.get(username);
          if (first) {
            const last = el.getBoundingClientRect();
            const dx = first.left - last.left;
            const dy = first.top - last.top;

            if (dx !== 0 || dy !== 0) {
              const htmlEl = el as HTMLElement;
              // Instantly translate to old positions without animation
              htmlEl.style.transition = "none";
              htmlEl.style.transform = `translate(${dx}px, ${dy}px)`;
              animationsToPlay.push({ el: htmlEl, dx, dy });
            }
          }
        }
      });

      // 2. Play transitions in the next animation frame (Play step)
      if (animationsToPlay.length > 0) {
        requestAnimationFrame(() => {
          animationsToPlay.forEach(({ el }) => {
            el.style.transition = "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)";
            el.style.transform = "";

            const onTransitionEnd = () => {
              el.style.transition = "";
              el.removeEventListener("transitionend", onTransitionEnd);
            };
            el.addEventListener("transitionend", onTransitionEnd);
          });
        });
      }
    }
  });

  return (
    <div class="board-container">
      <div class="board">
        <For each={sortedUsers()}>
          {(user) => (
            <div class="vote" data-testid={`board-card-${user.username}`}>
              <Card
                points={user.points}
                voted={user.voted}
                revealed={revealed()}
              />
              <span class="username">{user.username}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

