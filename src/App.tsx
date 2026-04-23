/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  X,
  ArrowUpRight,
  Rss,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// --- Shared data ---------------------------------------------------------

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/post', label: 'Posts' },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
];

const TOPICS = [
  'AI 에이전트',
  '대규모 언어 모델',
  '시스템 아키텍처',
  '개발자 도구',
  '스타트업',
  '오픈소스',
  '디지털 철학',
  '지식 시스템',
];

// --- Components ----------------------------------------------------------

const SearchBar = ({ onSubmit }: { onSubmit?: () => void }) => {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        navigate(`/post?q=${encodeURIComponent(value.trim())}`);
        onSubmit?.();
      }}
      className="relative group w-full"
    >
      <Search
        size={16}
        className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="생각·로그·주제를 검색..."
        className="w-full bg-transparent border-b border-on-surface/15 py-2 pl-7 text-sm font-sans placeholder:text-on-surface/40 focus:outline-none focus:border-primary transition-colors"
      />
    </form>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-surface-variant/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 sm:h-16 md:h-20 flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-baseline gap-2 shrink-0">
            <span className="font-serif italic text-2xl md:text-3xl text-primary-ink tracking-tight leading-none">
              Rebootiner
            </span>
          </Link>

          {/* Desktop nav + inline search — grouped toward the right, but inset from the edge */}
          <nav className="hidden md:flex items-center gap-9 ml-auto mr-16 lg:mr-24">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative py-2 nav-link"
                >
                  <span
                    className={
                      active
                        ? 'text-primary'
                        : 'text-on-surface group-hover:text-primary'
                    }
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-0 right-0 -bottom-0 h-[2px] bg-primary"
                    />
                  )}
                </Link>
              );
            })}
            <button
              type="button"
              aria-label="검색"
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 -mr-2 rounded-full hover:bg-surface-low transition-colors"
            >
              <Search size={18} className="text-on-surface-variant" />
            </button>
          </nav>

          {/* Mobile-only actions */}
          <div className="flex items-center gap-1 md:hidden ml-auto">
            <button
              type="button"
              aria-label="검색"
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-surface-low transition-colors"
            >
              <Search size={18} className="text-on-surface-variant" />
            </button>
            <button
              type="button"
              aria-label="메뉴"
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-full hover:bg-surface-low transition-colors"
            >
              <Menu size={20} className="text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Inline search drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-surface-variant/40 bg-surface/95 backdrop-blur overflow-hidden"
            >
              <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4">
                <SearchBar onSubmit={() => setSearchOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== Mobile menu ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            <div
              className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 h-full w-[82%] max-w-sm bg-surface shadow-2xl flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-5 border-b border-surface-variant/40">
                <span className="font-serif italic text-xl text-primary-ink">Rebootiner</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="닫기"
                  className="p-2 rounded-full hover:bg-surface-low transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between py-5 border-b border-surface-variant/30 transition-colors ${active ? 'text-primary' : 'text-on-surface hover:text-primary'
                        }`}
                    >
                      <span className="font-sans text-base font-bold uppercase tracking-[0.2em]">
                        {item.label}
                      </span>
                      <span className="text-on-surface-variant" aria-hidden="true">→</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-5 py-5 border-t border-surface-variant/40 space-y-4">
                <SearchBar />
                <p className="text-xs text-on-surface-variant font-serif italic">
                  © 2026 Rebootiner
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Main ===== */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-surface-variant/40 mt-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          {/* Identity */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="font-serif italic text-3xl text-primary-ink">
              Rebootiner
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed break-keep max-w-sm">
              AI 시스템을 만들고, 배운 것을 기록합니다. 에이전트·LLM·시스템
              아키텍처에 대한 에디토리얼 저널.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="/rss.xml"
                aria-label="RSS"
                className="p-2 rounded-full border border-surface-variant/60 hover:border-primary hover:text-primary transition-colors"
              >
                <Rss size={16} />
              </a>
            </div>
          </div>

          {/* Topics — curated, not overwhelming */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-6">
              주제 / Topics
            </h4>
            <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm text-on-surface-variant font-serif">
              {TOPICS.map((topic) => (
                <Link
                  key={topic}
                  to={`/post?q=${encodeURIComponent(topic)}`}
                  className="hover:text-primary transition-colors"
                >
                  {topic}
                </Link>
              ))}
            </nav>
          </div>

          {/* Nav + copyright */}
          <div className="md:col-span-3 flex flex-col justify-between gap-6">
            <nav className="grid grid-cols-2 gap-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="text-xs text-on-surface-variant font-serif italic leading-relaxed">
              © 2026 Rebootiner
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Pages ---------------------------------------------------------------

type Article = {
  date: string;
  title: string;
  desc: string;
  tags: string[];
  image?: string;
  plate?: string;
};

const Home = () => {
  const featured: Article = {
    date: '2026년 2월 2일',
    plate: 'Plate No. 42',
    title: '휴먼 웹은 이제 에이전트 웹이 된다',
    desc: '우리는 지금 인간의 클릭에서 에이전트 기반 워크플로우로의 거대한 전환점에 서 있습니다. 인터페이스는 이제 눈으로 보는 것이 아니라 실행되는 구조가 되어야 합니다.',
    tags: ['AI', 'AGENTS', 'WEB'],
    image:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
  };

  const secondary: Article[] = [
    {
      date: '2026년 4월 21일',
      plate: 'Plate No. 41',
      title: 'Qwen을 GPT-5.4보다 더 잘 쓰도록 학습시킨 경험',
      desc: '파인튜닝된 Qwen3 모델에서 발견한 RLVR 성능 향상의 핵심은 학습 방법보다 \u2018검증 루프\u2019의 설계에 있었습니다.',
      tags: ['LLM', 'TRAINING'],
    },
    {
      date: '2026년 4월 7일',
      plate: 'Plate No. 40',
      title: '아무도 해결하지 못한 지능의 난제들',
      desc: 'AI 에이전트가 코드를 작성할 순 있지만, 그것이 아키텍처적 일관성을 유지하는지는 완전히 다른 차원의 문제입니다.',
      tags: ['HARD PROBLEMS', 'AGENTS'],
    },
  ];

  const recent: Article[] = [
    { date: '2026년 3월 31일', title: 'Bash가 루프를 소유하다', desc: '가장 단순한 설계로 돌아갔을 때, 쉘 자체가 상태와 스케줄링을 관리하는 것이 에이전트의 안정성을 보장했습니다.', tags: ['DEV', 'BASH'] },
    { date: '2026년 3월 29일', title: 'AI 루프에 대해 강화된 아키텍처 철학', desc: '측정 가능한 결과와 현실 사이의 간극을 좁히는 유일한 방법은 루프 안의 신뢰 모델을 고도화하는 것입니다.', tags: ['LOOPS', 'AI'] },
    { date: '2026년 3월 25일', title: '벡터 데이터베이스의 한계와 기회', desc: 'RAG 시스템에서 지식의 인출은 완벽하지 않습니다. 의미론적 검색의 맹점을 보완하는 하이브리드 전략.', tags: ['DATA', 'RAG'] },
    { date: '2026년 3월 18일', title: '코딩 에이전트 인프라스트럭처', desc: '자율적인 코딩 에이전트를 위한 샌드박스 환경과 실행 권한 관리의 정밀한 설계 기법.', tags: ['INFRA', 'AGENTS'] },
    { date: '2026년 3월 12일', title: '멀티 에이전트의 협력 시뮬레이션', desc: '서로 다른 페르소나를 가진 에이전트들이 복잡한 태스크를 수행할 때 발생하는 창발적 행동 분석.', tags: ['MULTI-AGENT'] },
    { date: '2026년 3월 5일', title: 'LLM 기반 도구 호출의 안정성', desc: '함수 호출 오류를 최소화하고 결정론적인 결과를 끌어내는 프롬프트 아키텍처 가이드라인.', tags: ['TOOLS', 'LLM'] },
  ];

  const curated: Article[] = [
    { date: '2026년 2월 26일', title: '분산 지능의 관찰 가능성', desc: '에이전트 웹에서 일어나는 수백만 개의 비동기 작업을 추적하고 병목 현상을 시각화하는 방법.', tags: ['OBSERVABILITY'] },
    { date: '2026년 2월 19일', title: '생성형 AI와 저작권의 미래', desc: '창작의 주체가 기계로 넘어가는 시대에 지적 재산권이 재정의되어야 하는 철학적 토대.', tags: ['LEGAL', 'SOCIETY'] },
    { date: '2026년 2월 12일', title: '하이퍼 로컬 대규모 언어 모델', desc: '엣지 디바이스에서 실행되는 경량화된 모델들이 우리 일상의 데이터 프라이버시를 지키는 방식.', tags: ['EDGE', 'PRIVACY'] },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32 space-y-14 sm:space-y-20 md:space-y-24">
      {/* === Hero: Asymmetric featured + two secondary === */}
      <section>
        <div className="flex items-baseline justify-between mb-6 md:mb-8">
          <h2 className="plate-no">최신 발행 / Latest</h2>
          <Link
            to="/post"
            className="label text-on-surface-variant hover:text-primary transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Featured — large with image */}
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 card-editorial group overflow-hidden"
          >
            <Link to="/article" className="block">
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-variant">
                <img
                  src={featured.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
                <span className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-3 py-1.5 label text-primary">
                  {featured.plate}
                </span>
              </div>
              <div className="p-6 sm:p-8 md:p-10 space-y-4 md:space-y-5">
                <span className="block label text-on-surface-variant">{featured.date}</span>
                <h2 className="font-serif font-medium text-xl md:text-[1.625rem] leading-[1.25] tracking-[-0.018em] break-keep group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                <p className="tagline text-[0.95rem] md:text-base text-on-surface-variant break-keep">
                  {featured.desc}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 label text-primary">
                  {featured.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          </motion.article>

          {/* Two stacked secondary */}
          <div className="lg:col-span-5 grid grid-rows-2 gap-6 md:gap-8">
            {secondary.map((item, idx) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className={`card-editorial group p-6 sm:p-8 flex flex-col justify-between ${idx === 0 ? 'border-l-4 border-primary' : 'border-l-4 border-secondary'
                  }`}
              >
                <Link to="/article" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="label text-on-surface-variant">{item.plate}</span>
                    <span className="text-xs text-on-surface-variant">{item.date}</span>
                  </div>
                  <h3 className="title-h3 break-keep group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="tagline text-sm text-on-surface-variant break-keep">
                    {item.desc}
                  </p>
                </Link>
                <div className="flex flex-wrap gap-x-3 pt-5 label text-primary">
                  {item.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* === Recent — compact list === */}
      <section>
        <div className="flex items-baseline justify-between mb-6 md:mb-8">
          <h2 className="plate-no">최근 글 / Recent Posts</h2>
          <Link
            to="/post"
            className="label text-on-surface-variant hover:text-primary transition-colors"
          >
            아카이브 →
          </Link>
        </div>

        <div className="divide-y divide-surface-variant/40 border-y border-surface-variant/40">
          {recent.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: Math.min(idx * 0.03, 0.2) }}
              className="group"
            >
              <Link
                to="/article"
                className="grid grid-cols-12 gap-3 md:gap-6 py-5 md:py-6 items-baseline hover:bg-surface-low/60 -mx-3 px-3 sm:-mx-4 sm:px-4 transition-colors rounded-sm"
              >
                <span className="col-span-12 md:col-span-2 label text-on-surface-variant">
                  {item.date}
                </span>
                <div className="col-span-12 md:col-span-7 space-y-2">
                  <h3 className="title-h3 break-keep group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="prose-body text-sm text-on-surface-variant break-keep line-clamp-2">
                    {item.desc}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-3 flex md:justify-end gap-x-3 label text-primary">
                  {item.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {/* === Curated: "From the archive" === */}
      <section>
        <div className="flex items-baseline justify-between mb-6 md:mb-8">
          <h2 className="plate-no">아카이브에서 / From the Archive</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {curated.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.08 }}
              className="group space-y-4"
            >
              <Link to="/article" className="block space-y-4">
                <div className="aspect-[4/3] bg-primary-wash/50 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif italic text-[6rem] text-primary/20 select-none leading-none">
                      §
                    </span>
                  </div>
                </div>
                <span className="block label text-on-surface-variant">{item.date}</span>
                <h3 className="title-h3 break-keep group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="prose-body text-sm text-on-surface-variant break-keep line-clamp-2">
                  {item.desc}
                </p>
              </Link>
              <div className="flex flex-wrap gap-x-3 pt-1 label text-primary">
                {item.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
      {/* Page header */}
      <header className="space-y-4 mb-10 md:mb-12 max-w-3xl">
        <span className="plate-no">소개 / About</span>
        <h1 className="title-display break-keep">Rebootiner</h1>
        <p className="tagline text-[1.0625rem] sm:text-lg md:text-xl text-on-surface-variant break-keep">
          AI 시스템을 만들고, 배운 것을 기록합니다.
          <br />
          <span className="font-sans text-[0.9375rem] text-on-surface-variant font-normal">
            Building AI systems and writing about what we learn.
          </span>
        </p>
      </header>

      <div className="rule mb-10 md:mb-14 max-w-3xl" />

      {/* Body sections */}
      <div className="max-w-3xl space-y-12 md:space-y-16">

      {/* What I Build */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="title-h2 flex items-baseline gap-3">
            <span className="section-num">§01</span>
            <span>만들고 있는 것</span>
          </h2>
          <p className="text-on-surface-variant text-base break-keep">
            AI 실험과 프로덕션 시스템을 출시합니다. 최근 작업:
          </p>
        </div>
        <ul className="space-y-4 text-[1.0625rem] text-on-surface/85">
          {[
            { name: 'Looper', desc: '리뷰 게이트와 결정론적 워크플로우를 갖춘 자율 코딩 시스템' },
            { name: 'AgentProbe', desc: 'AI 에이전트 CLI 상호작용 테스트를 위한 오픈소스 도구' },
            { name: 'Agentic AI Handbook', desc: '멀티 에이전트 시스템을 위한 113개의 프로덕션 패턴' },
            { name: 'This Site', desc: 'AI 코딩 에이전트로 빌드하고 유지하는 에디토리얼 저널' },
          ].map((item) => (
            <li key={item.name} className="flex gap-4 break-keep">
              <span className="text-primary shrink-0 font-serif italic">—</span>
              <span>
                <strong className="text-on-surface font-medium">{item.name}</strong>
                <span className="text-on-surface-variant"> · {item.desc}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="tagline text-base text-on-surface-variant pt-4 border-t border-surface-variant/40">
          지난 1년간 50개 이상의 AI 프로젝트를 출시했고, 프로덕션에서 실제로 동작하는 것들을 기록합니다.
        </p>
      </section>

      {/* Current Focus */}
      <section className="space-y-8">
        <h2 className="title-h2 flex items-baseline gap-3">
          <span className="section-num">§02</span>
          <span>현재의 관심사</span>
        </h2>
        <ul className="space-y-4 text-[1.0625rem] text-on-surface/85">
          {[
            { name: '멀티 에이전트 오케스트레이션', desc: '자율 에이전트가 대규모로 협력하는 방법' },
            { name: '에이전트 친화 인프라', desc: '타입 안전성, CLI, 기계 판독 가능한 문서' },
            { name: '성능 패턴', desc: '전략적 조정을 통한 5배 성능 향상' },
            { name: 'AI-네이티브 개발', desc: 'AI가 주요 협업자일 때 무엇이 달라지는가' },
          ].map((item) => (
            <li key={item.name} className="flex gap-4 break-keep">
              <span className="text-primary shrink-0 font-serif italic">—</span>
              <span>
                <strong className="text-on-surface font-medium">{item.name}</strong>
                <span className="text-on-surface-variant"> · {item.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Writing & Research */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="title-h2 flex items-baseline gap-3">
            <span className="section-num">§03</span>
            <span>집필과 연구</span>
          </h2>
          <p className="text-on-surface-variant text-base">상세한 기술 분석을 씁니다:</p>
        </div>
        <ul className="space-y-4 text-[1.0625rem] text-on-surface/85">
          <li className="flex gap-4 break-keep">
            <span className="text-primary shrink-0 font-serif italic">—</span>
            <span>
              <a className="prose-link font-medium" href="#">"The Agentic AI Handbook"</a>
              <span className="text-on-surface-variant"> · 113개의 실전 검증 패턴</span>
            </span>
          </li>
          <li className="flex gap-4 break-keep">
            <span className="text-primary shrink-0 font-serif italic">—</span>
            <span className="text-on-surface-variant">
              인프라 딥다이브 — 서버리스 비용, 캐싱 전략
            </span>
          </li>
          <li className="flex gap-4 break-keep">
            <span className="text-primary shrink-0 font-serif italic">—</span>
            <span className="text-on-surface-variant">
              AI 개발 패턴 — Sourcegraph의 교훈, 병목 분석
            </span>
          </li>
          <li className="flex gap-4 break-keep">
            <span className="text-primary shrink-0 font-serif italic">—</span>
            <span className="text-on-surface-variant">
              기술 채택 사이클 — 20년 주기와 AI의 가속
            </span>
          </li>
        </ul>
      </section>

      {/* Contact CTA */}
      <section className="pt-8 border-t border-surface-variant/40">
        <p className="text-base text-on-surface-variant break-keep">
          문의·피드백은{' '}
          <a href="mailto:hello@rebootiner.com" className="prose-link font-medium">
            hello@rebootiner.com
          </a>
          으로.
        </p>
      </section>
      </div>
    </div>
  );
};

const Projects = () => {
  const projectList = [
    {
      id: 'scribe',
      title: 'scribe',
      desc: 'M5stack ESP32 기반 Tab5 디바이스를 위한 방해 없는 집필 펌웨어.',
      tags: ['firmware', 'embedded', 'esp32', 'writing'],
      href: 'https://github.com/rebootiner/scribe',
    },
    {
      id: 'anytime',
      title: 'anytime',
      desc: 'A/B 테스트와 온라인 지표를 위한 피킹에 안전한 스트리밍 추론.',
      tags: ['statistics', 'ab-testing', 'inference', 'python'],
      href: 'https://github.com/rebootiner/anytime',
    },
    {
      id: 'oas',
      title: 'oas',
      desc: '공개·버전 관리되는 Torture Suite를 백엔드로 한 표준 준수 OpenAPI 검증기.',
      tags: ['openapi', 'validation', 'rust', 'testing'],
      href: 'https://github.com/rebootiner/oas',
    },
    {
      id: 'demig',
      title: 'demig',
      desc: '제약된 소통을 통해 정체성이 어떻게 발현되는지 탐구하는 멀티 에이전트 공진화 실험.',
      tags: ['ai', 'agents', 'multi-agent', 'experiment'],
      href: 'https://github.com/rebootiner/demig',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
      {/* Page header */}
      <header className="space-y-4 mb-10 md:mb-12 max-w-3xl">
        <span className="plate-no">프로젝트 / Projects</span>
        <h1 className="title-display break-keep">프로젝트</h1>
        <p className="tagline text-[1.0625rem] sm:text-lg md:text-xl text-on-surface-variant break-keep">
          AI, 개발 도구, 그리고 혁신을 탐구하는 오픈소스 프로젝트와 실험들.
          각각은 새로운 기술에 대한 직접적인 탐색과 실용적인 해결책입니다.
        </p>
      </header>

      <div className="rule mb-10 md:mb-14" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 md:gap-y-10">
        {projectList.map((project, idx) => (
          <motion.a
            key={project.id}
            href={project.href}
            target="_blank"
            rel="noreferrer noopener"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="group block p-5 sm:p-6 md:p-8 -mx-2 rounded-sm border border-transparent hover:border-surface-variant/60 hover:bg-surface-high transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <h2 className="title-h2 group-hover:text-primary transition-colors">
                {project.title}
              </h2>
              <ArrowUpRight
                size={20}
                className="shrink-0 text-on-surface-variant group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
              />
            </div>
            <p className="prose-body text-base md:text-lg text-on-surface-variant break-keep mb-6 min-h-[3.5rem]">
              {project.desc}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="group-hover:text-primary/70 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

const Log = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q')?.toLowerCase() || '';

  const posts = [
    {
      date: '2026년 4월 21일',
      title: 'Qwen을 GPT-5.4보다 더 잘 쓰도록 학습시킨 경험 (어느 정도는)',
      tags: ['AI', 'HUMAN', 'TIL'],
      desc: '휴대폰으로 Clojure LLM을 학습시켰습니다. GPT-5.4를 \u2018이겼습니다\u2019—어느 정도는요. 실제로 어떤 일이 일어났는지 공유합니다.',
    },
    {
      date: '2026년 4월 7일',
      title: '아무도 해결하지 못한 지능의 난제들',
      tags: ['AI', 'OPINION', 'AGENTS'],
      desc: '에이전트의 미래를 가로막는 네 가지 미해결 문제들: 정확성, 아키텍처 드리프트, 컨텍스트 스케일링, 그리고 판단력.',
    },
    {
      date: '2026년 3월 31일',
      title: 'Bash가 루프를 소유하다',
      tags: ['AI', 'AGENTS', 'AUTOMATION'],
      desc: '자율 에이전트를 위한 견고한 래퍼 패턴: Bash가 상태, 검증, 복구 및 완료를 소유합니다.',
    },
    {
      date: '2026년 3월 29일',
      title: 'AI 루프에 대해 강화된 아키텍처 철학',
      desc: '우리가 직면한 AI 지원 엔지니어링의 진정한 모습: 엄격한 제약 조건, 실제 오라클, 작은 단위의 재현, 그리고 거부권.',
      tags: ['AI', 'AGENTS', 'TOOLS'],
    },
    {
      date: '2026년 3월 21일',
      title: '스킬 최적화',
      tags: ['AI', 'AGENTS', 'TOOLS'],
      desc: '2주간의 에이전트 벤치마킹을 통해 분산은 비용 문제이며, 실제 해결책은 더 나은 툴링에 있다는 것을 깨달았습니다.',
    },
  ];

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
  );

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
      {/* Page header */}
      <header className="space-y-4 mb-10 md:mb-12 max-w-3xl">
        <span className="plate-no">{query ? '검색 결과 / Results' : '글 / Posts'}</span>
        <h1 className="title-display break-keep">
          {query ? `"${query}"` : 'Posts'}
        </h1>
        <p className="tagline text-[1.0625rem] sm:text-lg text-on-surface-variant break-keep">
          {query
            ? `${filtered.length}개의 글을 찾았습니다.`
            : '개발, 아이디어, 그리고 사유의 기록들.'}
        </p>
      </header>

      <div className="rule mb-10 md:mb-14" />

      {/* Posts */}
      <div className="space-y-8 md:space-y-10 max-w-3xl">
        {filtered.length > 0 ? (
          filtered.map((entry, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="group space-y-4 pb-12 border-b border-surface-variant/40 last:border-0"
            >
              {/* Meta row */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap label text-on-surface-variant">
                  <span>{entry.date}</span>
                </div>
                <div className="flex gap-3 label text-primary">
                  {entry.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Title & description */}
              <div className="space-y-3">
                <Link to="/article">
                  <h2 className="font-serif text-xl md:text-2xl lg:text-[1.625rem] font-medium tracking-[-0.018em] leading-[1.3] hover:text-primary transition-colors break-keep">
                    {entry.title}
                  </h2>
                </Link>
                <p className="prose-body text-[0.95rem] md:text-base text-on-surface-variant max-w-3xl break-keep">
                  {entry.desc}
                </p>
              </div>

              <Link
                to="/article"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all pt-2"
              >
                읽기 <ArrowUpRight size={14} />
              </Link>
            </motion.article>
          ))
        ) : (
          <div className="py-20 text-center space-y-6">
            <p className="text-2xl text-on-surface-variant font-serif font-medium break-keep">
              해당 검색어와 일치하는 기록을 찾지 못했습니다.
            </p>
            <Link
              to="/post"
              className="inline-block text-primary font-bold hover:underline underline-offset-8"
            >
              전체 아카이브 보기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const Article = () => {
  return (
    <article className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
      {/* Title block — left-aligned at 3xl to share a left edge with other pages */}
      <div className="max-w-3xl mb-12 md:mb-14 space-y-5">
        <nav className="flex flex-wrap gap-2 items-center text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
          <span>디지털 문화</span>
          <span className="text-primary/40">/</span>
          <span>미래 아카이브</span>
        </nav>

        <h1 className="font-serif text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.2] tracking-[-0.02em] font-medium text-on-surface break-keep">
          휴먼 웹은 이제<br />에이전트 웹이 된다
        </h1>

        <div className="flex items-center gap-3 pt-2 text-[14px] text-on-surface-variant">
          <time>2024년 10월 24일</time>
          <span className="text-on-surface-variant/50">·</span>
          <span>7분 읽기</span>
        </div>
      </div>

      {/* Hero image — fills outer 5xl container */}
      <div className="mb-12 md:mb-16 group">
        <div className="aspect-[16/9] bg-surface-variant relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1600"
            alt="원고 도판 No. 42"
            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
        </div>
        <p className="mt-3 text-[13px] text-on-surface-variant text-right">
          Plate No. 42 — 논리의 출현
        </p>
      </div>

      {/* Body — also left-aligned at 3xl */}
      <div className="max-w-3xl space-y-10 md:space-y-12">
        <p className="drop-cap prose-body text-[17px] leading-[1.75] text-on-surface break-keep">
          지난 30년 동안 우리는 '페이지'의 시대에 머물렀습니다. 우리는 브라우징하고, 스크롤하며,
          클릭했습니다. 우리의 디지털 존재는 직사각형 프레임인 '인터페이스'에 의해 매개되었습니다.
          그러나 조용한 변전이 일어나고 있습니다. 인간의 눈과 손가락을 위해 구축된 사이트들의
          네트워크인 '휴먼 웹'은 자율적인 존재들이 우리를 대신해 소통하고 협상하며 실행하는
          보이지 않는 층인 '에이전트 웹'으로 대체되고 있습니다.
        </p>

        <section className="space-y-5">
          <h2 className="font-serif text-[1.375rem] md:text-[1.5rem] font-medium tracking-[-0.015em] text-on-surface break-keep">
            <span className="section-num text-base mr-2">§01</span>인터페이스의 종말
          </h2>
          <p className="prose-body text-[17px] leading-[1.75] text-on-surface-variant break-keep">
            에이전트가 항공권을 예매하고, 이메일을 요약하며, 캘린더를 관리할 수 있게 되면 그래픽
            사용자 인터페이스(GUI)의 필요성은 약화되기 시작합니다. 우리는 '목적지'인 웹사이트가
            단지 거대 언어 모델을 위한 데이터 소스에 불과한 세상으로 나아가고 있습니다. 사용자가
            화면을 보지 않게 된다면 브랜드가 집착하던 픽셀 단위의 완벽한 디자인은 무의미해질
            것입니다.
          </p>
        </section>

        <blockquote className="relative py-8 md:py-10 px-7 md:px-10 bg-primary-wash/50 border-l-4 border-primary overflow-hidden">
          <span className="absolute -top-2 -left-2 font-serif text-[5rem] text-primary/15 select-none pointer-events-none leading-none">
            “
          </span>
          <div className="relative z-10 space-y-4">
            <p className="text-[1.125rem] md:text-[1.25rem] font-serif font-medium text-primary-ink leading-[1.5] tracking-[-0.012em] break-keep">
              가장 심오한 기술은 사라지는 기술이다. 그것들은 일상의 직조 속에 녹아들어 우리가
              구별할 수 없을 때까지 스며든다.
            </p>
            <cite className="label text-secondary not-italic">
              — 마크 와이저, 1991
            </cite>
          </div>
        </blockquote>

        <section className="space-y-5">
          <h2 className="font-serif text-[1.375rem] md:text-[1.5rem] font-medium tracking-[-0.015em] text-on-surface break-keep">
            <span className="section-num text-base mr-2">§02</span>진정성으로서의 비대칭
          </h2>
          <p className="prose-body text-[17px] leading-[1.75] text-on-surface-variant break-keep">
            AI가 생성한 완벽하고 살균된 콘텐츠에 대응하여, 인간 창작자들은 의도적인 비대칭성으로
            회귀하고 있습니다. 우리는 이를 현대 타이포그래피와 레이아웃 디자인에서 목격하고
            있습니다. 이는 정형화된 그리드에 대한 반항입니다. '공간의 럭셔리'와 유기적인 온기를
            포용함으로써, 우리는 기계화된 풍경 속에서 인간의 존재를 증명합니다.
          </p>
        </section>

        {/* Article footer: return to archive */}
        <div className="pt-10 border-t border-surface-variant/60 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/post"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-on-surface hover:text-primary transition-colors"
          >
            ← 전체 아카이브
          </Link>
          <div className="flex gap-4 label text-primary">
            <span>AI</span>
            <span>AGENTS</span>
            <span>WEB</span>
          </div>
        </div>
      </div>
    </article>
  );
};

// --- App Root ---------------------------------------------------------

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<Log />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/article" element={<Article />} />
        </Routes>
      </Layout>
    </Router>
  );
}
