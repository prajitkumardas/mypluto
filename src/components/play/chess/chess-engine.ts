import { Chess, type Move, type PieceSymbol } from "chess.js";

export type ChessDifficulty = "easy" | "medium" | "hard";

const ENGINE_PATHS = [
  "/engines/stockfish-19-asm.js",
  "/engines/stockfish-19-lite-single.js"
] as const;

const ENGINE_SETTINGS: Record<ChessDifficulty, { elo: number; moveTime: number; skill: number }> = {
  easy: { elo: 1320, moveTime: 220, skill: 2 },
  medium: { elo: 1700, moveTime: 500, skill: 8 },
  hard: { elo: 2200, moveTime: 900, skill: 14 }
};

type PendingRequest = {
  reject: (reason?: unknown) => void;
  resolve: (move: string) => void;
  timeout: number;
};

export class StockfishClient {
  private pending: PendingRequest | null = null;
  private enginePathIndex = 0;
  private readyPromise: Promise<void> | null = null;
  private readyReject: ((reason?: unknown) => void) | null = null;
  private readyResolve: (() => void) | null = null;
  private readyTimeout: number | null = null;
  private worker: Worker | null = null;

  async getMove(fen: string, difficulty: ChessDifficulty): Promise<string> {
    try {
      await this.ensureReady();
    } catch (error) {
      if (this.enginePathIndex >= ENGINE_PATHS.length - 1) throw error;
      this.enginePathIndex += 1;
      await this.ensureReady();
    }
    const worker = this.worker;
    if (!worker) throw new Error("Stockfish is unavailable.");

    this.cancelPending("A newer position replaced this search.");
    const settings = ENGINE_SETTINGS[difficulty];

    return new Promise<string>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.pending = null;
        reject(new Error("Stockfish took too long to respond."));
      }, Math.max(8000, settings.moveTime * 5));

      this.pending = { reject, resolve, timeout };
      worker.postMessage("setoption name UCI_LimitStrength value true");
      worker.postMessage(`setoption name UCI_Elo value ${settings.elo}`);
      worker.postMessage(`setoption name Skill Level value ${settings.skill}`);
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go movetime ${settings.moveTime}`);
    });
  }

  stop() {
    this.worker?.postMessage("stop");
    this.cancelPending("Search stopped.");
  }

  destroy() {
    this.stop();
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
    this.clearReadyTimeout();
  }

  private ensureReady() {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;

      try {
        const worker = new Worker(ENGINE_PATHS[this.enginePathIndex]);
        this.worker = worker;
        worker.addEventListener("message", (event: MessageEvent<unknown>) => this.handleMessage(String(event.data)));
        worker.addEventListener("error", () => {
          const error = new Error("Stockfish failed to load.");
          this.readyReject?.(error);
          this.pending?.reject(error);
          this.clearPending();
          this.worker?.terminate();
          this.worker = null;
          this.readyPromise = null;
          this.clearReadyTimeout();
        });
        worker.postMessage("uci");
        this.readyTimeout = window.setTimeout(() => {
          const error = new Error("Stockfish did not become ready in time.");
          this.readyReject?.(error);
          this.worker?.terminate();
          this.worker = null;
          this.readyPromise = null;
          this.readyReject = null;
          this.readyResolve = null;
          this.clearReadyTimeout();
        }, 10_000);
      } catch (error) {
        this.worker = null;
        this.readyPromise = null;
        reject(error);
      }
    });

    return this.readyPromise;
  }

  private handleMessage(line: string) {
    if (line === "uciok") {
      this.worker?.postMessage("isready");
      return;
    }

    if (line === "readyok") {
      this.clearReadyTimeout();
      this.readyResolve?.();
      this.readyResolve = null;
      this.readyReject = null;
      return;
    }

    const bestMove = line.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/)?.[1];
    if (!bestMove || !this.pending) return;

    const { resolve } = this.pending;
    this.clearPending();
    resolve(bestMove);
  }

  private cancelPending(message: string) {
    if (!this.pending) return;
    const { reject } = this.pending;
    this.clearPending();
    reject(new Error(message));
  }

  private clearPending() {
    if (this.pending) window.clearTimeout(this.pending.timeout);
    this.pending = null;
  }

  private clearReadyTimeout() {
    if (this.readyTimeout) window.clearTimeout(this.readyTimeout);
    this.readyTimeout = null;
  }
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20_000
};

export function getFallbackMove(fen: string, difficulty: ChessDifficulty) {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  const depth = difficulty === "hard" ? 3 : 2;
  const scored = moves.map((move) => {
    chess.move(move);
    const score = search(chess, depth - 1, -100_000, 100_000);
    chess.undo();
    return { move, score };
  }).sort((a, b) => b.score - a.score);

  if (scored.length === 0) throw new Error("No legal moves are available.");
  const candidateCount = difficulty === "easy" ? Math.min(3, scored.length) : 1;
  const selected = scored[Math.floor(Math.random() * candidateCount)].move;
  return toUci(selected);
}

function search(chess: Chess, depth: number, alpha: number, beta: number): number {
  if (chess.isCheckmate()) return chess.turn() === "b" ? -99_999 - depth : 99_999 + depth;
  if (chess.isDraw()) return 0;
  if (depth === 0) return evaluate(chess);

  const maximizing = chess.turn() === "b";
  let best = maximizing ? -100_000 : 100_000;

  for (const move of chess.moves({ verbose: true })) {
    chess.move(move);
    const score = search(chess, depth - 1, alpha, beta);
    chess.undo();

    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }

    if (beta <= alpha) break;
  }

  return best;
}

function evaluate(chess: Chess) {
  let score = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      score += PIECE_VALUES[piece.type] * (piece.color === "b" ? 1 : -1);
    }
  }
  const mobility = chess.moves().length * (chess.turn() === "b" ? 1 : -1);
  return score + mobility * 2 + (chess.isCheck() ? (chess.turn() === "b" ? -35 : 35) : 0);
}

function toUci(move: Move) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}
