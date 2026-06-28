(function () {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const status = document.getElementById('search-status');
  let index = [];

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

  function normalize(text) {
    return text.toLowerCase();
  }

  function matchItem(item, terms) {
    const haystack = normalize(
      [item.title, item.excerpt, item.content, ...(item.tags || [])].join(' ')
    );
    return terms.every((term) => haystack.includes(term));
  }

  function snippet(item, terms) {
    const source = item.excerpt || item.content || '';
    const lower = source.toLowerCase();
    const hit = terms.find((term) => lower.includes(term));
    if (!hit) return escapeHtml(source.slice(0, 120));

    const index = lower.indexOf(hit);
    const start = Math.max(0, index - 40);
    const end = Math.min(source.length, index + hit.length + 80);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < source.length ? '…' : '';
    return prefix + escapeHtml(source.slice(start, end)) + suffix;
  }

  function render(query) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    results.innerHTML = '';

    if (!terms.length) {
      status.textContent = '输入关键词开始搜索';
      return;
    }

    const matched = index.filter((item) => matchItem(item, terms));
    status.textContent = matched.length
      ? `找到 ${matched.length} 篇相关文章`
      : '没有找到匹配的文章';

    results.innerHTML = matched
      .map(
        (item) => `
        <article class="search-result">
          <h2><a href="${item.url}">${escapeHtml(item.title)}</a></h2>
          <time datetime="${item.date}">${formatDate(item.date)}</time>
          <p class="post-excerpt">${snippet(item, terms)}</p>
          ${
            item.tags && item.tags.length
              ? `<p class="tags">${item.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</p>`
              : ''
          }
        </article>`
      )
      .join('');
  }

  fetch('/search-index.json')
    .then((res) => res.json())
    .then((data) => {
      index = data;
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q') || '';
      if (q) {
        input.value = q;
        render(q);
      }
    })
    .catch(() => {
      status.textContent = '搜索索引加载失败';
    });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    render(q);
  });
})();
