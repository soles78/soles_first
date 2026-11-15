/* 04 엔딩 — 크레딧과 다시 보기 */
(function (S) {
  const { animate } = anime;
  let active = false;
  let acc = 0;

  S.scenes.outro = {
    enter() {
      active = true;
      acc = 0;
      animate(S.fx.stars, { alpha: 1, duration: 2000 });
      S.ui.layer(S.$('d3-layer'), 0, 800);
      S.ui.title('NIGHT SHIFT', 'THE END');
      S.ui.credits([
        'anime.js · MIT', 'p5.js · LGPL-2.1', 'matter-js · MIT',
        'PixiJS · MIT', 'Tone.js · MIT', 'D3 · ISC',
      ]);
      S.ui.replay(true);
      S.audio.mix({ arp: 0, bell: 0, drum: 0 }, 1.5);
      S.audio.mix({ pad: 0 }, 8); // 남은 패드가 8초에 걸쳐 사라집니다.
    },
    exit() {
      active = false;
      S.ui.hideTitle(400);
      S.ui.replay(false);
    },
    update(dt) {
      if (!active) return;
      acc += dt;
      while (acc > 0.1) { acc -= 0.1; S.fx.embers(1); }
    },
  };
})(window.Studio);
