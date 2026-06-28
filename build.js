#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const POSTS_DIR = path.join(ROOT, 'posts');
const PAGES_DIR = path.join(ROOT, 'pages');
const ASSETS_DIR = path.join(ROOT, 'assets');

const SITE = {
  title: 'Sher',
  author: 'Sher Zhou',
  url: 'https://blog.zhouxianer.com',
  github: 'https://github.com/SherZhou',
  email: 'mailto:xianerr@hku.hk',
};

marked.setOptions({ gfm: true });

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function excerpt(markdown, maxLength = 140) {
  const block =
    markdown
      .replace(/```[\s\S]*?```/g, '')
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .find((part) => part && !/^#{1,6}\s/.test(part)) || '';

  const text = block
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}

function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function layout({ title, content, activeNav = '', scripts = '' }) {
  const pageTitle = title === SITE.title ? SITE.title : `${title} · ${SITE.title}`;
  const navClass = (name) => (activeNav === name ? 'active' : '');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="author" content="${escapeHtml(SITE.author)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="site-title" href="/">${escapeHtml(SITE.title)}</a>
      <nav>
        <a href="/" class="${navClass('home')}">首页</a>
        <a href="/archives.html" class="${navClass('archives')}">归档</a>
        <a href="/search.html" class="${navClass('search')}">搜索</a>
        <a href="/about.html" class="${navClass('about')}">关于</a>
      </nav>
    </div>
  </header>
  <main class="container">
    ${content}
  </main>
  <footer class="site-footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(SITE.author)} ·
        <a href="${SITE.github}" rel="noopener">GitHub</a> ·
        <a href="${SITE.email}">Email</a>
      </p>
    </div>
  </footer>
  ${scripts}
</body>
</html>`;
}

function loadPosts() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = path.basename(file, '.md');
    const tags = Array.isArray(data.tags)
      ? data.tags
      : data.tags
        ? [data.tags]
        : [];
    const date =
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date).slice(0, 10);
    return {
      slug,
      title: data.title || slug,
      date,
      tags,
      body: content.trim(),
      excerpt: excerpt(content.trim()),
      plainText: toPlainText(content.trim()),
    };
  });
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

function writeFile(relPath, content) {
  const dest = path.join(DIST, relPath);
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, content, 'utf8');
}

function build() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
  ensureDir(DIST);

  const posts = loadPosts();

  fs.cpSync(ASSETS_DIR, path.join(DIST, 'assets'), { recursive: true });

  const cname = path.join(ROOT, 'CNAME');
  if (fs.existsSync(cname)) {
    fs.copyFileSync(cname, path.join(DIST, 'CNAME'));
  }

  const postList = posts
    .map(
      (p) => `
    <article class="post-preview">
      <h2><a href="/posts/${p.slug}.html">${escapeHtml(p.title)}</a></h2>
      <time datetime="${p.date}">${formatDate(p.date)}</time>
      ${
        p.excerpt
          ? `<p class="post-excerpt">${escapeHtml(p.excerpt)}</p>`
          : ''
      }
      ${
        p.tags.length
          ? `<p class="tags">${p.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>`
          : ''
      }
    </article>`
    )
    .join('\n');

  writeFile(
    'index.html',
    layout({
      title: SITE.title,
      activeNav: 'home',
      content: `<section class="post-list">${postList}</section>`,
    })
  );

  const byYear = {};
  for (const p of posts) {
    const year = new Date(p.date).getFullYear();
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(p);
  }

  const archiveHtml = Object.keys(byYear)
    .sort((a, b) => b - a)
    .map(
      (year) => `
    <section class="archive-year">
      <h2>${year}</h2>
      <ul>
        ${byYear[year]
          .map(
            (p) => `
          <li>
            <time datetime="${p.date}">${formatDate(p.date)}</time>
            <a href="/posts/${p.slug}.html">${escapeHtml(p.title)}</a>
          </li>`
          )
          .join('')}
      </ul>
    </section>`
    )
    .join('\n');

  writeFile(
    'archives.html',
    layout({
      title: '归档',
      activeNav: 'archives',
      content: archiveHtml,
    })
  );

  const aboutRaw = fs.readFileSync(path.join(PAGES_DIR, 'about.md'), 'utf8');
  const { content: aboutContent } = matter(aboutRaw);
  writeFile(
    'about.html',
    layout({
      title: '关于',
      activeNav: 'about',
      content: `<article class="post-content">${marked.parse(aboutContent)}</article>`,
    })
  );

  writeFile(
    'search-index.json',
    JSON.stringify(
      posts.map((p) => ({
        title: p.title,
        url: `/posts/${p.slug}.html`,
        date: p.date,
        tags: p.tags,
        excerpt: p.excerpt,
        content: p.plainText,
      }))
    )
  );

  writeFile(
    'search.html',
    layout({
      title: '搜索',
      activeNav: 'search',
      content: `
        <section class="search-page">
          <label class="search-label" for="search-input">搜索文章</label>
          <input id="search-input" class="search-input" type="search" placeholder="输入关键词…" autocomplete="off" spellcheck="false">
          <p id="search-status" class="search-status">输入关键词开始搜索</p>
          <div id="search-results" class="search-results"></div>
        </section>`,
      scripts: '<script src="/assets/search.js"></script>',
    })
  );

  for (const post of posts) {
    writeFile(
      `posts/${post.slug}.html`,
      layout({
        title: post.title,
        content: `
        <article class="post">
          <header class="post-header">
            <h1>${escapeHtml(post.title)}</h1>
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            ${
              post.tags.length
                ? `<p class="tags">${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>`
                : ''
            }
          </header>
          <div class="post-content">${marked.parse(post.body)}</div>
        </article>`,
      })
    );
  }

  console.log(`Built ${posts.length} posts → dist/`);
}

build();
