import { useState, useRef } from "react";
import * as Tone from "tone";
import "./App.css";
import {
  QuarterNote,
  EighthNote,
  EighthPair,
  SixteenthNote,
  SixteenthPair,
  HalfNote,
  WholeNote,
  QuarterRest,
  EighthRest
} from "./notes";

const CARDS = [
  { id: "w", icon: <WholeNote />, pattern: [{ len: 4, rest: false }] },
  { id: "h", icon: <HalfNote />, pattern: [{ len: 2, rest: false }] },
  { id: "q", icon: <QuarterNote />, pattern: [{ len: 1, rest: false }] },
  { id: "e", icon: <EighthNote />, pattern: [{ len: 0.5, rest: false }] },
  { id: "e2", icon: <EighthPair />, pattern: [{ len: 0.5, rest: false }, { len: 0.5, rest: false }] },
  { id: "s", icon: <SixteenthNote />, pattern: [{ len: 0.25, rest: false }] },
  { id: "s2", icon: <SixteenthPair />, pattern: [{ len: 0.25, rest: false }, { len: 0.25, rest: false }] },

  { id: "rq", icon: <QuarterRest />, pattern: [{ len: 1, rest: true }] },
  { id: "re", icon: <EighthRest />, pattern: [{ len: 0.5, rest: true }] },
];

export default function App() {
  const [slots, setSlots] = useState([null, null, null, null]);
  const [playingIndex, setPlayingIndex] = useState(null);

  // 2種類の音：打楽器（休符用）と ピッ（音符用）
  const drumRef = useRef(null);
  const beepRef = useRef(null);

  const timeoutsRef = useRef([]);

  const addCard = (card) => {
    setSlots((prev) => {
      const next = [...prev];
      const empty = next.findIndex((s) => s === null);
      if (empty !== -1) next[empty] = card;
      return next;
    });
  };

  const stopAll = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    setPlayingIndex(null);
  };

  const clearAll = () => {
    stopAll();
    setSlots([null, null, null, null]);
  };

  const ensureAudio = async () => {
    // タップ操作をトリガーにAudio解禁
    await Tone.start();

    // 休符用：打楽器（ポン）
    if (!drumRef.current) {
      drumRef.current = new Tone.MembraneSynth().toDestination();
    }

    // 音符用：ピッ（短いビープ）
    if (!beepRef.current) {
      beepRef.current = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.05 }
      }).toDestination();
    }
  };

  const playSequence = async () => {
    stopAll();
    await ensureAudio();

    const bpm = 70;
    const beatMs = 60000 / bpm;
    const startAt = Tone.now() + 0.05;

    let beatPos = 0;

    slots.forEach((card, slotIndex) => {
      if (!card) return;

      // カードごとに光る（カード先頭タイミング）
      const hiMs = beatPos * beatMs;
      timeoutsRef.current.push(
        setTimeout(() => setPlayingIndex(slotIndex), hiMs)
      );

      card.pattern.forEach(({ len, rest }) => {
        const t = startAt + (beatPos * beatMs) / 1000;

        if (rest) {
          drumRef.current?.triggerAttackRelease("C2", "8n", t); // 休符＝打楽器
        } else {
          beepRef.current?.triggerAttackRelease("C6", 0.05, t); // 音符＝ピッ
        }

        beatPos += len;
      });
    });

    // 終了後に消灯
    const endMs = beatPos * beatMs;
    timeoutsRef.current.push(
      setTimeout(() => setPlayingIndex(null), endMs + 80)
    );
  };

  return (
    <div className="container">
      <h1>リズムあそび</h1>

      {/* 上の4マス（横並び） */}
      <div className="slots">
        {slots.map((slot, i) => (
          <div
            key={i}
            className={`slot ${playingIndex === i ? "active" : ""}`}
          >
            {slot ? slot.icon : ""}
          </div>
        ))}
      </div>

      {/* 下：カード選択（音符アイコン） */}
      <div className="cards">
        {CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => addCard(card)}
            className="cardBtn"
            aria-label={card.read}
            title={card.read}
          >
            {card.icon}
          </button>
        ))}
      </div>

      {/* 操作ボタン */}
      <div className="controls">
        <button type="button" onClick={playSequence}>▶ スタート</button>
        <button type="button" onClick={clearAll}>⟲ ぜんぶけす</button>
      </div>
    </div>
  );
}
