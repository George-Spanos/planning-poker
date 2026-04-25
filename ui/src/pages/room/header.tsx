import { Component, createEffect, createSignal, Show } from "solid-js";
import { ProgressBar } from "../../components/progressBar/progressBar";
import {
  RoundStatuses, useRoomContext,
} from "./roomState";

const roomHeaders = {
  Voting: "Voting is in session!",
  Ready: "Everyone's Ready",
  Revealing: "Revealing in",
  Revealed: "Average Score",
} as const;

export const RoomHeader: Component = () => {
  const { revealing, revealingDuration, roundStatus, averageScore, standardDeviation, verdict } = useRoomContext();
  let interval: NodeJS.Timer | undefined;
  const [roomHeader, setRoomHeader] = createSignal<string>(roomHeaders.Voting);

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
          <div class="stat-item">
            <span class="stat-label">Average</span>
            <span class="stat-value">{averageScore()?.toFixed(1)}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-label">Standard Deviation</span>
            <span class="stat-value">{standardDeviation()?.toFixed(1)}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item verdict">
            <span class="stat-label">Verdict</span>
            <span class="stat-value">{verdict()}</span>
          </div>
        </div>
      </Show>
      <Show when={roundStatus() === RoundStatuses.Revealing}>
        <ProgressBar duration={revealingDuration()} />
      </Show>
    </div>
  );
};
