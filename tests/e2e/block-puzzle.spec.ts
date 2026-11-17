import { expect, test, type Locator, type Page } from "@playwright/test";
import { BLOCK_SHAPES } from "../../src/components/play/block-puzzle/block-shapes";
import {
  calculateMoveScore,
  canAnyPieceFit,
  canPlacePiece,
  createEmptyBoard,
  generateTray,
  placeAndClear,
  toIndex
} from "../../src/components/play/block-puzzle/block-puzzle-engine";
import { BLOCK_BOARD_SIZE, type BlockPiece } from "../../src/components/play/block-puzzle/block-puzzle-types";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("pluto-block-puzzle-best"));
  await page.goto("/play");
  await page.getByRole("button", { name: "Play with Pluto" }).click();
  const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Block Puzzle" }) });
  await card.getByRole("button", { name: "Play Block Puzzle" }).click();
});

test("engine validates placement, clears crossing lines, scores combos, and detects game over", () => {
  const board = createEmptyBoard();
  for (let column = 1; column < BLOCK_BOARD_SIZE; column += 1) board[toIndex(0, column)] = "sky";
  for (let row = 1; row < BLOCK_BOARD_SIZE; row += 1) board[toIndex(row, 0)] = "mint";
  const single: BlockPiece = { id: "test", shapeId: "single", color: "coral", cells: [{ row: 0, column: 0 }] };

  expect(canPlacePiece(board, single, { row: 0, column: 0 })).toBe(true);
  expect(canPlacePiece(board, single, { row: 0, column: 1 })).toBe(false);
  expect(canPlacePiece(board, single, { row: -1, column: 0 })).toBe(false);

  const result = placeAndClear(board, single, { row: 0, column: 0 });
  expect(result).not.toBeNull();
  expect(result!.completedLines.rows).toEqual([0]);
  expect(result!.completedLines.columns).toEqual([0]);
  expect(result!.completedLines.cellIndexes).toHaveLength(15);
  expect(result!.boardAfterClear.every((cell) => cell === null)).toBe(true);
  expect(calculateMoveScore(1, 2, 1)).toBe(260);
  expect(calculateMoveScore(4, 1, 2)).toBe(210);

  const fullBoard = Array.from({ length: BLOCK_BOARD_SIZE * BLOCK_BOARD_SIZE }, () => "lavender" as const);
  expect(canAnyPieceFit(fullBoard, [single])).toBe(false);
});

test("shape library and generated trays contain normalized valid pieces", () => {
  expect(BLOCK_SHAPES.length).toBeGreaterThanOrEqual(28);
  BLOCK_SHAPES.forEach((shape) => {
    expect(shape.cells.length).toBeGreaterThan(0);
    expect(Math.min(...shape.cells.map((cell) => cell.row))).toBe(0);
    expect(Math.min(...shape.cells.map((cell) => cell.column))).toBe(0);
    expect(new Set(shape.cells.map((cell) => `${cell.row}-${cell.column}`)).size).toBe(shape.cells.length);
  });
  const tray = generateTray(8, [], () => 0.42);
  expect(tray).toHaveLength(3);
  tray.forEach((piece) => expect(canPlacePiece(createEmptyBoard(), piece, { row: 0, column: 0 })).toBe(true));
});

