"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Blocks,
  CircleHelp,
  CirclePause,
  CirclePlay,
  Gamepad2,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  X
} from "lucide-react";
import {
  CSSProperties,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Button } from "@/components/ui/button";
import { PlutoButton } from "@/components/ui/pluto-button";
import { readLocalRecord, writeLocalRecord } from "@/lib/local-persistence";
import { cn } from "@/lib/utils";
import {
  calculateMoveScore,
  canAnyPieceFit,
  canPlacePiece,
  createEmptyBoard,
  findPlacementHint,
  fromIndex,
  generateTray,
  placeAndClear,
  toIndex
} from "./block-puzzle-engine";
import {
  BLOCK_BOARD_SIZE,
  type BlockCoordinate,
  type BlockPiece
} from "./block-puzzle-types";
import styles from "./block-puzzle-game.module.css";

type GameStatus = "playing" | "clearing" | "paused" | "game-over";
type DragState = { pieceIndex: number; x: number; y: number; pointerType: string };
type PreviewState = { pieceIndex: number; origin: BlockCoordinate; valid: boolean };
type BestScoreRecord = { score: number };

const BEST_SCORE_KEY = "pluto-block-puzzle-best";
const BEST_SCORE_VERSION = 1;
const CLEAR_ANIMATION_MS = 230;

