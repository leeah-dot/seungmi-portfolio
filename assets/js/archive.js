(function () {
  const { esc, txt, pad, img, coverHTML, bindHoverVideos, reveal } = window.UI;
  const P = window.PROJECTS;
  const bySlug = Object.fromEntries(P.map((p) => [p.slug, p]));
  document.querySelectorAll('[data-count]').forEach((el) => (el.textContent = pad(P.length)));

  /* ---------- Selected Work: 대표 프로젝트 3개, 크게 ---------- */
  document.querySelector('.feature-list').innerHTML = window.FEATURED.map((f, k) => {
    const p = bySlug[f.slug];
    return `
    <a class="feature ${k % 2 ? 'flip' : ''}" href="project.html?p=${p.slug}" data-hover-video>
      <div class="f-media reveal">${coverHTML(p, { eager: k === 0 })}</div>
      <div class="f-text reveal">
        <span class="mono muted">${pad(k + 1)} — ${esc(p.brand || p.company)} · ${esc(p.year)}</span>
        <div class="f-num">${esc(f.n)}</div>
        <div class="f-label">${esc(f.l)}</div>
        <h3 class="f-title">${esc(p.title)}</h3>
        <p class="f-why">${esc(p.impact || '')}</p>
        <span class="f-cta mono">View case →</span>
      </div>
    </a>`;
  }).join('');

  /* ---------- All Projects: 회사(챕터) → 브랜드, 중요도에 따라 리듬 있게 ---------- */
  const MINOR = new Set(window.MINOR || []);
  const fig = (i) => `No. ${pad(i + 1)}`;
  let tabTone = 0;
  // 프로젝트 한 건 = 탭이 달린 서류 한 장
  const sheetTab = (p, i) => `<span class="sheet-tab ${tabTone++ % 2 ? 'blue' : 'pink'}">${fig(i)}<em>${esc(p.brand || p.client)}</em><b>${esc(p.year)}</b></span>`;
  // 모든 프로젝트를 같은 크기의 서류로 — 이미지 + 캡션
  const itemHTML = (p, i) => `
    <a class="sheet ed-item" href="project.html?p=${p.slug}" data-hover-video>
      ${sheetTab(p, i)}
      <div class="ed-media reveal">${coverHTML(p)}</div>
      <div class="ed-cap">
        <h5 class="ed-title">${esc(p.title)}</h5>
        <p class="ed-hl">${esc(p.headline)}</p>
        <p class="ed-role">${esc(p.role)}</p>
        <p class="ed-imp">${esc(p.impact || '')}</p>
        <span class="ed-cta mono">Read the case →</span>
      </div>
    </a>`;
  const minorHTML = (list) => list.length ? `
    <div class="sheet ed-minor">
      <span class="sheet-tab plain">Also in this chapter<b>${pad(list.length)}</b></span>
      ${list.map(([p, i]) => `
      <a class="row" href="project.html?p=${p.slug}" data-i="${i}">
        <span class="t">${esc(p.title)}</span>
        <span class="muted">${esc(p.headline)}</span>
        <span class="y mono">${esc(p.year)}</span>
      </a>`).join('')}
    </div>` : '';
  const block = (items) => {
    const main = items.filter(([p]) => !MINOR.has(p.slug));
    const minor = items.filter(([p]) => MINOR.has(p.slug));
    return (main.length ? `<div class="ed-grid${main.length === 1 ? ' solo' : ''}">${main.map(([p, i]) => itemHTML(p, i)).join('')}</div>` : '') + minorHTML(minor);
  };
  const chapterHTML = (g, n, ci) => {
    const items = P.map((p, i) => [p, i]).filter(([p]) => p.company === g.id);
    if (!items.length) return '';
    const brands = window.BRAND_ORDER.filter((b) => items.some(([p]) => p.brand === b));
    const brandHead = (b, n) => `<div class="brand-head"><span>${esc(b)}</span><span class="mono">${pad(n)}</span></div>`;
    let body = '';
    if (brands.length) {
      // 프로젝트가 1개뿐인 브랜드끼리는 한 줄에 나란히
      for (let k = 0; k < brands.length; k++) {
        const its = items.filter(([p]) => p.brand === brands[k]);
        const next = brands[k + 1] && items.filter(([p]) => p.brand === brands[k + 1]);
        const single = (x) => x && x.length === 1 && !MINOR.has(x[0][0].slug);
        if (single(its) && single(next)) {
          body += `<div class="ed-grid brand-pair">${[[brands[k], its], [brands[k + 1], next]].map(([b, x]) => `<div class="brand-cell">${brandHead(b, 1)}${itemHTML(x[0][0], x[0][1])}</div>`).join('')}</div>`;
          k++;
        } else {
          body += brandHead(brands[k], its.length) + block(its);
        }
      }
    } else {
      body = block(items);
    }
    const tabColor = ci % 2 ? 'pink' : 'blue';
    return `
    <section class="chapter">
      <div class="ftabs" aria-hidden="true"><span class="ftab">Chapter ${pad(ci + 1)}</span><span class="ftab ${tabColor}">${esc(g.kr)}</span>${brands.length > 1 ? `<span class="ftab ${ci % 2 ? 'blue' : 'pink'}">${brands.length} brands</span>` : ''}</div>
      <header class="ch-head reveal">
        <span class="ch-no">${pad(ci + 1)}</span>
        <span class="ch-name">${esc(g.name)}</span>
        <span class="ch-meta"><span>${esc(g.kr)}</span><span class="mono">${esc(g.role)}</span><span class="mono">${esc(g.period)}</span></span>
      </header>
      ${body}
    </section>`;
  };
  const grid = document.querySelector('.grid');
  grid.innerHTML = window.COMPANY_GROUPS.map((g, ci) => chapterHTML(g, 0, ci)).join('');

  // 리스트 보기: 회사 → 브랜드 순 전체 목록
  const rowHTML = (p, i) => `
    <a class="row" href="project.html?p=${p.slug}" data-i="${i}">
      <span class="t">${esc(p.title)}</span>
      <span class="muted">${esc(p.role)}</span>
      <span class="y mono">${esc(p.year)}</span>
    </a>`;
  const index = document.querySelector('.index-body');
  index.innerHTML = window.COMPANY_GROUPS.map((g) => {
    const items = P.map((p, i) => [p, i]).filter(([p]) => p.company === g.id);
    if (!items.length) return '';
    const brands = window.BRAND_ORDER.filter((b) => items.some(([p]) => p.brand === b));
    const body = brands.length
      ? brands.map((b) => `<div class="brand-head"><span>${esc(b)}</span></div>` + items.filter(([p]) => p.brand === b).map(([p, i]) => rowHTML(p, i)).join('')).join('')
      : items.map(([p, i]) => rowHTML(p, i)).join('');
    return `<div class="group-head"><span class="g-name">${esc(g.name)}</span><span class="g-meta"><span>${esc(g.kr)}</span><span class="mono">${esc(g.period)}</span></span></div>` + body;
  }).join('');

  // 브랜드 이름이 흐르는 띠
  const ticker = document.querySelector('.ticker-track');
  if (ticker) {
    const words = ['A’pieu', 'Pilkin', 'VDL', 'CNP', 'Yellow Balloon', 'Twennies', 'Hackers Law School', 'Lotte Duty Free'];
    const line = words.map((w) => `<span>${esc(w)}</span><i>✳︎</i>`).join('');
    ticker.innerHTML = line + line;
  }

  // 리스트 뷰: 커서를 따라다니는 미리보기
  const peek = document.querySelector('.peek');
  if (matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
      peek.style.left = e.clientX + 170 + 'px';
      peek.style.top = e.clientY + 'px';
    });
    document.querySelectorAll('.archive .row').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        peek.innerHTML = coverHTML(P[+row.dataset.i], { eager: true });
        peek.classList.add('on');
      });
      row.addEventListener('mouseleave', () => peek.classList.remove('on'));
    });
  }

  /* ---------- Grid / List ---------- */
  const archive = document.querySelector('.archive');
  const toggle = document.querySelector('.view-toggle');
  function setView(v) {
    archive.dataset.view = v;
    toggle.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === v)));
    try { localStorage.setItem('archive-view', v); } catch (e) {}
  }
  toggle.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) setView(b.dataset.view);
  });
  let savedView = 'grid';
  try { savedView = localStorage.getItem('archive-view') || 'grid'; } catch (e) {}
  setView(savedView === 'index' ? 'index' : 'grid');

  /* ---------- About ---------- */
  const pr = window.PROFILE;
  document.querySelector('.xp').innerHTML = pr.experience.map((x) => `
    <div class="xp-row">
      <div class="co">${esc(x.co)}<span class="team">${esc(x.team)}</span></div>
      <div class="note">${esc(x.note)}</div>
      <div class="pd mono">${txt(x.period)}</div>
    </div>`).join('');
  const li = (arr) => arr.map((a) => `<li><span>${esc(a.t)}</span><span>${esc(a.d)}</span></li>`).join('');
  document.querySelector('[data-edu]').innerHTML = li(pr.education) + li(pr.certs);
  document.querySelector('[data-act]').innerHTML = li(pr.activities);

  /* ---------- Hero 등장: 인트로가 없거나 끝난 뒤 ---------- */
  const hero = document.querySelector('.hero');
  const playHero = () => hero.classList.add('play');
  const intro = document.querySelector('.intro');
  if (!intro || intro.classList.contains('gone')) requestAnimationFrame(playHero);
  else document.addEventListener('intro:leave', () => setTimeout(playHero, 450), { once: true });

  bindHoverVideos(document);
  reveal();
})();

/* ---------- Intro: 폴더 — 클릭하면 표지가 열리고 문서가 꺼내짐 ---------- */
(function () {
  const intro = document.querySelector('.intro');
  if (!intro || intro.classList.contains('gone')) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(() => intro.classList.add('play'));
  intro.focus({ preventScroll: true });

  const open = () => {
    if (intro.classList.contains('opening')) return;
    try { sessionStorage.setItem('intro-seen', '1'); } catch (e) {}
    intro.classList.add('opening');
    const t = reduce ? 0 : 1500;
    setTimeout(() => {
      document.documentElement.classList.remove('intro-lock');
      scrollTo(0, 0);
      intro.classList.add('leaving');
      document.dispatchEvent(new Event('intro:leave'));
      setTimeout(() => intro.classList.add('gone'), reduce ? 0 : 1100);
    }, t);
  };
  intro.addEventListener('click', open);
  intro.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
})();
