import fs from 'node:fs';
import path from 'node:path';

type FrontmatterValue = string | string[];

type Frontmatter = {
  title?: string;
  date?: string;
  tags?: string[];
  excerpt?: string;
  cover?: string;
  aliases?: string[];
  [key: string]: FrontmatterValue | undefined;
};

type ParsedPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  cover: string | null;
  readingTime: number;
  html: string;
  body: string;
  aliases: string[];
  sourceFile: string;
  resolveImage: (reference: string) => string | null;
};

const projectRoot = process.cwd();
const contentsDir = path.join(projectRoot, 'contents');
const publicImagesDir = path.join(projectRoot, 'public', 'images');
const generatedDir = path.join(projectRoot, 'src', 'generated');
const generatedFile = path.join(generatedDir, 'posts.ts');

const TAG_KEYWORDS: Record<string, string[]> = {
  DESIGN: ['design', 'taste', '취향', '디자인', '레이아웃', '타이포그래피', 'editorial', '에디토리얼', 'stitch', 'claude cowork'],
  BLOG: ['blog', '블로그', '게시', 'publishing', 'publication'],
  'GITHUB PAGES': ['github pages', 'gh pages', 'pages 배포', '깃허브 페이지'],
  VITE: ['vite'],
  AI: ['ai', 'llm', '모델', '생성형 ai'],
  AGENTS: ['agent', 'agents', '에이전트', '멀티 에이전트'],
  WORKFLOW: ['workflow', '워크플로우', 'process', '배포', 'pipeline'],
};

main();

function main() {
  fs.mkdirSync(contentsDir, {recursive: true});
  fs.mkdirSync(publicImagesDir, {recursive: true});
  fs.mkdirSync(generatedDir, {recursive: true});

  const vaultRoot = detectVaultRoot(projectRoot);
  const vaultImageIndex = vaultRoot ? indexFilesByBasename(vaultRoot) : new Map<string, string>();

  const markdownFiles = fs
    .readdirSync(contentsDir)
    .filter((file) => file.endsWith('.md'))
    .sort((a, b) => a.localeCompare(b, 'ko'));

  const parsedPosts = markdownFiles.map((file) =>
    parsePost(path.join(contentsDir, file), vaultImageIndex)
  );

  const linkMap = buildLinkMap(parsedPosts);
  const finalizedPosts = parsedPosts
    .map((post) => finalizePost(post, linkMap))
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  const fileContents = `export type GeneratedPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  cover: string | null;
  readingTime: number;
  html: string;
};

export const posts: GeneratedPost[] = ${JSON.stringify(
    finalizedPosts.map(({slug, title, date, tags, excerpt, cover, readingTime, html}) => ({
      slug,
      title,
      date,
      tags,
      excerpt,
      cover,
      readingTime,
      html,
    })),
    null,
    2
  )};
`;

  fs.writeFileSync(generatedFile, fileContents, 'utf8');
  console.log(`Generated ${finalizedPosts.length} post(s) -> ${path.relative(projectRoot, generatedFile)}`);
}

