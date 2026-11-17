export type WordSearchDifficulty = "easy" | "medium" | "hard";

export type WordSearchCategory =
  | "animals"
  | "space"
  | "nature"
  | "technology"
  | "food"
  | "countries"
  | "sports"
  | "random";

export type GridPosition = {
  row: number;
  column: number;
};

export type Direction = GridPosition;

export type PlacedWord = {
  word: string;
  start: GridPosition;
  end: GridPosition;
  cells: GridPosition[];
};

export type WordSearchPuzzle = {
  seed: number;
  size: number;
  grid: string[][];
  words: PlacedWord[];
};

export type DifficultyConfig = {
  size: number;
  wordCount: number;
  pointsPerWord: number;
  hintCount: number;
  directions: Direction[];
};
