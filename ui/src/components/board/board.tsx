import { Component, For } from "solid-js";
import { User, sortVoters } from "../../common/user";
import { Card } from "../card/card";
import { flip } from "../../common/flip";
import "./board.css";
import { useRoomContext } from "../../pages/room/roomState";

// Referencing the imported directive keeps `use:flip` from being tree-shaken.
flip;

export const Board: Component<{ users: User[]; }> = (props) => {
  const { revealed, sortOrder } = useRoomContext();

  // Sorting is a pure derivation of the users, the chosen order and whether
  // the round is revealed — no extra state, no DOM measurement here.
  const sortedUsers = () => {
    const order = sortOrder();
    if (order === "none" || !revealed()) return props.users;
    return sortVoters(props.users, order);
  };

  return (
    <div class="board" use:flip={sortedUsers()}>
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
  );
};
