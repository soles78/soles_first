/* 01 흐름 — p5.js 노이즈 플로우 필드 (인스턴스 모드, 자체 캔버스) */
(function (S) {
  let p5i = null;
  let running = false;
  let resetBg = false;
  const N = 1500;

  function sketch(p) {
    let pts = [];
    let t = 0;

    const spawn = (o) => {
      o.x = p.random(p.width);
      o.y = p.random(p.height);
      o.px = o.x;
      o.py = o.y;
      o.life = p.random(80, 260);
      return o;
    };

    p.setup = () => {
      p.createCanvas(S.W, S.H);
      p.pixelDensity(1);
      p.colorMode(p.HSB, 360, 100, 100, 1);
      p.noiseDetail(3, 0.5);
      p.background(250, 70, 6);
      pts = Array.from({ length: N }, () => spawn({}));
      p.noLoop();
    };

    p.windowResized = () => p.resizeCanvas(S.W, S.H);

    p.draw = () => {
      if (resetBg) { p.background(250, 70, 6); resetBg = false; }
      const dt = Math.min(p.deltaTime / 1000, 0.05);
      t += dt * 0.18;

      // 꼬리: 반투명 사각형으로 서서히 지웁니다.
      p.noStroke();
      p.fill(250, 70, 6, 0.07);
      p.rect(0, 0, p.width, p.height);

      const pulse = S.pulse;
      p.strokeWeight(1 + pulse * 1.6);
      const sc = 0.0017;
      for (const o of pts) {
        const n = p.noise(o.x * sc, o.y * sc, t);
        const a = n * p.TWO_PI * 2.2;
        o.px = o.x;
        o.py = o.y;
        o.x += Math.cos(a) * (1.7 + pulse * 1.8);
        o.y += Math.sin(a) * (1.7 + pulse * 1.8);
        const hue = (170 + n * 200 + t * 40) % 360;
        p.stroke(hue, 65, 100, 0.45 + pulse * 0.4);
        p.line(o.px, o.py, o.x, o.y);
        if (--o.life < 0 || o.x < 0 || o.x > p.width || o.y < 0 || o.y > p.height) spawn(o);
      }
    };
  }

  S.scenes.flow = {
    init() {
      p5i = new p5(sketch, S.$('p5-layer'));
    },
    enter() {
      running = true;
      resetBg = true;
      if (p5i) p5i.loop();
      S.ui.layer(S.$('p5-layer'), 1, 1200);
      anime.animate(S.fx.stars, { alpha: 0, duration: 800 });
      S.ui.caption('01 / 04', '흐름', 'p5.js 노이즈 필드 위를 1,500개의 점이 흐릅니다. 선의 굵기와 밝기는 킥 드럼(Tone.js)의 박자에 반응합니다.');
      S.audio.mix({ pad: 0.8, arp: 0.7, bell: 0, drum: 0 }, 2);
      setTimeout(() => running && S.audio.mix({ drum: 0.55 }, 4), 7000);
    },
    exit() {
      running = false;
      S.ui.hideCaption();
      S.ui.layer(S.$('p5-layer'), 0, 900);
      setTimeout(() => { if (!running && p5i) p5i.noLoop(); }, 1000);
    },
    update() {},
  };
})(window.Studio);
