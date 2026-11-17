import type { Color, PieceSymbol } from "chess.js";
import styles from "./chess-game.module.css";

const LABELS: Record<PieceSymbol, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king"
};

export function ChessPiece({ color, type }: { color: Color; type: PieceSymbol }) {
  return (
    <svg
      aria-label={`${color === "w" ? "White" : "Black"} ${LABELS[type]}`}
      className={styles.piece}
      role="img"
      viewBox="0 0 64 64"
    >
      <g className={color === "w" ? styles.whitePiece : styles.blackPiece}>
        {type === "p" ? <path d="M32 8a9 9 0 0 0-5 16.5L23 42h18l-4-17.5A9 9 0 0 0 32 8ZM20 46h24l4 9H16l4-9Z" /> : null}
        {type === "r" ? <path d="M15 8h8v7h6V8h6v7h6V8h8v15l-6 5 3 21H18l3-21-6-5V8Zm8 24-2 13h22l-2-13H23Zm-7 18h32l3 6H13l3-6Z" /> : null}
        {type === "n" ? <path d="M18 54h31l-3-9-7-4 4-12-5-13-14-7 2 10-9 8-4 17 11-8 8 2-7 8H18v8Zm10-31 4-3 4 4-5 2-3-3Z" /> : null}
        {type === "b" ? <path d="m32 7 8 11-5 10 8 13H21l8-13-5-10 8-11Zm0 7-3 5 3 5 3-5-3-5ZM19 45h26l3 10H16l3-10Z" /> : null}
        {type === "q" ? <path d="M13 15a5 5 0 1 0 5-5 5 5 0 0 0-5 5Zm15-6a5 5 0 1 0 5-5 5 5 0 0 0-5 5Zm18 1a5 5 0 1 0 5 5 5 5 0 0 0-5-5ZM18 22l5 20h20l5-20-9 9-6-15-7 15-8-9Zm3 24h24l3 9H18l3-9Z" /> : null}
        {type === "k" ? <path d="M29 4h7v8h7v7h-7v7h-7v-7h-7v-7h7V4Zm3 22c-9 0-15 6-15 13 0 4 2 7 5 9h20c3-2 5-5 5-9 0-7-6-13-15-13Zm-12 25h24l3 6H17l3-6Z" /> : null}
      </g>
    </svg>
  );
}
