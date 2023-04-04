import { useNavigate } from "@solidjs/router";
import {
  Component,
  Show,
  Suspense,
  createEffect,
  createResource,
  onCleanup,
} from "solid-js";
import { log } from "../../common/analytics";
import { Board } from "../../components/board/board";
import { SpectatorList } from "../../components/spectatorList/spectatorList";
import {
  VotingCardList,
  selectedCard,
  setSelectedCard,
} from "../../components/votingCardList/votingCardList";
import { connectToRoom, sendMessageIfOpen } from "./common";
import { RoomHeader } from "./header";
import "./index.css";
import { RoomSubheader } from "./subheader";
import { SubmitBtn } from "./submitBtn";
import { UseRootContext } from "~/common/root.state";
import { useRoomContext } from "~/common/room.state";
import { useParams } from 'solid-start';
const Room: Component = () => {
  const navigate = useNavigate();
  const [{ username, isSpectator }, { setRoomId }] = UseRootContext();
  const [{ voters, revealing }] = useRoomContext();
  const params = useParams();
  const roomId = params["id"];
  const pingMSInterval = 5000;
  let pingInterval: NodeJS.Timer | undefined;
  setRoomId(roomId);
  if (!username()) {
    navigate("/prejoin");
    return;
  }
  log("new_room");
  const [socket] = createResource(() => connectToRoom());
  onCleanup(() => {
    if (!socket.error) socket()?.close();
    clearInterval(pingInterval);
    setSelectedCard(null);
  });
  createEffect(() => {
    if (socket.loading) return;
    if (socket.error) return navigate("/");
    const ws = socket();
    if (!ws) return;
    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: "ping" }));
      else clearInterval(pingInterval);
    }, pingMSInterval);
  });
  createEffect(() => {
    if (typeof selectedCard() === "number") userVotes();
  });
  createEffect((prev) => {
    if (prev === isSpectator() || revealing()) return;
    if (isSpectator()) {
      changeRole("spectator");
      setSelectedCard(null);
    } else {
      changeRole("voter");
    }
    return isSpectator();
  });
  const userVotes = () =>
    sendMessageIfOpen(socket(), {
      type: "userToVote",
      username: username(),
      storyPoints: selectedCard(),
      roomId,
    });
  const changeRole = (role: string) =>
    sendMessageIfOpen(socket(), {
      type: "changeRole",
      username: username(),
      role,
    });

  return (
    <Suspense fallback={<p data-testid="loading">Connecting...</p>}>
      <div class="room" data-testid="room">
        <RoomHeader />
        <RoomSubheader />
        <div class="voting-area-wrapper">
          <div class="voting-area">
            <Board users={voters} />
            <Show when={!isSpectator()}>
              <SubmitBtn socket={socket()} />
            </Show>
            <VotingCardList />
          </div>
          <SpectatorList />
        </div>
      </div>
    </Suspense>
  );
};

export default Room;
