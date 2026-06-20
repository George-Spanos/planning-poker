import { Component, createEffect, createSignal } from "solid-js";
import { isSpectator } from "../../common/state";
import { VotingCard } from "../card/votingCard";
import "./votingCardList.css";
import { useRoomContext } from "../../pages/room/roomState";
import { SCALES } from "../../common/scales";

export const [selectedCard, setSelectedCard] = createSignal<number | null>(
  null
);

export const VotingCardList: Component = () => {
  const { revealed, revealing, scaleType } = useRoomContext();
  createEffect((prev) => {
    if (prev && !revealed()) {
      setSelectedCard(null);
    }
    return revealed();
  }, false);
  const canSelectCard = () => !isSpectator() && !revealing() && !revealed();
  const scale = () => SCALES[scaleType()] || SCALES.fibonacci;
  return (
    <div class="voting-card-list" data-testid="voting-card-list">
      {scale().cards.map((card) => (
        <VotingCard
          points={card.value}
          label={card.label}
          selected={selectedCard() === card.value}
          action={() => (canSelectCard() ? setSelectedCard(card.value) : null)}
        />
      ))}
    </div>
  );
};
