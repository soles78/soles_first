/* 03 데이터 — D3 방사형 막대 차트. 입력은 앞 장면에서 실제로 측정한 충돌 횟수(S.counts)입니다. */
(function (S) {
  const { animate } = anime;
  let active = false;
  let root = null;
  let cx = 0;
  let cy = 0;

  const fmt = (n) => Math.round(n).toLocaleString('ko-KR');

  S.scenes.data = {
    enter() {
      active = true;
      animate(S.fx.stars, { alpha: 0.45, duration: 1000 });
      S.ui.layer(S.$('p5-layer'), 0, 300);
      S.ui.layer(S.$('d3-layer'), 1, 900);

      const n = S.NOTES.length;
      let data = S.counts.slice();
      let total = d3.sum(data);
      let synthetic = false;
      if (total < 40) {
        // 물리 장면을 거치지 않고 바로 들어온 경우(?scene=3 등)에만 쓰는 대체 데이터 — 화면에도 명시합니다.
        synthetic = true;
        data = d3.range(n).map((i) => Math.round(900 * Math.exp(-Math.pow((i - 5) / 3.1, 2)) * (0.85 + 0.3 * Math.random())));
        total = d3.sum(data);
      }

      const W = S.W, H = S.H;
      const minDim = Math.min(W, H);
      // 가로 화면: 차트를 오른쪽으로 옮겨 왼쪽 아래 자막과 겹치지 않게 합니다.
      cx = W > H * 1.3 ? W * 0.6 : W / 2;
      cy = H * 0.42;
      const rIn = minDim * 0.12;
      const rOut = minDim * 0.34;
      const max = d3.max(data) || 1;

      const svg = d3.select('#d3-layer');
      svg.selectAll('*').remove();
      svg.attr('viewBox', `0 0 ${W} ${H}`);
      root = svg.append('g').attr('transform', `translate(${cx},${cy})`);

      const x = d3.scaleBand().domain(d3.range(n)).range([0, Math.PI * 2]).padding(0.14);
      const y = d3.scaleSqrt().domain([0, max]).range([rIn, rOut]);

      // 가이드 원
      root.append('g').selectAll('circle').data([0, 0.5, 1]).join('circle')
        .attr('r', (d) => y(d * max))
        .attr('fill', 'none')
        .attr('stroke', 'rgba(138,147,194,.22)')
        .attr('stroke-dasharray', (d) => (d === 0 ? null : '3 6'));

      const arc = d3.arc()
        .innerRadius(rIn + 2)
        .startAngle((d, i) => x(i))
        .endAngle((d, i) => x(i) + x.bandwidth())
        .padAngle(0.015)
        .padRadius(rIn)
        .cornerRadius(3);

      const bars = root.append('g').style('filter', 'drop-shadow(0 0 10px rgba(56,232,255,.35))')
        .selectAll('path').data(data).join('path')
        .attr('fill', (d, i) => S.noteColor(i))
        .attr('fill-opacity', 0.92)
        .attr('d', (d, i) => arc.outerRadius(rIn + 2)(d, i));

      bars.transition()
        .delay((d, i) => 250 + i * 110)
        .duration(1700)
        .ease(d3.easeCubicOut)
        .attrTween('d', (d, i) => {
          const ri = d3.interpolateNumber(rIn + 2, y(d));
          return (tt) => arc.outerRadius(ri(tt))(d, i);
        });

      // 음 이름 라벨
      root.append('g').selectAll('text').data(S.NOTES).join('text')
        .attr('class', 'lbl')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('transform', (d, i) => {
          const a = x(i) + x.bandwidth() / 2;
          const rr = rOut + 24;
          return `translate(${Math.sin(a) * rr},${-Math.cos(a) * rr})`;
        })
        .attr('opacity', 0)
        .text((d) => d)
        .transition().delay((d, i) => 600 + i * 90).duration(600).attr('opacity', 1);

      // 가운데 합계
      // 자릿수가 늘어도 가운데 원 안에 들어가도록 글자 크기를 맞춥니다.
      const fs = Math.min(72, (rIn * 1.7) / (0.6 * fmt(total).length));
      const tot = root.append('text').attr('class', 'tot').attr('y', fs * 0.12).style('font-size', fs + 'px').text('0');
      root.append('text').attr('class', 'totl')
        .attr('y', fs * 0.12 + Math.max(16, fs * 0.45))
        .style('font-size', Math.max(8, Math.min(12, rIn * 0.14)) + 'px')
        .text('COLLISIONS');
      tot.transition().delay(300).duration(2400).ease(d3.easeCubicOut)
        .tween('text', function () {
          const ip = d3.interpolateNumber(0, total);
          return (tt) => { this.textContent = fmt(ip(tt)); };
        });

      const peak = data.indexOf(max);
      const msg = synthetic
        ? '※ 이 데이터는 시뮬레이션 값입니다(물리 장면을 건너뛰어 실측 데이터가 없습니다).'
        : `방금 들은 소리를 D3가 그렸습니다. 가장 많이 울린 음은 ${S.NOTES[peak]} (${fmt(max)}회), 총 ${fmt(total)}회 충돌 — 모두 이번 재생에서 실제로 측정된 값입니다.`;
      S.ui.caption('03 / 04', '데이터', msg);
      S.audio.mix({ pad: 0.9, arp: 0.25, bell: 0, drum: 0 }, 3);
      S.dataSummary = { total, peak: S.NOTES[peak], max, synthetic };
    },
    exit() {
      active = false;
      S.ui.hideCaption();
      S.ui.layer(S.$('d3-layer'), 0, 700);
    },
    update() {
      if (!active || !root) return;
      const s = 1 + S.pulse * 0.012;
      root.attr('transform', `translate(${cx},${cy}) scale(${s})`);
    },
  };
})(window.Studio);
