import { Component, Match, mergeProps, Show, Switch } from "solid-js";
import "./card.css";
import { useRoomContext } from "../../pages/room/roomState";
import { SCALES } from "../../common/scales";

export const Card: Component<{
  voted?: boolean;
  points?: number;
  revealed?: boolean;
}> = (_props) => {
  const props = mergeProps({ voted: false, revealed: false }, _props);
  let roomCtx: any;
  try {
    roomCtx = useRoomContext();
  } catch (e) {
    // Gracefully handle context not initialized (e.g. in tests)
  }

  const displayLabel = () => {
    if (props.points === undefined) return "";
    if (roomCtx && typeof roomCtx.scaleType === "function") {
      const scale = SCALES[roomCtx.scaleType()] || SCALES.fibonacci;
      const card = scale.cards.find(c => c.value === props.points);
      if (card) return card.label;
    }
    return props.points === 100 ? "?" : props.points.toString();
  };

  return (
    <div
      classList={{ card: true, voted: props.voted, revealed: props.revealed }}
    >
      <Show when={isNumber(props.points)}>
        <Switch fallback={<span>{displayLabel()}</span>}>
          <Match when={props.points === 1000}>
            <img src="/cup-medium.svg" />
          </Match>
        </Switch>
      </Show>
    </div>
  );
};
function isNumber(v: unknown): v is Number {
  return typeof v === "number";
}
