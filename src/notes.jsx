import React from "react";

export const QuarterNote = () => (
    <svg viewBox="0 0 40 80" width="40" height="60">
        <ellipse cx="15" cy="60" rx="12" ry="8" fill="black" />
        <rect x="22" y="10" width="4" height="50" fill="black" />
    </svg>
);

export const EighthPair = () => (
    <svg viewBox="0 0 80 80" width="60" height="60">
        <ellipse cx="20" cy="60" rx="10" ry="7" fill="black" />
        <ellipse cx="50" cy="60" rx="10" ry="7" fill="black" />
        <rect x="27" y="20" width="4" height="40" fill="black" />
        <rect x="57" y="20" width="4" height="40" fill="black" />
        <rect x="27" y="20" width="34" height="6" fill="black" />
    </svg>
);

export const SixteenthPair = () => (
    <svg viewBox="0 0 80 80" width="60" height="60">
        <ellipse cx="20" cy="60" rx="10" ry="7" fill="black" />
        <ellipse cx="50" cy="60" rx="10" ry="7" fill="black" />
        <rect x="27" y="20" width="4" height="40" fill="black" />
        <rect x="57" y="20" width="4" height="40" fill="black" />
        <rect x="27" y="20" width="34" height="6" fill="black" />
        <rect x="27" y="28" width="34" height="6" fill="black" />
    </svg>
);

export const QuarterRest = () => (
    <svg viewBox="0 0 40 80" width="40" height="60">
        <path
            d="M20 10 L10 30 L25 40 L15 60"
            stroke="black"
            strokeWidth="5"
            fill="none"
        />
    </svg>
);
