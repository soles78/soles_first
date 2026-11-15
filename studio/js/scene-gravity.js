/* 02 중력 — matter-js 물리 + PixiJS 렌더 + Tone.js 충돌음.
   공이 못(peg)에 부딪힐 때마다: 음 재생 · 파티클 · S.counts 집계(→ 다음 장면 D3 차트의 실측 데이터) */
(function (S) {
  const { Engine, Bodies, Body, Composite, Events } = Matter;
  const { animate } = anime;

  let engine = null;
  let container = null;
  let pegs = [];
  let balls = [];
  let t = 0;
  let acc = 0;
  let active = false;
  const DUR = 24;

  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 0.5; // ≈ N(0, ~1)

  function teardown() {
    if (engine) {
      Events.off(engine);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    }
    if (container) {
      container.destroy({ children: true });
      container = null;
    }
    pegs = [];
    balls = [];
    engine = null;
  }

  function build() {
    teardown();
    const W = S.W, H = S.H;
    const n = S.NOTES.length;
    engine = Engine.create();
    engine.gravity.y = 1;
    engine.gravity.scale = Math.max(0.0008, Math.min(0.0016, H / 800 * 0.0011));

    container = new PIXI.Container();
    S.fx.world.addChildAt(container, 0);

    const minDim = Math.min(W, H);
    const margin = W * 0.1;
    const sx = (W - margin * 2) / (n - 1);
    const topY = H * 0.2;
    const botY = H * 0.82;
    const rowGap = Math.max(34, minDim * 0.075);
    const rows = Math.max(5, Math.floor((botY - topY) / rowGap));
    const r = Math.max(3, Math.min(6, minDim * 0.0065));

    for (let row = 0; row < rows; row++) {
      const odd = row % 2 === 1;
      const count = odd ? n - 1 : n;
      for (let c = 0; c < count; c++) {
        const x = margin + (c + (odd ? 0.5 : 0)) * sx;
        const y = topY + row * rowGap;
        const idx = Math.max(0, Math.min(n - 1, Math.round((x - margin) / sx)));
        const body = Bodies.circle(x, y, r, { isStatic: true, label: 'peg', restitution: 0.85, friction: 0 });
        body.plugin = { note: idx };
        body._flash = 0;
        const col = S.noteColorInt(idx);
        const halo = new PIXI.Sprite(S.fx.glow);
        halo.anchor.set(0.5);
        halo.x = x;
        halo.y = y;
        halo.tint = col;
        halo.blendMode = 'add';
        halo._base = (r * 4.5) / 64;
        halo.scale.set(halo._base);
        halo.alpha = 0.4;
        const core = new PIXI.Sprite(S.fx.dot);
        core.anchor.set(0.5);
        core.x = x;
        core.y = y;
        core.tint = col;
        core.width = core.height = r * 2;
        container.addChild(halo, core);
        body._sprite = halo;
        pegs.push(body);
      }
    }
    Composite.add(engine.world, pegs);

    Events.on(engine, 'collisionStart', (ev) => {
      if (!active) return;
      for (const pr of ev.pairs) {
        let peg, ball;
        if (pr.bodyA.label === 'peg' && pr.bodyB.label === 'ball') { peg = pr.bodyA; ball = pr.bodyB; }
        else if (pr.bodyB.label === 'peg' && pr.bodyA.label === 'ball') { peg = pr.bodyB; ball = pr.bodyA; }
        else continue;
        const idx = peg.plugin.note;
        const speed = ball.speed || 0;
        S.counts[idx]++;
        S.audio.hit(idx, 0.3 + Math.min(0.65, speed / 14));
        peg._flash = 1;
        S.fx.burst(peg.position.x, peg.position.y, S.noteColorInt(idx), 4 + ((speed / 3) | 0), 90 + speed * 12);
      }
    });
  }

  function spawn(prog) {
    if (balls.length > 170) return;
    const W = S.W;
    const minDim = Math.min(W, S.H);
    const r = Math.max(4, Math.min(9, minDim * 0.0085)) * (0.8 + Math.random() * 0.5);
    const sigma = W * (0.035 + 0.13 * prog);
    const x = Math.max(W * 0.06, Math.min(W * 0.94, W / 2 + gauss() * sigma));
    const body = Bodies.circle(x, -12, r, {
      label: 'ball', restitution: 0.55, friction: 0.001, frictionAir: 0.004, density: 0.002,
    });
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 1.2, y: 1 });
    const hue = (170 + (t * 14) % 170);
    const color = S.noteColorInt(Math.round(((hue - 170) / 170) * (S.NOTES.length - 1)));
    const sp = new PIXI.Container();
    const halo = new PIXI.Sprite(S.fx.glow);
    halo.anchor.set(0.5);
    halo.blendMode = 'add';
    halo.tint = color;
    halo.scale.set((r * 5) / 64);
    const core = new PIXI.Sprite(S.fx.dot);
    core.anchor.set(0.5);
    core.tint = 0xffffff;
    core.width = core.height = r * 1.6;
    sp.addChild(halo, core);
    container.addChild(sp);
    body._sprite = sp;
    body._color = color;
    Composite.add(engine.world, body);
    balls.push(body);
  }

  S.scenes.gravity = {
    enter() {
      active = true;
      t = 0;
      acc = 0;
      S.counts.fill(0);
      build();
      animate(S.fx.stars, { alpha: 0.3, duration: 1200 });
      S.ui.layer(S.$('p5-layer'), 0, 600);
      S.ui.layer(S.$('d3-layer'), 0, 300);
      S.ui.caption('02 / 04', '중력', 'matter-js가 공을 떨어뜨리고, PixiJS가 그립니다. 못에 부딪히는 순간마다 Tone.js가 음을 울리고 — 그 횟수를 다음 장면에서 D3가 그립니다.');
      S.audio.mix({ pad: 0.7, arp: 0.35, bell: 1, drum: 0.7 }, 2);
    },
    exit() {
      active = false;
      S.ui.hideCaption();
      const c = container;
      if (c) animate(c, { alpha: 0, duration: 500, onComplete: () => { if (!active && container === c) teardown(); } });
    },
    update(dt, st) {
      if (!active || !engine) return;
      t += dt;
      const prog = Math.min(1, st / (DUR * 0.85));
      // 생성 속도: 2.5/초 → 15/초 (점점 고조)
      const rate = 2.5 + 12.5 * prog * prog;
      acc += dt * rate;
      while (acc >= 1) { acc -= 1; spawn(prog); }

      // Matter는 한 스텝이 16.67ms 이하일 때 안정적이므로 서브스텝으로 나눕니다(최대 3회).
      let rest = Math.min(dt, 0.05) * 1000;
      while (rest > 0.01) {
        const step = Math.min(1000 / 60, rest);
        Engine.update(engine, step);
        rest -= step;
      }

      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        const p = b.position;
        if (p.y > S.H + 60 || p.x < -60 || p.x > S.W + 60) {
          Composite.remove(engine.world, b);
          container.removeChild(b._sprite);
          b._sprite.destroy({ children: true });
          balls.splice(i, 1);
          continue;
        }
        b._sprite.x = p.x;
        b._sprite.y = p.y;
        if (Math.random() < 0.06) S.fx.trail(p.x, p.y, b._color);
      }

      for (const g of pegs) {
        g._flash = Math.max(0, g._flash - dt * 3.5);
        const sp = g._sprite;
        sp.scale.set(sp._base * (1 + g._flash * 2.2 + S.pulse * 0.2));
        sp.alpha = 0.4 + g._flash * 0.6 + S.pulse * 0.1;
      }
    },
    rebuild() { if (active) build(); },
  };

  S.onResize.push(() => S.scenes.gravity.rebuild());
})(window.Studio);
