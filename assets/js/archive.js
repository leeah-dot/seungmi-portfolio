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

/* ---------- v2 디벨롭: 내비 · 사원증 · 타임라인 · 카운트업 · Contact ---------- */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = window.UI.esc;

  // 인트로 픽셀 손 커서 (도트로 그림)
  const hand = document.querySelector('.pixel-hand');
  if (hand) {
    const rows = [
      '....XX..........', '...XooX.........', '...XooX.........', '...XooX.........',
      '...XooXXX.......', '...XooXooXXX....', '.XXXooXooXooXX..', 'XooXooooooooXoX.',
      'XooXoooooooooooX', '.XoooooooooooooX', '..XooooooooooooX', '..XoooooooooooX.',
      '...XooooooooooX.', '....XoooooooooX.', '.....XooooooooX.', '.....XXXXXXXXXX.',
    ];
    let out = '';
    rows.forEach((r, y) => [...r].forEach((c, x) => {
      if (c === 'X') out += `<rect x="${x}" y="${y}" width="1" height="1" fill="#121212"/>`;
      if (c === 'o') out += `<rect x="${x}" y="${y}" width="1" height="1" fill="#fff"/>`;
    }));
    hand.setAttribute('viewBox', '0 0 16 16');
    hand.innerHTML = out;
  }

  // 진행 바 · 스크롤 상태 · 현재 섹션 표시
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.progress span');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
    header && header.classList.toggle('scrolled', scrollY > 40);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const pill = document.querySelector('.nav-pill');
  const ind = pill && pill.querySelector('.nav-ind');
  const links = pill ? [...pill.querySelectorAll('a')] : [];
  const moveInd = (a) => {
    if (!ind) return;
    if (!a) { ind.style.opacity = 0; return; }
    ind.style.opacity = 1;
    ind.style.left = a.offsetLeft + 'px';
    ind.style.width = a.offsetWidth + 'px';
  };
  const ids = ['work', 'archive', 'about', 'contact'];
  const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
  const pickActive = () => {
    let cur = null;
    secs.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.45) cur = s.id; });
    moveInd(links.find((a) => a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', pickActive, { passive: true });
  addEventListener('resize', pickActive);
  pickActive();

  // 모바일 메뉴
  const mbtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (mbtn && menu) {
    const open = (v) => {
      menu.hidden = !v;
      mbtn.setAttribute('aria-expanded', String(v));
      document.documentElement.style.overflow = v ? 'hidden' : '';
      if (v) menu.querySelector('a').focus(); else mbtn.focus();
    };
    mbtn.addEventListener('click', () => open(true));
    menu.querySelector('.menu-close').addEventListener('click', () => open(false));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => open(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) open(false); });
  }

  // 사원증: 포인터에 따라 진자처럼 흔들림 + 눌러서 뒤집기
  const wrap = document.querySelector('.badge-wrap');
  const badge = document.querySelector('.badge');
  if (badge) {
    badge.addEventListener('click', () => badge.setAttribute('aria-pressed', String(badge.getAttribute('aria-pressed') !== 'true')));
  }
  if (wrap && !reduce) {
    let angle = 0, vel = 0, target = 0, last = null;
    addEventListener('pointermove', (e) => {
      const r = wrap.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const cx = r.left + r.width / 2;
      target = Math.max(-1, Math.min(1, (e.clientX - cx) / 400)) * 9;
      if (last !== null) vel += (e.clientX - last) * 0.012;
      last = e.clientX;
    }, { passive: true });
    const tick = () => {
      vel += (target - angle) * 0.035;
      vel *= 0.9;
      angle += vel;
      wrap.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // 경력 타임라인: 학력 추가 + Next 카드 + 스크롤에 따라 선 그리기
  const xp = document.querySelector('.xp');
  if (xp) {
    (window.PROFILE.education || []).forEach((ed) => {
      xp.insertAdjacentHTML('beforeend', `<div class="xp-row"><div class="co">${esc(ed.t)}<span class="team">학력</span></div><div class="note"></div><div class="pd mono">${esc(ed.d)}</div></div>`);
    });
    xp.insertAdjacentHTML('afterbegin', '<span class="xp-fill" aria-hidden="true"></span>');
    xp.insertAdjacentHTML('beforeend', '<div class="xp-next"><strong>Next — 함께할 <em>팀?</em></strong><a class="mono" href="#contact">Contact →</a></div>');
    const rows = [...xp.querySelectorAll('.xp-row')];
    const draw = () => {
      const r = xp.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.7 - r.top) / r.height));
      xp.style.setProperty('--tl', reduce ? 1 : p);
      const lineY = r.top + r.height * (reduce ? 1 : p);
      rows.forEach((row) => row.classList.toggle('on', row.getBoundingClientRect().top + 24 <= lineY));
    };
    addEventListener('scroll', draw, { passive: true });
    addEventListener('resize', draw);
    draw();
  }

  // 대표 숫자 카운트업 (보일 때 한 번, 1.4초)
  const nums = document.querySelectorAll('.f-num');
  const countUp = (el) => {
    const raw = el.textContent;
    const m = raw.match(/[\d.,]+/);
    if (!m || reduce) return;
    const str = m[0], val = parseFloat(str.replace(/,/g, '')), dec = (str.split('.')[1] || '').length;
    const pre = raw.slice(0, m.index), post = raw.slice(m.index + str.length);
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (val * e).toFixed(dec) + post;
      if (k < 1) requestAnimationFrame(step); else el.textContent = raw;
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } }), { threshold: 0.6 });
    nums.forEach((n) => io.observe(n));
  }

  // Contact: 글자마다 통통 + 이메일 복사
  document.querySelectorAll('.contact-title .bounce').forEach((w) => {
    w.innerHTML = [...w.textContent].map((c) => `<span class="ch" aria-hidden="true">${esc(c)}</span>`).join('');
  });
  document.querySelectorAll('.contact-title .ch').forEach((c) => {
    c.addEventListener('pointerdown', () => { c.classList.add('pop'); setTimeout(() => c.classList.remove('pop'), 450); });
  });
  const chip = document.querySelector('.copy-chip');
  if (chip) {
    chip.addEventListener('click', () => {
      const text = chip.dataset.copy;
      const done = () => { chip.textContent = '복사됨 ✓'; chip.classList.add('copied'); setTimeout(() => { chip.textContent = 'Copy'; chip.classList.remove('copied'); }, 1800); };
      const fallback = () => {
        const r = document.createRange();
        r.selectNodeContents(document.querySelector('.contact-mail'));
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        chip.textContent = '선택됨 — ⌘C로 복사';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    });
  }
})();
