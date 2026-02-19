import { useMemo, useRef, useState, useEffect } from "react";
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
  EighthRest,
} from "./notes";

// 4/4 を 16分刻みで扱う：1小節=16 ticks
const BAR_TICKS = 16;

// len(拍) → ticks 変換（4/4想定）
const beatsToTicks = (beats) => Math.round(beats * 4); // 1拍=4ticks

// カード定義（patternは「len:拍 / rest」）
const CARDS = [
  { id: "w", name: "全音符", icon: <WholeNote />, pattern: [{ len: 4, rest: false }] }, // 16 ticks
  { id: "h", name: "二分", icon: <HalfNote />, pattern: [{ len: 2, rest: false }] }, // 8
  { id: "q", name: "四分", icon: <QuarterNote />, pattern: [{ len: 1, rest: false }] }, // 4
  { id: "e", name: "八分", icon: <EighthNote />, pattern: [{ len: 0.5, rest: false }] }, // 2
  { id: "e2", name: "八分×2", icon: <EighthPair />, pattern: [{ len: 0.5, rest: false }, { len: 0.5, rest: false }] }, // 4
  { id: "s", name: "16分", icon: <SixteenthNote />, pattern: [{ len: 0.25, rest: false }] }, // 1
  { id: "s2", name: "16分×2", icon: <SixteenthPair />, pattern: [{ len: 0.25, rest: false }, { len: 0.25, rest: false }] }, // 2
  { id: "rq", name: "四分休符", icon: <QuarterRest />, pattern: [{ len: 1, rest: true }] }, // 4
  { id: "re", name: "八分休符", icon: <EighthRest />, pattern: [{ len: 0.5, rest: true }] }, // 2
];

// pattern → 合計ticks
function patternTicks(card) {
  return card.pattern.reduce((sum, p) => sum + beatsToTicks(p.len), 0);
}