function detectVaultRoot(startDir: string): string | null {
  let current = path.resolve(startDir);

  while (true) {
    if (fs.existsSync(path.join(current, '.obsidian'))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

function indexFilesByBasename(rootDir: string): Map<string, string> {
  const index = new Map<string, string>();
  const stack = [rootDir];

  while (stack.length > 0) {
    const current = stack.pop()!;
    const entries = fs.readdirSync(current, {withFileTypes: true});

    for (const entry of entries) {
      if (entry.name === '.obsidian' || entry.name === 'node_modules' || entry.name.startsWith('.git')) {
        continue;
      }

      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (!index.has(entry.name)) {
        index.set(entry.name, fullPath);
      }
    }
  }

  return index;
}

function parsePost(filePath: string, vaultImageIndex: Map<string, string>): ParsedPost {
  const raw = fs.readFileSync(filePath, 'utf8');
  const {frontmatter, body} = parseFrontmatter(raw);
  const title = frontmatter.title || extractTitle(body) || path.basename(filePath, '.md');
  const slug = slugify(path.basename(filePath, '.md'));
  const excerpt = (frontmatter.excerpt || extractExcerpt(body)).trim();
  const date = normalizeDate(frontmatter.date);
  const tags = normalizeTags(frontmatter.tags, title, body);
  const aliases = normalizeAliases(frontmatter.aliases);
  const imageState = createImageState(slug, vaultImageIndex);
  const cover = resolveCover(frontmatter.cover, body, imageState);
  const readingTime = estimateReadingTime(`${title}\n${body}`);

  return {
    slug,
    title,
    date,
    tags,
    excerpt,
    cover,
    readingTime,
    html: body,
    body,
    aliases,
    sourceFile: filePath,
    resolveImage: imageState.resolve,
  };
}

function finalizePost(
  post: ParsedPost,
  linkMap: Map<string, string>
): Omit<ParsedPost, 'body' | 'aliases' | 'sourceFile' | 'resolveImage'> {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    excerpt: post.excerpt,
    cover: post.cover,
    readingTime: post.readingTime,
    html: markdownToHtml(post.body, linkMap, post.resolveImage),
  };
}

function parseFrontmatter(raw: string): {frontmatter: Frontmatter; body: string} {
  if (!raw.startsWith('---\n')) {
    return {frontmatter: {}, body: raw.trim()};
  }

  const endIndex = raw.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return {frontmatter: {}, body: raw.trim()};
  }

  const frontmatterRaw = raw.slice(4, endIndex);
  const body = raw.slice(endIndex + 5).trim();
  return {frontmatter: parseSimpleYaml(frontmatterRaw), body};
}

function parseSimpleYaml(input: string): Frontmatter {
  const result: Frontmatter = {};
  let currentKey: string | null = null;

  for (const line of input.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      const existing = Array.isArray(result[currentKey]) ? [...(result[currentKey] as string[])] : [];
      existing.push(stripQuotes(listMatch[1].trim()));
      result[currentKey] = existing;
      continue;
    }

    const keyIndex = line.indexOf(':');
    if (keyIndex === -1) {
      continue;
    }

    const key = line.slice(0, keyIndex).trim();
    const rawValue = line.slice(keyIndex + 1).trim();
    currentKey = key;

    if (!rawValue) {
      result[key] = [];
      continue;
    }

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      const inner = rawValue.slice(1, -1).trim();
      result[key] = inner
        ? inner.split(',').map((entry) => stripQuotes(entry.trim())).filter(Boolean)
        : [];
      continue;
    }

    result[key] = stripQuotes(rawValue);
  }

  return result;
}

function normalizeAliases(value: FrontmatterValue | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function normalizeDate(value: FrontmatterValue | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }

  const dateOnly = raw.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  return dateOnly || raw;
}

function normalizeTags(tags: FrontmatterValue | undefined, title: string, body: string): string[] {
  const explicit = Array.isArray(tags)
    ? tags.map((tag) => formatTag(tag)).filter(Boolean)
    : typeof tags === 'string' && tags.trim()
      ? [formatTag(tags)]
      : [];

  const haystack = `${title}\n${body}`.toLowerCase();
  const inferred = Object.entries(TAG_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => haystack.includes(keyword.toLowerCase())))
    .map(([tag]) => tag);

  const merged = [...explicit, ...inferred];
  return Array.from(new Set(merged)).filter(Boolean).slice(0, 8).length > 0
    ? Array.from(new Set(merged)).filter(Boolean).slice(0, 8)
    : ['ESSAY'];
}

function resolveCover(
  coverValue: FrontmatterValue | undefined,
  body: string,
  imageState: ReturnType<typeof createImageState>
): string | null {
  const explicit = Array.isArray(coverValue) ? coverValue[0] : coverValue;
  if (explicit) {
    return imageState.resolve(explicit);
  }

  const firstEmbed = body.match(/!\[\[([^\]]+)\]\]/)?.[1];
  if (!firstEmbed) {
    return null;
  }

  return imageState.resolve(firstEmbed);
}

