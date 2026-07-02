export interface CardOption {
  label: string;
  value: number;
  description?: string;
}

export interface ScaleDefinition {
  name: string;
  value: string;
  numeric: boolean;
  cards: CardOption[];
}

export const SCALES: Record<string, ScaleDefinition> = {
  fibonacci: {
    name: "Fibonacci",
    value: "fibonacci",
    numeric: true,
    cards: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "5", value: 5 },
      { label: "8", value: 8 },
      { label: "13", value: 13 },
      { label: "21", value: 21 },
      { label: "34", value: 34 },
      { label: "55", value: 55 },
      { label: "89", value: 89 },
      { label: "?", value: 100 },
      { label: "☕", value: 1000 },
    ],
  },
  tshirt: {
    name: "T-shirt sizes",
    value: "tshirt",
    numeric: false,
    cards: [
      { label: "XS", value: 1 },
      { label: "S", value: 2 },
      { label: "M", value: 3 },
      { label: "L", value: 5 },
      { label: "XL", value: 8 },
      { label: "XXL", value: 13 },
      { label: "?", value: 100 },
      { label: "☕", value: 1000 },
    ],
  },
  powersof2: {
    name: "Powers of 2",
    value: "powersof2",
    numeric: true,
    cards: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "4", value: 4 },
      { label: "8", value: 8 },
      { label: "16", value: 16 },
      { label: "32", value: 32 },
      { label: "64", value: 64 },
      { label: "?", value: 100 },
      { label: "☕", value: 1000 },
    ],
  },
  animals: {
    name: "Animals",
    value: "animals",
    numeric: false,
    cards: [
      { label: "🐭", value: 1, description: "Mouse" },
      { label: "🐱", value: 2, description: "Cat" },
      { label: "🐶", value: 3, description: "Dog" },
      { label: "🐑", value: 5, description: "Sheep" },
      { label: "🐮", value: 8, description: "Cow" },
      { label: "🐘", value: 13, description: "Elephant" },
      { label: "❓", value: 100, description: "Unsure" },
      { label: "☕", value: 1000, description: "Coffee break" },
    ],
  },
};

export function getClosestScaleSymbol(scaleType: string, targetValue: number): string {
  const scale = SCALES[scaleType] || SCALES.fibonacci;
  // Filter out special cards for verdict calculation (values >= 100)
  const numericCards = scale.cards.filter((c) => c.value < 100);
  if (numericCards.length === 0) return "?";

  let closestCard = numericCards[0];
  let minDiff = Math.abs(targetValue - closestCard.value);

  for (let i = 1; i < numericCards.length; i++) {
    const diff = Math.abs(targetValue - numericCards[i].value);
    if (diff < minDiff) {
      minDiff = diff;
      closestCard = numericCards[i];
    }
  }
  return closestCard.label;
}
