import { getEligibleWords } from "./word-banks";
import type {
  DifficultyConfig,
  Direction,
  GridPosition,
  PlacedWord,
  WordSearchCategory,
  WordSearchDifficulty,
  WordSearchPuzzle
} from "./word-search-types";

const FORWARD_DIRECTIONS: Direction[] = [
  { row: 0, column: 1 },
  { row: 1, column: 0 }
];

const ALL_DIRECTIONS: Direction[] = [
  { row: -1, column: -1 },
  { row: -1, column: 0 },
  { row: -1, column: 1 },
  { row: 0, column: -1 },
  { row: 0, column: 1 },
  { row: 1, column: -1 },
  { row: 1, column: 0 },
  { row: 1, column: 1 }
];

export const DIFFICULTY_CONFIG: Record<WordSearchDifficulty, DifficultyConfig> = {
  easy: { size: 8, wordCount: 5, pointsPerWord: 10, hintCount: 3, directions: FORWARD_DIRECTIONS },
  medium: { size: 10, wordCount: 8, pointsPerWord: 20, hintCount: 2, directions: ALL_DIRECTIONS },
  hard: { size: 12, wordCount: 10, pointsPerWord: 30, hintCount: 1, directions: ALL_DIRECTIONS }
};

type Candidate = { start: GridPosition; direction: Direction; overlap: number };

export function createPuzzle(
  category: WordSearchCategory,
  difficulty: WordSearchDifficulty,
  seed = createSeed()
): WordSearchPuzzle {
  const config = DIFFICULTY_CONFIG[difficulty];
  const eligibleWords = getEligibleWords(category, difficulty);

  if (eligibleWords.length < config.wordCount) {
    throw new Error(`The ${category} word bank does not contain enough ${difficulty} words.`);
  }

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const attemptSeed = (seed + Math.imul(attempt, 0x9e3779b1)) >>> 0;
    const random = mulberry32(attemptSeed);
    const chosenWords = shuffle(eligibleWords, random)
      .slice(0, config.wordCount)
      .sort((first, second) => second.length - first.length);
    const grid = createEmptyGrid(config.size);
    const placements: PlacedWord[] = [];

    if (placeWords(chosenWords, 0, grid, placements, config.directions, random)) {
      fillEmptyCells(grid, random);
      return { seed: attemptSeed, size: config.size, grid, words: placements };
    }
  }

  throw new Error("Pluto could not build a valid puzzle. Please try another seed.");
}

export function getLineCells(start: GridPosition, end: GridPosition): GridPosition[] {
  const rowDistance = end.row - start.row;
  const columnDistance = end.column - start.column;
  const straight = rowDistance === 0 || columnDistance === 0 || Math.abs(rowDistance) === Math.abs(columnDistance);
  if (!straight) return [start];

  const length = Math.max(Math.abs(rowDistance), Math.abs(columnDistance));
  const rowStep = Math.sign(rowDistance);
  const columnStep = Math.sign(columnDistance);
  return Array.from({ length: length + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    column: start.column + columnStep * index
  }));
}

export function readSelection(grid: string[][], cells: GridPosition[]) {
  return cells.map((cell) => grid[cell.row]?.[cell.column] ?? "").join("");
}

export function createSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

function placeWords(
  words: string[],
  wordIndex: number,
  grid: string[][],
  placements: PlacedWord[],
  directions: Direction[],
  random: () => number
): boolean {
  if (wordIndex >= words.length) return true;

  const word = words[wordIndex];
  const candidates = getCandidates(word, grid, directions)
    .map((candidate) => ({ candidate, tieBreaker: random() }))
    .sort((first, second) => second.candidate.overlap - first.candidate.overlap || first.tieBreaker - second.tieBreaker)
    .slice(0, 160);

  for (const { candidate } of candidates) {
    const changed = writeWord(word, candidate, grid);
    const cells = getWordCells(word, candidate.start, candidate.direction);
    const end = cells[cells.length - 1];
    placements.push({ word, start: candidate.start, end, cells });

    if (placeWords(words, wordIndex + 1, grid, placements, directions, random)) return true;

    placements.pop();
    for (const cell of changed) grid[cell.row][cell.column] = "";
  }

  return false;
}

function getCandidates(word: string, grid: string[][], directions: Direction[]) {
  const candidates: Candidate[] = [];
  for (let row = 0; row < grid.length; row += 1) {
    for (let column = 0; column < grid.length; column += 1) {
      for (const direction of directions) {
        const cells = getWordCells(word, { row, column }, direction);
        if (cells.some((cell) => !isInside(cell, grid.length))) continue;

        let overlap = 0;
        let valid = true;
        cells.forEach((cell, index) => {
          const current = grid[cell.row][cell.column];
          if (current && current !== word[index]) valid = false;
          if (current === word[index]) overlap += 1;
        });
        if (valid) candidates.push({ start: { row, column }, direction, overlap });
      }
    }
  }
  return candidates;
}

function writeWord(word: string, candidate: Candidate, grid: string[][]) {
  const changed: GridPosition[] = [];
  getWordCells(word, candidate.start, candidate.direction).forEach((cell, index) => {
    if (!grid[cell.row][cell.column]) {
      grid[cell.row][cell.column] = word[index];
      changed.push(cell);
    }
  });
  return changed;
}

function getWordCells(word: string, start: GridPosition, direction: Direction) {
  return Array.from({ length: word.length }, (_, index) => ({
    row: start.row + direction.row * index,
    column: start.column + direction.column * index
  }));
}

function createEmptyGrid(size: number) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
}

function fillEmptyCells(grid: string[][], random: () => number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  grid.forEach((row) => row.forEach((letter, column) => {
    if (!letter) row[column] = alphabet[Math.floor(random() * alphabet.length)];
  }));
}

function isInside(position: GridPosition, size: number) {
  return position.row >= 0 && position.column >= 0 && position.row < size && position.column < size;
}

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function mulberry32(seed: number) {
  return () => {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
