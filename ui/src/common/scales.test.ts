import { describe, it, expect } from "vitest";
import { SCALES, getClosestScaleSymbol } from "./scales";

describe("SCALES definitions", () => {
  it("exposes the four scales offered on the create screen", () => {
    expect(Object.keys(SCALES)).toEqual([
      "fibonacci",
      "tshirt",
      "powersof2",
      "animals",
    ]);
  });

  it("flags numeric vs non-numeric scales", () => {
    expect(SCALES.fibonacci.numeric).toBe(true);
    expect(SCALES.powersof2.numeric).toBe(true);
    expect(SCALES.tshirt.numeric).toBe(false);
    expect(SCALES.animals.numeric).toBe(false);
  });

  it("gives every scale the shared ? and coffee special cards", () => {
    for (const scale of Object.values(SCALES)) {
      const specials = scale.cards.filter((c) => c.value >= 100);
      expect(specials.map((c) => c.label)).toEqual(["?", "☕"]);
      expect(specials.map((c) => c.value)).toEqual([100, 1000]);
    }
  });
});

describe("getClosestScaleSymbol", () => {
  it("snaps to the nearest fibonacci card", () => {
    expect(getClosestScaleSymbol("fibonacci", 5)).toBe("5");
    expect(getClosestScaleSymbol("fibonacci", 6)).toBe("5");
    expect(getClosestScaleSymbol("fibonacci", 7)).toBe("8");
  });

  it("maps a numeric average onto a t-shirt symbol", () => {
    // A t-shirt round of M(3) and XXL(13) averages toward XL(8).
    expect(getClosestScaleSymbol("tshirt", 10.5)).toBe("XL");
  });

  it("never returns a special card as the verdict", () => {
    expect(getClosestScaleSymbol("tshirt", 999)).toBe("XXL");
    expect(getClosestScaleSymbol("fibonacci", 999)).toBe("89");
  });

  it("falls back to fibonacci for an unknown scale", () => {
    expect(getClosestScaleSymbol("garbage", 5)).toBe("5");
  });
});
