/* audio.js — Tone.js 사운드 엔진. 실패해도 영상은 무음으로 계속 재생됩니다. */
(function (S) {
  const CHORDS = [
    ['A2', 'E3', 'G3', 'B3', 'C4'],   // Am9
    ['F2', 'C3', 'E3', 'G3', 'A3'],   // Fmaj7
    ['C3', 'G3', 'B3', 'E4'],         // Cmaj7
    ['G2', 'D3', 'A3', 'E4'],         // G6sus2
  ];

  const A = (S.audio = {
    ready: false,
    error: null,
    g: {},
    chord: 0,
    lastHit: {},
  });

  A.init = async function () {
    if (A.ready) return true;
    try {
      await Tone.start();

      const comp = new Tone.Compressor(-18, 3).toDestination();
      const bus = new Tone.Gain(0.9).connect(comp);
      const rev = new Tone.Reverb({ decay: 5.5, wet: 0.38 }).connect(bus);
      // 일부 환경에서 reverb 생성이 오래 걸리면 건너뜁니다.
      await Promise.race([rev.generate(), new Promise((r) => setTimeout(r, 4000))]);

      const mk = (v) => new Tone.Gain(v).connect(rev);
      A.g.pad = mk(0);
      A.g.arp = mk(0);
      A.g.bell = mk(0);
      A.g.drum = new Tone.Gain(0).connect(bus); // 드럼은 리버브 없이

      const padFilter = new Tone.Filter(1100, 'lowpass').connect(A.g.pad);
      A.pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 24 },
        envelope: { attack: 1.6, decay: 1, sustain: 0.85, release: 3.5 },
        volume: -20,
      }).connect(padFilter);

      A.arp = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.4 },
        volume: -16,
      }).connect(A.g.arp);

      A.bell = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.01,
        modulationIndex: 9,
        envelope: { attack: 0.003, decay: 1.1, sustain: 0, release: 1.4 },
        modulationEnvelope: { attack: 0.002, decay: 0.4, sustain: 0, release: 0.5 },
        volume: -13,
      }).connect(A.g.bell);
      A.bell.maxPolyphony = 40;

      A.kick = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.2 },
        volume: -8,
      }).connect(A.g.drum);

      const hatFilter = new Tone.Filter(7500, 'highpass').connect(A.g.drum);
      A.hat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.045, sustain: 0 },
        volume: -26,
      }).connect(hatFilter);

      const T = Tone.getTransport();
      T.bpm.value = 84;

      // 2마디마다 코드 진행
      new Tone.Loop((time) => {
        const c = CHORDS[A.chord % CHORDS.length];
        A.pad.triggerAttackRelease(c, '2m', time);
        A.chord++;
      }, '2m').start(0);

      // 8분음표 아르페지오
      let step = 0;
      new Tone.Loop((time) => {
        const c = CHORDS[(A.chord - 1 + CHORDS.length) % CHORDS.length];
        const pattern = [0, 2, 1, 3, 2, 4, 3, 1];
        const idx = pattern[step % pattern.length] % c.length;
        const note = Tone.Frequency(c[idx]).transpose(12).toNote();
        A.arp.triggerAttackRelease(note, '16n', time, 0.5 + 0.4 * Math.random());
        step++;
      }, '8n').start(0);

      // 킥 + 하이햇 (+ 비주얼 펄스)
      new Tone.Loop((time) => {
        A.kick.triggerAttackRelease('C1', '8n', time);
        Tone.getDraw().schedule(() => { S.pulse = 1; }, time);
      }, '4n').start(0);
      new Tone.Loop((time) => {
        A.hat.triggerAttackRelease('32n', time + Tone.Time('8n').toSeconds());
      }, '4n').start(0);

      A.ready = true;
      return true;
    } catch (e) {
      A.error = e;
      console.warn('[audio] 사운드 초기화 실패 — 무음으로 진행합니다.', e);
      return false;
    }
  };

  /** 믹스 조정: { pad, arp, bell, drum } 각각 0~1, 선형 램프 */
  A.mix = function (levels, sec = 2) {
    if (!A.ready) return;
    Object.entries(levels).forEach(([k, v]) => {
      if (A.g[k]) A.g[k].gain.rampTo(v, sec);
    });
  };

  A.start = function () {
    if (!A.ready) return;
    const T = Tone.getTransport();
    T.stop();
    T.position = 0;
    A.chord = 0;
    T.start('+0.05');
  };

  A.stop = function () {
    if (!A.ready) return;
    Tone.getTransport().stop();
    A.pad.releaseAll();
    A.mix({ pad: 0, arp: 0, bell: 0, drum: 0 }, 0.3);
  };

  /** 충돌음: 16분음표 격자에 맞춰 터뜨립니다. 같은 음은 90ms 이내 중복 방지. */
  A.hit = function (noteIdx, velocity = 0.7) {
    if (!A.ready) return;
    const now = performance.now();
    if (now - (A.lastHit[noteIdx] || 0) < 90) return;
    if (now - (A.lastAny || 0) < 28) return; // 전체 발음 수 상한(약 35음/초)
    A.lastHit[noteIdx] = now;
    A.lastAny = now;
    const T = Tone.getTransport();
    let time = Tone.now();
    if (T.state === 'started') time = T.nextSubdivision('16n');
    A.bell.triggerAttackRelease(S.NOTES[noteIdx], '8n', time, Math.min(1, velocity));
  };

  A.mute = function (m) {
    if (!A.ready) return;
    Tone.getDestination().mute = m;
  };
})(window.Studio);
