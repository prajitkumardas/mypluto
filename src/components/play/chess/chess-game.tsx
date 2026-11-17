"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import {
  ArrowLeft,
  BrainCircuit,
  ChevronDown,
  Gamepad2,
  History,
  Loader2,
  RotateCcw,
  Sparkles,
  Undo2,
  UserRound,
  X
} from "lucide-react";
import Image from "next/image";
import { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlutoButton } from "@/components/ui/pluto-button";
import { cn } from "@/lib/utils";
import { type ChessDifficulty, getFallbackMove, StockfishClient } from "./chess-engine";
import { ChessPiece } from "./chess-piece";
import styles from "./chess-game.module.css";

type PromotionChoice = Extract<PieceSymbol, "q" | "r" | "b" | "n">;
type PendingPromotion = { from: Square; to: Square };
type GameResult = { title: "You Won!" | "Pluto Won!" | "Draw!"; message: string } | null;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const PROMOTIONS: PromotionChoice[] = ["q", "r", "b", "n"];
const PROMOTION_NAMES: Record<PromotionChoice, string> = { q: "Queen", r: "Rook", b: "Bishop", n: "Knight" };

export function ChessGame({ onChooseGame, onExit, playerName }: {
  onChooseGame: () => void;
  onExit: () => void;
  playerName: string;
}) {
  const chessRef = useRef(new Chess());
  const stockfishRef = useRef<StockfishClient | null>(null);
  const requestIdRef = useRef(0);
  const [fen, setFen] = useState(() => chessRef.current.fen());
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [difficulty, setDifficulty] = useState<ChessDifficulty>("medium");
  const [thinking, setThinking] = useState(false);
  const [engineMode, setEngineMode] = useState<"stockfish" | "fallback" | null>(null);
  const [reaction, setReaction] = useState("Let's play, buddy! You're White. Make your first move!");

  const chess = chessRef.current;
  const board = chess.board();
  const result = getGameResult(chess);
  const isUserTurn = chess.turn() === "w" && !thinking && !result;
  const legalMoves = useMemo(
    () => selectedSquare ? chessRef.current.moves({ square: selectedSquare, verbose: true }) : [],
    // fen is required because chessRef is intentionally stable while its position changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fen, selectedSquare]
  );
  const legalTargets = useMemo(() => new Map(legalMoves.map((move) => [move.to, move])), [legalMoves]);
  const lastMove = moveHistory.at(-1) ?? null;
  const checkedKing = chess.isCheck() ? chess.findPiece({ color: chess.turn(), type: "k" })[0] : null;

  const syncPosition = useCallback(() => {
    const current = chessRef.current;
    setFen(current.fen());
    setMoveHistory(current.history({ verbose: true }));
  }, []);

  useEffect(() => {
    stockfishRef.current = new StockfishClient();
    return () => {
      requestIdRef.current += 1;
      stockfishRef.current?.destroy();
      stockfishRef.current = null;
    };
  }, []);

  useEffect(() => {
    const current = chessRef.current;
    if (current.turn() !== "b" || current.isGameOver()) {
      setThinking(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const position = current.fen();
    setThinking(true);
    setReaction("Pluto is thinking...");

    const timer = window.setTimeout(async () => {
      let uciMove: string;
      try {
        if (!stockfishRef.current) throw new Error("Stockfish client is unavailable.");
        uciMove = await stockfishRef.current.getMove(position, difficulty);
        setEngineMode("stockfish");
      } catch {
        if (requestId !== requestIdRef.current) return;
        uciMove = getFallbackMove(position, difficulty);
        setEngineMode("fallback");
      }

      if (requestId !== requestIdRef.current) return;
      const liveGame = chessRef.current;
      if (liveGame.fen() !== position || liveGame.turn() !== "b") return;

      try {
        liveGame.move({
          from: uciMove.slice(0, 2),
          to: uciMove.slice(2, 4),
          promotion: uciMove.slice(4, 5) || undefined
        });
      } catch {
        const fallback = getFallbackMove(position, difficulty);
        liveGame.move({ from: fallback.slice(0, 2), to: fallback.slice(2, 4), promotion: fallback.slice(4, 5) || undefined });
        setEngineMode("fallback");
      }

      setThinking(false);
      setReaction(getPlutoMoveReaction(liveGame));
      syncPosition();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [difficulty, fen, syncPosition]);

  function handleSquareClick(square: Square) {
    if (!isUserTurn) return;
    const piece = chessRef.current.get(square);

    if (!selectedSquare) {
      if (piece?.color === "w") setSelectedSquare(square);
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (piece?.color === "w") {
      setSelectedSquare(square);
      return;
    }

    attemptMove(selectedSquare, square);
  }

  function attemptMove(from: Square, to: Square) {
    if (!isUserTurn) return;
    const matchingMoves = chessRef.current.moves({ square: from, verbose: true }).filter((move) => move.to === to);
    if (matchingMoves.length === 0) return;

    if (matchingMoves.some((move) => move.isPromotion())) {
      setPendingPromotion({ from, to });
      return;
    }

    commitUserMove(from, to);
  }

  function commitUserMove(from: Square, to: Square, promotion?: PromotionChoice) {
    try {
      chessRef.current.move({ from, to, promotion });
    } catch {
      return;
    }

    setPendingPromotion(null);
    setSelectedSquare(null);
    setReaction(chessRef.current.isCheck() ? "Uh-oh! You've got me in check." : "Nice move, buddy. Let me think...");
    syncPosition();
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, square: Square) {
    if (!isUserTurn || chessRef.current.get(square)?.color !== "w") {
      event.preventDefault();
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", square);
    setSelectedSquare(square);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>, square: Square) {
    event.preventDefault();
    const from = event.dataTransfer.getData("text/plain") as Square;
    if (from) attemptMove(from, square);
  }

  function undoExchange() {
    if (thinking || moveHistory.length === 0) return;
    requestIdRef.current += 1;
    stockfishRef.current?.stop();
    const current = chessRef.current;
    current.undo();
    if (current.turn() === "b" && current.history().length > 0) current.undo();
    setThinking(false);
    setSelectedSquare(null);
    setReaction("No worries—let's try that position again.");
    syncPosition();
  }

  function resetGame(confirmation: boolean) {
    if (confirmation && moveHistory.length > 0 && !result && !window.confirm("Discard this game and start again?")) return;
    requestIdRef.current += 1;
    stockfishRef.current?.stop();
    chessRef.current.reset();
    setThinking(false);
    setSelectedSquare(null);
    setPendingPromotion(null);
    setReaction("Let's play, buddy! You're White. Make your first move!");
    syncPosition();
  }

  function leaveGame(destination: "exit" | "choose") {
    if (moveHistory.length > 0 && !result && !window.confirm("Leave this chess game? Your current match will be lost.")) return;
    requestIdRef.current += 1;
    stockfishRef.current?.stop();
    destination === "exit" ? onExit() : onChooseGame();
  }

  const status = result
    ? result.title
    : thinking
      ? "Pluto is thinking"
      : chess.isCheck()
        ? "Your king is in check"
        : "Your turn";

  return (
    <section className={styles.chessShell} aria-labelledby="chess-title" data-pluto-modal-scroll="true">
      <header className={styles.header}>
        <Button className={styles.exitButton} onClick={() => leaveGame("exit")} variant="ghost">
          <ArrowLeft aria-hidden="true" /> Exit game
        </Button>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>Strategy game</p>
          <h1 id="chess-title">Chess with Pluto</h1>
          <p>Hey buddy! Ready for a little brain battle? Let&apos;s see if you can outsmart me.</p>
        </div>
      </header>

      <div className={styles.gameLayout}>
        <div className={styles.primaryColumn}>
          <div className={styles.players}>
            <PlayerCard active={isUserTurn} color="White" icon={<UserRound aria-hidden="true" />} label={playerName} />
            <div className={cn(styles.statusPill, thinking && styles.statusThinking)} aria-live="polite">
              {thinking ? <Loader2 aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
              {status}
            </div>
            <PlayerCard
              active={chess.turn() === "b" && !result}
              avatar
              color="Black"
              icon={<Image alt="" height={52} src="/images/play/plutopopup.png" width={52} />}
              label="Pluto"
              thinking={thinking}
            />
          </div>

          <div className={styles.reaction}>
            <Image alt="Pluto" height={72} src="/images/play/plutopopup.png" width={72} />
            <p>{result ? result.message : reaction}</p>
          </div>

          <div className={styles.boardFrame}>
            <div className={styles.board} role="grid" aria-label={`Chess board. ${playerName} is White.`}>
              {board.flatMap((row, rankIndex) => row.map((piece, fileIndex) => {
                const square = `${FILES[fileIndex]}${8 - rankIndex}` as Square;
                const legalMove = legalTargets.get(square);
                const isLight = (rankIndex + fileIndex) % 2 === 0;
                const isSelected = selectedSquare === square;
                const isLastMove = lastMove?.from === square || lastMove?.to === square;
                const isCapture = Boolean(legalMove?.captured);
                const canDrag = Boolean(piece?.color === "w" && isUserTurn);

                return (
                  <button
                    aria-label={getSquareLabel(square, piece, isSelected, Boolean(legalMove))}
                    aria-pressed={isSelected}
                    className={cn(
                      styles.square,
                      isLight ? styles.lightSquare : styles.darkSquare,
                      isLastMove && styles.lastMove,
                      isSelected && styles.selectedSquare,
                      legalMove && styles.legalSquare,
                      isCapture && styles.captureSquare,
                      checkedKing === square && styles.checkedSquare
                    )}
                    data-square={square}
                    disabled={!isUserTurn}
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, square)}
                    role="gridcell"
                    type="button"
                  >
                    {fileIndex === 0 ? <span className={styles.rankLabel}>{8 - rankIndex}</span> : null}
                    {rankIndex === 7 ? <span className={styles.fileLabel}>{FILES[fileIndex]}</span> : null}
                    {legalMove ? <span className={isCapture ? styles.captureIndicator : styles.moveIndicator} aria-hidden="true" /> : null}
                    {piece ? (
                      <div draggable={canDrag} onDragStart={(event) => handleDragStart(event, square)}>
                        <ChessPiece color={piece.color} type={piece.type} />
                      </div>
                    ) : null}
                  </button>
                );
              }))}
            </div>
          </div>

          <div className={styles.mobileControls}>
            <GameControls
              canUndo={moveHistory.length > 0 && !thinking}
              onNewGame={() => resetGame(true)}
              onRestart={() => resetGame(true)}
              onUndo={undoExchange}
            />
          </div>
        </div>

        <aside className={styles.sidePanel} aria-label="Chess game information">
          <section className={styles.panelCard}>
            <div className={styles.panelHeading}>
              <BrainCircuit aria-hidden="true" />
              <div><span>Pluto&apos;s strength</span><small>Change between games</small></div>
            </div>
            <label className={styles.difficultyField}>
              <span className="sr-only">Difficulty</span>
              <select
                disabled={moveHistory.length > 0}
                onChange={(event) => setDifficulty(event.target.value as ChessDifficulty)}
                value={difficulty}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <ChevronDown aria-hidden="true" />
            </label>
            {engineMode === "fallback" ? <p className={styles.engineNotice}>Local backup AI active</p> : null}
          </section>

          <MoveHistory moves={moveHistory} />

          <div className={styles.desktopControls}>
            <GameControls
              canUndo={moveHistory.length > 0 && !thinking}
              onNewGame={() => resetGame(true)}
              onRestart={() => resetGame(true)}
              onUndo={undoExchange}
            />
          </div>

          <Button className={styles.chooseGameButton} onClick={() => leaveGame("choose")} variant="ghost">
            <Gamepad2 aria-hidden="true" /> Choose another game
          </Button>
        </aside>
      </div>

      <Dialog.Root open={Boolean(pendingPromotion)} onOpenChange={(open) => !open && setPendingPromotion(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogOverlay} />
          <Dialog.Content className={styles.promotionDialog} aria-describedby="promotion-description">
            <Dialog.Close asChild>
              <button className={styles.dialogClose} type="button" aria-label="Cancel promotion"><X aria-hidden="true" /></button>
            </Dialog.Close>
            <Dialog.Title>Choose your promotion</Dialog.Title>
            <Dialog.Description id="promotion-description">What should your pawn become?</Dialog.Description>
            <div className={styles.promotionChoices}>
              {PROMOTIONS.map((piece) => (
                <button
                  aria-label={`Promote pawn to ${PROMOTION_NAMES[piece]}`}
                  key={piece}
                  onClick={() => pendingPromotion && commitUserMove(pendingPromotion.from, pendingPromotion.to, piece)}
                  type="button"
                >
                  <ChessPiece color="w" type={piece} />
                  <span>{PROMOTION_NAMES[piece]}</span>
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {result ? (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true" aria-labelledby="chess-result-title">
          <div className={styles.resultCard}>
            <Image alt="Pluto" height={120} src="/images/play/plutopopup.png" width={120} />
            <p className={styles.eyebrow}>Game complete</p>
            <h2 id="chess-result-title">{result.title}</h2>
            <p>{result.message}</p>
            <div className={styles.resultActions}>
              <PlutoButton onClick={() => resetGame(false)} showArrow variant="primary">Play Again</PlutoButton>
              <Button onClick={() => leaveGame("choose")} variant="ghost">Choose game</Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlayerCard({ active, avatar = false, color, icon, label, thinking = false }: {
  active: boolean;
  avatar?: boolean;
  color: string;
  icon: React.ReactNode;
  label: string;
  thinking?: boolean;
}) {
  return (
    <div className={cn(styles.playerCard, active && styles.activePlayer, avatar && styles.plutoPlayer)}>
      <span className={styles.playerIcon}>{icon}</span>
      <span><strong>{label}</strong><small>{color}{thinking ? " · Thinking" : ""}</small></span>
    </div>
  );
}

function GameControls({ canUndo, onNewGame, onRestart, onUndo }: {
  canUndo: boolean;
  onNewGame: () => void;
  onRestart: () => void;
  onUndo: () => void;
}) {
  return (
    <div className={styles.controls}>
      <Button disabled={!canUndo} onClick={onUndo} variant="outline"><Undo2 aria-hidden="true" /> Undo</Button>
      <Button onClick={onRestart} variant="outline"><RotateCcw aria-hidden="true" /> Restart</Button>
      <PlutoButton onClick={onNewGame} variant="secondary">New Game</PlutoButton>
    </div>
  );
}

function MoveHistory({ moves }: { moves: Move[] }) {
  const rows = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
    black: moves[index * 2 + 1],
    number: index + 1,
    white: moves[index * 2]
  }));

  return (
    <details className={styles.historyCard} open>
      <summary><span><History aria-hidden="true" /> Move history</span><ChevronDown aria-hidden="true" /></summary>
      <div className={styles.historyList} aria-label="Move history" aria-live="polite">
        {rows.length === 0 ? <p>No moves yet. You&apos;re up first.</p> : rows.map((row) => (
          <div className={styles.historyRow} key={row.number}>
            <span>{row.number}.</span>
            <strong className={row.white === moves.at(-1) ? styles.latestMove : undefined}>{row.white?.san}</strong>
            <strong className={row.black === moves.at(-1) ? styles.latestMove : undefined}>{row.black?.san ?? "…"}</strong>
          </div>
        ))}
      </div>
    </details>
  );
}

function getSquareLabel(
  square: Square,
  piece: { color: "w" | "b"; type: PieceSymbol } | null | undefined,
  selected: boolean,
  legal: boolean
) {
  const pieceLabel = piece ? `${piece.color === "w" ? "White" : "Black"} ${piece.type}` : "empty";
  return `${square}, ${pieceLabel}${selected ? ", selected" : ""}${legal ? ", legal destination" : ""}`;
}

function getPlutoMoveReaction(chess: Chess) {
  const result = getGameResult(chess);
  if (result) return result.message;
  if (chess.isCheck()) return "Nice try! But I found a sharp reply—your king is in check.";
  return Math.random() < 0.35 ? "Nice try! But I saw that coming." : "Your move, buddy.";
}

function getGameResult(chess: Chess): GameResult {
  if (chess.isCheckmate()) {
    return chess.turn() === "b"
      ? { title: "You Won!", message: "Wow! You actually beat me. Well played, buddy!" }
      : { title: "Pluto Won!", message: "That was a great game! Better luck next time." };
  }
  if (!chess.isGameOver()) return null;

  let reason = "The game ended in a draw.";
  if (chess.isStalemate()) reason = "Stalemate—there are no legal moves left.";
  else if (chess.isThreefoldRepetition()) reason = "The same position appeared three times.";
  else if (chess.isDrawByFiftyMoves()) reason = "Fifty moves passed without a pawn move or capture.";
  else if (chess.isInsufficientMaterial()) reason = "Neither side has enough material to checkmate.";

  return { title: "Draw!", message: `${reason} A fair match—we're equally matched.` };
}