test("supports click, keyboard, drag, pause, and local best score", async ({ page }) => {
  const board = page.getByRole("grid", { name: "Block Puzzle board" });
  await expect(board.getByRole("gridcell")).toHaveCount(64);
  const pieceButtons = page.locator("[data-piece-index]");
  await expect(pieceButtons).toHaveCount(3);

  const firstPiece = pieceButtons.nth(0);
  const firstCellCount = await getPieceCells(firstPiece).then((cells) => cells.length);
  await firstPiece.click();
  await page.locator('[data-block-cell][data-row="0"][data-column="0"]').click();
  await expect(page.locator('[data-block-cell][data-color]')).toHaveCount(firstCellCount);

  const secondPiece = pieceButtons.nth(1);
  const secondCells = await getPieceCells(secondPiece);
  const secondOrigin = await findOpenOrigin(page, secondCells);
  await secondPiece.focus();
  await page.keyboard.press("Enter");
  const secondTarget = page.locator(`[data-block-cell][data-row="${secondOrigin.row}"][data-column="${secondOrigin.column}"]`);
  await secondTarget.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-block-cell][data-color]')).toHaveCount(firstCellCount + secondCells.length);

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("Game paused", { exact: true })).toBeVisible();
  await expect(board.getByRole("gridcell").first()).toBeDisabled();
  await page.getByRole("button", { name: /Resume/ }).last().click();

  const thirdPiece = pieceButtons.nth(2);
  const thirdCells = await getPieceCells(thirdPiece);
  const thirdOrigin = await findOpenOrigin(page, thirdCells);
  const scoreBeforeDrag = Number(await page.locator("[data-current-score]").textContent());
  await dragPieceToOrigin(page, thirdPiece, thirdCells, thirdOrigin);
  await expect.poll(async () => Number(await page.locator("[data-current-score]").textContent())).toBeGreaterThan(scoreBeforeDrag);

  const savedBest = await page.evaluate(() => JSON.parse(window.localStorage.getItem("pluto-block-puzzle-best") || "null"));
  expect(savedBest?.data?.score).toBeGreaterThan(0);
});

for (const width of [320, 360, 375, 390, 430]) {
  test(`board and tray fit a ${width}px mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole("grid", { name: "Block Puzzle board" }).getByRole("gridcell")).toHaveCount(64);
    await expect(page.locator("[data-piece-index]")).toHaveCount(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

async function getPieceCells(piece: Locator) {
  return piece.locator("[data-shape-id] > span").evaluateAll((blocks) => blocks.map((block) => ({
    row: Number.parseInt((block as HTMLElement).style.gridRow, 10) - 1,
    column: Number.parseInt((block as HTMLElement).style.gridColumn, 10) - 1
  })));
}

async function findOpenOrigin(page: Page, pieceCells: Array<{ row: number; column: number }>) {
  const occupied = new Set(await page.locator("[data-block-cell][data-color]").evaluateAll((cells) => cells.map((cell) => `${(cell as HTMLElement).dataset.row}-${(cell as HTMLElement).dataset.column}`)));
  for (let row = 0; row < BLOCK_BOARD_SIZE; row += 1) {
    for (let column = 0; column < BLOCK_BOARD_SIZE; column += 1) {
      const valid = pieceCells.every((cell) => {
        const targetRow = row + cell.row;
        const targetColumn = column + cell.column;
        return targetRow < BLOCK_BOARD_SIZE && targetColumn < BLOCK_BOARD_SIZE && !occupied.has(`${targetRow}-${targetColumn}`);
      });
      if (valid) return { row, column };
    }
  }
  throw new Error("Generated piece has no valid placement on the test board.");
}

async function dragPieceToOrigin(
  page: Page,
  piece: Locator,
  cells: Array<{ row: number; column: number }>,
  origin: { row: number; column: number }
) {
  const pieceBox = await piece.boundingBox();
  const boardBox = await page.getByRole("grid", { name: "Block Puzzle board" }).boundingBox();
  expect(pieceBox).not.toBeNull();
  expect(boardBox).not.toBeNull();
  const cellSize = boardBox!.width / BLOCK_BOARD_SIZE;
  const pieceWidth = Math.max(...cells.map((cell) => cell.column)) + 1;
  const pieceHeight = Math.max(...cells.map((cell) => cell.row)) + 1;
  const targetColumn = origin.column + Math.floor(pieceWidth / 2);
  const targetRow = origin.row + Math.floor(pieceHeight / 2);
  await page.mouse.move(pieceBox!.x + pieceBox!.width / 2, pieceBox!.y + pieceBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    boardBox!.x + (targetColumn + 0.5) * cellSize,
    boardBox!.y + (targetRow + 0.5) * cellSize + 8,
    { steps: 12 }
  );
  await page.mouse.up();
}
