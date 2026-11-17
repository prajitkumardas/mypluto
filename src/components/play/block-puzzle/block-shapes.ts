import type { BlockShape } from "./block-puzzle-types";

const shape = (
  id: string,
  cells: Array<[number, number]>,
  weight: number,
  minimumRound = 1
): BlockShape => ({
  id,
  cells: cells.map(([row, column]) => ({ row, column })),
  weight,
  minimumRound
});

export const BLOCK_SHAPES: BlockShape[] = [
  shape("single", [[0, 0]], 8),
  shape("line-2-h", [[0, 0], [0, 1]], 9),
  shape("line-3-h", [[0, 0], [0, 1], [0, 2]], 8),
  shape("line-4-h", [[0, 0], [0, 1], [0, 2], [0, 3]], 5, 2),
  shape("line-5-h", [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], 3, 4),
  shape("line-2-v", [[0, 0], [1, 0]], 9),
  shape("line-3-v", [[0, 0], [1, 0], [2, 0]], 8),
  shape("line-4-v", [[0, 0], [1, 0], [2, 0], [3, 0]], 5, 2),
  shape("line-5-v", [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], 3, 4),
  shape("square-2", [[0, 0], [0, 1], [1, 0], [1, 1]], 7),
  shape("square-3", [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], 2, 5),
  shape("l-small", [[0, 0], [1, 0], [1, 1]], 7),
  shape("l-small-mirror", [[0, 1], [1, 0], [1, 1]], 7),
  shape("l-small-up", [[0, 0], [0, 1], [1, 0]], 7),
  shape("l-small-up-mirror", [[0, 0], [0, 1], [1, 1]], 7),
  shape("l-large", [[0, 0], [1, 0], [2, 0], [2, 1]], 4, 2),
  shape("l-large-mirror", [[0, 1], [1, 1], [2, 0], [2, 1]], 4, 2),
  shape("l-large-right", [[0, 0], [1, 0], [0, 1], [0, 2]], 4, 2),
  shape("l-large-left", [[0, 2], [1, 0], [1, 1], [1, 2]], 4, 2),
  shape("t-up", [[0, 0], [0, 1], [0, 2], [1, 1]], 4, 3),
  shape("t-down", [[0, 1], [1, 0], [1, 1], [1, 2]], 4, 3),
  shape("t-left", [[0, 0], [1, 0], [2, 0], [1, 1]], 4, 3),
  shape("t-right", [[0, 1], [1, 0], [1, 1], [2, 1]], 4, 3),
  shape("z-horizontal", [[0, 0], [0, 1], [1, 1], [1, 2]], 4, 3),
  shape("z-horizontal-mirror", [[0, 1], [0, 2], [1, 0], [1, 1]], 4, 3),
  shape("z-vertical", [[0, 1], [1, 0], [1, 1], [2, 0]], 4, 3),
  shape("z-vertical-mirror", [[0, 0], [1, 0], [1, 1], [2, 1]], 4, 3),
  shape("staircase", [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]], 3, 4),
  shape("plus", [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]], 2, 5),
  shape("corner-5", [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], 3, 4),
  shape("cluster", [[0, 0], [0, 1], [1, 0], [2, 0]], 4, 3)
];
