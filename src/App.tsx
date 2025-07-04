import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import naturalFlow from "./assets/natural-flow.mp3";
// import secondTrack from "./assets/SecondTrack.mp3";
// import thirdTrack from "./assets/ThirdTrack.mp3";
import backImg from "./assets/녹색배경.png";
import ProfileCard from "./ProfileCard";
import Loader from "./Loader";
import AvatarMenu from "./AvatarMenu";
import { AboutSection, ProjectsSection, ContactSection } from "./sections";

// 플레이리스트 설정
const tracks = [
  { title: "Natural Flow", src: naturalFlow },
  // { title: "Second Track", src: secondTrack },
  // { title: "Third Track", src: thirdTrack },
];

// 원하는 Hz 구간별로 범위를 설정합니다
const freqRanges = [
  { label: "20-60Hz", from: 20, to: 60 },
  { label: "60-120Hz", from: 60, to: 120 },
  { label: "120-250Hz", from: 120, to: 250 },
  { label: "250-500Hz", from: 250, to: 500 },
  { label: "500-1kHz", from: 500, to: 1000 },
  { label: "1-2kHz", from: 1000, to: 2000 },
  { label: "2-4kHz", from: 2000, to: 4000 },
  { label: "4-6kHz", from: 4000, to: 6000 },
  { label: "6-12kHz", from: 6000, to: 12000 },
  { label: "12-20kHz", from: 12000, to: 20000 },
];

