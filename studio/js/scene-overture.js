/* 00 오버추어 — anime.js 타이틀 + PixiJS 별밭 */
(function (S) {
  const { animate } = anime;
  let active = false;
  let acc = 0;

  S.scenes.overture = {
    enter() {
      active = true;
      acc = 0;
      animate(S.fx.stars, { alpha: [0, 1], duration: 2200, ease: 'outQuad' });
      S.ui.layer(S.$('p5-layer'), 0, 300);
      S.ui.layer(S.$('d3-layer'), 0, 300);
      S.ui.title('NIGHT SHIFT', '무료 오픈소스 6개 · 브라우저 하나 · 78초');
      S.audio.mix({ pad: 0.9, arp: 0, bell: 0, drum: 0 }, 3);
    },
    exit() {
      active = false;
      S.ui.hideTitle();
    },
    update(dt) {
      if (!active) return;
      acc += dt;
      while (acc > 0.16) { acc -= 0.16; S.fx.embers(1); }
    },
  };
})(window.Studio);