function createImageState(slug: string, vaultImageIndex: Map<string, string>) {
  const copiedImages = new Map<string, string>();

  return {
    resolve(reference: string): string | null {
      const basename = cleanImageReference(reference);
      if (!basename) {
        return null;
      }

      if (copiedImages.has(basename)) {
        return copiedImages.get(basename)!;
      }

      const sourcePath = vaultImageIndex.get(basename) || path.join(contentsDir, basename);
      if (!fs.existsSync(sourcePath)) {
        return null;
      }

      const ext = path.extname(basename);
      const targetName = `${slug}-${slugify(path.basename(basename, ext))}${ext.toLowerCase()}`;
      const targetPath = path.join(publicImagesDir, targetName);

      fs.copyFileSync(sourcePath, targetPath);
      const publicPath = `/images/${targetName}`;
      copiedImages.set(basename, publicPath);
      return publicPath;
    },
  };
}

function markdownToHtml(
  markdown: string,
  linkMap: Map<string, string>,
  resolveImage: (reference: string) => string | null
): string {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }
    html.push(`<p>${renderInline(paragraph.join(' '), linkMap)}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }
    html.push(`<ul>${listItems.map((item) => `<li>${renderInline(item, linkMap)}</li>`).join('')}</ul>`);
    listItems = [];
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) {
      return;
    }
    html.push(`<blockquote><p>${renderInline(quoteLines.join(' '), linkMap)}</p></blockquote>`);
    quoteLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2], linkMap)}</h${level}>`);
      continue;
    }

    const imageMatch = trimmed.match(/^!\[\[([^\]]+)\]\]$/);
    if (imageMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const basename = cleanImageReference(imageMatch[1]);
      const fallbackAlt = basename ? path.basename(basename, path.extname(basename)) : 'embedded image';
      const imageSrc = basename ? resolveImage(basename) : null;
      if (imageSrc) {
        html.push(`<figure><img src="${escapeHtmlAttr(imageSrc)}" alt="${escapeHtmlAttr(fallbackAlt)}" /></figure>`);
      }
      continue;
    }

    const listMatch = trimmed.match(/^-\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(listMatch[1]);
      continue;
    }

    const quoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return html.join('\n');
}

function buildLinkMap(posts: ParsedPost[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const post of posts) {
    const keys = [
      post.slug,
      post.title,
      path.basename(post.sourceFile, '.md'),
      ...post.aliases,
    ];

    for (const key of keys) {
      const normalized = normalizeLinkKey(key);
      if (normalized) {
        map.set(normalized, post.slug);
      }
    }
  }

  return map;
}

function renderInline(text: string, linkMap: Map<string, string>): string {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
    const safeHref = escapeHtmlAttr(href);
    return `<a href="${safeHref}">${label}</a>`;
  });

  html = html.replace(/\[\[([^\]]+)\]\]/g, (_match, rawTarget) => {
    const [target, label] = rawTarget.split('|').map((value: string) => value.trim());
    const slug = linkMap.get(normalizeLinkKey(target));
    const resolvedLabel = escapeHtml(label || target);
    if (!slug) {
      return `<span class="content-link unresolved">${resolvedLabel}</span>`;
    }
    return `<a href="/post/${encodeURIComponent(slug)}">${resolvedLabel}</a>`;
  });

  return html;
}

function extractTitle(body: string): string | null {
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || null;
}

function extractExcerpt(body: string): string {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#') && !line.startsWith('![[') && !line.startsWith('>') && !line.startsWith('- '));

  const firstParagraph = lines[0] || '';
  return firstParagraph.length > 180 ? `${firstParagraph.slice(0, 177).trim()}...` : firstParagraph;
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const units = Math.max(words, Math.ceil(koreanChars / 2));
  return Math.max(1, Math.ceil(units / 220));
}

function compareDatesDesc(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}

function slugify(input: string): string {
  return input
    .replace(/[^0-9A-Za-z가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function formatTag(input: string): string {
  const compact = input.replace(/[^0-9A-Za-z가-힣]/g, '').toLowerCase();
  const specialCases: Record<string, string> = {
    githubpages: 'GITHUB PAGES',
  };

  if (specialCases[compact]) {
    return specialCases[compact];
  }

  const normalized = input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();

  return normalized.toUpperCase();
}

function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, '');
}

function cleanImageReference(reference: string): string | null {
  const cleaned = reference.split('|')[0]?.trim();
  if (!cleaned) {
    return null;
  }
  return path.basename(cleaned);
}

function normalizeLinkKey(input: string): string {
  return input.trim().toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
