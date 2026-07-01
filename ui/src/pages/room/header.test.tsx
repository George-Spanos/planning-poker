import { render, screen } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import { createSignal } from "solid-js";
import { RoomHeader } from "./header";
import { RoomContext, RoundStatuses } from "./roomState";

const renderRevealedHeader = (scaleType: string, verdict: string) => {
  const [sortOrder, setSortOrder] = createSignal<"none" | "asc" | "desc">("asc");
  const mockContext = {
    voters: [],
    setVoters: vi.fn(),
    spectators: [],
    setSpectators: vi.fn(),
    roundStatus: () => RoundStatuses.Revealed,
    revealingDuration: () => 0,
    revealed: () => true,
    revealing: () => false,
    revealable: () => false,
    averageScore: () => 8,
    standardDeviation: () => 5,
    verdict: () => verdict,
    roundScore: () => "",
    addPointsToVoter: vi.fn(),
    handleWsMessage: vi.fn(),
    sortOrder,
    setSortOrder,
    scaleType: () => scaleType,
  };
  return render(() => (
    <RoomContext.Provider value={mockContext as any}>
      <RoomHeader />
    </RoomContext.Provider>
  ));
};

describe("RoomHeader stats per scale", () => {
  it("shows average and standard deviation for a numeric scale", () => {
    renderRevealedHeader("fibonacci", "8");
    expect(screen.getByText("Average")).toBeTruthy();
    expect(screen.getByText("Standard Deviation")).toBeTruthy();
    expect(screen.getByText("Verdict")).toBeTruthy();
    expect(screen.getByText("8.0")).toBeTruthy();
  });

  it("hides numeric stats for a non-numeric scale but keeps the verdict", () => {
    renderRevealedHeader("tshirt", "XL");
    expect(screen.queryByText("Average")).toBeNull();
    expect(screen.queryByText("Standard Deviation")).toBeNull();
    expect(screen.getByText("Verdict")).toBeTruthy();
    expect(screen.getByText("XL")).toBeTruthy();
  });

  it("always renders the sort controls once revealed", () => {
    renderRevealedHeader("fibonacci", "8");
    expect(screen.getByTestId("sort-controls")).toBeTruthy();
    expect(screen.getByTestId("sort-btn-none")).toBeTruthy();
    expect(screen.getByTestId("sort-btn-asc")).toBeTruthy();
    expect(screen.getByTestId("sort-btn-desc")).toBeTruthy();
  });
});
