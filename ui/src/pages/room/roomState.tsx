import { Accessor, JSX, batch, createContext, createSignal, useContext, createEffect } from "solid-js";
import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { username } from "../../common/state";
import { SortOrder, User } from "../../common/user";
import {
  RoundToReveal,
  isCancelReveal,
  isPong,
  isRoundRevealAvailable,
  isRoundRevealed,
  isRoundStarted,
  isRoundToReveal,
  isUserVoted,
  isUsersUpdated
} from "../../common/ws-events";
import { getClosestScaleSymbol } from "../../common/scales";
export const RoundStatuses = {
  NotStarted: "NotStarted",
  Started: "Started",
  Revealable: "Revealable",
  Revealing: "Revealing",
  Revealed: "Revealed",
} as const;

export const RoomContext = createContext<{
  voters: User[],
  setVoters: SetStoreFunction<User[]>;
  spectators: User[],
  setSpectators: SetStoreFunction<User[]>;

  roundStatus: Accessor<string>;
  revealingDuration: Accessor<number>;
  revealed: () => boolean;
  revealing: () => boolean;
  revealable: () => boolean;
  averageScore: Accessor<number | null>;
  standardDeviation: Accessor<number | null>;
  verdict: Accessor<string | null>;
  roundScore: () => string | undefined;
  addPointsToVoter: (points: number) => void;
  handleWsMessage: (event: MessageEvent<unknown>) => void;
  sortOrder: Accessor<SortOrder>;
  setSortOrder: (order: SortOrder) => void;
  scaleType: Accessor<string>;
}>();
export type RoomContext = typeof RoomContext;
export function RoomProvider(props: { children: JSX.ArrayElement; }) {
  const [voters, setVoters] = createStore<User[]>([]);
  const [spectators, setSpectators] = createStore<User[]>([]);
  const [roundStatus, setRoundStatus] = createSignal<string>(RoundStatuses.Started);
  const [revealingDuration, setRevealingDuration] = createSignal<number>(0);
  const revealed = () => roundStatus() === RoundStatuses.Revealed;
  const revealing = () => roundStatus() === RoundStatuses.Revealing;
  const revealable = () => roundStatus() === RoundStatuses.Revealable;
  const [averageScore, setAverageScore] = createSignal<number | null>(null);
  const [standardDeviation, setStandardDeviation] = createSignal<number | null>(null);
  const [verdict, setVerdict] = createSignal<string | null>(null);
  const [sortOrder, setSortOrder] = createSignal<SortOrder>("none");
  const [scaleType, setScaleType] = createSignal<string>("fibonacci");

  createEffect(() => {
    if (!revealed()) {
      setSortOrder("none");
    } else {
      setSortOrder("asc");
    }
  });

  const roundScore = () => {
    const avg = averageScore();
    const sd = standardDeviation();
    const v = verdict();
    if (avg == null || sd == null || v == null) return undefined;
    return `Avg: ${avg.toFixed(1)} | SD: ${sd.toFixed(1)} | Verdict: ${v}`;
  };
  function addPointsToVoter(points: number) {
    setVoters(
      (voter) => voter.username === username(),
      produce((voter) => {
        voter.points = points;
      })
    );
  }
  function handleWsMessage(event: MessageEvent<unknown>): void {
    let data: any = event.data;
    try {
      data = JSON.parse(data as string);
    } catch (e) {
      console.error(e);
    }
    if (isUsersUpdated(data)) {
      setScaleType(data.scale);
      const v = data.users
        .filter((u) => u.isVoter)
        .map((u) => ({
          username: u.username,
          voted: u.hasVoted,
          points: voters.find((v) => v.username === u.username)?.points,
        }));
      const s: User[] = data.users
        .filter((u) => !u.isVoter)
        .map((u) => ({
          username: u.username,
          voted: false,
        }));
      setVoters(v);
      setSpectators(s);
    } else if (isRoundRevealAvailable(data)) {
      if (data.revealAvailable)
        setRoundStatus(RoundStatuses.Revealable);
      else setRoundStatus(RoundStatuses.Started);
    } else if (isUserVoted(data)) {
      setVoters(
        (voter) => voter.username === data.username,
        produce((voter) => {
          voter.voted = true;
        })
      );
    } else if (isRoundToReveal(data)) {
      ((data: RoundToReveal) => {
        batch(() => {
          setRevealingDuration(data.after);
          setRoundStatus(RoundStatuses.Revealing);
        });
      })(data);
    } else if (isCancelReveal(data)) {
      if (revealing())
        setRoundStatus(RoundStatuses.Revealable);
    }
    else if (isRoundRevealed(data)) {
      const numericVotes = Object.values(data.votes).filter((val) => val < 100);
      const count = numericVotes.length;
      let averageScore = 0;
      let stdDev = 0;
      let calculatedVerdict = "?";

      if (count > 0) {
        averageScore = numericVotes.reduce((a, b) => a + b, 0) / count;
        const variance = numericVotes.reduce((sum, val) => sum + Math.pow(val - averageScore, 2), 0) / count;
        stdDev = Math.sqrt(variance);
        calculatedVerdict = getClosestScaleSymbol(scaleType(), averageScore + stdDev / 2);
      } else {
        const allVotes = Object.values(data.votes);
        if (allVotes.includes(1000)) {
          calculatedVerdict = "☕";
        } else {
          calculatedVerdict = "?";
        }
      }

      batch(() => {
        setAverageScore(count > 0 ? averageScore : 0);
        setStandardDeviation(count > 0 ? stdDev : 0);
        setVerdict(calculatedVerdict);
        setRoundStatus(RoundStatuses.Revealed);
        setVoters(
          produce((voters) =>
            voters.map((voter) => {
              voter.points = data.votes[voter.username];
              return voter;
            })
          )
        );
      });
    }
    else if (isRoundStarted(data)) {
      batch(() => {
        setRoundStatus(RoundStatuses.Started);
        setVoters(voters.map((v) => ({ ...v, voted: false, points: undefined })));
        setAverageScore(null);
        setStandardDeviation(null);
        setVerdict(null);
      });
    } else if (isPong(data)) {
      // ignore
    } else {
      console.error("Unhandled message", data);
    }
  }
  const ctx = {
    addPointsToVoter,
    averageScore,
    standardDeviation,
    verdict,
    handleWsMessage,
    roundStatus,
    revealable,
    revealed,
    revealing,
    revealingDuration,
    roundScore,
    setSpectators,
    setVoters, spectators, voters,
    sortOrder,
    setSortOrder,
    scaleType,
  };
  return <RoomContext.Provider value={ctx}>{props.children}</RoomContext.Provider>;
}

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("room context not initialzed");
  return ctx;
}
