# 🏠 Baebini’s Portfolio

프론트엔드 & 믹스미디어 개발 경험을 한눈에 보여 주는 **포트폴리오 웹사이트**입니다.  
음악 플레이어 + 오디오 스펙트럼, 프로젝트 소개, 연락처 섹션을 한 페이지에 담았습니다.

> 모바일·데스크톱 모두에서 매끄럽게 작동하도록 캔버스를 **기기 배율**에 맞춰 리사이즈하고,  
> 배경색과 어울리는 스펙트럼 컬러를 **볼륨에 따라 밝기 조절**하도록 개선했습니다.
> 본인의 프로필 확인, 프로젝트 소개, 연락처 등 간략한 이력 또한 적혀있어요.

## ✨ 데모

곧 배포 예정… (예: Vercel URL)

## 🔧 기술 스택

| 영역       | 사용 기술                           |
| ---------- | ----------------------------------- |
| 프레임워크 | **React 18 + Vite**                 |
| 언어       | **TypeScript** (≈ 83 %), JavaScript |
| 스타일     | **Tailwind CSS**, PostCSS           |
| 도구       | ESLint, Prettier                    |
| 기타       | Web Audio API, Canvas               |

> 참고: `tailwind.config.js`, `vite.config.ts` 등 구성 파일은 리포지토리 루트에서 확인할 수 있습니다. :contentReference[oaicite:1]{index=1}

## 📂 프로젝트 구조

```
├─ public/ # 정적 리소스 (음원, 아이콘 등)
├─ src/
│ ├─ components/ # 재사용 UI
│ ├─ sections/ # About · Projects · Contact
│ ├─ hooks/ # 커스텀 훅 (오디오 분석 등)
│ └─ App.tsx # 진입 컴포넌트
├─ index.html # Vite 템플릿
└─ package.json
```

## 🚀 빠른 시작

```bash
# 1) 저장소 클론
git clone https://github.com/baebini11/portfolio.git
cd portfolio

# 2) 패키지 설치
npm install

# 3) 개발 서버 실행
npm run dev        # http://localhost:5173
빌드
bash
복사
편집
npm run build      # production build
npm run preview    # 빌드 결과 로컬 확인
```
