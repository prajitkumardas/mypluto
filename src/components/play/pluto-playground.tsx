"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Circle,
  Gamepad2,
  Gift,
  Lightbulb,
  Lock,
  PawPrint,
  RotateCcw,
  Share2,
  Trophy,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlutoButton } from "@/components/ui/pluto-button";
import LightPillar from "@/components/ui/light-pillar";
import { ToolLogo } from "@/components/shared/tool-logo";
import { HeroVeil } from "@/components/shared/hero-veil";
import { getFaviconLogoUrl } from "@/lib/tool-logo";
import { cn } from "@/lib/utils";
import { readLocalRecord, writeLocalRecord } from "@/lib/local-persistence";
import styles from "./pluto-playground.module.css";

type Mark = "X" | "O" | null;
type Player = "user" | "pluto";
type Outcome = "user" | "pluto" | "draw" | null;
type FlowState =
  | "landing"
  | "game-selection"
  | "name-entry"
  | "versus"
  | "playing"
  | "user-won"
  | "pluto-won"
  | "draw"
  | "reward-reveal";

export type PlayRewardTool = {
  slug: string;
  name: string;
  category: string;
  description: string;
  domain: string;
  pricing: string;
  useCase: string;
  whyPicked: string;
};

type GameResult = {
  outcome: Outcome;
  line: number[];
};

type Score = {
  user: number;
  pluto: number;
  draws: number;
};

type BodyScrollSnapshot = {
  scrollY: number;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  bodyPaddingRight: string;
  htmlOverflow: string;
  htmlOverscrollBehavior: string;
  bodyOverscrollBehavior: string;
};

type ConfettiStyle = CSSProperties & {
  "--confetti-delay": string;
  "--confetti-duration": string;
  "--confetti-rotation": string;
  "--confetti-size": string;
  "--confetti-x": string;
  "--confetti-y": string;
};

type GiftDustStyle = CSSProperties & {
  "--gift-dust-delay": string;
  "--gift-dust-drift-x": string;
  "--gift-dust-drift-y": string;
  "--gift-dust-duration": string;
  "--gift-dust-opacity": string;
  "--gift-dust-size": string;
  "--gift-dust-x": string;
  "--gift-dust-y": string;
};

const VIDEO_SRC = "/videos/play/plutoplay.mp4";
const POSTER_SRC = "/images/home/hero/pluto-valley-background.webp";
const PLAY_PROFILE_KEY = "pluto-play-profile";
const PLAY_PROFILE_VERSION = 1;
type PlayProfile = { playerName: string; score: Score; unlockedRewardSlugs: string[] };
const emptyBoard: Mark[] = Array.from({ length: 9 }, () => null);
const winLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
const WIN_CONFETTI: Array<{ id: number; style: ConfettiStyle }> = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  style: {
    "--confetti-delay": `${(0.58 + confettiValue(index, 1, 0, 0.24)).toFixed(2)}s`,
    "--confetti-duration": `${confettiValue(index, 2, 1.85, 2.9).toFixed(2)}s`,
    "--confetti-rotation": `${confettiValue(index, 3, -1080, 1080).toFixed(0)}deg`,
    "--confetti-size": `${confettiValue(index, 4, 0.34, 0.72).toFixed(2)}rem`,
    "--confetti-x": `${confettiValue(index, 5, -48, 48).toFixed(2)}vw`,
    "--confetti-y": `${confettiValue(index, 6, -46, 38).toFixed(2)}vh`
  }
}));

