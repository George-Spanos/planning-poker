import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import { Card } from "./card";
import { RoomContext } from "../../pages/room/roomState";

const renderCard = (
  props: { points?: number; revealed?: boolean },
  scaleType?: string,
) => {
  if (!scaleType) {
    return render(() => <Card {...props} revealed />);
  }
  return render(() => (
    <RoomContext.Provider value={{ scaleType: () => scaleType } as any}>
      <Card {...props} revealed />
    </RoomContext.Provider>
  ));
};

describe("Card labels per scale", () => {
  it("shows t-shirt letters instead of raw points", () => {
    expect(renderCard({ points: 3 }, "tshirt").container.textContent).toContain("M");
    expect(renderCard({ points: 13 }, "tshirt").container.textContent).toContain("XXL");
  });

  it("shows the numeric label for fibonacci", () => {
    expect(renderCard({ points: 5 }, "fibonacci").container.textContent).toContain("5");
  });

  it("renders the ? special card", () => {
    expect(renderCard({ points: 100 }, "tshirt").container.textContent).toContain("?");
  });

  it("renders the coffee break card as an image for non-emoji scales", () => {
    const { container } = renderCard({ points: 1000 }, "tshirt");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/cup-medium.svg");
  });

  it("renders the coffee break card as an emoji for emoji scales", () => {
    const { container } = renderCard({ points: 1000 }, "animals");
    expect(container.textContent).toContain("☕");
  });

  it("falls back to raw points when there is no room context", () => {
    expect(renderCard({ points: 8 }).container.textContent).toContain("8");
    expect(renderCard({ points: 100 }).container.textContent).toContain("?");
  });
});