// ====== 새로 추가된 설정 ======
// 모바일 성능 최적화를 위해 내부 픽셀 비율을 최대 2 이하로 제한합니다.
const MAX_DPR = 2;
// 스펙트럼 민감도 조절 변수 (0 ~ 255 사이). 값이 클수록 더 둔감해집니다.
const NOISE_FLOOR = 40;
const SMOOTHING = 0.65; // 원래 0.8 → 더 빠르게 반응하도록 조정
// ====

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);

  const formatTime = (time: number) => {
    if (!time && time !== 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const lightenColor = (color: string, factor: number) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const nr = Math.round(r + (255 - r) * factor);
    const ng = Math.round(g + (255 - g) * factor);
    const nb = Math.round(b + (255 - b) * factor);
    return `rgba(${nr},${ng},${nb},0.8)`;
  };

  const createImpulseResponse = (ctx: AudioContext) => {
    const length = ctx.sampleRate * 2;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < impulse.numberOfChannels; ch++) {
      const channelData = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    return impulse;
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // 마우스 클릭 시 원형 파동 효과
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  // 컨테이너 크기에 맞춰 캔버스 너비 설정
  useEffect(() => {
    if (loading) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [loading]);

  // 오디오 재생 위치 및 길이 추적
  useEffect(() => {
    if (loading) return;
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
    };
  }, [currentIndex, loading]);

  // 오디오 및 비주얼라이저 설정
  useEffect(() => {
    if (loading) return;
    const audio = audioRef.current;

    if (!audio) return;

    const ctx = new AudioContext();
    const srcNode = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    const convolver = ctx.createConvolver();
    convolver.buffer = createImpulseResponse(ctx);
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = SMOOTHING;
    srcNode.connect(analyser);
    analyser.connect(ctx.destination);

    // === 연결 정보 저장 (이전 코드에서는 누락) ===
    ctxRef.current = ctx;
    analyserRef.current = analyser;
    convolverRef.current = convolver;

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      ctx.close();
    };
  }, [loading]);

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

    // 성능 안정을 위해 canvas 해상도를 최대 2배까지만 올립니다.
    const rawDpr = window.devicePixelRatio || 1;
    const dpr = Math.min(rawDpr, MAX_DPR);
    canvas.width = canvasWidth * dpr;
    const containerHeight =
      (containerRef.current?.clientHeight as number) || window.innerHeight;
    canvas.height = containerHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Nyquist 주파수 계산
    const sampleRate = audioCtx.sampleRate;
    const nyquist = sampleRate / 2;

    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height / 2);
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

      // 민감도 조정: NOISE_FLOOR 이하의 값은 무시합니다.
      const normalized = Math.max(avg - NOISE_FLOOR, 0) / (255 - NOISE_FLOOR);
      const barHeight = normalized * (canvas.height - labelOffset);

      // 바 그리기 - 배경색에 가깝게, 강해질수록 연하게
      const baseColor = darkMode ? "#111827" : "#f3f4f6";
      ctx.fillStyle = lightenColor(baseColor, normalized);
      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeight - labelOffset,
        barWidth - 2,
        barHeight
      );
    });

    animationRef.current = requestAnimationFrame(drawSpectrum);
  };

  // 트랙 변경 시 재생 초기화
  useEffect(() => {
    if (loading) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    setCurrentTime(0);
    setDuration(audio.duration);
    if (isPlaying) {
      audio.play();
      drawSpectrum();
    }
  }, [currentIndex, loading]);

  // 프로필 창 열릴 때 리버브 연결
  useEffect(() => {
    if (loading) return;
    const ctx = ctxRef.current;
    const analyser = analyserRef.current;
    const convolver = convolverRef.current;
    if (!ctx || !analyser || !convolver) return;
    analyser.disconnect();
    convolver.disconnect();
    if (showProfile) {
      analyser.connect(convolver);
      convolver.connect(ctx.destination);
    } else {
      analyser.connect(ctx.destination);
    }
  }, [showProfile, loading]);

  // 플레이리스트 이동
  const nextTrack = () => setCurrentIndex((idx) => (idx + 1) % tracks.length);
  const prevTrack = () =>
    setCurrentIndex((idx) => (idx - 1 + tracks.length) % tracks.length);

  const updateSeek = (clientX: number) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleSeekStart = (e: React.PointerEvent<HTMLDivElement>) => {
    setSeeking(true);
    updateSeek(e.clientX);
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seeking) return;
    updateSeek(e.clientX);
  };

  const handleSeekEnd = () => setSeeking(false);

  if (loading) return <Loader />;

  return (
    <div className={darkMode ? "dark" : ""}>
      <section
        className={`relative w-full h-screen overflow-hidden fade-up ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        }`}
        ref={containerRef}
        onMouseDown={handleClick}
      >
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${backImg})`,
            filter: darkMode ? "brightness(0.5)" : "brightness(1)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))",
            opacity: 0.8,
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple"
            style={{ left: r.x, top: r.y, zIndex: 5 }}
          />
        ))}

        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute top-4 right-4 z-20 px-3 py-2 rounded-md border ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-900"
          }`}
        >
          {darkMode ? "주간 모드" : "야간 모드"}
        </button>

        <div
          className={`relative z-10 flex flex-col items-center justify-center h-full ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          <div className="mb-4 fade-up" style={{ animationDelay: "0.1s" }}>
            <AvatarMenu />
          </div>
          <h1
            className="text-4xl font-bold mb-6 fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span
              className="cursor-pointer transition-transform hover:scale-110 hover:text-blue-500"
              onClick={() => setShowProfile(true)}
            >
              baebini
            </span>
            's Flow
          </h1>
          <p className="mb-2 fade-up" style={{ animationDelay: "0.4s" }}>
            Now Playing: {tracks[currentIndex].title}
          </p>
          <div
            className="mb-4 fade-up flex-col w-full items-center align max-w-md"
            style={{ animationDelay: "0.5s" }}
          >
            <div
              ref={progressRef}
              className="flex-1 h-2 bg-gray-300 rounded overflow-hidden"
              onPointerDown={handleSeekStart}
              onPointerMove={handleSeekMove}
              onPointerUp={handleSeekEnd}
              onPointerLeave={handleSeekEnd}
            >
              <div
                className="h-full bg-green-500"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="ml-2 text-sm whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div
            className="flex space-x-4 mb-6 fade-up border-none"
            style={{ animationDelay: "0.6s" }}
          >
            <button
              onClick={prevTrack}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 border-none text-white"
                  : "bg-gray-200 hover:bg-gray-300 border-none text-gray-900"
              }`}
            >
              Prev
            </button>
            <button
              onClick={togglePlay}
              className={`px-6 py-3 ${
                darkMode
                  ? "bg-600 hover:bg-green-500 border-none text-white"
                  : "bg-500 hover:bg-green-400 border-none text-white"
              } 
            ${isPlaying ? "bg-green-600" : ""}`}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={nextTrack}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 border-none text-white"
                  : "bg-gray-200 hover:bg-gray-300 border-none text-gray-900"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        <audio ref={audioRef} loop playsInline preload="auto">
          <source src={tracks[currentIndex].src} />
        </audio>
        <ProfileCard
          visible={showProfile}
          onClose={() => setShowProfile(false)}
        />
      </section>
      <AboutSection />
      <ProjectsSection />
      <ContactSection />
    </div>
  );
}