export function BlockPuzzleGame({ onChooseGame, onExit }: {
  onChooseGame: () => void;
  onExit: () => void;
}) {
  const [board, setBoard] = useState(createEmptyBoard);
  const [pieces, setPieces] = useState<Array<BlockPiece | null>>(() => generateTray(1));
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [newBestThisRun, setNewBestThisRun] = useState(false);
  const [combo, setCombo] = useState(0);
  const [highestCombo, setHighestCombo] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [piecesPlaced, setPiecesPlaced] = useState(0);
  const [round, setRound] = useState(1);
  const [clearingIndexes, setClearingIndexes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("Ready to put your brain to the test?");
  const [pointsFeedback, setPointsFeedback] = useState<number | null>(null);
  const [focusedCell, setFocusedCell] = useState(0);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const previewRef = useRef<PreviewState | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const pointerMovedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const clearTimerRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  const previewIndexes = useMemo(() => {
    if (!preview) return new Set<number>();
    const piece = pieces[preview.pieceIndex];
    if (!piece) return new Set<number>();
    return new Set(piece.cells.map((cell) => toIndex(preview.origin.row + cell.row, preview.origin.column + cell.column)));
  }, [pieces, preview]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const record = readLocalRecord<BestScoreRecord>(BEST_SCORE_KEY, BEST_SCORE_VERSION);
      if (record && Number.isFinite(record.score) && record.score >= 0) setBestScore(Math.floor(record.score));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
  }, []);

  function updatePreview(nextPreview: PreviewState | null) {
    previewRef.current = nextPreview;
    setPreview(nextPreview);
  }

  function selectPiece(pieceIndex: number) {
    if (status !== "playing" || !pieces[pieceIndex]) return;
    const nextIndex = selectedPieceIndex === pieceIndex ? null : pieceIndex;
    setSelectedPieceIndex(nextIndex);
    updatePreview(nextIndex === null ? null : {
      pieceIndex: nextIndex,
      origin: fromIndex(focusedCell),
      valid: canPlacePiece(board, pieces[nextIndex]!, fromIndex(focusedCell))
    });
    setFeedback(nextIndex === null ? "Selection cancelled." : "Piece selected. Choose a spot on the board.");
  }

  function handlePiecePointerDown(event: ReactPointerEvent<HTMLButtonElement>, pieceIndex: number) {
    if (status !== "playing" || !pieces[pieceIndex]) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    pointerMovedRef.current = false;
    setSelectedPieceIndex(pieceIndex);
    setDrag({ pieceIndex, x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    updateDragPreview(pieceIndex, event.clientX, event.clientY, event.pointerType);
  }

  function handlePiecePointerMove(event: ReactPointerEvent<HTMLButtonElement>, pieceIndex: number) {
    if (!drag || drag.pieceIndex !== pieceIndex) return;
    if (Math.hypot(event.clientX - dragStartRef.current.x, event.clientY - dragStartRef.current.y) > 4) pointerMovedRef.current = true;
    setDrag({ pieceIndex, x: event.clientX, y: event.clientY, pointerType: event.pointerType });
    updateDragPreview(pieceIndex, event.clientX, event.clientY, event.pointerType);
  }

  function handlePiecePointerUp(event: ReactPointerEvent<HTMLButtonElement>, pieceIndex: number) {
    if (!drag || drag.pieceIndex !== pieceIndex) return;
    const activePreview = previewRef.current;
    // Pointer down already selects the piece. Suppress the synthetic click that follows
    // pointer up so a simple tap does not immediately toggle that selection back off.
    suppressClickRef.current = true;
    setDrag(null);
    if (activePreview?.pieceIndex === pieceIndex && activePreview.valid) commitPlacement(pieceIndex, activePreview.origin);
    else setFeedback(pointerMovedRef.current ? "That spot will not fit. Try another." : "Piece selected. Choose a spot on the board.");
  }

  function handlePiecePointerCancel() {
    setDrag(null);
    updatePreview(null);
    setFeedback("Placement cancelled. Your piece is still available.");
  }

  function handlePieceClick(pieceIndex: number) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    selectPiece(pieceIndex);
  }

  function updateDragPreview(pieceIndex: number, clientX: number, clientY: number, pointerType: string) {
    const boardElement = boardRef.current;
    const piece = pieces[pieceIndex];
    if (!boardElement || !piece) return;
    const rect = boardElement.getBoundingClientRect();
    const cellSize = rect.width / BLOCK_BOARD_SIZE;
    const verticalOffset = pointerType === "mouse" ? 8 : 60;
    const pieceWidth = Math.max(...piece.cells.map((cell) => cell.column)) + 1;
    const pieceHeight = Math.max(...piece.cells.map((cell) => cell.row)) + 1;
    const column = Math.floor((clientX - rect.left) / cellSize) - Math.floor(pieceWidth / 2);
    const row = Math.floor((clientY - verticalOffset - rect.top) / cellSize) - Math.floor(pieceHeight / 2);
    const origin = { row, column };
    updatePreview({ pieceIndex, origin, valid: canPlacePiece(board, piece, origin) });
  }

  function handleCellPointerEnter(index: number) {
    if (drag || selectedPieceIndex === null || status !== "playing") return;
    const piece = pieces[selectedPieceIndex];
    if (!piece) return;
    const origin = fromIndex(index);
    updatePreview({ pieceIndex: selectedPieceIndex, origin, valid: canPlacePiece(board, piece, origin) });
  }

  function handleCellClick(index: number) {
    if (selectedPieceIndex === null || status !== "playing") return;
    commitPlacement(selectedPieceIndex, fromIndex(index));
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (selectedPieceIndex === null || status !== "playing") return;
    if (event.key === "Escape") {
      event.preventDefault();
      setSelectedPieceIndex(null);
      updatePreview(null);
      setFeedback("Selection cancelled.");
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commitPlacement(selectedPieceIndex, fromIndex(index));
      return;
    }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const current = fromIndex(index);
    const next = {
      row: Math.min(BLOCK_BOARD_SIZE - 1, Math.max(0, current.row + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0))),
      column: Math.min(BLOCK_BOARD_SIZE - 1, Math.max(0, current.column + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0)))
    };
    const nextIndex = toIndex(next.row, next.column);
    setFocusedCell(nextIndex);
    cellRefs.current[nextIndex]?.focus();
    const piece = pieces[selectedPieceIndex];
    if (piece) updatePreview({ pieceIndex: selectedPieceIndex, origin: next, valid: canPlacePiece(board, piece, next) });
  }

  function commitPlacement(pieceIndex: number, origin: BlockCoordinate) {
    if (status !== "playing") return;
    const piece = pieces[pieceIndex];
    if (!piece) return;
    const result = placeAndClear(board, piece, origin);
    if (!result) {
      updatePreview({ pieceIndex, origin, valid: false });
      setFeedback("That spot will not fit. Try another.");
      return;
    }

    const lineCount = result.completedLines.rows.length + result.completedLines.columns.length;
    const nextCombo = lineCount > 0 ? combo + 1 : 0;
    const points = calculateMoveScore(piece.cells.length, lineCount, nextCombo);
    const nextScore = score + points;
    const nextPieces = pieces.map((availablePiece, index) => index === pieceIndex ? null : availablePiece);
    setScore(nextScore);
    setCombo(nextCombo);
    setHighestCombo((current) => Math.max(current, nextCombo));
    setLinesCleared((current) => current + lineCount);
    setPiecesPlaced((current) => current + 1);
    setPointsFeedback(points);
    setSelectedPieceIndex(null);
    updatePreview(null);
    updateBestScore(nextScore);
    showFeedback(getMoveFeedback(lineCount, nextCombo), 1300);

    if (lineCount > 0) {
      setBoard(result.boardAfterPlacement);
      setClearingIndexes(result.completedLines.cellIndexes);
      setStatus("clearing");
      clearTimerRef.current = window.setTimeout(() => {
        setClearingIndexes([]);
        finishMove(result.boardAfterClear, nextPieces);
        clearTimerRef.current = null;
      }, CLEAR_ANIMATION_MS);
      return;
    }

    setBoard(result.boardAfterClear);
    finishMove(result.boardAfterClear, nextPieces);
  }

  function finishMove(stableBoard: ReturnType<typeof createEmptyBoard>, nextPieces: Array<BlockPiece | null>) {
    let playablePieces = nextPieces;
    if (nextPieces.every((piece) => piece === null)) {
      const nextRound = round + 1;
      const previousShapeIds = pieces.flatMap((piece) => piece ? [piece.shapeId] : []);
      playablePieces = generateTray(nextRound, previousShapeIds);
      setRound(nextRound);
    }
    setPieces(playablePieces);
    setBoard(stableBoard);
    if (!canAnyPieceFit(stableBoard, playablePieces)) {
      setStatus("game-over");
      setFeedback("No more moves. One more round?");
    } else {
      setStatus("playing");
    }
  }

  function updateBestScore(nextScore: number) {
    if (nextScore <= bestScore) return;
    setBestScore(nextScore);
    setNewBestThisRun(true);
    if (hydrated) writeLocalRecord<BestScoreRecord>(BEST_SCORE_KEY, BEST_SCORE_VERSION, { score: nextScore });
  }

  function showFeedback(message: string, duration: number) {
    setFeedback(message);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setPointsFeedback(null);
      feedbackTimerRef.current = null;
    }, duration);
  }

  function restartGame(confirmRestart: boolean) {
    if (confirmRestart && piecesPlaced > 0 && status !== "game-over" && !window.confirm("Restart Block Puzzle and discard this run?")) return;
    if (clearTimerRef.current) window.clearTimeout(clearTimerRef.current);
    const freshPieces = generateTray(1);
    setBoard(createEmptyBoard());
    setPieces(freshPieces);
    setSelectedPieceIndex(null);
    updatePreview(null);
    setDrag(null);
    setStatus("playing");
    setScore(0);
    setNewBestThisRun(false);
    setCombo(0);
    setHighestCombo(0);
    setLinesCleared(0);
    setPiecesPlaced(0);
    setRound(1);
    setClearingIndexes([]);
    setPointsFeedback(null);
    setFeedback("Fresh board. Let’s make it count!");
  }

  function togglePause() {
    if (status === "playing") {
      setSelectedPieceIndex(null);
      updatePreview(null);
      setDrag(null);
      setStatus("paused");
      setFeedback("Game paused.");
    } else if (status === "paused") {
      setStatus("playing");
      setFeedback("Game resumed. Nice and steady!");
    }
  }

  function useHint() {
    if (status !== "playing") return;
    const hint = findPlacementHint(board, pieces);
    if (!hint) return;
    setSelectedPieceIndex(hint.pieceIndex);
    setFocusedCell(toIndex(hint.origin.row, hint.origin.column));
    updatePreview({ pieceIndex: hint.pieceIndex, origin: hint.origin, valid: true });
    cellRefs.current[toIndex(hint.origin.row, hint.origin.column)]?.focus();
    setFeedback("Pluto found a promising spot!");
  }

  function leave(destination: "exit" | "choose") {
    if (piecesPlaced > 0 && status !== "game-over" && !window.confirm("Leave Block Puzzle? This run will be lost.")) return;
    if (destination === "exit") onExit();
    else onChooseGame();
  }

  const activeDragPiece = drag ? pieces[drag.pieceIndex] : null;

  return (
    <section className={styles.shell} aria-labelledby="block-puzzle-title" data-pluto-modal-scroll="true">
      <header className={styles.header}>
        <Button className={styles.exitButton} onClick={() => leave("exit")} variant="ghost"><ArrowLeft aria-hidden="true" /> Exit game</Button>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>Pluto&apos;s Playroom</p>
          <h1 id="block-puzzle-title">Block Puzzle</h1>
          <p>Fit the blocks. Clear the lines. Beat your best!</p>
        </div>
        <Button className={styles.pauseButton} disabled={status === "clearing" || status === "game-over"} onClick={togglePause} variant="outline">
          {status === "paused" ? <CirclePlay aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
          {status === "paused" ? "Resume" : "Pause"}
        </Button>
      </header>

      <div className={styles.scoreBar} aria-label="Block Puzzle score">
        <ScoreStat icon={<Trophy aria-hidden="true" />} label="Score" value={score} pulse={Boolean(pointsFeedback)} />
        <ScoreStat icon={<Sparkles aria-hidden="true" />} label="Best" value={bestScore} />
        <div className={styles.feedback} aria-live="polite">
          <strong>{feedback}</strong>
          {pointsFeedback ? <span key={`${score}-${pointsFeedback}`}>+{pointsFeedback}</span> : null}
        </div>
        <div className={styles.comboStat}><span>Combo</span><strong>{combo > 1 ? `${Math.min(3, 1 + (combo - 1) * 0.5)}×` : "—"}</strong></div>
      </div>

      <div className={styles.gameLayout}>
        <div className={styles.boardColumn}>
          <div className={styles.boardFrame}>
            <div className={styles.board} ref={boardRef} role="grid" aria-label="Block Puzzle board">
              {board.map((color, index) => {
                const position = fromIndex(index);
                const previewed = previewIndexes.has(index);
                const invalidPreview = previewed && preview?.valid === false;
                const previewColor = previewed && preview ? pieces[preview.pieceIndex]?.color : null;
                return (
                  <button
                    aria-label={`Row ${position.row + 1}, column ${position.column + 1}${color ? ", occupied" : ", empty"}${previewed ? preview?.valid ? ", valid placement preview" : ", invalid placement preview" : ""}`}
                    className={cn(
                      styles.cell,
                      color && styles.occupiedCell,
                      previewed && styles.previewCell,
                      invalidPreview && styles.invalidPreview,
                      clearingIndexes.includes(index) && styles.clearingCell
                    )}
                    data-block-cell="true"
                    data-color={color ?? previewColor ?? undefined}
                    data-column={position.column}
                    data-row={position.row}
                    disabled={status !== "playing"}
                    key={index}
                    onClick={() => handleCellClick(index)}
                    onFocus={() => {
                      setFocusedCell(index);
                      handleCellPointerEnter(index);
                    }}
                    onKeyDown={(event) => handleCellKeyDown(event, index)}
                    onPointerEnter={() => handleCellPointerEnter(index)}
                    ref={(node) => { cellRefs.current[index] = node; }}
                    role="gridcell"
                    tabIndex={focusedCell === index ? 0 : -1}
                    type="button"
                  >
                    <span aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {status === "paused" ? (
              <div className={styles.pauseOverlay}>
                <CirclePause aria-hidden="true" />
                <strong>Game paused</strong>
                <span>Your board is waiting for you.</span>
                <div><PlutoButton onClick={togglePause} variant="primary"><CirclePlay aria-hidden="true" /> Resume</PlutoButton><Button onClick={() => restartGame(true)} variant="ghost">Restart</Button></div>
              </div>
            ) : null}
          </div>

          <p className={styles.instructions}>Drag a piece onto the board, or select it and choose a cell. Keyboard: arrows move the preview, Enter places, Escape cancels.</p>
        </div>

        <aside className={styles.sidePanel} aria-label="Block Puzzle pieces and controls">
          <section className={styles.trayCard}>
            <div className={styles.panelHeading}>
              <div><p className={styles.eyebrow}>Your pieces</p><h2>Choose a shape</h2></div>
              <span>{pieces.filter(Boolean).length} left</span>
            </div>
            <div className={styles.tray}>
              {pieces.map((piece, pieceIndex) => (
                <button
                  aria-label={piece ? `Select ${describePiece(piece)} block piece` : `Piece ${pieceIndex + 1} used`}
                  aria-pressed={selectedPieceIndex === pieceIndex}
                  className={cn(styles.pieceButton, selectedPieceIndex === pieceIndex && styles.pieceSelected, !piece && styles.pieceUsed)}
                  data-piece-index={pieceIndex}
                  disabled={!piece || status !== "playing"}
                  key={piece?.id ?? `used-${pieceIndex}`}
                  onClick={() => handlePieceClick(pieceIndex)}
                  onPointerCancel={handlePiecePointerCancel}
                  onPointerDown={(event) => handlePiecePointerDown(event, pieceIndex)}
                  onPointerMove={(event) => handlePiecePointerMove(event, pieceIndex)}
                  onPointerUp={(event) => handlePiecePointerUp(event, pieceIndex)}
                  type="button"
                >
                  {piece ? <PieceShape piece={piece} /> : <span className={styles.usedLabel}><X aria-hidden="true" />Placed</span>}
                </button>
              ))}
            </div>
          </section>

          <div className={styles.runStats}>
            <div><span>Lines</span><strong>{linesCleared}</strong></div>
            <div><span>Pieces</span><strong>{piecesPlaced}</strong></div>
            <div><span>Best combo</span><strong>{highestCombo}</strong></div>
          </div>

          <div className={styles.controls}>
            <Button disabled={status === "clearing"} onClick={() => restartGame(true)} variant="outline"><RotateCcw aria-hidden="true" /> Restart</Button>
            <Button disabled={status !== "playing"} onClick={useHint} variant="outline"><Lightbulb aria-hidden="true" /> Hint</Button>
            <Button onClick={() => setHowToPlayOpen(true)} variant="outline"><CircleHelp aria-hidden="true" /> How to Play</Button>
            <Button onClick={() => leave("choose")} variant="ghost"><Gamepad2 aria-hidden="true" /> Choose game</Button>
          </div>
        </aside>
      </div>

      {activeDragPiece && drag ? (
        <div
          aria-hidden="true"
          className={styles.dragPreview}
          style={{
            "--drag-x": `${drag.x}px`,
            "--drag-y": `${drag.y - (drag.pointerType === "mouse" ? 8 : 60)}px`
          } as CSSProperties}
        >
          <PieceShape piece={activeDragPiece} />
        </div>
      ) : null}

      {howToPlayOpen ? (
        <div className={styles.dialogOverlay} role="presentation">
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="block-how-title">
            <button aria-label="Close how to play" className={styles.dialogClose} onClick={() => setHowToPlayOpen(false)} type="button"><X aria-hidden="true" /></button>
            <Blocks aria-hidden="true" />
            <p className={styles.eyebrow}>Quick guide</p>
            <h2 id="block-how-title">How to Play</h2>
            <ol>
              <li>Place any of the three shapes on empty board cells.</li>
              <li>Complete a full row or column to clear it and earn bonus points.</li>
              <li>Use all three pieces to receive a fresh tray. Keep going while a piece can fit.</li>
            </ol>
            <PlutoButton onClick={() => setHowToPlayOpen(false)} variant="primary">Got it</PlutoButton>
          </section>
        </div>
      ) : null}

      {status === "game-over" ? (
        <div className={styles.dialogOverlay}>
          <section className={cn(styles.dialog, styles.gameOverDialog)} role="dialog" aria-modal="true" aria-labelledby="block-game-over-title">
            <Image alt="Pluto" height={116} src="/images/play/plutopopup.png" width={104} />
            <p className={styles.eyebrow}>{newBestThisRun ? "New Best!" : "Great run"}</p>
            <h2 id="block-game-over-title">No More Moves!</h2>
            <p>That was a great run! Ready to beat your score?</p>
            <dl className={styles.results}>
              <div><dt>Score</dt><dd>{score}</dd></div>
              <div><dt>Best</dt><dd>{bestScore}</dd></div>
              <div><dt>Lines</dt><dd>{linesCleared}</dd></div>
              <div><dt>Best combo</dt><dd>{highestCombo}</dd></div>
              <div><dt>Pieces</dt><dd>{piecesPlaced}</dd></div>
            </dl>
            <div className={styles.dialogActions}><PlutoButton onClick={() => restartGame(false)} showArrow variant="primary">Play Again</PlutoButton><Button onClick={() => leave("choose")} variant="ghost">Back to Playroom</Button></div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function ScoreStat({ icon, label, pulse = false, value }: { icon: React.ReactNode; label: string; pulse?: boolean; value: number }) {
  return <div className={cn(styles.scoreStat, pulse && styles.scorePulse)}>{icon}<span>{label}</span><strong data-current-score={label === "Score" ? "true" : undefined}>{value}</strong></div>;
}

function PieceShape({ piece }: { piece: BlockPiece }) {
  const width = Math.max(...piece.cells.map((cell) => cell.column)) + 1;
  const height = Math.max(...piece.cells.map((cell) => cell.row)) + 1;
  return (
    <span
      className={styles.pieceShape}
      data-color={piece.color}
      data-shape-id={piece.shapeId}
      style={{ "--piece-columns": width, "--piece-rows": height } as CSSProperties}
    >
      {piece.cells.map((cell) => <span className={styles.pieceBlock} key={`${cell.row}-${cell.column}`} style={{ gridColumn: cell.column + 1, gridRow: cell.row + 1 }} />)}
    </span>
  );
}

function describePiece(piece: BlockPiece) {
  return `${piece.cells.length}-block ${piece.shapeId.replaceAll("-", " ")}`;
}

function getMoveFeedback(lineCount: number, combo: number) {
  if (combo > 1) return "Combo! Pluto is impressed!";
  if (lineCount >= 4) return "Incredible!";
  if (lineCount === 3) return "Amazing!";
  if (lineCount === 2) return "Double Clear!";
  if (lineCount === 1) return "Look at you go!";
  return "Nice fit!";
}
