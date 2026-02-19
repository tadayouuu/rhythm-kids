import React from "react";

/* 共通：黒塗り楕円 */
const Head = ({ cx, cy }) => (
    <ellipse cx={cx} cy={cy} rx="10" ry="7" fill="black" />
);

/* 四分 */
export const QuarterNote = () => (
    <svg viewBox="0 0 40 80">
        <Head cx="15" cy="60" />
        <rect x="22" y="15" width="4" height="45" fill="black" />
    </svg>
);

/* 八分（単体） */
export const EighthNote = () => (
    <svg viewBox="0 0 40 80">
        <Head cx="15" cy="60" />
        <rect x="22" y="15" width="4" height="45" fill="black" />
        <path d="M26 15 Q40 20 30 35" stroke="black" strokeWidth="4" fill="none" />
    </svg>
);

/* 八分×2 */
export const EighthPair = () => (
    <svg viewBox="0 0 80 80">
        <Head cx="20" cy="60" />
        <Head cx="50" cy="60" />
        <rect x="27" y="20" width="4" height="40" fill="black" />
        <rect x="57" y="20" width="4" height="40" fill="black" />
        <rect x="27" y="20" width="34" height="6" fill="black" />
    </svg>
);

/* 16分（単体） */
export const SixteenthNote = () => (
    <svg viewBox="0 0 40 80">
        <Head cx="15" cy="60" />
        <rect x="22" y="15" width="4" height="45" fill="black" />
        <path d="M26 15 Q40 20 30 35" stroke="black" strokeWidth="4" fill="none" />
        <path d="M26 25 Q40 30 30 45" stroke="black" strokeWidth="4" fill="none" />
    </svg>
);

/* 16分×2 */
export const SixteenthPair = () => (
    <svg viewBox="0 0 80 80">
        <Head cx="20" cy="60" />
        <Head cx="50" cy="60" />
        <rect x="27" y="20" width="4" height="40" fill="black" />
        <rect x="57" y="20" width="4" height="40" fill="black" />
        <rect x="27" y="20" width="34" height="6" fill="black" />
        <rect x="27" y="30" width="34" height="6" fill="black" />
    </svg>
);

/* 二分 */
export const HalfNote = () => (
    <svg viewBox="0 0 40 80">
        <ellipse cx="15" cy="60" rx="10" ry="7" fill="white" stroke="black" strokeWidth="3" />
        <rect x="22" y="15" width="4" height="45" fill="black" />
    </svg>
);

/* 全音符 */
export const WholeNote = () => (
    <svg viewBox="0 0 40 80">
        <ellipse cx="20" cy="60" rx="12" ry="8" fill="white" stroke="black" strokeWidth="3" />
    </svg>
);

/* 四分休符 */
export const QuarterRest = () => (
    <svg viewBox="0 0 40 80">
        <path d="M20 15 L10 35 L25 45 L15 65" stroke="black" strokeWidth="5" fill="none" />
    </svg>
);

/* 八分休符 */
export const EighthRest = () => (
    <svg viewBox="0 0 40 80">
        <path d="M20 20 Q30 30 15 40 Q25 45 20 60" stroke="black" strokeWidth="5" fill="none" />
    </svg>
);
