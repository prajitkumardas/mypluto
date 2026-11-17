import type { WordSearchCategory, WordSearchDifficulty } from "./word-search-types";

export const CATEGORY_LABELS: Record<WordSearchCategory, string> = {
  animals: "Animals",
  space: "Space",
  nature: "Nature",
  technology: "Technology",
  food: "Food",
  countries: "Countries",
  sports: "Sports",
  random: "Random Mix"
};

export const DIFFICULTY_LABELS: Record<WordSearchDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard"
};

const WORD_BANKS: Record<Exclude<WordSearchCategory, "random">, string[]> = {
  animals: ["CAT", "DOG", "BEAR", "LION", "FROG", "WOLF", "HORSE", "TIGER", "OTTER", "PANDA", "RABBIT", "MONKEY", "CHEETAH", "LEOPARD", "BUFFALO", "HAMSTER", "DOLPHIN", "GIRAFFE", "PENGUIN", "FLAMINGO", "SQUIRREL", "ELEPHANT", "KANGAROO", "CROCODILE", "CHIMPANZEE", "RHINOCEROS"],
  space: ["SUN", "MOON", "STAR", "MARS", "COMET", "ORBIT", "VENUS", "EARTH", "ROCKET", "SATURN", "METEOR", "GALAXY", "NEBULA", "GRAVITY", "JUPITER", "COSMONAUT", "UNIVERSE", "ASTEROID", "STARLIGHT", "SUPERNOVA", "SATELLITE", "SPACESHIP", "TELESCOPE", "ASTRONAUT", "CONSTELLATION"],
  nature: ["TREE", "RAIN", "ROCK", "LEAF", "RIVER", "OCEAN", "CLOUD", "FOREST", "FLOWER", "VALLEY", "MEADOW", "THUNDER", "SUNSHINE", "SEASHORE", "WOODLAND", "WATERFALL", "MOUNTAIN", "EVERGREEN", "WILDFLOWER", "RAINFOREST", "WILDERNESS"],
  technology: ["APP", "CODE", "DATA", "ROBOT", "PIXEL", "MOUSE", "CLOUD", "SERVER", "BROWSER", "LAPTOP", "DIGITAL", "NETWORK", "COMPUTER", "INTERNET", "FIREWALL", "SOFTWARE", "HARDWARE", "KEYBOARD", "DATABASE", "INTERFACE", "ALGORITHM", "PROCESSOR"],
  food: ["RICE", "SOUP", "TACO", "APPLE", "BREAD", "MANGO", "PASTA", "PIZZA", "COOKIE", "CARROT", "NOODLE", "PANCAKE", "AVOCADO", "CINNAMON", "SANDWICH", "BLUEBERRY", "PINEAPPLE", "CHOCOLATE", "STRAWBERRY", "WATERMELON", "CROISSANT"],
  countries: ["INDIA", "CHILE", "JAPAN", "KENYA", "SPAIN", "BRAZIL", "CANADA", "FRANCE", "MEXICO", "NORWAY", "IRELAND", "GERMANY", "THAILAND", "MALAYSIA", "COLOMBIA", "PORTUGAL", "SINGAPORE", "AUSTRALIA", "ARGENTINA", "INDONESIA", "SWITZERLAND"],
  sports: ["GOLF", "RUGBY", "SKATE", "TENNIS", "HOCKEY", "SOCCER", "BOXING", "CRICKET", "CYCLING", "ARCHERY", "BASEBALL", "SWIMMING", "BADMINTON", "VOLLEYBALL", "BASKETBALL", "GYMNASTICS", "SKATEBOARD", "SNOWBOARD" ]
};

const LENGTH_RANGES: Record<WordSearchDifficulty, { minimum: number; maximum: number }> = {
  easy: { minimum: 3, maximum: 6 },
  medium: { minimum: 5, maximum: 9 },
  hard: { minimum: 7, maximum: 12 }
};

export function getEligibleWords(category: WordSearchCategory, difficulty: WordSearchDifficulty) {
  const range = LENGTH_RANGES[difficulty];
  const source = category === "random" ? Object.values(WORD_BANKS).flat() : WORD_BANKS[category];
  return [...new Set(source)].filter((word) => word.length >= range.minimum && word.length <= range.maximum);
}
