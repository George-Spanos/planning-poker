import { Component, Match, mergeProps, Switch } from "solid-js";
import "./card.css";
export const VotingCard: Component<{
  selected?: boolean;
  points: number;
  label?: string;
  description?: string;
  scaleType?: string;
  action: () => void;
}> = (_props) => {
  const props = mergeProps({ selected: false }, _props);
  const displayLabel = () => props.label !== undefined ? props.label : (props.points === 100 ? "?" : props.points.toString());
  const isEmojiScale = () => props.scaleType === "animals";
  return (
    <button
      classList={{ "voting-card": true, selected: props.selected }}
      data-testid={`voting-card-${props.points}`}
      onClick={props.action}
      title={props.description}
      aria-label={props.description || props.label}
    >
      <Switch fallback={<span>{displayLabel()}</span>}>
        <Match when={props.points === 1000 && !isEmojiScale()}>
          <img src={`/cup-small-${props.selected ? "white" : "black"}.svg`} />
        </Match>
      </Switch>
    </button>
  );
};
