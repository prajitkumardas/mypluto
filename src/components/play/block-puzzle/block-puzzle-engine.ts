import { BLOCK_SHAPES } from "./block-shapes";
import {
  BLOCK_BOARD_SIZE,
  type BlockBoard,
  type BlockColor,
  type BlockCoordinate,
  type BlockPiece,
  type CompletedLines,
  type PlacementHint,
  type PlacementResult
} from "./block-puzzle-types";

const BLOCK_COLORS: BlockColor[] = ["coral", "sky", "mint", "lavender", "yellow", "orange"];
const LINE_BONUSES: Record<number, number> = { 1: 100, 2: 250, 3: 450, 4: 700 };

export function createEmptyBoard(): BlockBoard {
  return Array.from({ length: BLOCK_BOARD_SIZE * BLOCK_BOARD_SIZE }, () => null);
}

export function generateTray(round: number, previousShapeIds: string[] = [], random = Math.random): BlockPiece[] {
  const eligibleShapes = BLOCK_SHAPES.filter((candidate) => (candidate.minimumRound ?? 1) <= round);
  const chosenShapeIds: string[] = [];

  return Array.from({ length: 3 }, (_, index) => {
    const repetitionPenalty = new Set([...previousShapeIds, ...chosenShapeIds]);
    const pool = eligibleShapes.map((candidate) => ({
      shape: candidate,
      weight: Math.max(1, candidate.weight - (repetitionPenalty.has(candidate.id) ? 5 : 0))
    }));
    const selected = weightedPick(pool, random);
    chosenShapeIds.push(selected.id);
    return {
      id: `${round}-${index}-${Math.floor(random() * 1_000_000)}`,
      shapeId: selected.id,
      cells: selected.cells,
      color: BLOCK_COLORS[Math.floor(random() * BLOCK_COLORS.length)]
    };
  });
}

export function canPlacePiece(board: BlockBoard, piece: Pick<BlockPiece, "cells">, origin: BlockCoordinate) {
  return piece.cells.every((cell) => {
    const row = origin.row + cell.row;
    const column = origin.column + cell.column;
    return row >= 0 && column >= 0 && row < BLOCK_BOARD_SIZE && column < BLOCK_BOARD_SIZE && board[toIndex(row, column)] === null;
  });
}

export function placeAndClear(board: BlockBoard, piece: BlockPiece, origin: BlockCoordinate): PlacementResult | null {
  if (!canPlacePiece(board, piece, origin)) return null;
  const boardAfterPlacement = [...board];
  piece.cells.forEach((cell) => {
    boardAfterPlacement[toIndex(origin.row + cell.row, origin.column + cell.column)] = piece.color;
  });
  const completedLines = findCompletedLines(boardAfterPlacement);
  const boardAfterClear = clearCompletedLines(boardAfterPlacement, completedLines);
  return { boardAfterPlacement, boardAfterClear, completedLines };
}

export function findCompletedLines(board: BlockBoard): CompletedLines {
  const rows = Array.from({ length: BLOCK_BOARD_SIZE }, (_, row) => row)
    .filter((row) => Array.from({ length: BLOCK_BOARD_SIZE }, (_, column) => board[toIndex(row, column)]).every(Boolean));
  const columns = Array.from({ length: BLOCK_BOARD_SIZE }, (_, column) => column)
    .filter((column) => Array.from({ length: BLOCK_BOARD_SIZE }, (_, row) => board[toIndex(row, column)]).every(Boolean));
  const cellIndexes = new Set<number>();
  rows.forEach((row) => Array.from({ length: BLOCK_BOARD_SIZE }, (_, column) => cellIndexes.add(toIndex(row, column))));
  columns.forEach((column) => Array.from({ length: BLOCK_BOARD_SIZE }, (_, row) => cellIndexes.add(toIndex(row, column))));
  return { rows, columns, cellIndexes: [...cellIndexes] };
}

export function clearCompletedLines(board: BlockBoard, completedLines: CompletedLines) {
  if (completedLines.cellIndexes.length === 0) return [...board];
  const clearedBoard = [...board];
  completedLines.cellIndexes.forEach((index) => { clearedBoard[index] = null; });
  return clearedBoard;
}

export function calculateMoveScore(cellCount: number, lineCount: number, comboStreak: number) {
  const baseScore = cellCount * 10;
  if (lineCount === 0) return baseScore;
  const lineBonus = lineCount <= 4 ? LINE_BONUSES[lineCount] : LINE_BONUSES[4] + (lineCount - 4) * 200;
  const multiplier = Math.min(3, 1 + Math.max(0, comboStreak - 1) * 0.5);
  return Math.round((baseScore + lineBonus) * multiplier);
}

export function canAnyPieceFit(board: BlockBoard, pieces: Array<BlockPiece | null>) {
  return findPlacementHint(board, pieces) !== null;
}

export function findPlacementHint(board: BlockBoard, pieces: Array<BlockPiece | null>): PlacementHint | null {
  for (let pieceIndex = 0; pieceIndex < pieces.length; pieceIndex += 1) {
    const piece = pieces[pieceIndex];
    if (!piece) continue;
    for (let row = 0; row < BLOCK_BOARD_SIZE; row += 1) {
      for (let column = 0; column < BLOCK_BOARD_SIZE; column += 1) {
        const origin = { row, column };
        if (canPlacePiece(board, piece, origin)) return { pieceIndex, origin };
      }
    }
  }
  return null;
}

export function toIndex(row: number, column: number) {
  return row * BLOCK_BOARD_SIZE + column;
}

export function fromIndex(index: number): BlockCoordinate {
  return { row: Math.floor(index / BLOCK_BOARD_SIZE), column: index % BLOCK_BOARD_SIZE };
}

function weightedPick(pool: Array<{ shape: (typeof BLOCK_SHAPES)[number]; weight: number }>, random: () => number) {
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let target = random() * total;
  for (const item of pool) {
    target -= item.weight;
    if (target <= 0) return item.shape;
  }
  return pool[pool.length - 1].shape;
}
