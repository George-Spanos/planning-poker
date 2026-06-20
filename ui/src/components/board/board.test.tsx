import { render, screen, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import { Board } from "./board";
import { RoomHeader } from "../../pages/room/header";
import { RoomContext, RoundStatuses } from "../../pages/room/roomState";
import { User } from "../../common/user";
import { createSignal } from "solid-js";

describe("Board component and sorting", () => {
  const mockUsers: User[] = [
    { username: "Alice", voted: true, points: 5 },
    { username: "Bob", voted: true, points: 2 },
    { username: "Charlie", voted: true, points: 8 },
    { username: "Dave", voted: false, points: undefined },
  ];

  const renderBoardWithContext = (users: User[], revealedValue: boolean) => {
    const [sortOrder, setSortOrder] = createSignal<"none" | "asc" | "desc">(revealedValue ? "asc" : "none");

    const mockContext = {
      voters: users,
      setVoters: vi.fn(),
      spectators: [],
      setSpectators: vi.fn(),
      roundStatus: () => (revealedValue ? RoundStatuses.Revealed : RoundStatuses.Started),
      revealingDuration: () => 0,
      revealed: () => revealedValue,
      revealing: () => false,
      revealable: () => false,
      averageScore: () => 5,
      standardDeviation: () => 2.4,
      verdict: () => "5",
      roundScore: () => "",
      addPointsToVoter: vi.fn(),
      handleWsMessage: vi.fn(),
      sortOrder,
      setSortOrder,
      scaleType: () => "fibonacci",
    };

    return render(() => (
      <RoomContext.Provider value={mockContext as any}>
        <div>
          <RoomHeader />
          <Board users={users} />
        </div>
      </RoomContext.Provider>
    ));
  };

  it("should render voting cards for all users", () => {
    renderBoardWithContext(mockUsers, false);
    
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("Charlie")).toBeTruthy();
    expect(screen.getByText("Dave")).toBeTruthy();
  });

  it("should not display sorting controls when votes are not revealed", () => {
    renderBoardWithContext(mockUsers, false);
    
    const controls = screen.queryByTestId("sort-controls");
    expect(controls).toBeNull();
  });

  it("should display sorting controls when votes are revealed", () => {
    renderBoardWithContext(mockUsers, true);
    
    const controls = screen.getByTestId("sort-controls");
    expect(controls).toBeTruthy();
    
    expect(screen.getByTestId("sort-btn-none")).toBeTruthy();
    expect(screen.getByTestId("sort-btn-asc")).toBeTruthy();
    expect(screen.getByTestId("sort-btn-desc")).toBeTruthy();
  });

  it("should sort cards by points ascending by default when revealed", () => {
    const { container } = renderBoardWithContext(mockUsers, true);
    
    // Default sorting on reveal should be "asc".
    // Points: Bob (2), Alice (5), Charlie (8), Dave (undefined)
    // Order in DOM: Bob, Alice, Charlie, Dave
    const voteElements = container.querySelectorAll(".vote");
    expect(voteElements.length).toBe(4);
    
    expect(voteElements[0].querySelector(".username")?.textContent).toBe("Bob");
    expect(voteElements[1].querySelector(".username")?.textContent).toBe("Alice");
    expect(voteElements[2].querySelector(".username")?.textContent).toBe("Charlie");
    expect(voteElements[3].querySelector(".username")?.textContent).toBe("Dave");
  });

  it("should allow sorting descending when clicking descending button", async () => {
    const { container } = renderBoardWithContext(mockUsers, true);
    
    const descBtn = screen.getByTestId("sort-btn-desc");
    fireEvent.click(descBtn);
    
    // Order in DOM should be: Charlie (8), Alice (5), Bob (2), Dave (undefined)
    const voteElements = container.querySelectorAll(".vote");
    expect(voteElements[0].querySelector(".username")?.textContent).toBe("Charlie");
    expect(voteElements[1].querySelector(".username")?.textContent).toBe("Alice");
    expect(voteElements[2].querySelector(".username")?.textContent).toBe("Bob");
    expect(voteElements[3].querySelector(".username")?.textContent).toBe("Dave");
  });

  it("should allow resetting sorting to none (original list order)", async () => {
    const { container } = renderBoardWithContext(mockUsers, true);
    
    const noneBtn = screen.getByTestId("sort-btn-none");
    fireEvent.click(noneBtn);
    
    // Order in DOM should be original: Alice, Bob, Charlie, Dave
    const voteElements = container.querySelectorAll(".vote");
    expect(voteElements[0].querySelector(".username")?.textContent).toBe("Alice");
    expect(voteElements[1].querySelector(".username")?.textContent).toBe("Bob");
    expect(voteElements[2].querySelector(".username")?.textContent).toBe("Charlie");
    expect(voteElements[3].querySelector(".username")?.textContent).toBe("Dave");
  });
});