const WIN_GIFT_DUST: Array<{ id: number; style: GiftDustStyle }> = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  style: {
    "--gift-dust-delay": `${confettiValue(index, 7, -6, 0).toFixed(2)}s`,
    "--gift-dust-drift-x": `${confettiValue(index, 8, -1.1, 1.1).toFixed(2)}rem`,
    "--gift-dust-drift-y": `${confettiValue(index, 9, -1.5, -0.45).toFixed(2)}rem`,
    "--gift-dust-duration": `${confettiValue(index, 10, 3.8, 6.8).toFixed(2)}s`,
    "--gift-dust-opacity": confettiValue(index, 11, 0.35, 0.82).toFixed(2),
    "--gift-dust-size": `${confettiValue(index, 12, 0.1, 0.24).toFixed(2)}rem`,
    "--gift-dust-x": `${confettiValue(index, 13, 8, 92).toFixed(2)}%`,
    "--gift-dust-y": `${confettiValue(index, 14, 10, 90).toFixed(2)}%`
  }
}));

function confettiValue(index: number, salt: number, minimum: number, maximum: number) {
  let value = Math.imul(index + 1, 0x45d9f3b) ^ Math.imul(salt + 1, 0x27d4eb2d);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  const normalized = ((value ^ (value >>> 16)) >>> 0) / 4294967295;
  return minimum + (maximum - minimum) * normalized;
}

