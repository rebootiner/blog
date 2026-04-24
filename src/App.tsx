/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Search,
  X,
  ArrowUpRight,
  Rss,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { posts } from './generated/posts';

const BASE_URL = (import.meta as ImportMeta & { env: { BASE_URL: string } }).env.BASE_URL;

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

type Post = (typeof posts)[number];

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

const Layout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-surface-variant/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 sm:h-16 md:h-20 flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-baseline gap-2 shrink-0">
            <span className="font-serif italic text-2xl md:text-3xl text-primary-ink tracking-tight leading-none">
              Rebootiner
            </span>
          </Link>

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
                      className={`flex items-center justify-between py-5 border-b border-surface-variant/30 transition-colors ${active ? 'text-primary' : 'text-on-surface hover:text-primary'}`}
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

      <footer className="border-t border-surface-variant/40 mt-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12">
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="font-serif italic text-3xl text-primary-ink">
              Rebootiner
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed break-keep max-w-sm">
              AI 시스템을 만들고, 배운 것을 기록합니다. 에이전트·LLM·시스템
              아키텍처에 대한 에디토리얼 저널.
            </p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <span className="label text-on-surface">Pages</span>
            <nav className="flex flex-col gap-2 text-sm text-on-surface-variant">
              {NAV_ITEMS.map((item) => (
                <Link key={item.to} to={item.to} className="hover:text-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="md:col-span-4 space-y-4">
            <span className="label text-on-surface">Topics</span>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <span
                  key={topic}
                  className="px-2.5 py-1 rounded-full border border-surface-variant/60 text-[11px] uppercase tracking-[0.14em] text-on-surface-variant"
                >
                  {topic}
                </span>
              ))}
            </div>
            <a
              href={`${BASE_URL}feed.xml`}
              className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <Rss size={15} /> RSS Soon
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Home = () => {
  const featured = posts[0];
  const secondary = posts.slice(1, 3);
  const recent = posts.slice(0, 6);
  const curated = posts.slice(6, 9);

  if (!featured) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32 space-y-14 sm:space-y-20 md:space-y-24">
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
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-7 group"
          >
            <Link to={`/post/${featured.slug}`} className="block space-y-4 md:space-y-5">
              <div className="aspect-[16/10] bg-primary-wash/50 relative overflow-hidden rounded-sm">
                {featured.cover ? (
                  <img
                    src={withBasePath(featured.cover)}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-serif italic text-[6rem] text-primary/20 select-none leading-none">§</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
              </div>
              <div className="space-y-3">
                <span className="plate-no">Plate No. 43</span>
                <h1 className="font-serif text-[clamp(1.8rem,3vw,2.8rem)] leading-[1.15] tracking-[-0.02em] font-medium break-keep group-hover:text-primary transition-colors">
                  {featured.title}
                </h1>
                <p className="tagline text-[1.02rem] md:text-[1.125rem] break-keep max-w-2xl">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-on-surface-variant">
                  <time>{formatDisplayDate(featured.date)}</time>
                  <span className="text-on-surface-variant/40">·</span>
                  <span>{featured.readingTime}분 읽기</span>
                </div>
              </div>
            </Link>
          </motion.article>

          <div className="lg:col-span-5 grid grid-cols-1 gap-6 md:gap-8">
            {secondary.map((item, idx) => (
              <motion.article
                key={item.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="card-editorial p-5 md:p-6 rounded-sm"
              >
                <Link to={`/post/${item.slug}`} className="block space-y-3 group">
                  <div className="flex items-center justify-between gap-3">
                    <span className="label">{formatDisplayDate(item.date)}</span>
                    <ArrowUpRight size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="title-h3 break-keep group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="prose-body text-sm text-on-surface-variant break-keep line-clamp-3">{item.excerpt}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-2 pt-2 label text-primary">
                    {item.tags.slice(0, 3).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-6 md:mb-8">
          <h2 className="plate-no">최근 글 / Recent Notes</h2>
          <Link to="/post" className="label text-on-surface-variant hover:text-primary transition-colors">
            archive →
          </Link>
        </div>

        <div className="divide-y divide-surface-variant/40">
          {recent.map((item, idx) => (
            <motion.article
              key={item.slug}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: Math.min(idx * 0.03, 0.2) }}
              className="group"
            >
              <Link
                to={`/post/${item.slug}`}
                className="grid grid-cols-12 gap-3 md:gap-6 py-5 md:py-6 items-baseline hover:bg-surface-low/60 -mx-3 px-3 sm:-mx-4 sm:px-4 transition-colors rounded-sm"
              >
                <span className="col-span-12 md:col-span-2 label text-on-surface-variant">
                  {formatDisplayDate(item.date)}
                </span>
                <div className="col-span-12 md:col-span-7 space-y-2">
                  <h3 className="title-h3 break-keep group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="prose-body text-sm text-on-surface-variant break-keep line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-3 flex md:justify-end gap-x-3 gap-y-2 flex-wrap label text-primary">
                  {item.tags.slice(0, 3).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      {curated.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-6 md:mb-8">
            <h2 className="plate-no">아카이브에서 / From the Archive</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {curated.map((item, idx) => (
              <motion.article
                key={item.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.08 }}
                className="group space-y-4"
              >
                <Link to={`/post/${item.slug}`} className="block space-y-4">
                  <div className="aspect-[4/3] bg-primary-wash/50 relative overflow-hidden rounded-sm">
                    {item.cover ? (
                      <img src={withBasePath(item.cover)} alt={item.title} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-serif italic text-[6rem] text-primary/20 select-none leading-none">§</span>
                      </div>
                    )}
                  </div>
                  <span className="block label text-on-surface-variant">{formatDisplayDate(item.date)}</span>
                  <h3 className="title-h3 break-keep group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="prose-body text-sm text-on-surface-variant break-keep line-clamp-2">{item.excerpt}</p>
                </Link>
                <div className="flex flex-wrap gap-x-3 pt-1 label text-primary">
                  {item.tags.slice(0, 3).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
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

      <div className="max-w-3xl space-y-12 md:space-y-16">
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
              { name: 'This Site', desc: '옵시디언 원고에서 자동 발행되는 에디토리얼 저널' },
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

        <section className="space-y-8">
          <h2 className="title-h2 flex items-baseline gap-3">
            <span className="section-num">§02</span>
            <span>현재의 관심사</span>
          </h2>
          <ul className="space-y-4 text-[1.0625rem] text-on-surface/85">
            {[
              { name: '멀티 에이전트 오케스트레이션', desc: '자율 에이전트가 대규모로 협력하는 방법' },
              { name: '에이전트 친화 인프라', desc: '타입 안전성, CLI, 기계 판독 가능한 문서' },
              { name: '콘텐츠 자동화', desc: '옵시디언 원고에서 퍼블리싱까지 이어지는 파이프라인' },
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
      <header className="space-y-4 mb-10 md:mb-12 max-w-3xl">
        <span className="plate-no">프로젝트 / Projects</span>
        <h1 className="title-display break-keep">프로젝트</h1>
        <p className="tagline text-[1.0625rem] sm:text-lg md:text-xl text-on-surface-variant break-keep">
          AI, 개발 도구, 그리고 혁신을 탐구하는 오픈소스 프로젝트와 실험들.
          각각은 새로운 기술에 대한 직접적인 탐색과 실용적인 해결책입니다.
        </p>
      </header>

      <div className="rule mb-10 md:mb-14" />

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
  const query = new URLSearchParams(search).get('q')?.trim().toLowerCase() || '';
  const filteredPosts = useMemo(() => filterPosts(posts, query), [query]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
      <header className="space-y-4 mb-10 md:mb-12 max-w-3xl">
        <span className="plate-no">기록 / Posts</span>
        <h1 className="title-display break-keep">발행된 글</h1>
        <p className="tagline text-[1.0625rem] sm:text-lg md:text-xl text-on-surface-variant break-keep">
          옵시디언 원고를 `contents/`에 넣으면, 이미지 정리와 링크 변환을 거쳐 이 목록에 자동 반영됩니다.
        </p>
      </header>

      <div className="rule mb-10 md:mb-14" />

      <div className="space-y-4 mb-8">
        <SearchBar />
        {query && (
          <p className="text-sm text-on-surface-variant">
            <span className="font-medium text-on-surface">{filteredPosts.length}</span>개의 결과 · “{query}”
          </p>
        )}
      </div>

      <div className="space-y-5">
        {filteredPosts.length > 0 ? filteredPosts.map((post, idx) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: Math.min(idx * 0.04, 0.16) }}
            className="border-b border-surface-variant/40 pb-5"
          >
            <Link to={`/post/${post.slug}`} className="block group space-y-3">
              <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
                <span className="label text-on-surface-variant">{formatDisplayDate(post.date)}</span>
                <span className="text-on-surface-variant/40">·</span>
                <span className="text-sm text-on-surface-variant">{post.readingTime}분 읽기</span>
              </div>
              <h2 className="title-h2 break-keep group-hover:text-primary transition-colors">{post.title}</h2>
              <p className="prose-body text-on-surface-variant break-keep">{post.excerpt}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-2 label text-primary">
                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </Link>
          </motion.article>
        )) : (
          <div className="rounded-sm border border-surface-variant/60 bg-surface-high px-6 py-10 text-on-surface-variant">
            검색 결과가 없어요.
          </div>
        )}
      </div>
    </div>
  );
};

const ArticlePage = () => {
  const { slug } = useParams();
  const post = posts.find((item) => item.slug === slug);

  if (!post) {
    return <Navigate to="/post" replace />;
  }

  return (
    <article className="max-w-5xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-20 sm:pb-32">
      <div className="max-w-3xl mb-12 md:mb-14 space-y-5">
        <nav className="flex flex-wrap gap-2 items-center text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
          {post.tags.slice(0, 3).map((tag, idx) => (
            <span key={tag} className="inline-flex items-center gap-2">
              {idx > 0 && <span className="text-primary/40">/</span>}
              <span>{tag}</span>
            </span>
          ))}
        </nav>

        <h1 className="font-serif text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.2] tracking-[-0.02em] font-medium text-on-surface break-keep">
          {post.title}
        </h1>

        <p className="tagline text-[1.05rem] md:text-[1.125rem] text-on-surface-variant break-keep max-w-2xl">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 pt-2 text-[14px] text-on-surface-variant">
          <time>{formatDisplayDate(post.date)}</time>
          <span className="text-on-surface-variant/50">·</span>
          <span>{post.readingTime}분 읽기</span>
        </div>
      </div>

      {post.cover && (
        <div className="mb-12 md:mb-16 group">
          <div className="aspect-[16/9] bg-surface-variant relative overflow-hidden rounded-sm">
            <img
              src={withBasePath(post.cover)}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:opacity-0 transition-opacity" />
          </div>
        </div>
      )}

      <div className="max-w-3xl article-content" dangerouslySetInnerHTML={{ __html: normalizeGeneratedHtml(post.html) }} />
    </article>
  );
};

const EmptyState = () => (
  <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-16 pb-24">
    <div className="rounded-sm border border-surface-variant/60 bg-surface-high px-6 py-10 text-on-surface-variant">
      아직 `contents/`에 글이 없어요.
    </div>
  </div>
);

function formatDisplayDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function withBasePath(path: string) {
  if (!path.startsWith('/')) return path;
  return `${BASE_URL}${path.replace(/^\//, '')}`;
}

function normalizeGeneratedHtml(html: string) {
  return html
    .replace(/href="\/post\//g, `href="${BASE_URL}post/`)
    .replace(/src="\/images\//g, `src="${BASE_URL}images/`);
}

function filterPosts(items: Post[], query: string) {
  if (!query) return items;
  return items.filter((post) => {
    const haystack = [post.title, post.excerpt, ...post.tags, post.html]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

function App() {
  return (
    <Router basename={BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={posts.length > 0 ? <Home /> : <EmptyState />} />
          <Route path="/post" element={<Log />} />
          <Route path="/post/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/article" element={posts[0] ? <Navigate to={`/post/${posts[0].slug}`} replace /> : <EmptyState />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
