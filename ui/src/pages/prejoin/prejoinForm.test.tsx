import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Router, Route } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import PrejoinForm from "./prejoinForm";
import { setUsername } from "../../common/state";

// animejs touches the DOM in ways jsdom doesn't support; the animation is
// irrelevant to this form's behaviour.
vi.mock("animejs", () => ({ animate: () => ({}), stagger: () => 0 }));

const renderPrejoin = () => {
  const queryClient = new QueryClient();
  return render(() => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/" component={PrejoinForm} />
        <Route path="/room/:id" component={() => <div>room</div>} />
      </Router>
    </QueryClientProvider>
  ));
};

describe("PrejoinForm scale selection", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/?create=true");
    setUsername("");
  });

  it("offers the four agile scales with fibonacci selected by default", () => {
    renderPrejoin();
    const select = screen.getByTestId("scale-select") as HTMLSelectElement;
    const labels = Array.from(select.options).map((o) => o.textContent);
    expect(labels).toEqual([
      "Fibonacci",
      "T-shirt sizes",
      "Powers of 2",
      "Animals",
    ]);
    expect(select.value).toBe("fibonacci");
  });

  it("creates the room with the chosen scale in the request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      text: () => Promise.resolve("room-123"),
    });
    vi.stubGlobal("fetch", fetchMock);

    renderPrejoin();
    const select = screen.getByTestId("scale-select") as HTMLSelectElement;
    select.value = "tshirt";
    fireEvent.input(select);

    setUsername("Fabio F");
    const form = screen.getByTestId("create-room").closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      const url = fetchMock.mock.calls[0][0] as string;
      expect(url).toContain("/createRoom?scale=tshirt");
    });

    vi.unstubAllGlobals();
  });
});
