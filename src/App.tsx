import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import naturalFlow from "./assets/Natural Flow.mp3";
// import secondTrack from "./assets/SecondTrack.mp3";
// import thirdTrack from "./assets/ThirdTrack.mp3";
import backImg from "./assets/녹색배경.png";

// 플레이리스트 설정
const tracks = [
  { title: "Natural Flow", src: naturalFlow },
  // { title: "Second Track", src: secondTrack },
  // { title: "Third Track", src: thirdTrack },
];

// 원하는 Hz 구간별로 범위를 설정합니다
const freqRanges = [
  { label: "Low (20-250Hz)", from: 20, to: 250 },
  { label: "Mid (250-2000Hz)", from: 250, to: 2000 },
  { label: "High (2000-20000Hz)", from: 2000, to: 20000 },
];

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // 컨테이너 크기에 맞춰 캔버스 너비 설정
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // 오디오 및 비주얼라이저 설정
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new AudioContext();
    const srcNode = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    srcNode.connect(analyser);
    analyser.connect(ctx.destination);

    ctxRef.current = ctx;
    analyserRef.current = analyser;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      ctx.close();
    };
  }, []);

  // 재생/일시정지 토글
  const togglePlay = async () => {
    const audio = audioRef.current;
    const ctx = ctxRef.current;
    if (!audio || !ctx) return;

    if (ctx.state === "suspended") await ctx.resume();

    if (isPlaying) {
      audio.pause();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      audio.play();
      drawSpectrum();
    }
    setPlaying(!isPlaying);
  };

  // 스펙트럼 그리기 (Hz 구간별 바)
const drawSpectrum = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const ctx = canvas?.getContext("2d");
    const audioCtx = ctxRef.current;
    if (!canvas || !analyser || !ctx || !audioCtx) return;

    // 캔버스 크기 동기화
    canvas.width = canvasWidth;
    canvas.height = containerRef.current?.clientHeight || window.innerHeight;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Nyquist 주파수 계산
    const sampleRate = audioCtx.sampleRate;
    const nyquist = sampleRate / 2;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";

    // 각 Hz 구간별로 바 그리기
    const barWidth = canvas.width / freqRanges.length;
    const labelOffset = 20; // 공간 확보를 위해 하단 여백 설정
    freqRanges.forEach((range, i) => {
      const startBin = Math.floor((range.from / nyquist) * bufferLength);
      const endBin = Math.min(
        Math.floor((range.to / nyquist) * bufferLength),
        bufferLength - 1
      );
      let sum = 0;
      for (let j = startBin; j <= endBin; j++) sum += dataArray[j];
      const avg = sum / (endBin - startBin + 1);
      const barHeight = (avg / 255) * (canvas.height - labelOffset);

      // 바 그리기
      ctx.fillStyle = `rgba(255,255,255,${(avg / 255) * 0.5})`;
      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeight - labelOffset,
        barWidth - 2,
        barHeight
      );

      // 레이블 표시
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(
        range.label,
        i * barWidth + barWidth / 2,
        canvas.height - 4
      );
    });

    animationRef.current = requestAnimationFrame(drawSpectrum);
  };

  // 트랙 변경 시 재생 초기화
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) {
      audio.play();
      drawSpectrum();
    }
  }, [currentIndex]);

  // 플레이리스트 이동
  const nextTrack = () => setCurrentIndex((idx) => (idx + 1) % tracks.length);
  const prevTrack = () =>
    setCurrentIndex((idx) => (idx - 1 + tracks.length) % tracks.length);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      ref={containerRef}
    >
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${backImg})`,
          WebkitMaskImage:
            "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
          opacity: 0.8,
        }}
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-4xl font-bold mb-6">baebini's Flow</h1>
        <p className="mb-4">Now Playing: {tracks[currentIndex].title}</p>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={prevTrack}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Prev
          </button>
          <button
            onClick={togglePlay}
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={nextTrack}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Next
          </button>
        </div>
        {/* <ul className="space-y-2">
          {tracks.map((track, idx) => (
            <li
              key={idx}
              className={`cursor-pointer ${
                idx === currentIndex ? "text-blue-300" : "text-gray-400"
              }`}
              onClick={() => setCurrentIndex(idx)}
            >
              {track.title}
            </li>
          ))}
        </ul> */}
      </div>

      <audio ref={audioRef} loop playsInline preload="auto">
        <source src={tracks[currentIndex].src} />
      </audio>
    </div>
  );
}
