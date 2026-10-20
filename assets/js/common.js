(function () {
  const TODO_LABEL = '[내용 추가 필요]';

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // 텍스트를 이스케이프하고, [... 필요] 형태의 표기는 강조 태그로 감싼다.
  const txt = (s) => {
    if (s === null || s === undefined || s === '') return `<span class="todo">${TODO_LABEL}</span>`;
    return esc(s).replace(/\[[^\]]*필요[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`);
  };

  const img = (name) => `assets/img/${name}.jpg`;
  const vid = (name) => `assets/video/${name}.mp4`;
  const pad = (n) => String(n).padStart(2, '0');

  // 커버 렌더링 — type: img | trio | duo | text
  function coverHTML(p, { eager = false } = {}) {
    const c = p.cover;
    const loading = 'eager';
    const alt = esc(p.title);
    if (c.type === 'text') {
      return `<div class="cover text" style="background:${c.bg};color:${c.fg}"><span>${esc(c.text)}</span></div>`;
    }
    if (c.type === 'trio' || c.type === 'duo') {
      const units = c.videos
        ? c.videos.map((v) => `<div class="unit"><video muted loop playsinline preload="none" poster="${img(v)}" data-src="${vid(v)}" aria-label="${alt} 광고 소재"></video></div>`)
        : c.imgs.map((s) => `<div class="unit"><img src="${img(s)}" alt="${alt}" loading="${loading}"></div>`);
      return `<div class="cover set ${c.type}">${units.join('')}</div>`;
    }
    const cls = c.fit === 'contain' ? 'fit' : 'fill';
    return `<div class="cover"><img class="${cls}" src="${img(c.src)}" alt="${alt}" loading="${loading}"></div>`;
  }

  // 커버 안의 영상은 마우스를 올렸을 때만 재생
  function bindHoverVideos(root) {
    root.querySelectorAll('[data-hover-video]').forEach((el) => {
      const videos = [...el.querySelectorAll('video[data-src]')];
      if (!videos.length) return;
      el.addEventListener('mouseenter', () => {
        videos.forEach((v) => {
          if (!v.src) v.src = v.dataset.src;
          v.play().catch(() => {});
        });
      });
      el.addEventListener('mouseleave', () => videos.forEach((v) => v.pause()));
    });
  }

  function reveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((e) => io.observe(e));
  }

  window.UI = { esc, txt, img, vid, pad, coverHTML, bindHoverVideos, reveal, TODO_LABEL };
})();
