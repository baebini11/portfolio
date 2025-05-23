import mainSong from "./assets/Natural Flow.mp3";
import { useEffect, useRef, useState } from "react";
import backImg from "./assets/녹색배경.png";
import "./App.css";

function App() {
  const [isPlaying, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const srcRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // 초기 마운트에서는 AudioContext 생성을 미룸

  // 초기 마운트에서 단 한 번만 실행
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1) 컨텍스트 및 소스 노드 한 번만 생성
    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();

    gain.gain.setValueAtTime(1, ctx.currentTime);
    src.connect(gain).connect(ctx.destination);

    // 레퍼런스에 저장
    ctxRef.current = ctx;
    srcRef.current = src;
    gainRef.current = gain;

    return () => {
      src.disconnect();
      ctx.close(); //
    };
  }, []);

  // 재생/정지 토글
  useEffect(() => {
    const audio = audioRef.current;
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!audio || !ctx || !gain) return; // 안전 가드

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return (
    <>
      <audio ref={audioRef} src={mainSong} loop playsInline preload="auto" />
      <div
        onClick={async () => {
          // 클릭할 때만 컨텍스트를 resume
          const ctx = ctxRef.current;
          if (ctx && ctx.state === "suspended") {
            await ctx.resume();
          }
          setPlaying((p) => !p);
        }}
      >
        {isPlaying ? <h2>Pause?</h2> : <h2>Play?</h2>}
        <p className="desc">Composer, Web, etc</p>
      </div>
      <h1>baebini's Flow</h1>
      <div>
        <img src={backImg} alt="back" style={{ width: "50%", height: "50%" }} />
      </div>
    </>
  );
}

export default App;
