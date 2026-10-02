/**
 * The room's scale, read back out of the markup the server rendered.
 *
 * The voting cards are the scale, so there is no need to ship it a second time
 * as data: whatever the visitor can click is exactly what the server thinks the
 * room offers.
 */

/** The break card, which is drawn rather than written. */
export const COFFEE = 1000;

/**
 * Everything the board needs to draw a revealed vote.
 *
 * @returns {{labels: Map<number, string>, descriptions: Map<number, string>, emoji: boolean}}
 *   labels maps a card value to the label the voter saw, descriptions to the
 *   words behind an emoji label (absent for scales that already read as text),
 *   and emoji says whether the break card is a glyph rather than the artwork.
 */
export function cards() {
  const labels = new Map();
  const descriptions = new Map();
  document.querySelectorAll(".voting-card").forEach((card) => {
    const value = Number(card.dataset.value);
    labels.set(value, card.dataset.label);
    if (card.dataset.description) {
      descriptions.set(value, card.dataset.description);
    }
  });
  const list = document.querySelector(".voting-card-list");
  return { labels, descriptions, emoji: list?.dataset.emoji === "true" };
}