export default function App() {
  // 配置したブロック（時間レーン）
  // item: { key, cardId, startTick, ticks }
  const [items, setItems] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTick, setPlayTick] = useState(0);

  // 音：逆仕様（音符=ピッ、休符=打楽器）
  // const drumRef = useRef(null);
  // const beepRef = useRef(null);

  const drumRestRef = useRef(null);   // 休符用（今までの）
  const bangNoteRef = useRef(null);   // 音符用（バンッ）
  const noiseRef = useRef(null);

  const rafRef = useRef(null);
  const stopTimersRef = useRef([]);

  const usedTicks = useMemo(
    () => items.reduce((s, it) => s + it.ticks, 0),
    [items]
  );

  // const ensureAudio = async () => {
  //   await Tone.start();
  //   if (!drumRef.current) {
  //     drumRef.current = new Tone.MembraneSynth().toDestination();
  //   }
  //   if (!beepRef.current) {
  //     beepRef.current = new Tone.Synth({
  //       oscillator: { type: "sine" },
  //       envelope: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.05 },
  //     }).toDestination();
  //   }
  // };

  const ensureAudio = async () => {
    await Tone.start();

    // 休符用（いまの太鼓：そのまま系）
    if (!drumRestRef.current) {
      drumRestRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.01 },
        volume: -6
      }).toDestination();
    }

    // 音符用（バンッ：太め＆短め）
    if (!bangNoteRef.current) {
      bangNoteRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.008,
        octaves: 8,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.06, sustain: 0.0, release: 0.01 },
        volume: 0,                 // ここ上げると“前に出る”
      });

      // ちょい圧縮して“バンッ”感を安定させる
      const comp = new Tone.Compressor(-18, 8);
      bangNoteRef.current.chain(comp, Tone.Destination);
    }

    // アタック（パッ）を混ぜるノイズ：高域だけ残して“打撃”に寄せる
    if (!noiseRef.current) {
      const hp = new Tone.Filter(1800, "highpass");
      noiseRef.current = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.02, sustain: 0.0 },
        volume: -6
      });

      noiseRef.current.chain(hp, Tone.Destination);
    }

  };

  const stopAll = () => {
    stopTimersRef.current.forEach((id) => clearTimeout(id));
    stopTimersRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setIsPlaying(false);
    setPlayTick(0);
  };

  const clearAll = () => {
    stopAll();
    setItems([]);
  };

  // 次に置けるtick（詰め込み方式）
  const nextTick = usedTicks;

  const addCard = (card) => {
    const ticks = patternTicks(card);
    if (nextTick + ticks > BAR_TICKS) return; // 収まらん

    setItems((prev) => [
      ...prev,
      {
        key: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        cardId: card.id,
        startTick: nextTick,
        ticks,
      },
    ]);
  };

  const removeItem = (key) => {
    // 削除したら左詰めし直す（子ども向けにわかりやすい）
    setItems((prev) => {
      const filtered = prev.filter((x) => x.key !== key);
      let t = 0;
      return filtered.map((x) => {
        const nx = { ...x, startTick: t };
        t += x.ticks;
        return nx;
      });
    });
  };

  const cardById = useMemo(() => {
    const m = new Map(CARDS.map((c) => [c.id, c]));
    return (id) => m.get(id);
  }, []);

  const play = async () => {
    stopAll();
    await ensureAudio();

    const bpm = 70;
    const tickMs = (60000 / bpm) / 4; // 16分=1tick
    const startAt = Tone.now() + 0.06;

    // 音イベントを全部スケジュール
    for (const it of items) {
      const card = cardById(it.cardId);
      if (!card) continue;

      let localTick = it.startTick;

      for (const p of card.pattern) {
        const lenTicks = beatsToTicks(p.len);
        const t = startAt + (localTick * tickMs) / 1000;

        if (p.rest) {
          // 休符＝打楽器
          // drumRef.current?.triggerAttackRelease("C2", "8n", t);
          drumRestRef.current?.triggerAttackRelease("C2", "16n", t);
        } else {
          // 音符＝バンッ
          bangNoteRef.current?.triggerAttackRelease("C1", "32n", t); // ← G1よりC1の方が“ドン/バン”寄り
          noiseRef.current?.triggerAttackRelease("32n", t);
        }

        localTick += lenTicks;
      }
    }

    // 再生ヘッド（見た目）
    setIsPlaying(true);
    const startPerf = performance.now();
    const totalMs = BAR_TICKS * tickMs;

    const loop = () => {
      const elapsed = performance.now() - startPerf;
      const tick = Math.min(BAR_TICKS, Math.floor(elapsed / tickMs));
      setPlayTick(tick);

      if (elapsed < totalMs) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setIsPlaying(false);
        setPlayTick(0);
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    // 念のため終了処理
    stopTimersRef.current.push(
      setTimeout(() => {
        setIsPlaying(false);
        setPlayTick(0);
      }, totalMs + 120)
    );
  };

  // アンマウント時安全
  useEffect(() => () => stopAll(), []);

  return (
    <div className="container">
      <h1>リズムあそび</h1>

      {/* レーン */}
      <div className="laneWrap">
        <div className="lane">
          {/* 背景グリッド（4拍を太線に） */}
          {Array.from({ length: BAR_TICKS }).map((_, i) => (
            <div
              key={i}
              className={`tick ${i % 4 === 0 ? "beat" : ""}`}
              style={{ left: `${(i / BAR_TICKS) * 100}%` }}
            />
          ))}

          {/* ブロック */}
          {items.map((it) => {
            const card = cardById(it.cardId);
            const left = (it.startTick / BAR_TICKS) * 100;
            const width = (it.ticks / BAR_TICKS) * 100;
            return (
              <button
                key={it.key}
                type="button"
                className="block"
                style={{ left: `${left}%`, width: `${width}%` }}
                onClick={() => removeItem(it.key)}
                title="タップでけす"
              >
                {card?.icon}
              </button>
            );
          })}

          {/* 再生ヘッド */}
          <div
            className={`playhead ${isPlaying ? "show" : ""}`}
            style={{ left: `${(playTick / BAR_TICKS) * 100}%` }}
          />
        </div>

        <div className="meter">
          のこり：{BAR_TICKS - usedTicks} / {BAR_TICKS}
        </div>
      </div>

      {/* カード一覧 */}
      <div className="cards">
        {CARDS.map((card) => {
          const canPlace = nextTick + patternTicks(card) <= BAR_TICKS;
          return (
            <button
              key={card.id}
              type="button"
              className={`cardBtn ${canPlace ? "" : "disabled"}`}
              onClick={() => canPlace && addCard(card)}
              title={card.name}
            >
              {card.icon}
            </button>
          );
        })}
      </div>

      <div className="controls">
        <button type="button" onClick={play}>▶ スタート</button>
        <button type="button" onClick={clearAll}>⟲ ぜんぶけす</button>
      </div>

      <div className="hint">ブロックをタップすると消えるで</div>
    </div>
  );
}