export function PlutoPlayground({ rewardTools }: { rewardTools: PlayRewardTool[] }) {
  const [flowState, setFlowState] = useState<FlowState>("landing");
  const [board, setBoard] = useState<Mark[]>(emptyBoard);
  const [turn, setTurn] = useState<Player>("user");
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [score, setScore] = useState<Score>({ user: 0, pluto: 0, draws: 0 });
  const [round, setRound] = useState(1);
  const [playerName, setPlayerName] = useState("You");
  const [nameInput, setNameInput] = useState("");
  const [selectedReward, setSelectedReward] = useState<PlayRewardTool | null>(null);
  const [giftOpening, setGiftOpening] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [unlockedRewardSlugs, setUnlockedRewardSlugs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollLockRef = useRef<BodyScrollSnapshot | null>(null);

  const modalOpen = flowState === "game-selection" || flowState === "name-entry";
  const resultOpen = flowState === "user-won" || flowState === "pluto-won" || flowState === "draw" || flowState === "reward-reveal";
  const popupOpen = modalOpen || resultOpen;
  const gameVisible = isGameVisible(flowState);
  const scrollLocked = popupOpen || flowState === "versus" || gameVisible;
  const thinking = flowState === "playing" && turn === "pluto";
  const outcome = getOutcomeFromState(flowState);
  const status = getStatusText(flowState, turn, thinking);
  const rewardLogo = useMemo(() => getFaviconLogoUrl(selectedReward?.domain), [selectedReward?.domain]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-play-immersive", flowState === "versus" || gameVisible || resultOpen);
    return () => document.documentElement.removeAttribute("data-play-immersive");
  }, [flowState, gameVisible, resultOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const profile = readLocalRecord<PlayProfile>(PLAY_PROFILE_KEY, PLAY_PROFILE_VERSION);
      if (profile) {
        setPlayerName(profile.playerName || "You");
        setNameInput(profile.playerName === "You" ? "" : profile.playerName);
        setScore(profile.score);
        setUnlockedRewardSlugs(profile.unlockedRewardSlugs || []);
      }
      setProfileHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!profileHydrated) return;
    writeLocalRecord<PlayProfile>(PLAY_PROFILE_KEY, PLAY_PROFILE_VERSION, { playerName, score, unlockedRewardSlugs });
  }, [playerName, profileHydrated, score, unlockedRewardSlugs]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 0.7;

    const syncPlayback = () => {
      if (document.hidden || flowState !== "landing" || modalOpen) {
        video.pause();
        return;
      }

      void video.play().catch(() => undefined);
    };

    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);

    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [flowState, modalOpen]);


  useEffect(() => {
    if (!scrollLocked) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const computedBody = window.getComputedStyle(body);
    const currentPaddingRight = Number.parseFloat(computedBody.paddingRight) || 0;

    scrollLockRef.current = {
      scrollY,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverscrollBehavior: body.style.overscrollBehavior
    };

    const preventBackgroundScroll = (event: WheelEvent | TouchEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('[data-pluto-modal-scroll="true"]')) return;
      event.preventDefault();
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });

    return () => {
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);

      const snapshot = scrollLockRef.current;
      if (!snapshot) return;

      html.style.overflow = snapshot.htmlOverflow;
      html.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
      body.style.position = snapshot.bodyPosition;
      body.style.top = snapshot.bodyTop;
      body.style.left = snapshot.bodyLeft;
      body.style.right = snapshot.bodyRight;
      body.style.width = snapshot.bodyWidth;
      body.style.overflow = snapshot.bodyOverflow;
      body.style.overscrollBehavior = snapshot.bodyOverscrollBehavior;
      body.style.paddingRight = snapshot.bodyPaddingRight;
      scrollLockRef.current = null;
      window.scrollTo(0, snapshot.scrollY);
    };
  }, [scrollLocked]);
  useEffect(() => {
    if (flowState !== "versus") return;

    const timer = window.setTimeout(() => {
      setFlowState("playing");
      setTurn("user");
    }, 4800);

    return () => window.clearTimeout(timer);
  }, [flowState]);

  useEffect(() => {
    if (!thinking) return;

    const timer = window.setTimeout(() => {
      setBoard((currentBoard) => {
        const move = choosePlutoMove(currentBoard);
        if (move === -1) return currentBoard;

        const nextBoard = [...currentBoard];
        nextBoard[move] = "O";
        const result = getGameResult(nextBoard);

        if (result.outcome) {
          completeRound(result);
        } else {
          setTurn("user");
        }

        return nextBoard;
      });
    }, 660);

    return () => window.clearTimeout(timer);
  // completeRound only reads stable React setters plus the current reward pool for a finished round.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thinking]);

  function openInvitation() {
    setFlowState("game-selection");
  }

  function closeGameModal() {
    setFlowState("landing");
  }

  function chooseTicTacToe() {
    setFlowState("name-entry");
  }

  function startGame(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const nextName = sanitizePlayerName(nameInput);
    setPlayerName(nextName);
    resetBoard();
    setSelectedReward(null);
    setGiftOpening(false);
    setFlowState("versus");
  }

  function resetBoard() {
    setBoard([...emptyBoard]);
    setTurn("user");
    setWinningLine([]);
    setRound((value) => value + 1);
  }

  function restartRound() {
    resetBoard();
    setSelectedReward(null);
    setGiftOpening(false);
    setFlowState("playing");
  }

  function exitGame() {
    resetBoard();
    setSelectedReward(null);
    setGiftOpening(false);
    setFlowState("landing");
  }

  function chooseAnotherGame() {
    resetBoard();
    setSelectedReward(null);
    setGiftOpening(false);
    setFlowState("game-selection");
  }

  function completeRound(result: GameResult) {
    setWinningLine(result.line);

    if (result.outcome === "user") {
      const reward = selectedReward ?? randomItem(rewardTools);
      setScore((current) => ({ ...current, user: current.user + 1 }));
      setSelectedReward(reward);
      setUnlockedRewardSlugs((current) => current.includes(reward.slug) ? current : [...current, reward.slug]);
      setFlowState("user-won");
      return;
    }

    if (result.outcome === "pluto") {
      setScore((current) => ({ ...current, pluto: current.pluto + 1 }));
      setFlowState("pluto-won");
      return;
    }

    setScore((current) => ({ ...current, draws: current.draws + 1 }));
    setFlowState("draw");
  }

  async function shareReward() {
    if (!selectedReward) return;
    const url = new URL(`/tools/${selectedReward.slug}`, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title: `${selectedReward.name} on Pluto Finds`, text: "I unlocked this AI tool by beating Pluto.", url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
  }

  function makeMove(index: number) {
    if (turn !== "user" || thinking || flowState !== "playing" || board[index]) return;

    const nextBoard = [...board];
    nextBoard[index] = "X";
    const result = getGameResult(nextBoard);

    setBoard(nextBoard);

    if (result.outcome) {
      completeRound(result);
    } else {
      setTurn("pluto");
    }
  }

  function revealReward() {
    if (flowState !== "user-won" || giftOpening) return;

    setGiftOpening(true);
    window.setTimeout(() => {
      setGiftOpening(false);
      setFlowState("reward-reveal");
    }, 520);
  }

  return (
    <main className={cn(styles.stage, flowState === "landing" && styles.landingStage, gameVisible && styles.gameStage)}>
      {flowState === "landing" || modalOpen ? (
        <div className={styles.videoLayer} aria-hidden="true">
          <video
            autoPlay
            className={styles.heroVideo}
            loop
            muted
            playsInline
            poster={POSTER_SRC}
            preload="metadata"
            ref={videoRef}
            src={VIDEO_SRC}
          />
          <div className={styles.videoOverlay} />
        </div>
      ) : (
        <HeroVeil className={styles.background} />
      )}

      {flowState === "landing" || modalOpen ? (
        <section className={styles.landingContent} aria-labelledby="play-title">
          <p className={styles.eyebrow}>Pluto&apos;s Playroom</p>
          <h1 id="play-title">Pluto&apos;s been waiting for you to play with.</h1>
          <p>He&apos;s been sitting here all alone. Stay for a little while and challenge him to a game.</p>
          <PlutoButton className={styles.primaryCta} onClick={openInvitation} showArrow size="lg" type="button" variant="primary">
            Play with Pluto
          </PlutoButton>
        </section>
      ) : null}

      {flowState === "versus" ? (
        <section className={styles.versusScreen} aria-label={`Pluto versus ${playerName}`} aria-live="polite">
          <div className={styles.versusLight} aria-hidden="true">
            <LightPillar
              topColor="#AD6CFF"
              bottomColor="#7825E8"
              intensity={0.58}
              rotationSpeed={2}
              glowAmount={0.00125}
              pillarWidth={3}
              pillarHeight={0.4}
              noiseIntensity={0.5}
              pillarRotation={25}
              interactive={false}
              mixBlendMode="screen"
              quality="high"
            />
          </div>
          <div className={styles.versusContent}>
            <span className={cn(styles.versusName, styles.versusPluto)} data-text="Pluto">Pluto</span>
            <strong className={styles.versusMark} data-text="VS">VS</strong>
            <span className={cn(styles.versusName, styles.versusPlayer)} data-text={playerName}>{playerName}</span>
          </div>
        </section>
      ) : null}

      {gameVisible ? (
        <section className={styles.gameShell} aria-labelledby="game-title">
          <div className={styles.gameHeader}>
            <Button className={styles.exitButton} onClick={exitGame} variant="ghost">
              <ArrowLeft aria-hidden="true" /> Exit game
            </Button>
            <div className={styles.gameTitleBlock}>
              <p className={styles.eyebrow}>Tic-Tac-Toe</p>
              <h1 className={styles.gameTitle} id="game-title">
                <span className={styles.gameTitlePlayer}>{playerName}</span>
                <span className={styles.gameTitleVs}>vs</span>
                <span className={styles.gameTitlePluto}>Pluto</span>
              </h1>
            </div>
          </div>

          <div className={styles.scoreRow} aria-label="Current session score">
            <div className={styles.playerBadge}>
              <span>{playerName} - X</span>
              <strong key={`user-${score.user}`}>{score.user}</strong>
            </div>
            <div className={styles.playerBadge}>
              <span>Draws</span>
              <strong key={`draws-${score.draws}`}>{score.draws}</strong>
            </div>
            <div className={styles.playerBadge}>
              <span>Pluto - O</span>
              <strong key={`pluto-${score.pluto}`}>{score.pluto}</strong>
            </div>
          </div>

          <div className={cn(styles.turnPill, outcome && styles.turnPillSettled)} aria-live="polite">
            {turn === "pluto" || outcome === "pluto" ? <Circle aria-hidden="true" /> : outcome === "user" ? <Trophy aria-hidden="true" /> : <X aria-hidden="true" />}
            {status}
          </div>

          <div className={styles.board} role="grid" aria-label="Tic-tac-toe board">
            {board.map((mark, index) => (
              <button
                aria-label={getCellLabel(mark, index, playerName)}
                className={cn(
                  styles.cell,
                  mark === "X" && styles.cellX,
                  mark === "O" && styles.cellO,
                  winningLine.includes(index) && styles.winningCell
                )}
                disabled={Boolean(mark) || turn !== "user" || thinking || flowState !== "playing"}
                key={`${round}-${index}`}
                onClick={() => makeMove(index)}
                role="gridcell"
                type="button"
              >
                <span>{mark}</span>
              </button>
            ))}
          </div>

          <div className={styles.gameActions}>
            <PlutoButton onClick={restartRound} type="button" variant="secondary">
              <RotateCcw aria-hidden="true" /> Restart
            </PlutoButton>
            <PlutoButton onClick={chooseAnotherGame} type="button" variant="secondary">
              <Gamepad2 aria-hidden="true" /> Choose game
            </PlutoButton>
          </div>
        </section>
      ) : null}

      <Dialog.Root open={modalOpen} onOpenChange={(open) => !open && closeGameModal()}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.modalOverlay} />
          <Dialog.Content className={cn(styles.modalContent, styles.selectionModalContent, flowState === "name-entry" && styles.nameEntryModalContent)} data-pluto-modal-scroll="true">
            <div className={styles.modalMascotFrame} aria-hidden="true">
              <Image
                alt=""
                className={styles.modalMascot}
                height={1321}
                priority
                sizes="(max-width: 700px) 105px, 136px"
                src="/images/play/plutopopup.png"
                width={1191}
              />
            </div>
            <div className={styles.modalHeader}>
              <div>
                <Dialog.Title className={styles.modalTitle}>
                  {flowState === "name-entry" ? (
                    "What should Pluto call you?"
                  ) : (
                    <>What would you like to <span className={styles.titleAccent}>play?</span></>
                  )}
                </Dialog.Title>
                <Dialog.Description className={styles.modalDescription}>
                  {flowState === "name-entry" ? "The name is optional. Pluto will keep it for this session." : "Choose a game and challenge Pluto."}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button className={styles.closeButton} type="button" aria-label="Close play popup">
                  <X aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            {flowState === "game-selection" ? (
              <>
                <div className={styles.gameChoices}>
                  <article className={cn(styles.gameChoice, styles.gameChoiceAvailable)}>
                    <div className={styles.gamePreview} aria-hidden="true">
                      <X />
                      <Circle />
                    </div>
                    <div>
                      <h3>Tic-Tac-Toe</h3>
                      <p>A quick match against Pluto.</p>
                    </div>
                    <PlutoButton onClick={chooseTicTacToe} showArrow type="button" variant="primary">
                      Play now
                    </PlutoButton>
                  </article>

                  <article className={styles.gameChoice} data-disabled="true">
                    <div className={styles.gamePreview} aria-hidden="true">
                      <PawPrint />
                    </div>
                    <div>
                      <h3>Memory Match</h3>
                      <p>Flip cards with Pluto.</p>
                    </div>
                    <span className={styles.soonBadge}><Lock aria-hidden="true" />Coming soon</span>
                  </article>

                  <article className={styles.gameChoice} data-disabled="true">
                    <div className={styles.gamePreview} aria-hidden="true">
                      <Lightbulb />
                    </div>
                    <div>
                      <h3>Prompt Puzzle</h3>
                      <p>A tiny AI riddle room.</p>
                    </div>
                    <span className={styles.soonBadge}><Lock aria-hidden="true" />Coming soon</span>
                  </article>
                </div>
                <p className={styles.selectionFooter}>Play, win, and discover a surprise!</p>
              </>
            ) : null}

            {flowState === "name-entry" ? (
              <form className={styles.nameForm} onSubmit={startGame}>
                <label className={styles.nameField}>
                  <span>Player name</span>
                  <input
                    autoFocus
                    maxLength={20}
                    onChange={(event) => setNameInput(event.target.value.slice(0, 20))}
                    placeholder="Enter your name"
                    value={nameInput}
                  />
                </label>
                <div className={styles.modalActions}>
                  <Button onClick={() => setFlowState("game-selection")} type="button" variant="ghost">
                    <ArrowLeft aria-hidden="true" /> Back
                  </Button>
                  <PlutoButton showArrow type="submit" variant="primary">
                    Start game
                  </PlutoButton>
                </div>
              </form>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={resultOpen} onOpenChange={() => undefined}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.resultOverlay} />
          {flowState === "user-won" ? (
            <div aria-hidden="true" className={styles.winConfetti}>
              {WIN_CONFETTI.map((piece) => (
                <span className={styles.confettiPiece} key={piece.id} style={piece.style} />
              ))}
            </div>
          ) : null}
          <Dialog.Content
            className={cn(
              styles.resultContent,
              flowState === "user-won" && styles.winResultContent,
              flowState === "reward-reveal" && styles.rewardResultContent
            )}
            data-pluto-modal-scroll="true"
          >
            {flowState === "user-won" ? (
              <>
                <div className={styles.modalMascotFrame} aria-hidden="true">
                  <Image
                    alt=""
                    className={styles.modalMascot}
                    height={1321}
                    priority
                    sizes="(max-width: 700px) 105px, 136px"
                    src="/images/play/plutopopup.webp"
                    width={1191}
                  />
                </div>
                <div className={styles.winPanel}>
                  <div className={styles.winMessage}>
                    <div className={styles.winGiftVisual} aria-hidden="true">
                      <div className={styles.winGiftDust}>
                        {WIN_GIFT_DUST.map((particle) => (
                          <span key={particle.id} style={particle.style} />
                        ))}
                      </div>
                      <Image
                        alt=""
                        className={styles.winGiftImage}
                        height={1195}
                        sizes="(max-width: 700px) 92px, 112px"
                        src="/images/play/rewardbox.webp"
                        width={1316}
                      />
                    </div>
                    <p className={styles.winHooray}>Hooray!</p>
                    <Dialog.Title className={cn(styles.resultTitle, styles.winTitle)}>
                      You beat <span>Pluto!</span>
                    </Dialog.Title>
                    <Dialog.Description className={cn(styles.resultCopy, styles.winCopy)}>
                      That was a great game.{" "}
                      <span>Pluto has a surprise for you.</span>
                    </Dialog.Description>
                    <PlutoButton
                      className={styles.winRewardCta}
                      loading={giftOpening}
                      onClick={revealReward}
                      showArrow
                      size="lg"
                      type="button"
                      variant="primary"
                    >
                      <Gift aria-hidden="true" />
                      <span>Tap to Reveal Surprise</span>
                    </PlutoButton>
                  </div>
                </div>
              </>
            ) : null}

            {flowState === "reward-reveal" ? (
              <div className={styles.rewardReveal}>
                <div className={styles.particles} aria-hidden="true">
                  {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
                </div>
                {selectedReward ? (
                  <>
                    <div className={styles.rewardToolSummary}>
                      <div className={styles.rewardLogoOrbit}>
                        <ToolLogo className={styles.toolLogo} name={selectedReward.name} src={rewardLogo} />
                      </div>
                      <h3>{selectedReward.name}</h3>
                      <p>{selectedReward.description}</p>
                    </div>
                    <Dialog.Title className={cn(styles.resultTitle, styles.rewardTitle)}>
                      Pluto picked <span>this for you.</span>
                    </Dialog.Title>
                    <Dialog.Description className={cn(styles.resultCopy, styles.rewardCopy)}>
                      A small find for a sharp win.
                    </Dialog.Description>
                    <div className={styles.resultActions}>
                      <PlutoButton className={styles.rewardAction} href={`/plutos-library/tool/${selectedReward.slug}`} showArrow variant="primary">
                        View tool
                      </PlutoButton>
                      <PlutoButton className={styles.rewardAction} onClick={restartRound} type="button" variant="secondary">
                        Play again <RotateCcw aria-hidden="true" />
                      </PlutoButton>
                      <PlutoButton className={styles.rewardAction} onClick={() => void shareReward()} type="button" variant="secondary">
                        <Share2 aria-hidden="true" /> Share
                      </PlutoButton>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {flowState === "pluto-won" || flowState === "draw" ? (
              <div className={styles.resultPanel}>
                <Dialog.Title className={styles.resultTitle}>
                  {flowState === "pluto-won" ? "Pluto wins this round!" : "It's a draw!"}
                </Dialog.Title>
                <Dialog.Description className={styles.resultCopy}>
                  {flowState === "pluto-won"
                    ? "He looks happier already. Want to challenge him again?"
                    : "You and Pluto might be evenly matched."}
                </Dialog.Description>
                <div className={styles.resultActions}>
                  <PlutoButton onClick={restartRound} type="button" variant="primary">
                    Play again <RotateCcw aria-hidden="true" />
                  </PlutoButton>
                  <PlutoButton onClick={chooseAnotherGame} type="button" variant="secondary">
                    Choose another game <Gamepad2 aria-hidden="true" />
                  </PlutoButton>
                </div>
              </div>
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}

function isGameVisible(state: FlowState) {
  return state === "playing" || state === "user-won" || state === "pluto-won" || state === "draw" || state === "reward-reveal";
}

function getOutcomeFromState(state: FlowState): Outcome {
  if (state === "user-won" || state === "reward-reveal") return "user";
  if (state === "pluto-won") return "pluto";
  if (state === "draw") return "draw";
  return null;
}

function sanitizePlayerName(value: string) {
  const name = value.replace(/\s+/g, " ").trim().slice(0, 20);
  return name || "You";
}

function getGameResult(board: Mark[]): GameResult {
  for (const line of winLines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { outcome: board[a] === "X" ? "user" : "pluto", line };
    }
  }

  if (board.every(Boolean)) {
    return { outcome: "draw", line: [] };
  }

  return { outcome: null, line: [] };
}

function choosePlutoMove(board: Mark[]) {
  const available = board
    .map((mark, index) => (mark ? -1 : index))
    .filter((index) => index >= 0);

  if (available.length === 0) return -1;

  const winningMove = findWinningMove(board, "O");
  if (winningMove !== -1) return winningMove;

  const blockingMove = findWinningMove(board, "X");
  if (blockingMove !== -1 && Math.random() < 0.74) return blockingMove;

  if (!board[4] && Math.random() < 0.56) return 4;

  const corners = [0, 2, 6, 8].filter((index) => !board[index]);
  if (corners.length > 0 && Math.random() < 0.68) return randomItem(corners);

  return randomItem(available);
}

function findWinningMove(board: Mark[], mark: Exclude<Mark, null>) {
  for (const index of board.keys()) {
    if (board[index]) continue;
    const nextBoard = [...board];
    nextBoard[index] = mark;
    if (getGameResult(nextBoard).outcome === (mark === "X" ? "user" : "pluto")) {
      return index;
    }
  }

  return -1;
}

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function getStatusText(state: FlowState, turn: Player, thinking: boolean) {
  if (state === "user-won" || state === "reward-reveal") return "You won";
  if (state === "pluto-won") return "Pluto won";
  if (state === "draw") return "Draw game";
  if (thinking) return "Pluto is thinking...";
  if (turn === "pluto") return "Pluto's turn";
  return "Your turn";
}

function getCellLabel(mark: Mark, index: number, playerName: string) {
  if (mark === "X") return `Cell ${index + 1}, marked by ${playerName}`;
  if (mark === "O") return `Cell ${index + 1}, marked by Pluto`;
  return `Cell ${index + 1}, empty`;
}
