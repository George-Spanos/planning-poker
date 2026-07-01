import { Component, createEffect, createSignal, Show } from "solid-js";
import { ProgressBar } from "../../components/progressBar/progressBar";
import {
  RoundStatuses, useRoomContext,
} from "./roomState";
import { SCALES } from "../../common/scales";

const roomHeaders = {
  Voting: "Voting is in session!",
  Ready: "Everyone's Ready",
  Revealing: "Revealing in",
  Revealed: "Average Score",
} as const;

export const RoomHeader: Component = () => {
  const { revealing, revealingDuration, roundStatus, averageScore, standardDeviation, verdict, sortOrder, setSortOrder, scaleType } = useRoomContext();
  let interval: NodeJS.Timer | undefined;
  const [roomHeader, setRoomHeader] = createSignal<string>(roomHeaders.Voting);
  const isNumeric = () => {
    const scale = SCALES[scaleType()] || SCALES.fibonacci;
    return scale.numeric;
  };

  createEffect(() => {
    if (revealing()) {
      let i = revealingDuration() / 1000;
      setRoomHeader(roomHeaders.Revealing + " " + i);
      interval = setInterval(() => {
        if (i === 0) {
          clearInterval(interval);
          return;
        }
        setRoomHeader(roomHeaders.Revealing + " " + --i);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
  });

  createEffect(() => {
    switch (roundStatus()) {
      case RoundStatuses.Started:
        setRoomHeader(roomHeaders.Voting);
        break;
      case RoundStatuses.Revealable:
        setRoomHeader(roomHeaders.Ready);
        break;
    }
  });

  return (
    <div class="room-header">
      <Show
        when={roundStatus() === RoundStatuses.Revealed}
        fallback={<h2>{roomHeader()}</h2>}
      >
        <div class="stats-container" data-testid="stats-container">
          <Show when={isNumeric()}>
            <div class="item">
              <span class="label">Average</span>
              <span class="value">{averageScore()?.toFixed(1)}</span>
            </div>
            <div class="divider" />
            <div class="item">
              <span class="label">Standard Deviation</span>
              <span class="value">{standardDeviation()?.toFixed(1)}</span>
            </div>
            <div class="divider" />
          </Show>
          <div class="item verdict">
            <span class="label">Verdict</span>
            <span class="value">{verdict()}</span>
          </div>
        </div>

        <div class="sort-icon-group" data-testid="sort-controls">
          <button
            class="sort-icon-btn"
            classList={{ active: sortOrder() === "none" }}
            onClick={() => setSortOrder("none")}
            data-testid="sort-btn-none"
            title="Unsorted"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button
            class="sort-icon-btn"
            classList={{ active: sortOrder() === "asc" }}
            onClick={() => setSortOrder("asc")}
            data-testid="sort-btn-asc"
            title="Sort Ascending"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8l4-4 4 4M7 4v16M13 12h8M13 18h8M13 6h8" />
            </svg>
          </button>
          <button
            class="sort-icon-btn"
            classList={{ active: sortOrder() === "desc" }}
            onClick={() => setSortOrder("desc")}
            data-testid="sort-btn-desc"
            title="Sort Descending"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 16l4 4 4-4M7 20V4M13 12h8M13 18h8M13 6h8" />
            </svg>
          </button>
        </div>
      </Show>
      <Show when={roundStatus() === RoundStatuses.Revealing}>
        <ProgressBar duration={revealingDuration()} />
      </Show>
    </div>
  );
};
