# Rebootiner — The Manuscript

AI 시스템을 만들고, 배운 것을 기록하는 에디토리얼 저널. 에이전트·LLM·시스템 아키텍처에 대한 한국어 기술 블로그입니다.

## 스택

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** (with `@tailwindcss/vite`)
- **React Router 7** (client-side routing)
- **Motion** (framer-motion의 후속)
- **lucide-react** (아이콘)
- **Noto Serif / Noto Serif KR / Public Sans** (Google Fonts)

## 로컬 실행

```bash
npm install
npm run dev
```

개발 서버는 `http://localhost:3000`에서 뜹니다.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드 (`dist/`)
- `npm run preview` — 빌드 결과물 로컬 미리보기
- `npm run lint` — TypeScript 타입 체크

## 구조

```
src/
├── App.tsx      — 전체 페이지(Home/Posts/About/Projects/Article) 및 레이아웃
├── index.css    — Tailwind 커스텀 토큰, 타이포그래피 유틸리티
└── main.tsx     — React 진입점
```

## 디자인 시스템

- **색상**: Terracotta (#91471d), Olive (#53652f), Teal (#00666b), warm off-white surface (#fbf9f5)
- **타이포그래피**: 3단 weight (400/500/700), 1.25 modular scale
- **레이아웃**: 모든 페이지 `max-w-5xl` 컨테이너, 헤더 블록은 `max-w-3xl` 좌측 정렬
- **반응형**: mobile-first 브레이크포인트 (default / sm / md / lg)

## License

Apache-2.0
