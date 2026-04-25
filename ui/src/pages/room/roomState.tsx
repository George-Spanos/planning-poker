import { Accessor, JSX, batch, createContext, createSignal, useContext } from "solid-js";
import { SetStoreFunction, createStore, produce } from "solid-js/store";
import { username } from "../../common/state";
import { User } from "../../common/user";
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
  verdict: Accessor<number | null>;
  roundScore: () => string | undefined;
  addPointsToVoter: (points: number) => void;
  handleWsMessage: (event: MessageEvent<unknown>) => void;
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
  const [verdict, setVerdict] = createSignal<number | null>(null);

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
      const votes = Object.values(data.votes);
      const count = votes.length;
      const averageScore = count > 0 ? votes.reduce((a, b) => a + b, 0) / count : 0;

      const variance = count > 0 ? votes.reduce((sum, val) => sum + Math.pow(val - averageScore, 2), 0) / count : 0;
      const stdDev = Math.sqrt(variance);

      const calculatedVerdict = getClosestFibonacci(averageScore + stdDev / 2);

      batch(() => {
        setAverageScore(averageScore);
        setStandardDeviation(stdDev);
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
  };
  return <RoomContext.Provider value={ctx}>{props.children}</RoomContext.Provider>;
}

function getClosestFibonacci(num: number): number {
  if (num <= 0) return 0;
  let a = 0;
  let b = 1;
  while (b < num) {
    const temp = b;
    b = a + b;
    a = temp;
  }
  return (num - a < b - num) ? a : b;
};

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("room context not initialzed");
  return ctx;
}
