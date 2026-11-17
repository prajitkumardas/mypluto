import { expect, test, type Page } from "@playwright/test";
import { CATEGORY_LABELS } from "../../src/components/play/word-search/word-banks";
import { createPuzzle, DIFFICULTY_CONFIG } from "../../src/components/play/word-search/word-search-generator";
import type { WordSearchCategory, WordSearchDifficulty } from "../../src/components/play/word-search/word-search-types";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem("pluto-word-search"));
  await page.goto("/play");
  await page.getByRole("button", { name: "Play with Pluto" }).click();
  const wordSearchCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Word Search" }) });
  await wordSearchCard.getByRole("button", { name: "Play Word Search" }).click();
});

test("starts a valid puzzle, finds a word, and pauses cleanly", async ({ page }) => {
  await page.getByRole("button", { name: /Space/ }).click();
  await page.getByRole("button", { name: /Medium/ }).click();
  await page.getByRole("button", { name: "Start Word Search" }).click();

  const board = page.getByRole("grid", { name: /Medium word search board/ });
  await expect(board.getByRole("gridcell")).toHaveCount(100);
  await expect(page.locator("[data-target-word]")).toHaveCount(8);

  const target = await locateFirstTarget(page, 10);
  const start = page.locator(`[data-row="${target.start.row}"][data-column="${target.start.column}"]`);
  const end = page.locator(`[data-row="${target.end.row}"][data-column="${target.end.column}"]`);
  const startBox = await start.boundingBox();
  const endBox = await end.boundingBox();
  expect(startBox).not.toBeNull();
  expect(endBox).not.toBeNull();

  await page.mouse.move(startBox!.x + startBox!.width / 2, startBox!.y + startBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(endBox!.x + endBox!.width / 2, endBox!.y + endBox!.height / 2, { steps: target.word.length + 2 });
  await page.mouse.up();
  await expect(page.locator(`[data-target-word="${target.word}"]`).getByLabel("Found")).toBeVisible();
  await expect(page.getByText("1 / 8", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("Game paused", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Resume/ }).click();
  await expect(page.getByText("Game paused", { exact: true })).toBeHidden();

  const keyboardTarget = await locateFirstTarget(page, 10, target.word);
  const keyboardStart = page.locator(`[data-row="${keyboardTarget.start.row}"][data-column="${keyboardTarget.start.column}"]`);
  await keyboardStart.focus();
  await page.keyboard.press("Enter");
  const keyboardStep = getKeyboardStep(keyboardTarget.start, keyboardTarget.end);
  for (let index = 1; index < keyboardTarget.word.length; index += 1) await page.keyboard.press(keyboardStep);
  await page.keyboard.press("Enter");
  await expect(page.locator(`[data-target-word="${keyboardTarget.word}"]`).getByLabel("Found")).toBeVisible();
});

test("generator produces valid puzzles for every category and difficulty", () => {
  const categories = Object.keys(CATEGORY_LABELS) as WordSearchCategory[];
  const difficulties = Object.keys(DIFFICULTY_CONFIG) as WordSearchDifficulty[];

  categories.forEach((category, categoryIndex) => difficulties.forEach((difficulty, difficultyIndex) => {
    const puzzle = createPuzzle(category, difficulty, 1000 + categoryIndex * 10 + difficultyIndex);
    const config = DIFFICULTY_CONFIG[difficulty];
    expect(puzzle.grid).toHaveLength(config.size);
    expect(puzzle.words).toHaveLength(config.wordCount);
    expect(new Set(puzzle.words.map(({ word }) => word)).size).toBe(config.wordCount);

    puzzle.words.forEach((placedWord) => {
      expect(placedWord.cells).toHaveLength(placedWord.word.length);
      const boardWord = placedWord.cells.map(({ row, column }) => puzzle.grid[row][column]).join("");
      expect(boardWord).toBe(placedWord.word);
      const rowDirection = Math.sign(placedWord.end.row - placedWord.start.row);
      const columnDirection = Math.sign(placedWord.end.column - placedWord.start.column);
      expect(config.directions).toContainEqual({ row: rowDirection, column: columnDirection });
    });
  }));
});

for (const width of [320, 375, 390, 430]) {
  test(`hard mode fits a ${width}px mobile viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole("button", { name: /Hard/ }).click();
    await page.getByRole("button", { name: "Start Word Search" }).click();
    await expect(page.getByRole("grid", { name: /Hard word search board/ }).getByRole("gridcell")).toHaveCount(144);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

async function locateFirstTarget(page: Page, size: number, excludedWord?: string) {
  const letters = await page.locator("[data-word-cell]").allTextContents();
  const words = await page.locator("[data-target-word]").evaluateAll((items) => items.map((item) => item.getAttribute("data-target-word") || ""));
  const grid = Array.from({ length: size }, (_, row) => letters.slice(row * size, (row + 1) * size));
  const directions = [-1, 0, 1].flatMap((row) => [-1, 0, 1].map((column) => ({ row, column }))).filter(({ row, column }) => row !== 0 || column !== 0);

  for (const word of words) {
    if (word === excludedWord) continue;
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        for (const direction of directions) {
          const end = { row: row + direction.row * (word.length - 1), column: column + direction.column * (word.length - 1) };
          if (end.row < 0 || end.column < 0 || end.row >= size || end.column >= size) continue;
          const candidate = Array.from({ length: word.length }, (_, index) => grid[row + direction.row * index][column + direction.column * index]).join("");
          if (candidate === word) return { word, start: { row, column }, end };
        }
      }
    }
  }
  throw new Error("No target word was present on the generated board.");
}

function getKeyboardStep(start: { row: number; column: number }, end: { row: number; column: number }) {
  const rowDirection = Math.sign(end.row - start.row);
  const columnDirection = Math.sign(end.column - start.column);
  if (rowDirection === 0) return columnDirection > 0 ? "ArrowRight" : "ArrowLeft";
  if (columnDirection === 0) return rowDirection > 0 ? "ArrowDown" : "ArrowUp";
  if (rowDirection > 0 && columnDirection > 0) return "Shift+ArrowRight";
  if (rowDirection < 0 && columnDirection < 0) return "Shift+ArrowLeft";
  if (rowDirection < 0 && columnDirection > 0) return "Shift+ArrowUp";
  return "Shift+ArrowDown";
}
