import { useState, useRef } from "react";
import * as Tone from "tone";
import "./App.css";

const CARDS = [
  // 音符（rest:false）＝ピッ音、休符（rest:true）＝打楽器（逆仕様）
  { id: "q", icon: "♩", pattern: [{ len: 1, rest: false }] }, // 四分
  { id: "e", icon: "♪", pattern: [{ len: 0.5, rest: false }] }, // 八分（単体）
  { id: "e2", icon: "♫", pattern: [{ len: 0.5, rest: false }, { len: 0.5, rest: false }] }, // 八分×2
  { id: "s2", icon: "♬", pattern: [{ len: 0.25, rest: false }, { len: 0.25, rest: false }] }, // 16分×2 ★ここ修正
  { id: "s", icon: "𝅘𝅥𝅯", pattern: [{ len: 0.25, rest: false }] }, // 16分
  { id: "h", icon: "𝅗𝅥", pattern: [{ len: 2, rest: false }] }, // 二分
  { id: "w", icon: "𝅝", pattern: [{ len: 4, rest: false }] }, // 全音符

  { id: "rq", icon: "𝄽", pattern: [{ len: 1, rest: true }] }, // 四分休符
  { id: "re", icon: "𝄾", pattern: [{ len: 0.5, rest: true }] }, // 八分休符
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
