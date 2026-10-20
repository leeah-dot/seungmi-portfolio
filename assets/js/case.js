(function () {
  const { esc, txt, pad, img, vid, coverHTML, bindHoverVideos, reveal } = window.UI;
  const P = window.PROJECTS;
  const slug = new URLSearchParams(location.search).get('p');
  let idx = P.findIndex((p) => p.slug === slug);
  if (idx < 0) idx = 0;
  const p = P[idx];
  const next = P[(idx + 1) % P.length];
  const prev = P[(idx - 1 + P.length) % P.length];
  const catLabel = Object.fromEntries(window.CATEGORIES.map((c) => [c.id, c.label]));

  document.title = `${p.title} — 이승미`;

  const section = (no, label, inner) => `
    <section class="case-section section">
      <div class="split">
        <div class="label"><span class="mono muted">${no}</span><h2>${label}</h2></div>
        <div class="body">${inner}</div>
      </div>
    </section>`;

  const prose = (arr) => (arr && arr.length ? `<div class="prose">${arr.map((s) => `<p>${txt(s)}</p>`).join('')}</div>` : `<div class="prose">${txt(null)}</div>`);
  const list = (arr) =>
    arr && arr.length
      ? `<ul class="list">${arr.map((s, i) => `<li><span class="mono">${pad(i + 1)}</span><span>${txt(s)}</span></li>`).join('')}</ul>`
      : `<div class="prose">${txt(null)}</div>`;
  const steps = (arr) =>
    arr && arr.length
      ? `<div class="steps">${arr.map((s, i) => `<div class="step"><span class="mono muted">Step ${pad(i + 1)}</span><h3>${txt(s.h)}</h3><p>${txt(s.p)}</p></div>`).join('')}</div>`
      : `<div class="prose">${txt(null)}</div>`;
  const results = (arr, notes) =>
    (arr && arr.length
      ? `<div class="results">${arr.map((r) => `<div class="result"><div class="n">${esc(r.n)}</div><div class="l">${txt(r.l)}</div></div>`).join('')}</div>`
      : `<div class="prose">${txt(null)}</div>`) +
    (notes && notes.length ? `<ul class="notes">${notes.map((n) => `<li>${txt(n)}</li>`).join('')}</ul>` : '');

  const gallery = (p.gallery || [])
    .map((g) => {
      const cls = g.wide ? 'g-wide' : '';
      let media;
      if (g.yt) {
        // 유튜브 임베드 (start: 초 단위 시작 지점)
        const q = `rel=0${g.start ? `&start=${g.start}` : ''}`;
        media = `<iframe src="https://www.youtube-nocookie.com/embed/${esc(g.yt)}?${q}" title="${esc(g.cap || p.title)}" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      } else if (g.video) {
        // poster 이미지가 없는 영상은 첫 프레임을 미리보기로 사용
        media = g.poster === false
          ? `<video src="${vid(g.video)}#t=0.1" controls muted playsinline preload="metadata"></video>`
          : `<video src="${vid(g.video)}" poster="${img(g.video)}" controls muted playsinline preload="none"></video>`;
      } else {
        media = `<img src="${img(g.img)}" alt="${esc(g.cap || p.title)}" loading="lazy" data-zoom>`;
      }
      return `<figure class="${cls}"><div class="g-media${g.yt ? ' yt' : ''}">${media}</div>${g.cap ? `<figcaption class="mono">${esc(g.cap)}</figcaption>` : ''}</figure>`;
    })
    .join('');

  // 휴대폰 목업 쇼케이스 (광고 소재 · 릴스)
  const phone = (m) => `<div class="phone"><div class="screen">${
    m.video
      ? `<video src="${vid(m.video)}" poster="${img(m.video)}" muted loop playsinline preload="metadata" data-autoplay></video>`
      : `<img src="${img(m.img)}" alt="${esc((m.title || '').replace(/\n/g, ' '))}" loading="lazy">`
  }</div></div>`;
  const showcase = p.showcase ? `
    <section class="showcase">
      <div class="sc-tab"><span>${esc(p.showcase.tab)}</span><span class="sc-arrow" aria-hidden="true">⟶</span></div>
      <div class="sc-panel">
        <div class="sc-items">
          ${p.showcase.items.map((m) => `
          <div class="sc-item reveal">
            <div class="sc-text">
              <h3>${esc(m.title).replace(/\n/g, '<br>')}</h3>
              <span class="sc-line" aria-hidden="true"></span>
              <span class="sc-seg mono">${esc(m.seg)}</span>
              <p>${esc(m.desc)}</p>
            </div>
            ${phone(m)}
          </div>`).join('')}
        </div>
        ${(p.showcase.notes || []).map((n, k) => `
        <div class="sc-note n${k + 1}"><span class="sc-ntab">${esc(n.tab)} <span aria-hidden="true">⟶</span></span><p>${esc(n.text)}</p></div>`).join('')}
      </div>
    </section>` : '';

  const links = (p.links || []).length
    ? section('↗', 'Links', `<ul class="links">${p.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener"><span>${esc(l.label)}</span><span class="mono">Open ↗</span></a></li>`).join('')}</ul>`)
    : '';

  document.getElementById('case').innerHTML = `
    <div class="case-top mono">
      <a href="index.html#archive">← Archive</a>
      <span>${pad(idx + 1)} / ${pad(P.length)}</span>
    </div>

    <div class="case-hero">
      <div class="ftabs" aria-hidden="true"><span class="ftab">${esc(p.company)}</span>${p.brand ? `<span class="ftab blue">${esc(p.brand)}</span>` : ''}<span class="ftab pink">${esc(p.year)}</span></div>
      <span class="mono muted">${p.cats.map((c) => esc(catLabel[c])).join(' · ')}</span>
      <h1 class="case-title">${esc(p.title)}</h1>
      <div class="case-en mono">${esc(p.titleEn)}</div>
      <dl class="case-meta">
        <div><dt class="mono">Client</dt><dd>${txt(p.client)}</dd></div>
        <div><dt class="mono">Company</dt><dd>${txt(p.company)}</dd></div>
        <div><dt class="mono">Period</dt><dd>${txt(p.period)}</dd></div>
        <div><dt class="mono">Role</dt><dd>${txt(p.role)}</dd></div>
        <div><dt class="mono">Scope</dt><dd>${txt(p.roleDetail)}</dd></div>
        <div><dt class="mono">Channel</dt><dd>${p.channels.map(esc).join(', ')}</dd></div>
        <div><dt class="mono">Key Result</dt><dd>${txt(p.headline)}</dd></div>
        <div><dt class="mono">Year</dt><dd>${esc(p.year)}</dd></div>
      </dl>
    </div>

    <div class="case-cover" data-hover-video>${coverHTML(p, { eager: true })}</div>

    <section class="section" style="margin-top:clamp(48px,6vw,88px)">
      <div class="split" style="padding-top:0">
        <div class="label mono muted">Overview</div>
        <div class="body"><p class="case-lead">${txt(p.summary)}</p></div>
      </div>
    </section>

    ${p.why ? `
    <section class="whybox section">
      <div class="wb why"><span class="wb-tab">Why</span><p>${txt(p.why)}</p></div>
      <div class="wb so"><span class="wb-tab">So what</span><p>${txt(p.impact)}</p></div>
    </section>` : ''}

    ${section('01', 'Background', prose(p.background))}
    ${section('02', 'Problem', list(p.problem))}
    ${section('03', 'My Role', list(p.myRole))}
    ${section('04', 'Approach', steps(p.approach))}
    ${showcase}
    ${section('05', 'Result', results(p.results, p.resultNotes))}
    ${section('06', 'Learnings', list(p.learnings))}

    ${gallery ? `<section class="case-section section"><div class="split"><div class="label"><span class="mono muted">07</span><h2>Gallery</h2></div><div class="body mono muted">이미지를 클릭하면 크게 볼 수 있습니다.</div></div></section><div class="gallery">${gallery}</div>` : ''}

    ${links}

    <a class="next" href="project.html?p=${next.slug}">
      <span class="mono muted">Next project — ${pad(((idx + 1) % P.length) + 1)}</span>
      <span class="t">${esc(next.title)} <span class="arrow">→</span></span>
    </a>
  `;

  // 이전/다음 키보드 이동
  addEventListener('keydown', (e) => {
    if (lb.classList.contains('on')) { if (e.key === 'Escape') close(); return; }
    if (e.key === 'ArrowRight') location.href = `project.html?p=${next.slug}`;
    if (e.key === 'ArrowLeft') location.href = `project.html?p=${prev.slug}`;
  });

  // 라이트박스
  const lb = document.querySelector('.lightbox');
  const lbImg = lb.querySelector('img');
  const close = () => lb.classList.remove('on');
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-zoom]');
    if (t) { lbImg.src = t.src; lbImg.alt = t.alt; lb.classList.add('on'); }
  });
  lb.addEventListener('click', close);

  // 쇼케이스 영상: 화면에 보일 때만 재생
  const autos = document.querySelectorAll('video[data-autoplay]');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.4 });
    autos.forEach((v) => vio.observe(v));
  }

  // 갤러리: 세로형(릴스) 이미지·영상은 휴대폰 안에 넣어서 보여줌
  const toPhone = (fig, el, w, h) => {
    if (!w || h / w < 1.55 || fig.classList.contains('reel')) return;
    const ph = document.createElement('div');
    ph.className = 'phone';
    ph.innerHTML = '<div class="screen"></div>';
    el.parentNode.insertBefore(ph, el);
    ph.firstChild.appendChild(el);
    fig.classList.add('reel');
  };
  document.querySelectorAll('.gallery figure').forEach((fig) => {
    const el = fig.querySelector('img, video');
    if (!el) return;
    if (el.tagName === 'IMG') {
      const go = () => toPhone(fig, el, el.naturalWidth, el.naturalHeight);
      el.complete ? go() : el.addEventListener('load', go, { once: true });
    } else {
      const go = () => toPhone(fig, el, el.videoWidth, el.videoHeight);
      el.readyState >= 1 ? go() : el.addEventListener('loadedmetadata', go, { once: true });
    }
  });

  bindHoverVideos(document);
  // 케이스 상단 커버 영상은 자동 재생 (모션 최소화 설정 존중)
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.case-cover video[data-src]').forEach((v) => { v.src = v.dataset.src; v.play().catch(() => {}); });
  }
  reveal();
})();
