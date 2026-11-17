export const BLOCK_BOARD_SIZE = 8;

export type BlockColor = "coral" | "sky" | "mint" | "lavender" | "yellow" | "orange";

export type BlockCoordinate = {
  row: number;
  column: number;
};

export type BlockShape = {
  id: string;
  cells: BlockCoordinate[];
  weight: number;
  minimumRound?: number;
};

export type BlockPiece = {
  id: string;
  shapeId: string;
  cells: BlockCoordinate[];
  color: BlockColor;
};

export type BoardCell = BlockColor | null;
export type BlockBoard = BoardCell[];

export type CompletedLines = {
  rows: number[];
  columns: number[];
  cellIndexes: number[];
};

export type PlacementResult = {
  boardAfterPlacement: BlockBoard;
  boardAfterClear: BlockBoard;
  completedLines: CompletedLines;
};

export type PlacementHint = {
  pieceIndex: number;
  origin: BlockCoordinate;
};
