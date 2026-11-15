/* main.js — 감독: 장면 순서·시간·진행바·단축키 */
(async function (S) {
  const { animate } = anime;
  const q = new URLSearchParams(location.search);

  const scenes = [
    { id: 'overture', mod: S.scenes.overture, dur: 9, uses: ['anime', 'pixi', 'tone'] },
    { id: 'flow', mod: S.scenes.flow, dur: 20, uses: ['p5', 'tone', 'anime'] },
    { id: 'gravity', mod: S.scenes.gravity, dur: 24, uses: ['matter', 'pixi', 'tone'] },
    { id: 'data', mod: S.scenes.data, dur: 16, uses: ['d3', 'anime', 'tone'] },
    { id: 'outro', mod: S.scenes.outro, dur: 9, uses: ['anime', 'p5', 'matter', 'pixi', 'tone', 'd3'] },
  ];
  let acc = 0;
  scenes.forEach((s) => { s.start = acc; acc += s.dur; });
  const TOTAL = acc;

  const D = (S.director = { scenes, TOTAL, idx: -1, t: 0, running: false });

  const barEl = S.$('bar');
  const fillEl = barEl.querySelector('i');
  scenes.slice(1).forEach((s) => {
    const m = document.createElement('b');
    m.style.left = (s.start / TOTAL) * 100 + '%';
    barEl.appendChild(m);
  });

  D.goto = (i) => {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    if (D.idx >= 0) scenes[D.idx].mod.exit();
    D.idx = i;
    D.t = scenes[i].start;
    S.ui.flash();
    S.ui.pills(scenes[i].uses);
    scenes[i].mod.enter();
  };

  D.play = async () => {
    document.body.classList.add('running');
    S.audio.start();
    D.running = true;
    D.idx = -1;
    D.goto(0);
  };

  D.tick = (dt) => {
    if (!D.running) return;
    D.t = Math.min(TOTAL, D.t + dt);
    const sc = scenes[D.idx];
    sc.mod.update(dt, D.t - sc.start);
    if (D.t >= sc.start + sc.dur && D.idx < scenes.length - 1) D.goto(D.idx + 1);
    fillEl.style.width = (D.t / TOTAL) * 100 + '%';
  };

  /* ---------- 부팅 ---------- */
  const startBtn = S.$('startBtn');
  const errEl = S.$('err');
  startBtn.disabled = true;
  startBtn.textContent = '불러오는 중…';

  try {
    await S.fx.init();
    S.scenes.flow.init();
    S.fx.app.ticker.add((tk) => D.tick(Math.min(tk.deltaMS / 1000, 0.1)));
    startBtn.disabled = false;
    startBtn.textContent = '▶ 재생';
  } catch (e) {
    console.error(e);
    errEl.textContent = '그래픽을 시작하지 못했습니다(WebGL 필요). 최신 Chrome·Edge·Firefox·Safari에서 열어 주세요.';
    startBtn.textContent = '재생 불가';
    return;
  }

  // 오디오가 막혀도 영상은 멈추지 않도록 대기 시간에 상한을 둡니다(초과 시 무음 진행).
  const audioReady = () => Promise.race([S.audio.init(), new Promise((r) => setTimeout(() => r(false), 4000))]);

  async function begin() {
    startBtn.disabled = true;
    await audioReady(); // 사용자 제스처 안에서 호출되어야 소리가 납니다.
    animate(S.$('start'), {
      opacity: 0, duration: 600, ease: 'outQuad',
      onComplete: () => { S.$('start').style.display = 'none'; },
    });
    D.play();
  }
  startBtn.addEventListener('click', begin);
  S.$('replay').addEventListener('click', () => { S.audio.start(); D.goto(0); });

  const muteBtn = S.$('mute');
  let muted = false;
  const toggleMute = () => {
    muted = !muted;
    S.audio.mute(muted);
    muteBtn.textContent = muted ? '소리 켜기' : '소리 끄기';
    muteBtn.setAttribute('aria-pressed', String(muted));
  };
  muteBtn.addEventListener('click', toggleMute);

  barEl.addEventListener('click', (e) => {
    if (!D.running) return;
    const r = barEl.getBoundingClientRect();
    const t = ((e.clientX - r.left) / r.width) * TOTAL;
    D.goto(scenes.findIndex((s) => t >= s.start && t < s.start + s.dur));
  });

  window.addEventListener('keydown', (e) => {
    if (!D.running) return;
    if (e.key >= '1' && e.key <= '5') D.goto(Number(e.key) - 1);
    else if (e.key === 'r' || e.key === 'R') { S.audio.start(); D.goto(0); }
    else if (e.key === 'm' || e.key === 'M') toggleMute();
  });

  // 개발/검증용: ?auto=1 로 클릭 없이 시작, &scene=N(0~4) 으로 해당 장면부터 시작
  if (q.get('auto') === '1') {
    S.$('start').style.display = 'none';
    await audioReady();
    document.body.classList.add('running');
    S.audio.start();
    D.running = true;
    D.idx = -1;
    D.goto(Number(q.get('scene') || 0));
  }
})(window.Studio);
