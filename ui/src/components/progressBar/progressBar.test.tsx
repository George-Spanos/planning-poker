import { render, screen, waitFor } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ProgressBar } from "./progressBar";

describe("ProgressBar", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should complete progress in exactly 5 seconds for 5000ms duration", async () => {
        const { container } = render(() => <ProgressBar duration={5000} />);
        const bar = container.querySelector("#bar") as HTMLElement;

        expect(bar).toBeTruthy();

        // Initial state - should be at or near 0%
        const initialWidth = parseFloat(bar.style.width);
        expect(initialWidth).toBeLessThan(5);

        // After 2.5 seconds (halfway), should be around 50%
        vi.advanceTimersByTime(2500);
        await waitFor(() => {
            const midWidth = parseFloat(bar.style.width);
            expect(midWidth).toBeGreaterThan(45);
            expect(midWidth).toBeLessThan(55);
        });

        // After 5 seconds, should be at 100%
        vi.advanceTimersByTime(2500);
        await waitFor(() => {
            const finalWidth = parseFloat(bar.style.width);
            expect(finalWidth).toBeGreaterThanOrEqual(100);
        });
    });

    it("should complete progress in exactly 3 seconds for 3000ms duration", async () => {
        const { container } = render(() => <ProgressBar duration={3000} />);
        const bar = container.querySelector("#bar") as HTMLElement;

        expect(bar).toBeTruthy();

        // After 1.5 seconds (halfway), should be around 50%
        vi.advanceTimersByTime(1500);
        await waitFor(() => {
            const midWidth = parseFloat(bar.style.width);
            expect(midWidth).toBeGreaterThan(45);
            expect(midWidth).toBeLessThan(55);
        });

        // After 3 seconds, should be at 100%
        vi.advanceTimersByTime(1500);
        await waitFor(() => {
            const finalWidth = parseFloat(bar.style.width);
            expect(finalWidth).toBeGreaterThanOrEqual(100);
        });
    });

    it("should start at approximately 0% width", () => {
        const { container } = render(() => <ProgressBar duration={5000} />);
        const bar = container.querySelector("#bar") as HTMLElement;

        const initialWidth = parseFloat(bar.style.width);
        expect(initialWidth).toBeLessThan(5);
    });

    it("should clean up interval on unmount", () => {
        const clearIntervalSpy = vi.spyOn(global, "clearInterval");
        const { unmount } = render(() => <ProgressBar duration={5000} />);

        unmount();

        expect(clearIntervalSpy).toHaveBeenCalled();
    });
});
