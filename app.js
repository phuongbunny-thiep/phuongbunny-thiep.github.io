/* Thiệp cưới online — logic chung. Thông tin từng đơn nằm ở config.js */
(function () {
  'use strict';
  const C = window.CONFIG || {};
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  /* ================= LỊCH ÂM (thuật toán Hồ Ngọc Đức, múi giờ +7) ================= */
  const TZ = 7, PI = Math.PI;
  const INT = Math.floor;
  function jdFromDate(dd, mm, yy) {
    const a = INT((14 - mm) / 12), y = yy + 4800 - a, m = mm + 12 * a - 3;
    let jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - INT(y / 100) + INT(y / 400) - 32045;
    if (jd < 2299161) jd = dd + INT((153 * m + 2) / 5) + 365 * y + INT(y / 4) - 32083;
    return jd;
  }
  function newMoonDay(k) {
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
    C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
    C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
    C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
    C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
    C1 = C1 + 0.0010 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
    const deltat = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
                           : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return INT(Jd1 + C1 - deltat + 0.5 + TZ / 24);
  }
  function sunLongitude(jdn) {
    const T = (jdn - 2451545.5 - TZ / 24) / 36525, T2 = T * T, dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
    DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr;
    L -= PI * 2 * INT(L / (PI * 2));
    return INT(L / PI * 6);
  }
  function lunarMonth11(yy) {
    const off = jdFromDate(31, 12, yy) - 2415021, k = INT(off / 29.530588853);
    let nm = newMoonDay(k);
    if (sunLongitude(nm) >= 9) nm = newMoonDay(k - 1);
    return nm;
  }
  function leapMonthOffset(a11) {
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let last, i = 1, arc = sunLongitude(newMoonDay(k + i));
    do { last = arc; i++; arc = sunLongitude(newMoonDay(k + i)); } while (arc !== last && i < 14);
    return i - 1;
  }
  function solarToLunar(dd, mm, yy) {
    const day = jdFromDate(dd, mm, yy), k = INT((day - 2415021.076998695) / 29.530588853);
    let monthStart = newMoonDay(k + 1);
    if (monthStart > day) monthStart = newMoonDay(k);
    let a11 = lunarMonth11(yy), b11 = a11, lYear;
    if (a11 >= monthStart) { lYear = yy; a11 = lunarMonth11(yy - 1); }
    else { lYear = yy + 1; b11 = lunarMonth11(yy + 1); }
    const lDay = day - monthStart + 1, diff = INT((monthStart - a11) / 29);
    let leap = 0, lMonth = diff + 11;
    if (b11 - a11 > 365) {
      const lm = leapMonthOffset(a11);
      if (diff >= lm) { lMonth = diff + 10; if (diff === lm) leap = 1; }
    }
    if (lMonth > 12) lMonth -= 12;
    if (lMonth >= 11 && diff < 4) lYear -= 1;
    return { day: lDay, month: lMonth, year: lYear, leap };
  }
  const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
  const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
  const lunarText = v => {
    const L = solarToLunar(v.d, v.m, v.y);
    const mName = L.month === 1 ? 'Giêng' : L.month === 12 ? 'Chạp' : pad(L.month);
    return `Tức ngày ${pad(L.day)} tháng ${mName}${L.leap ? ' nhuận' : ''} năm ${CAN[(L.year + 6) % 10]} ${CHI[(L.year + 8) % 12]}`;
  };
  window.__solarToLunar = solarToLunar; // để kiểm tra

  /* ================= NGÀY GIỜ (luôn theo giờ Việt Nam) ================= */
  const WD = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const vn = iso => {
    const t = new Date(new Date(iso).getTime() + 7 * 3600e3);
    return { d: t.getUTCDate(), m: t.getUTCMonth() + 1, y: t.getUTCFullYear(), h: t.getUTCHours(), mi: t.getUTCMinutes(), wd: t.getUTCDay() };
  };
  const dmy = v => `${pad(v.d)}.${pad(v.m)}.${v.y}`;
  const hm = v => `${pad(v.h)}:${pad(v.mi)}`;

  /* ================= DỮ LIỆU ================= */
  const nhaGai = (C.side || 'nha-gai') === 'nha-gai';
  const bride = C.bride || {}, groom = C.groom || {};
  const first = nhaGai ? bride : groom, second = nhaGai ? groom : bride;
  const title = nhaGai ? 'Lễ Vu Quy' : 'Lễ Thành Hôn';
  const events = C.events || [];
  const main = vn(C.mainDate || (events[0] && events[0].datetime) || new Date().toISOString());
  const mainEvent = events.find(e => dmy(vn(e.datetime)) === dmy(main) && hm(vn(e.datetime)) === hm(main)) || events[events.length - 1] || {};
  const guest = (new URLSearchParams(location.search).get('khach') || '').trim();

  document.title = `Thiệp cưới ${first.name} & ${second.name}`;
  document.body.classList.toggle('bw', !!C.photosBlackWhite);

  /* ================= PHẦN MỞ ĐẦU ================= */
  if (C.background) { const b = $('bgImg'); b.style.backgroundImage = `url("${C.background}")`; b.classList.add('photo'); }
  $('names').innerHTML = `${esc(first.name)}<span class="amp">&amp;</span>${esc(second.name)}`;
  $('date').textContent = dmy(main);
  $('envText').innerHTML = C.envelopeText || 'Trân trọng<br>kính mời';
  if (guest) { const g = $('envGuest'); g.hidden = false; g.innerHTML = `Kính gửi<b>${esc(guest)}</b>`; }
  const mono = C.monogram || `${(first.name || ' ').trim()[0]}&${(second.name || ' ').trim()[0]}`;
  $('sealMonoS').textContent = mono; $('sealMonoL').textContent = mono;
  $('ctTitle').textContent = title;
  $('ctName1').textContent = first.name; $('ctName2').textContent = second.name;
  $('ctDate').textContent = dmy(main);
  $('ctVenue').innerHTML = `${hm(main)} · ${WD[main.wd]}<br>${esc(mainEvent.venue || '')}`;
  (C.envelopePhotos || []).forEach((p, i) => { const n = $('photo' + (i + 1)); if (n && p) n.style.backgroundImage = `url("${p}")`; });

  // dấu sáp gợn
  (function () {
    const pts = [], n = 28;
    for (let i = 0; i < n; i++) {
      const a = i / n * PI * 2, r = 51 + Math.sin(a * 5 + 1) * 2.6 + Math.sin(a * 9 + 2) * 1.6 + (rnd() - .5) * 3.2;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    $('sealBlob').setAttribute('d', d + 'Z');
  })();

  // thiệp kem viền ren trắng
  (function () {
    const svg = $('cardSvg'), W = 400, H = 570, r = 11, inset = 24;
    const defs = el('defs', {}, svg);
    const g1 = el('linearGradient', { id: 'gCard', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#f9f2e7' }, g1); el('stop', { offset: 1, 'stop-color': '#efe3d1' }, g1);
    const scal = (x0, y0, x1, y1) => {
      const len = Math.hypot(x1 - x0, y1 - y0), k = Math.max(1, Math.round(len / (r * 2))), s = [];
      for (let i = 0; i < k; i++) s.push(`A${r} ${r} 0 0 1 ${(x0 + (x1 - x0) * (i + 1) / k).toFixed(1)} ${(y0 + (y1 - y0) * (i + 1) / k).toFixed(1)}`);
      return s.join(' ');
    };
    const o = 2;
    const d = `M${o} ${o} ` + scal(o, o, W - o, o) + ' ' + scal(W - o, o, W - o, H - o) + ' ' + scal(W - o, H - o, o, H - o) + ' ' + scal(o, H - o, o, o) + ' Z';
    let holes = '';
    const add = (x, y, rad) => { holes += ` M${(x - rad).toFixed(1)} ${y.toFixed(1)} a${rad} ${rad} 0 1 0 ${rad * 2} 0 a${rad} ${rad} 0 1 0 ${-rad * 2} 0`; };
    const off = 12, step = 22;
    for (let x = off; x <= W - off + .1; x += (W - off * 2) / Math.round((W - off * 2) / step)) { add(x, off, 3.4); add(x, H - off, 3.4); }
    for (let y = off + step; y <= H - off - step + .1; y += (H - off * 2) / Math.round((H - off * 2) / step)) { add(off, y, 3.4); add(W - off, y, 3.4); }
    el('path', { d: d + holes, 'fill-rule': 'evenodd', fill: '#fffdf9' }, svg);
    el('rect', { x: inset, y: inset, width: W - inset * 2, height: H - inset * 2, fill: 'url(#gCard)' }, svg);
    el('rect', { x: inset + 9, y: inset + 9, width: W - inset * 2 - 18, height: H - inset * 2 - 18, fill: 'none', stroke: '#8d2a3a', 'stroke-opacity': .35, 'stroke-width': 1.2 }, svg);
    el('rect', { x: inset, y: inset, width: W - inset * 2, height: H - inset * 2, fill: '#fff', filter: 'url(#fPaper)' }, svg);
  })();

  // bó hoa baby + nụ hồng + lá bạch đàn, buộc nơ ren
  (function () {
    const svg = $('bouquet');
    const defs = el('defs', {}, svg);
    const gr = el('radialGradient', { id: 'gBud', cx: '40%', cy: '35%', r: '70%' }, defs);
    el('stop', { offset: 0, 'stop-color': '#b3344a' }, gr); el('stop', { offset: 1, 'stop-color': '#6a1222' }, gr);
    const back = el('g', {}, svg), mid = el('g', {}, svg), front = el('g', {}, svg);
    const tie = [250, 385];
    // cành phía dưới nơ
    [[228, 545], [246, 555], [262, 548], [278, 538]].forEach(([x, y]) => el('path', { d: `M${tie[0]} ${tie[1]} Q ${(tie[0] + x) / 2 + 4} ${(tie[1] + y) / 2} ${x} ${y}`, stroke: '#6f7d55', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, back));
    // lá bạch đàn
    const euca = (pts) => {
      const [s, c, e] = pts;
      el('path', { d: `M${s[0]} ${s[1]} Q ${c[0]} ${c[1]} ${e[0]} ${e[1]}`, stroke: '#77845f', 'stroke-width': 2.4, fill: 'none' }, back);
      for (let i = 1; i <= 7; i++) {
        const t = i / 7.6, mt = 1 - t;
        const x = mt * mt * s[0] + 2 * mt * t * c[0] + t * t * e[0], y = mt * mt * s[1] + 2 * mt * t * c[1] + t * t * e[1];
        const rr = 15 - i * 1.1;
        el('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: rr, ry: rr * .86, fill: ['#9aa889', '#8c9b7a', '#a8b597'][i % 3], stroke: '#6f7d5c', 'stroke-width': .8, 'stroke-opacity': .6 }, back);
      }
    };
    euca([tie, [150, 300], [70, 250]]); euca([tie, [370, 300], [430, 210]]); euca([tie, [180, 220], [175, 110]]);
    // hoa baby
    const cx = 255, cy = 225;
    for (let i = 0; i < 70; i++) {
      const a = rnd() * PI * 2, rr = Math.sqrt(rnd());
      const ex = cx + Math.cos(a) * rr * 140, ey = cy + Math.sin(a) * rr * 115;
      el('path', { d: `M${tie[0]} ${tie[1]} Q ${(tie[0] + ex) / 2 + (rnd() - .5) * 30} ${(tie[1] + ey) / 2} ${ex.toFixed(1)} ${ey.toFixed(1)}`, stroke: '#8a9670', 'stroke-width': 1.1, fill: 'none', opacity: .85 }, mid);
      const k = 3 + INT(rnd() * 4);
      for (let j = 0; j < k; j++) {
        const fx = ex + (rnd() - .5) * 16, fy = ey + (rnd() - .5) * 14, fr = 3.4 + rnd() * 2.6;
        el('circle', { cx: fx.toFixed(1), cy: fy.toFixed(1), r: fr.toFixed(1), fill: rnd() < .8 ? '#fffdf7' : '#f1ece0', stroke: '#e1dccd', 'stroke-width': .6 }, mid);
        el('circle', { cx: fx.toFixed(1), cy: fy.toFixed(1), r: .9, fill: '#d8cfaa' }, mid);
      }
    }
    // nụ hồng
    const bud = (x, y, rot, s) => {
      el('path', { d: `M${tie[0]} ${tie[1]} Q ${(tie[0] + x) / 2} ${(tie[1] + y) / 2 + 20} ${x} ${y + 14 * s}`, stroke: '#5f7046', 'stroke-width': 3, fill: 'none' }, mid);
      const g = el('g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` }, front);
      el('path', { d: 'M-9 10 L-14 22 L-3 14 L0 26 L3 14 L14 22 L9 10 Z', fill: '#6c7f4a' }, g);
      el('path', { d: 'M0 -22 C 14 -20 20 -4 14 8 C 9 16 -9 16 -14 8 C -20 -4 -14 -20 0 -22 Z', fill: 'url(#gBud)' }, g);
      el('path', { d: 'M-9 -6 C -4 -14 6 -14 10 -5 M-5 2 C 0 -6 6 -4 7 3 M-12 4 C -8 12 8 12 12 4', stroke: '#4f0c18', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', opacity: .75 }, g);
      el('path', { d: 'M-6 -16 C -2 -19 4 -19 7 -15', stroke: '#d6687a', 'stroke-width': 1.4, fill: 'none', opacity: .7 }, g);
    };
    bud(232, 250, -12, 1.25); bud(300, 205, 18, 1.05); bud(190, 300, -28, 1.0); bud(318, 292, 25, 1.15); bud(262, 168, 5, .9);
    // nơ ren
    el('use', { href: '#lace-bow', transform: `translate(${tie[0] - 78} ${tie[1] - 44}) scale(.78) rotate(-6 100 64)` }, front);
  })();

  /* ---------- co tên cho vừa ---------- */
  const fitAll = () => {
    const n = $('names'); n.style.fontSize = '';
    const sw = n.parentElement.offsetWidth;
    let fs = parseFloat(getComputedStyle(n).fontSize), guard = 40;
    const probe = document.createElement('span'); probe.innerHTML = n.innerHTML; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:inherit';
    n.appendChild(probe);
    while (probe.getBoundingClientRect().width > sw * .88 && guard--) { fs *= .96; n.style.fontSize = fs + 'px'; }
    probe.remove();
    ['ctName1', 'ctName2'].forEach(id => {
      const node = $(id); node.style.fontSize = '';
      let f = parseFloat(getComputedStyle(node).fontSize), g = 40;
      while (node.scrollWidth > node.parentElement.clientWidth && g--) { f *= .95; node.style.fontSize = f + 'px'; }
    });
  };

  /* ---------- chạy intro ---------- */
  const intro = $('intro');
  let canOpen = false, opened = false;
  const start = () => {
    if (intro.classList.contains('ready')) return;
    fitAll();
    intro.classList.add('ready');
    setTimeout(() => { canOpen = true; if (C.autoOpen > 0) setTimeout(open, C.autoOpen * 1000); }, reduce ? 50 : 2300);
  };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) : Promise.resolve()).then(start);
  addEventListener('resize', () => { if (intro.classList.contains('ready')) fitAll(); });

  /* ---------- nhạc ---------- */
  let audio = null;
  const mb = $('musicBtn');
  if (C.music) {
    audio = new Audio(C.music); audio.loop = true; audio.preload = 'auto'; mb.hidden = false;
    mb.addEventListener('click', () => { if (audio.paused) { audio.play(); mb.classList.add('playing'); } else { audio.pause(); mb.classList.remove('playing'); } });
  }

  /* ---------- cánh hoa ---------- */
  const petals = () => {
    if (!C.petals || reduce) return;
    const box = $('petals');
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('i'); p.className = 'petal';
      const s = .6 + Math.random() * .8;
      p.style.cssText = `left:${Math.random() * 100}%;width:${12 * s}px;height:${10 * s}px;animation-duration:${9 + Math.random() * 8}s;animation-delay:${Math.random() * 9}s;--dx:${(Math.random() - .5) * 160}px;--rot:${(Math.random() - .5) * 720}deg`;
      box.appendChild(p);
    }
  };

  function open() {
    if (!canOpen || opened) return;
    opened = true;
    intro.classList.add('is-open');
    if (audio) audio.play().then(() => mb.classList.add('playing')).catch(() => {});
    setTimeout(() => { $('envClosed').style.visibility = 'hidden'; }, reduce ? 0 : 1300);
    setTimeout(() => { document.body.classList.add('unlocked'); $('dock').classList.add('show'); petals(); }, reduce ? 0 : 3200);
  }
  $('envClosed').addEventListener('click', open);
  window.openInvitation = open;
  document.querySelector('.scroll-hint').addEventListener('click', () => $('loi-ngo').scrollIntoView({ behavior: 'smooth' }));
  document.querySelector('.scroll-hint').style.pointerEvents = 'auto';

  /* ================= NỘI DUNG ================= */
  // lời ngỏ + hai họ
  $('secTitle1').textContent = title;
  const famBlock = (label, f, dir) => `<div class="fam" data-r="${dir}"><h3>${label}</h3><p>${esc(f.father || '')}<br>${esc(f.mother || '')}</p><small>${esc(f.address || '')}</small></div>`;
  const bf = C.brideFamily || {}, gf = C.groomFamily || {};
  $('families').innerHTML = nhaGai ? famBlock('Nhà gái', bf, 'left') + famBlock('Nhà trai', gf, 'right') : famBlock('Nhà trai', gf, 'left') + famBlock('Nhà gái', bf, 'right');
  $('invitation').textContent = C.invitation || (nhaGai ? 'Trân trọng báo tin Lễ Vu Quy của con gái chúng tôi' : 'Trân trọng báo tin Lễ Thành Hôn của con trai chúng tôi');
  const pol = (p, role, dir) => `<figure class="pol keep-rot" data-r="${dir}"><span class="tape"></span><img src="${esc(p.photo || '')}" alt="${esc(p.fullName || p.name)}" loading="lazy"><figcaption style="font-size:${Math.min(26, Math.round(380 / Math.max(1, (p.name || '').length)))}px">${esc(p.name)}</figcaption><span class="role">${role}${p.order ? ' · ' + esc(p.order) : ''}</span></figure>`;
  $('couple').innerHTML = pol(first, nhaGai ? 'Cô dâu' : 'Chú rể', 'left') + `<span class="amp-big" data-r="zoom">&amp;</span>` + pol(second, nhaGai ? 'Chú rể' : 'Cô dâu', 'right');
  $('quote').textContent = C.quote || '';

  // sự kiện
  const mapLink = e => (e.map && !/output=embed|\/embed/.test(e.map)) ? e.map : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((e.venue ? e.venue + ', ' : '') + (e.address || ''))}`;
  const pin = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  $('events').innerHTML = events.map(e => {
    const v = vn(e.datetime);
    return `<article class="paper event" data-r="up">
      <div class="ev-title">${esc(e.title)}</div>
      <div class="ev-time">Vào lúc ${hm(v)}</div>
      <div class="ev-date"><div class="side">${WD[v.wd]}</div><div class="d">${pad(v.d)}</div><div class="side">Tháng ${pad(v.m)}<br>${v.y}</div></div>
      <div class="ev-lunar">(${esc(e.lunar || lunarText(v))})</div>
      <div class="ev-venue">${esc(e.venue || '')}</div>
      <div class="ev-addr">${esc(e.address || '')}</div>
      <a class="btn" href="${esc(mapLink(e))}" target="_blank" rel="noopener">${pin}Chỉ đường</a>
    </article>`;
  }).join('');

  // lịch tháng
  (function () {
    const first = new Date(Date.UTC(main.y, main.m - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(main.y, main.m, 0)).getUTCDate();
    const lead = (first + 6) % 7;
    let h = `<div class="cal-head">Tháng ${pad(main.m)}</div><div class="cal-sub">${main.y}</div><div class="cal-grid">`;
    h += ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(w => `<div class="wd">${w}</div>`).join('');
    for (let i = 0; i < lead; i++) h += '<div></div>';
    for (let d = 1; d <= days; d++) {
      h += d === main.d
        ? `<div class="day mark"><svg viewBox="0 0 24 22"><path d="M12 21C5 16 1 12.4 1 7.6 1 4 3.8 1.3 7.2 1.3c2.1 0 3.7 1 4.8 2.6 1.1-1.6 2.7-2.6 4.8-2.6C20.2 1.3 23 4 23 7.6c0 4.8-4 8.4-11 13.4z" fill="#7d1d2e"/></svg><span>${d}</span></div>`
        : `<div class="day">${d}</div>`;
    }
    $('calendar').innerHTML = h + '</div>';
  })();

  // đếm ngược
  (function () {
    const box = $('countdown'), target = new Date(C.mainDate || events[0].datetime).getTime();
    box.innerHTML = ['Ngày', 'Giờ', 'Phút', 'Giây'].map((l, i) => `<div class="cd"><b id="cd${i}">00</b><span>${l}</span></div>`).join('');
    const tick = () => {
      let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      if (s === 0) { box.innerHTML = '<p class="cd-done">Hôm nay là ngày vui! Cảm ơn bạn đã đến chung vui.</p>'; return; }
      const v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      v.forEach((n, i) => { $('cd' + i).textContent = i === 0 ? n : pad(n); });
      setTimeout(tick, 1000);
    };
    tick();
  })();

  // album + lightbox
  const album = C.album || [];
  $('album').innerHTML = album.map((src, i) => `<figure class="keep-rot" data-r="zoom" data-i="${i}"><img src="${esc(src)}" alt="Ảnh cưới ${i + 1}" loading="lazy"></figure>`).join('');
  let lbIndex = 0;
  const lb = $('lightbox'), lbImg = $('lbImg');
  const showLb = i => { lbIndex = (i + album.length) % album.length; lbImg.src = album[lbIndex]; };
  $('album').addEventListener('click', e => { const f = e.target.closest('figure'); if (!f) return; showLb(+f.dataset.i); openModal(lb); });
  $('lbPrev').onclick = () => showLb(lbIndex - 1);
  $('lbNext').onclick = () => showLb(lbIndex + 1);
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) showLb(lbIndex + (dx < 0 ? 1 : -1)); });

  // bản đồ
  (function () {
    const e = events[C.mapEvent || 0] || mainEvent;
    const src = (e.map && /output=embed|\/embed/.test(e.map)) ? e.map : `https://maps.google.com/maps?q=${encodeURIComponent((e.venue ? e.venue + ', ' : '') + (e.address || ''))}&z=16&output=embed`;
    $('mapbox').innerHTML = `<iframe src="${esc(src)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Bản đồ"></iframe><p>${esc(e.venue || '')}</p>`;
    $('mapbox').insertAdjacentHTML('afterend', `<a class="btn ghost" href="${esc(mapLink(e))}" target="_blank" rel="noopener">${pin}Mở Google Maps</a>`);
  })();

  // lời chúc + RSVP
  const wishList = $('wishList');
  const addWish = (w, top) => {
    if (!w || !w.message) return;
    const d = document.createElement('div'); d.className = 'wish';
    d.innerHTML = `<b>${esc(w.name)}</b><p>${esc(w.message)}</p>`;
    top ? wishList.prepend(d) : wishList.appendChild(d);
  };
  if (C.rsvpEndpoint) {
    fetch(C.rsvpEndpoint + (C.rsvpEndpoint.includes('?') ? '&' : '?') + 'action=wishes')
      .then(r => r.json()).then(j => (j.wishes || []).forEach(w => addWish(w)))
      .catch(() => (C.sampleWishes || []).forEach(w => addWish(w)));
  } else (C.sampleWishes || []).forEach(w => addWish(w));

  if (guest) $('fName').value = guest;
  if (!nhaGai) { const s = $('fSide'); s.insertBefore(s.options[1], s.options[0]); s.selectedIndex = 0; }
  $('rsvpForm').addEventListener('submit', async ev => {
    ev.preventDefault();
    const f = ev.target, msg = $('formMsg'), btn = $('fSubmit');
    const data = Object.fromEntries(new FormData(f).entries());
    data.name = (data.name || '').trim();
    if (!data.name) { msg.textContent = 'Bạn nhập tên giúp mình nhé.'; $('fName').focus(); return; }
    data.invite = nhaGai ? 'Nhà gái' : 'Nhà trai'; data.guestLink = guest; data.page = location.pathname;
    btn.disabled = true; btn.textContent = 'Đang gửi…'; msg.textContent = '';
    try {
      if (C.rsvpEndpoint) {
        try { await fetch(C.rsvpEndpoint, { method: 'POST', body: JSON.stringify(data) }); }
        catch (_) { await fetch(C.rsvpEndpoint, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) }); }
      } else await new Promise(r => setTimeout(r, 700));
      msg.textContent = data.attend === 'Có' ? `Cảm ơn ${data.name}! Hẹn gặp bạn trong ngày vui.` : `Cảm ơn ${data.name} đã gửi lời chúc!`;
      addWish({ name: data.name, message: data.message }, true);
      f.reset(); if (guest) $('fName').value = guest;
      btn.textContent = 'Đã gửi ✓';
      setTimeout(() => { btn.disabled = false; btn.textContent = 'Gửi xác nhận'; }, 4000);
    } catch (e) {
      msg.textContent = 'Gửi chưa được, bạn thử lại giúp mình nhé.';
      btn.disabled = false; btn.textContent = 'Gửi xác nhận';
    }
  });

  // mừng cưới
  const gifts = C.gifts || [];
  const giftModal = $('giftModal');
  const renderGift = i => {
    const g = gifts[i];
    [...$('giftTabs').children].forEach((b, j) => b.classList.toggle('on', i === j));
    $('giftBody').innerHTML = `<div class="gift-item"><img src="${esc(g.qr)}" alt="Mã QR ${esc(g.label)}">
      <div class="bank">${esc(g.bank)}</div><div class="num">${esc(g.number)}</div><div class="holder">${esc(g.holder)}</div>
      <button class="btn" data-copy="${esc(String(g.number).replace(/\s/g, ''))}">Sao chép số tài khoản</button></div>`;
  };
  $('giftTabs').innerHTML = gifts.length > 1 ? gifts.map((g, i) => `<button data-i="${i}">${esc(g.label)}</button>`).join('') : '';
  $('giftTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) renderGift(+b.dataset.i); });
  const openGift = () => { if (!gifts.length) return; renderGift(0); openModal(giftModal); };
  $('giftOpen').addEventListener('click', openGift);
  $('dockGift').addEventListener('click', openGift);
  $('dockRsvp').addEventListener('click', () => $('rsvp').scrollIntoView({ behavior: 'smooth' }));
  if (!gifts.length) { $('mung-cuoi').remove(); $('dockGift').remove(); }

  // sao chép
  const toast = t => { const n = $('toast'); n.textContent = t; n.classList.add('show'); clearTimeout(n._t); n._t = setTimeout(() => n.classList.remove('show'), 1800); };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const v = b.dataset.copy;
    const done = () => toast('Đã sao chép ' + v);
    if (navigator.clipboard && isSecureContext) navigator.clipboard.writeText(v).then(done, () => fallback());
    else fallback();
    function fallback() { const t = document.createElement('textarea'); t.value = v; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (_) { } t.remove(); }
  });

  // modal chung
  function openModal(m) { m.classList.add('open'); document.documentElement.style.overflow = 'hidden'; }
  function closeModal(m) { m.classList.remove('open'); document.documentElement.style.overflow = ''; }
  document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); }));
  addEventListener('keydown', e => {
    const m = document.querySelector('.modal.open'); if (!m) return;
    if (e.key === 'Escape') closeModal(m);
    if (m === lb && e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (m === lb && e.key === 'ArrowRight') showLb(lbIndex + 1);
  });

  // cảm ơn
  $('thanksPhoto').src = C.thanksPhoto || album[0] || '';
  document.querySelector('.thanks figcaption').textContent = 'Cảm ơn';
  $('thanks').textContent = C.thanks || '';
  $('thanksNames').textContent = `${first.name} & ${second.name}`;
  const cr = $('credit'); cr.textContent = C.credit || ''; cr.href = C.credit ? 'https://' + C.credit.replace(/^https?:\/\//, '') : '#';

  // hiện dần khi cuộn
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
  document.querySelectorAll('[data-r]').forEach(n => io ? io.observe(n) : n.classList.add('in'));
})();
