"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Check,
  CirclePause,
  CirclePlay,
  Gamepad2,
  Lightbulb,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Timer,
  Trophy
} from "lucide-react";
import {
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
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "./word-banks";
import {
  createPuzzle,
  createSeed,
  DIFFICULTY_CONFIG,
  getLineCells
} from "./word-search-generator";
import type {
  GridPosition,
  WordSearchCategory,
  WordSearchDifficulty,
  WordSearchPuzzle
} from "./word-search-types";
import { getMonotonicTime } from "./word-search-time";
import styles from "./word-search-game.module.css";

type GameStatus = "setup" | "playing" | "complete";

type PersistedGame = {
  category: WordSearchCategory;
  difficulty: WordSearchDifficulty;
  elapsedSeconds: number;
  foundWords: string[];
  puzzle: WordSearchPuzzle;
  remainingHints: number;
  status: Exclude<GameStatus, "setup">;
};

const STORAGE_KEY = "pluto-word-search";
const STORAGE_VERSION = 1;
const CATEGORIES = Object.keys(CATEGORY_LABELS) as WordSearchCategory[];
const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as WordSearchDifficulty[];

export function WordSearchGame({ onChooseGame, onExit }: {
  onChooseGame: () => void;
  onExit: () => void;
}) {
  const [category, setCategory] = useState<WordSearchCategory>("animals");
  const [difficulty, setDifficulty] = useState<WordSearchDifficulty>("easy");
  const [puzzle, setPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [status, setStatus] = useState<GameStatus>("setup");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<GridPosition[]>([]);
  const [paused, setPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingHints, setRemainingHints] = useState(DIFFICULTY_CONFIG.easy.hintCount);
  const [hintedCell, setHintedCell] = useState<GridPosition | null>(null);
  const [announcement, setAnnouncement] = useState("Ready to hunt some hidden words?");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const pointerIdRef = useRef<number | null>(null);
  const selectionStartRef = useRef<GridPosition | null>(null);
  const selectionRef = useRef<GridPosition[]>([]);
  const startedAtRef = useRef(0);
  const hintTimerRef = useRef<number | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];
  const progress = puzzle ? Math.round((foundWords.length / puzzle.words.length) * 100) : 0;
  const hintsUsed = config.hintCount - remainingHints;
  const score = Math.max(0, foundWords.length * config.pointsPerWord - hintsUsed * 5);
  const selectedKeys = useMemo(() => new Set(selection.map(positionKey)), [selection]);
  const foundCellKeys = useMemo(() => {
    if (!puzzle) return new Set<string>();
    return new Set(puzzle.words
      .filter((placedWord) => foundWords.includes(placedWord.word))
      .flatMap((placedWord) => placedWord.cells.map(positionKey)));
  }, [foundWords, puzzle]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = readLocalRecord<PersistedGame>(STORAGE_KEY, STORAGE_VERSION);
      if (saved && isValidPersistedGame(saved)) {
        setCategory(saved.category);
        setDifficulty(saved.difficulty);
        setPuzzle(saved.puzzle);
        setFoundWords(saved.foundWords);
        setElapsedSeconds(saved.elapsedSeconds);
        setRemainingHints(saved.remainingHints);
        setStatus(saved.status);
        setPaused(saved.status === "playing");
        setAnnouncement(saved.status === "complete" ? "Every word found. Pluto is impressed!" : "Puzzle restored. Press Resume when you are ready.");
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated || !puzzle || status === "setup") return;
    writeLocalRecord<PersistedGame>(STORAGE_KEY, STORAGE_VERSION, {
      category,
      difficulty,
      elapsedSeconds,
      foundWords,
      puzzle,
      remainingHints,
      status
    });
  }, [category, difficulty, elapsedSeconds, foundWords, hydrated, puzzle, remainingHints, status]);

  useEffect(() => {
    if (status !== "playing" || paused) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((getMonotonicTime() - startedAtRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(timer);
  }, [paused, status]);

  useEffect(() => () => {
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
  }, []);

  function startPuzzle(nextDifficulty = difficulty, nextCategory = category, seed = createSeed()) {
    const nextPuzzle = createPuzzle(nextCategory, nextDifficulty, seed);
    setCategory(nextCategory);
    setDifficulty(nextDifficulty);
    setPuzzle(nextPuzzle);
    setFoundWords([]);
    updateSelection([]);
    setElapsedSeconds(0);
    setRemainingHints(DIFFICULTY_CONFIG[nextDifficulty].hintCount);
    setHintedCell(null);
    setPaused(false);
    setStatus("playing");
    setAnnouncement("Puzzle ready. Find your first hidden word!");
    startedAtRef.current = getMonotonicTime();
  }

  function restartPuzzle() {
    if (!puzzle) return;
    setFoundWords([]);
    updateSelection([]);
    setElapsedSeconds(0);
    setRemainingHints(config.hintCount);
    setHintedCell(null);
    setPaused(false);
    setStatus("playing");
    setAnnouncement("Puzzle restarted. You have got this!");
    startedAtRef.current = getMonotonicTime();
  }

  function togglePause() {
    if (status !== "playing") return;
    if (!paused) {
      setElapsedSeconds(Math.floor((getMonotonicTime() - startedAtRef.current) / 1000));
      cancelSelection();
      setPaused(true);
      setAnnouncement("Game paused.");
      return;
    }
    startedAtRef.current = getMonotonicTime() - elapsedSeconds * 1000;
    setPaused(false);
    setAnnouncement("Game resumed. Keep looking!");
  }

  function useHint() {
    if (!puzzle || paused || status !== "playing" || remainingHints <= 0 || hintedCell) return;
    const target = puzzle.words.find((placedWord) => !foundWords.includes(placedWord.word));
    if (!target) return;
    setRemainingHints((current) => current - 1);
    setHintedCell(target.start);
    setAnnouncement(`Cosmic hint: look near row ${target.start.row + 1}, column ${target.start.column + 1}.`);
    hintTimerRef.current = window.setTimeout(() => {
      setHintedCell(null);
      hintTimerRef.current = null;
    }, 1800);
  }

  function beginPointerSelection(event: ReactPointerEvent<HTMLButtonElement>, position: GridPosition) {
    if (!canInteract()) return;
    pointerIdRef.current = event.pointerId;
    selectionStartRef.current = position;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSelection([position]);
  }

  function movePointerSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId || !selectionStartRef.current) return;
    const element = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-word-cell]");
    if (!element || !boardRef.current?.contains(element)) return;
    const row = Number(element.dataset.row);
    const column = Number(element.dataset.column);
    if (!Number.isInteger(row) || !Number.isInteger(column)) return;
    updateSelection(getLineCells(selectionStartRef.current, { row, column }));
  }

  function endPointerSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== event.pointerId) return;
    submitSelection(selectionRef.current);
    pointerIdRef.current = null;
    selectionStartRef.current = null;
  }

  function handlePointerCancel() {
    pointerIdRef.current = null;
    selectionStartRef.current = null;
    cancelSelection();
  }

  function handleCellKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!puzzle || !canInteract()) return;
    const position = indexToPosition(index, puzzle.size);

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!selectionStartRef.current) {
        selectionStartRef.current = position;
        updateSelection([position]);
        setAnnouncement("Start selected. Use arrow keys to extend the word, then press Enter to submit.");
      } else {
        submitSelection(selectionRef.current);
        selectionStartRef.current = null;
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      selectionStartRef.current = null;
      cancelSelection();
      return;
    }

    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const nextPosition = getKeyboardDestination(position, event.key, event.shiftKey, puzzle.size);
    const nextIndex = nextPosition.row * puzzle.size + nextPosition.column;
    setFocusedIndex(nextIndex);
    cellRefs.current[nextIndex]?.focus();
    if (selectionStartRef.current) updateSelection(getLineCells(selectionStartRef.current, nextPosition));
  }

  function submitSelection(cells: GridPosition[]) {
    if (!puzzle || cells.length < 2) {
      cancelSelection();
      return;
    }

    const match = puzzle.words.find((placedWord) => samePath(cells, placedWord.cells));
    if (!match) {
      setAnnouncement("Not a hidden word. Try another line.");
      cancelSelection();
      return;
    }
    if (foundWords.includes(match.word)) {
      setAnnouncement(`${match.word} is already found.`);
      cancelSelection();
      return;
    }

    const nextFoundWords = [...foundWords, match.word];
    setFoundWords(nextFoundWords);
    updateSelection([]);
    if (nextFoundWords.length === puzzle.words.length) {
      setElapsedSeconds(Math.floor((getMonotonicTime() - startedAtRef.current) / 1000));
      setStatus("complete");
      setAnnouncement("Every word found. Pluto is impressed!");
    } else if (nextFoundWords.length * 2 >= puzzle.words.length && foundWords.length * 2 < puzzle.words.length) {
      setAnnouncement(`${match.word} found. Halfway there, word explorer!`);
    } else {
      setAnnouncement(`${match.word} found. Nice find!`);
    }
  }

  function updateSelection(cells: GridPosition[]) {
    selectionRef.current = cells;
    setSelection(cells);
  }

  function cancelSelection() {
    updateSelection([]);
  }

  function canInteract() {
    return Boolean(puzzle && status === "playing" && !paused);
  }

  function leave(destination: "exit" | "choose") {
    if (status === "playing" && foundWords.length > 0 && !window.confirm("Leave this word search? Your puzzle is saved for later.")) return;
    if (destination === "exit") onExit();
    else onChooseGame();
  }

  if (status === "setup" || !puzzle) {
    return (
      <section className={styles.shell} aria-labelledby="word-search-title" data-pluto-modal-scroll="true">
        <GameHeader onBack={() => leave("exit")} />
        <div className={styles.setupCard}>
          <div className={styles.setupIntro}>
            <span className={styles.setupIcon}><Search aria-hidden="true" /></span>
            <p className={styles.eyebrow}>Choose your challenge</p>
            <h2>Ready to hunt some hidden words?</h2>
            <p>Pick a category and difficulty. Pluto will build a fresh puzzle just for you.</p>
          </div>

          <fieldset className={styles.optionGroup}>
            <legend>Category</legend>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((option) => (
                <button
                  aria-pressed={category === option}
                  className={category === option ? styles.optionSelected : undefined}
                  key={option}
                  onClick={() => setCategory(option)}
                  type="button"
                >
                  {CATEGORY_LABELS[option]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.optionGroup}>
            <legend>Difficulty</legend>
            <div className={styles.difficultyGrid}>
              {DIFFICULTIES.map((option) => (
                <button
                  aria-pressed={difficulty === option}
                  className={difficulty === option ? styles.optionSelected : undefined}
                  key={option}
                  onClick={() => setDifficulty(option)}
                  type="button"
                >
                  <strong>{DIFFICULTY_LABELS[option]}</strong>
                  <span>{DIFFICULTY_CONFIG[option].size} × {DIFFICULTY_CONFIG[option].size} · {DIFFICULTY_CONFIG[option].wordCount} words</span>
                </button>
              ))}
            </div>
          </fieldset>

          <PlutoButton className={styles.startButton} onClick={() => startPuzzle()} showArrow size="lg" variant="primary">
            Start Word Search
          </PlutoButton>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.shell} aria-labelledby="word-search-title" data-pluto-modal-scroll="true">
      <GameHeader onBack={() => leave("exit")} />

      <div className={styles.stats} aria-label="Game progress">
        <Stat icon={<Check aria-hidden="true" />} label="Words found" value={`${foundWords.length} / ${puzzle.words.length}`} />
        <Stat icon={<Timer aria-hidden="true" />} label="Time" value={formatTime(elapsedSeconds)} />
        <Stat icon={<Trophy aria-hidden="true" />} label="Score" value={String(score)} />
        <div className={styles.progressStat}>
          <span>Progress</span>
          <strong>{progress}%</strong>
          <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
        </div>
      </div>

      <div className={styles.gameLayout}>
        <div className={styles.boardColumn}>
          <div className={styles.contextBar}>
            <span>{DIFFICULTY_LABELS[difficulty]}</span>
            <span>{CATEGORY_LABELS[category]}</span>
            <span>{puzzle.size} × {puzzle.size}</span>
          </div>

          <div className={styles.boardFrame}>
            <div
              aria-label={`${DIFFICULTY_LABELS[difficulty]} word search board`}
              className={cn(styles.board, paused && styles.boardPaused)}
              onPointerCancel={handlePointerCancel}
              onPointerMove={movePointerSelection}
              onPointerUp={endPointerSelection}
              ref={boardRef}
              role="grid"
              style={{ "--word-grid-size": puzzle.size } as React.CSSProperties}
            >
              {puzzle.grid.flatMap((row, rowIndex) => row.map((letter, columnIndex) => {
                const index = rowIndex * puzzle.size + columnIndex;
                const position = { row: rowIndex, column: columnIndex };
                const key = positionKey(position);
                const found = foundCellKeys.has(key);
                const selected = selectedKeys.has(key);
                const hinted = hintedCell?.row === rowIndex && hintedCell.column === columnIndex;
                return (
                  <button
                    aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}, letter ${letter}${found ? ", part of a found word" : ""}`}
                    className={cn(styles.cell, selected && styles.cellSelected, found && styles.cellFound, hinted && styles.cellHinted)}
                    data-column={columnIndex}
                    data-row={rowIndex}
                    data-word-cell="true"
                    disabled={paused || status !== "playing"}
                    key={key}
                    onFocus={() => setFocusedIndex(index)}
                    onKeyDown={(event) => handleCellKeyDown(event, index)}
                    onPointerDown={(event) => beginPointerSelection(event, position)}
                    ref={(node) => { cellRefs.current[index] = node; }}
                    role="gridcell"
                    tabIndex={focusedIndex === index ? 0 : -1}
                    type="button"
                  >
                    {letter}
                  </button>
                );
              }))}
            </div>
            {paused ? (
              <div className={styles.pauseOverlay}>
                <CirclePause aria-hidden="true" />
                <strong>Game paused</strong>
                <span>Your puzzle is right where you left it.</span>
                <PlutoButton onClick={togglePause} variant="primary"><CirclePlay aria-hidden="true" /> Resume</PlutoButton>
              </div>
            ) : null}
          </div>

          <p className={styles.instructions}>
            Drag across letters, or focus a cell and press Enter. Use arrows for straight lines and Shift + arrows for diagonals; Enter submits and Escape cancels.
          </p>
        </div>

        <aside className={styles.sidePanel} aria-label="Word search controls and word list">
          <section className={styles.wordCard}>
            <div className={styles.panelHeading}>
              <div><p className={styles.eyebrow}>Hidden words</p><h2>Find them all</h2></div>
              <span>{foundWords.length}/{puzzle.words.length}</span>
            </div>
            <ul className={styles.wordList}>
              {puzzle.words.map((placedWord) => {
                const found = foundWords.includes(placedWord.word);
                return (
                  <li className={found ? styles.wordFound : undefined} data-target-word={placedWord.word} key={placedWord.word}>
                    <span>{placedWord.word}</span>
                    {found ? <Check aria-label="Found" /> : <span className="sr-only">Not found</span>}
                  </li>
                );
              })}
            </ul>
            <p className={styles.encouragement}>{progress >= 50 ? "Halfway there, word explorer!" : "You're doing great. Keep looking!"}</p>
          </section>

          <div className={styles.controls}>
            <Button onClick={togglePause} variant="outline"><CirclePause aria-hidden="true" /> Pause</Button>
            <Button onClick={restartPuzzle} variant="outline"><RotateCcw aria-hidden="true" /> Restart</Button>
            <Button disabled={remainingHints === 0 || Boolean(hintedCell)} onClick={useHint} variant="outline">
              <Lightbulb aria-hidden="true" /> Hint ({remainingHints})
            </Button>
            <Button onClick={() => startPuzzle(difficulty, category)} variant="outline"><RefreshCw aria-hidden="true" /> New puzzle</Button>
          </div>

          <Button className={styles.chooseGame} onClick={() => leave("choose")} variant="ghost">
            <Gamepad2 aria-hidden="true" /> Choose another game
          </Button>
        </aside>
      </div>

      <p aria-live="polite" className="sr-only">{announcement}</p>

      {status === "complete" ? (
        <div className={styles.completionOverlay} role="dialog" aria-modal="true" aria-labelledby="word-search-complete-title">
          <div className={styles.completionCard}>
            <Image alt="Pluto celebrating" height={116} src="/images/play/plutopopup.png" width={104} />
            <span className={styles.celebrationIcon}><Sparkles aria-hidden="true" /></span>
            <p className={styles.eyebrow}>Every word found</p>
            <h2 id="word-search-complete-title">Amazing! You found them all!</h2>
            <p>Pluto knew you had it in you. Ready for another challenge?</p>
            <dl className={styles.results}>
              <div><dt>Difficulty</dt><dd>{DIFFICULTY_LABELS[difficulty]}</dd></div>
              <div><dt>Category</dt><dd>{CATEGORY_LABELS[category]}</dd></div>
              <div><dt>Time</dt><dd>{formatTime(elapsedSeconds)}</dd></div>
              <div><dt>Score</dt><dd>{score}</dd></div>
              <div><dt>Words</dt><dd>{foundWords.length}/{puzzle.words.length}</dd></div>
              <div><dt>Hints used</dt><dd>{hintsUsed}</dd></div>
            </dl>
            <div className={styles.completionActions}>
              <PlutoButton onClick={restartPuzzle} showArrow variant="primary">Play Again</PlutoButton>
              <Button onClick={() => startPuzzle(nextDifficulty(difficulty), category)} variant="outline">Try Harder Difficulty</Button>
              <Button onClick={() => leave("choose")} variant="ghost">Back to Playroom</Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function GameHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className={styles.header}>
      <Button className={styles.exitButton} onClick={onBack} variant="ghost"><ArrowLeft aria-hidden="true" /> Exit game</Button>
      <div>
        <p className={styles.eyebrow}>Pluto&apos;s Playroom</p>
        <h1 id="word-search-title">Word Search</h1>
        <p>Search, connect, and discover hidden words with Pluto.</p>
      </div>
    </header>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className={styles.stat}>{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function positionKey(position: GridPosition) {
  return `${position.row}-${position.column}`;
}

function samePath(first: GridPosition[], second: GridPosition[]) {
  if (first.length !== second.length) return false;
  const forward = first.every((cell, index) => positionKey(cell) === positionKey(second[index]));
  const reverse = first.every((cell, index) => positionKey(cell) === positionKey(second[second.length - 1 - index]));
  return forward || reverse;
}

function indexToPosition(index: number, size: number): GridPosition {
  return { row: Math.floor(index / size), column: index % size };
}

function getKeyboardDestination(
  current: GridPosition,
  key: string,
  diagonal: boolean,
  size: number
): GridPosition {
  let rowChange = 0;
  let columnChange = 0;
  if (key === "ArrowUp") rowChange = -1;
  if (key === "ArrowDown") rowChange = 1;
  if (key === "ArrowLeft") columnChange = -1;
  if (key === "ArrowRight") columnChange = 1;
  if (diagonal) {
    if (key === "ArrowUp" || key === "ArrowDown") columnChange = key === "ArrowUp" ? 1 : -1;
    if (key === "ArrowLeft" || key === "ArrowRight") rowChange = key === "ArrowRight" ? 1 : -1;
  }
  return {
    row: Math.min(size - 1, Math.max(0, current.row + rowChange)),
    column: Math.min(size - 1, Math.max(0, current.column + columnChange))
  };
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function nextDifficulty(difficulty: WordSearchDifficulty): WordSearchDifficulty {
  if (difficulty === "easy") return "medium";
  return "hard";
}

function isValidPersistedGame(value: PersistedGame): value is PersistedGame {
  const config = DIFFICULTY_CONFIG[value.difficulty];
  return Boolean(
    config &&
    CATEGORY_LABELS[value.category] &&
    value.puzzle &&
    value.puzzle.size === config.size &&
    value.puzzle.grid.length === config.size &&
    value.puzzle.grid.every((row) => row.length === config.size && row.every((letter) => /^[A-Z]$/.test(letter))) &&
    value.puzzle.words.length === config.wordCount &&
    value.foundWords.every((word) => value.puzzle.words.some((placedWord) => placedWord.word === word)) &&
    Number.isFinite(value.elapsedSeconds) && value.elapsedSeconds >= 0 &&
    Number.isInteger(value.remainingHints) && value.remainingHints >= 0 && value.remainingHints <= config.hintCount &&
    (value.status === "playing" || value.status === "complete")
  );
}
