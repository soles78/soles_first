/* fx.js — PixiJS 무대: 별밭 + 파티클 풀. 모든 장면이 공유합니다. */
(function (S) {
  const FX = (S.fx = {
    app: null,
    stars: null,
    world: null,     // 장면별 오브젝트가 올라가는 컨테이너
    glow: null,      // 방사형 글로우 텍스처
    parts: [],
  });

  function makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.25, 'rgba(255,255,255,.55)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return PIXI.Texture.from(c);
  }

  function makeDotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.72, 'rgba(255,255,255,1)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 32, 32);
    return PIXI.Texture.from(c);
  }

  FX.init = async function () {
    const app = new PIXI.Application();
    await app.init({
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      preference: 'webgl',
    });
    S.$('pixi-layer').appendChild(app.canvas);
    FX.app = app;
    FX.glow = makeGlowTexture();
    FX.dot = makeDotTexture();   // 선명한 원(공/못의 코어)

    // 별밭
    FX.stars = new PIXI.Container();
    FX.starList = [];
    for (let i = 0; i < 320; i++) {
      const s = new PIXI.Sprite(FX.glow);
      s.anchor.set(0.5);
      const depth = Math.random();
      s.scale.set(0.06 + depth * 0.22);
      s.tint = [0x9fd8ff, 0xffffff, 0xffb3f6, 0xfff0b3][(Math.random() * 4) | 0];
      s.blendMode = 'add';
      s.x = Math.random() * S.W;
      s.y = Math.random() * S.H;
      s._d = depth;
      s._ph = Math.random() * Math.PI * 2;
      FX.stars.addChild(s);
      FX.starList.push(s);
    }
    app.stage.addChild(FX.stars);

    FX.world = new PIXI.Container();
    app.stage.addChild(FX.world);

    app.ticker.add((tk) => FX.update(tk.deltaMS / 1000));

    S.onResize.push(() => {
      FX.starList.forEach((s) => {
        s.x = Math.random() * S.W;
        s.y = Math.random() * S.H;
      });
    });
  };

  /** 한 점에서 퍼지는 파티클 */
  FX.burst = function (x, y, color, n = 8, speed = 160) {
    if (FX.parts.length > 900) return;
    for (let i = 0; i < n; i++) {
      const s = new PIXI.Sprite(FX.glow);
      s.anchor.set(0.5);
      s.blendMode = 'add';
      s.tint = color;
      s.x = x;
      s.y = y;
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.9);
      s._p = {
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - speed * 0.25,
        life: 0,
        max: 0.5 + Math.random() * 0.7,
        s0: 0.12 + Math.random() * 0.16,
        g: 140,
      };
      s.scale.set(s._p.s0);
      FX.world.addChild(s);
      FX.parts.push(s);
    }
  };

  /** 아래에서 위로 흩날리는 불씨 (오버추어/아웃트로용) */
  FX.embers = function (n = 1) {
    for (let i = 0; i < n; i++) {
      FX.burst(Math.random() * S.W, S.H + 10, [0x38e8ff, 0xff3df0, 0xffc857][(Math.random() * 3) | 0], 1, 40);
      const s = FX.parts[FX.parts.length - 1];
      if (s) { s._p.vy = -(50 + Math.random() * 110); s._p.vx = (Math.random() - 0.5) * 40; s._p.max = 3 + Math.random() * 2; s._p.g = -8; }
    }
  };

  /** 움직이는 물체 뒤에 남는 짧은 꼬리 */
  FX.trail = function (x, y, color) {
    if (FX.parts.length > 900) return;
    FX.burst(x, y, color, 1, 6);
    const s = FX.parts[FX.parts.length - 1];
    if (s) { s._p.max = 0.35 + Math.random() * 0.25; s._p.s0 = 0.07; s._p.g = 0; s.scale.set(0.07); }
  };

  let time = 0;
  FX.update = function (dt) {
    time += dt;
    S.pulse = Math.max(0, S.pulse - dt * 3.2);

    // 별: 느린 표류 + 반짝임 + 박자 펄스
    const stars = FX.starList;
    if (stars && FX.stars.alpha > 0.01) {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y -= (4 + s._d * 18) * dt;
        s.x += (s._d - 0.5) * 6 * dt;
        if (s.y < -10) { s.y = S.H + 10; s.x = Math.random() * S.W; }
        s.alpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * (0.8 + s._d * 1.6) + s._ph)) + S.pulse * 0.25 * s._d;
      }
    }

    // 파티클
    for (let i = FX.parts.length - 1; i >= 0; i--) {
      const s = FX.parts[i];
      const p = s._p;
      p.life += dt;
      if (p.life >= p.max) {
        FX.world.removeChild(s);
        s.destroy();
        FX.parts.splice(i, 1);
        continue;
      }
      const k = p.life / p.max;
      p.vy += p.g * dt;
      s.x += p.vx * dt;
      s.y += p.vy * dt;
      s.alpha = 1 - k;
      s.scale.set(p.s0 * (1 - k * 0.6));
    }
  };
})(window.Studio);
