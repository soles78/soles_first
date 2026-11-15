/* core.js — 전역 네임스페이스, 공용 상태, UI 헬퍼 (anime.js 사용) */
(function () {
  const { animate, stagger } = anime;

  const S = (window.Studio = {
    W: window.innerWidth,
    H: window.innerHeight,
    // A 마이너 펜타토닉 + 9도(11음). 물리 장면의 충돌음이자 D3 차트의 x축입니다.
    NOTES: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5'],
    pulse: 0,            // 킥 박자마다 1로 튀었다가 감쇠하는 공용 값(비주얼이 음악에 반응)
    counts: null,        // 물리 장면에서 실제로 측정한 음별 충돌 횟수
    scenes: {},
    ui: {},
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
  S.counts = new Array(S.NOTES.length).fill(0);

  const $ = (id) => document.getElementById(id);
  S.$ = $;

  // 음 번호 → 색. 물리 장면의 못(peg)과 D3 차트의 막대가 같은 색을 씁니다.
  const ramp = d3.interpolateRgb('#38e8ff', '#ff3df0');
  S.noteColor = (i) => ramp(i / (S.NOTES.length - 1));
  S.noteColorInt = (i) => parseInt(d3.color(S.noteColor(i)).formatHex().slice(1), 16);

  const titleEl = $('title');
  const subEl = $('sub');
  const credEl = $('credits');
  const replayEl = $('replay');
  const capEl = $('caption');

  // 같은 요소에 등장/퇴장 애니메이션이 겹치면 늦게 끝나는 쪽이 이기므로, 키별로 이전 것을 취소합니다.
  const live = {};
  const run = (key, targets, params) => {
    if (live[key]) live[key].cancel();
    live[key] = animate(targets, params);
    return live[key];
  };

  /* ---------- 레이어 ---------- */
  S.ui.layer = (el, opacity, duration = 800) =>
    animate(el, { opacity: opacity, duration, ease: 'outQuad' });

  /* ---------- 타이틀 ---------- */
  S.ui.title = (text, sub) => {
    titleEl.innerHTML = '';
    [...text].forEach((ch) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      titleEl.appendChild(s);
    });
    subEl.textContent = sub || '';
    const spans = titleEl.querySelectorAll('span');
    run('titleSpans', spans, {
      opacity: [0, 1],
      translateY: [60, 0],
      rotateX: [-95, 0],
      delay: stagger(65),
      duration: 1100,
      ease: 'outExpo',
    });
    run('sub', subEl, { opacity: [0, 1], translateY: [14, 0], delay: 900, duration: 1200, ease: 'outQuad' });
  };

  S.ui.hideTitle = (duration = 700) => {
    const spans = titleEl.querySelectorAll('span');
    if (spans.length) {
      run('titleSpans', spans, { opacity: 0, translateY: -30, delay: stagger(25), duration, ease: 'inQuad' });
    }
    run('sub', subEl, { opacity: 0, duration: duration * 0.7 });
    if (live.credKids) live.credKids.cancel();
    run('cred', credEl, { opacity: 0, duration: duration * 0.7 });
    run('replay', replayEl, { opacity: 0, duration: duration * 0.7 });
    replayEl.style.pointerEvents = 'none';
  };

  S.ui.credits = (items) => {
    credEl.innerHTML = '';
    items.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      credEl.appendChild(li);
    });
    run('credKids', credEl.children, {
      opacity: [0, 1],
      translateY: [16, 0],
      delay: stagger(90, { start: 1400 }),
      duration: 800,
      ease: 'outQuad',
    });
    run('cred', credEl, { opacity: 1, duration: 10 });
  };

  S.ui.replay = (show) => {
    run('replay', replayEl, { opacity: show ? 1 : 0, delay: show ? 2600 : 0, duration: 700 });
    replayEl.style.pointerEvents = show ? 'auto' : 'none';
  };

  /* ---------- 자막 ---------- */
  S.ui.caption = (no, head, desc) => {
    capEl.querySelector('.no').textContent = no;
    capEl.querySelector('.head').textContent = head;
    capEl.querySelector('.desc').textContent = desc;
    animate(capEl, { opacity: [0, 1], translateY: [24, 0], duration: 900, delay: 350, ease: 'outExpo' });
  };
  S.ui.hideCaption = () => animate(capEl, { opacity: 0, duration: 400 });

  /* ---------- 사용 중인 라이브러리 표시 ---------- */
  const LIBS = [
    ['anime', 'anime.js'],
    ['p5', 'p5.js'],
    ['matter', 'matter-js'],
    ['pixi', 'PixiJS'],
    ['tone', 'Tone.js'],
    ['d3', 'D3'],
  ];
  const pillsEl = $('pills');
  const pillMap = {};
  LIBS.forEach(([key, label]) => {
    const p = document.createElement('span');
    p.className = 'pill';
    p.textContent = label;
    pillsEl.appendChild(p);
    pillMap[key] = p;
  });
  S.ui.pills = (keys) => {
    Object.entries(pillMap).forEach(([k, el]) => el.classList.toggle('on', keys.includes(k)));
  };

  /* ---------- 화면 전환 페이드 ---------- */
  S.ui.flash = () => {
    const f = $('fade');
    animate(f, { opacity: [0.85, 0], duration: 900, ease: 'outQuad' });
  };

  window.addEventListener('resize', () => {
    S.W = window.innerWidth;
    S.H = window.innerHeight;
    (S.onResize || []).forEach((fn) => fn());
  });
  S.onResize = [];
})();
