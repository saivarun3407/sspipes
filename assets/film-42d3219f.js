(() => {
const T = 21.5;                     // film length, seconds
const MODE = { embed: false, compact: false };
const LOOP = 19.65;                 // embed loops here: the stage is empty, as it is at t = 0
const W = 1920, H = 1080;
const TAU = Math.PI * 2, D = Math.PI / 180;
const C = { page:'#EEEDEA', surf:'#F7F6F3', shade:'#E2E0DA', ink:'#1C1C1A', line:'#C9C6BF', mid:'#9A968E', muted:'#625F59', acc:'#FF5A1F', bore:'#D3D0C8' };
const F = { tight:'600 1px "SP Tight", Arial, sans-serif', body:'"SP Inter", Arial, sans-serif', mono:'"SP Mono", ui-monospace, monospace' };
const WORD = new Path2D("m61-51l-15 1q-1-3-4-6q-3-2-9-2q-5 0-8 2q-4 2-4 6q0 3 3 5q2 1 7 3l12 2q10 2 15 7q5 5 5 12q0 7-4 12q-4 5-11 8q-6 2-15 2q-13 0-21-5q-8-5-9-15l16-2q1 5 5 8q3 2 9 2q6 0 9-2q4-3 4-6q0-6-10-8l-11-3q-11-2-15-7q-5-5-5-13q0-6 3-11q4-5 10-7q7-3 15-3q12 0 19 6q8 5 9 14zm5 51v-70h16v12h1q2-6 7-10q4-3 10-3q2 0 3 0q2 0 3 1v15q-1-1-3-1q-2 0-4 0q-5 0-9 2q-3 2-5 5q-2 3-2 8v41zm44 0v-70h16v70zm41-41v41h-17v-70h16v12h1q3-6 8-9q5-4 13-4q7 0 12 3q6 3 9 9q3 6 3 15v44h-17v-42q0-7-3-11q-4-4-10-4q-5 0-8 2q-3 2-5 5q-2 4-2 9zm53 41v-70h16v70zm87-70l-25 70h-18l-25-70h18l16 52h1l16-52zm20 71q-7 0-12-2q-5-2-8-7q-3-5-3-12q0-6 2-9q2-4 6-7q3-2 8-3q5-1 10-2q6-1 10-1q4 0 6-2q1-1 1-3v0q0-5-3-8q-3-3-8-3q-7 0-10 2q-4 3-5 7l-15-3q2-6 6-10q4-4 10-7q6-2 13-2q5 0 10 1q5 2 10 4q4 3 6 8q3 4 3 11v47h-16v-10h-1q-1 3-4 6q-2 2-6 4q-5 1-10 1zm4-12q5 0 9-2q3-2 5-5q2-3 2-7v-8q0 0-2 1q-2 0-4 1q-3 0-5 1q-2 0-4 0q-3 1-6 2q-3 1-5 3q-2 2-2 5q0 5 4 7q3 2 8 2zm96-40l-15 1q-1-3-4-6q-3-2-9-2q-5 0-8 2q-4 2-4 6q0 3 3 5q2 1 7 3l12 2q10 2 15 7q5 5 5 12q0 7-4 12q-4 5-11 8q-6 2-15 2q-13 0-21-5q-7-5-9-15l16-2q1 5 5 8q3 2 9 2q6 0 9-2q4-3 4-6q0-6-9-8l-12-3q-10-2-15-7q-5-5-5-13q0-6 4-11q3-5 9-7q7-3 15-3q13 0 20 6q7 5 8 14zm27 52q-7 0-12-2q-5-2-8-7q-4-5-4-12q0-6 3-9q2-4 6-7q3-2 8-3q5-1 10-2q6-1 10-1q4 0 5-2q2-1 2-3v0q0-5-3-8q-3-3-9-3q-6 0-9 2q-4 3-5 7l-15-3q2-6 6-10q4-4 10-7q6-2 13-2q5 0 10 1q5 2 10 4q4 3 6 8q3 4 3 11v47h-16v-10h-1q-1 3-4 6q-3 2-7 4q-4 1-9 1zm4-12q5 0 9-2q3-2 5-5q2-3 2-7v-8q0 0-2 1q-2 0-4 1q-3 0-5 1q-2 0-4 0q-3 1-6 2q-3 1-5 3q-2 2-2 5q0 5 4 7q3 2 8 2z");
const WORD_W = 480.8, WORD_H = 115.5;

/* ---------- easing and timing ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, x) => a + (b - a) * x;
const io = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const sio = x => x * x * x * (x * (x * 6 - 15) + 10);          // smootherstep
const out5 = x => 1 - Math.pow(1 - x, 5);
const out3 = x => 1 - Math.pow(1 - x, 3);
const in3 = x => x * x * x;
// Catmull-Rom through time keys: velocity stays continuous across keys, so camera moves never stop dead.
function spline(t, k) {
  if (t <= k[0][0]) return k[0][1];
  const n = k.length - 1;
  if (t >= k[n][0]) return k[n][1];
  let i = 0; while (t > k[i + 1][0]) i++;
  const [t0, p0] = k[i], [t1, p1] = k[i + 1], h = t1 - t0, u = (t - t0) / h;
  const m = j => (j <= 0 || j >= n) ? 0 : (k[j + 1][1] - k[j - 1][1]) / (k[j + 1][0] - k[j - 1][0]);
  const m0 = m(i) * h, m1 = m(i + 1) * h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
}
// Eased keyframes (stop at each key) for object moves that should settle.
function keys(t, k) {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], io((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
  return k[k.length - 1][1];
}
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

/* ---------- camera ---------- */
const CAM = {
  psi:   [[0, 90], [1.9, 90], [3.7, 54], [5.8, 50], [7.6, 44], [9.2, 47], [10.6, 40], [12.6, 50], [14.6, 46], [16.4, 52], [17.6, 47], [18.6, 51], [19.3, 60], [20.2, 90], [21.5, 90]],
  phi:   [[0, 0], [1.9, 0], [3.7, 24], [6.2, 26], [8.4, 21], [10.8, 22], [12.6, 28], [14.6, 22], [17.6, 21], [19.3, 18], [20.2, 0], [21.5, 0]],
  s:     [[0, 1.25], [1.9, 1.22], [3.7, 1.0], [5.6, .9], [6.6, .8], [8.2, .84], [9.2, .9], [10.2, 1.3], [10.9, 1.3], [12.2, .8], [13.4, .8], [14.6, .92], [16.2, .72], [17.3, .6], [18.4, .62], [19.3, .66], [20.2, .78], [21.5, .8]],
  cx:    [[0, 1180], [3.7, 1190], [5.6, 1120], [6.6, 1010], [8.2, 1010], [9.2, 1080], [10.2, 1150], [12.2, 1200], [16.2, 1140], [17.3, 1080], [18.4, 1100], [19.3, 1180], [20.2, 960], [21.5, 960]],
  cy:    [[0, 540], [3.7, 560], [5.6, 580], [6.6, 590], [8.2, 590], [9.2, 570], [10.2, 520], [11.4, 600], [12.4, 660], [13.4, 650], [14.6, 590], [16.2, 620], [17.3, 690], [18.4, 690], [19.3, 620], [20.2, 410], [21.5, 410]],
};
let R, U, V, S, CX, CY;
function setCam(t) {
  const psi = spline(t, CAM.psi) * D, phi = spline(t, CAM.phi) * D;
  const sp = Math.sin(psi), cp = Math.cos(psi), sf = Math.sin(phi), cf = Math.cos(phi);
  R = [cp, 0, -sp]; U = [-sp * sf, cf, -cp * sf]; V = [sp * cf, sf, cp * cf];
  S = spline(t, CAM.s); CX = spline(t, CAM.cx); CY = spline(t, CAM.cy);
  if (MODE.compact) { CX = 960 + (CX - 1120) * 1.3; CY = 540 + (CY - 600) * 1.3; S *= 1.3; }
}
const P = (x, y, z) => [CX + S * (x * R[0] + z * R[2]), CY - S * (x * U[0] + y * U[1] + z * U[2])];
const depth = (x, y, z) => x * V[0] + y * V[1] + z * V[2];

/* ---------- drawing primitives ---------- */
let g;
const LW = 2.2;
function poly(pts, close) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if (close) g.closePath(); }
function strokeFrac(pts, f) {
  if (f <= 0 || pts.length < 2) return;
  const n = pts.length - 1, e = f * n, k = Math.floor(e);
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= Math.min(k, n); i++) g.lineTo(pts[i][0], pts[i][1]);
  if (k < n) { const a = pts[k], b = pts[k + 1], r = e - k; g.lineTo(lerp(a[0], b[0], r), lerp(a[1], b[1], r)); }
  g.stroke();
}
function ln(a, b, color, w = LW, alpha = 1) { g.globalAlpha = alpha; g.strokeStyle = color; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.globalAlpha = 1; }
// Cross-section ring around the x axis.
function ring(o, x, r, n = 120) { const a = []; for (let i = 0; i <= n; i++) { const th = i / n * TAU; a.push(P(o[0] + x, o[1] + r * Math.sin(th), o[2] + r * Math.cos(th))); } return a; }
const visA = th => Math.sin(th) * V[1] + Math.cos(th) * V[2];  // >0 when the surface at angle th faces the viewer
// Split a sampled ring into visible / hidden runs for line weight.
function ringRuns(o, x, r, sign, n = 160) {
  const runs = []; let cur = null;
  for (let i = 0; i <= n; i++) {
    const th = i / n * TAU, v = visA(th) * sign > 0;
    const p = P(o[0] + x, o[1] + r * Math.sin(th), o[2] + r * Math.cos(th));
    if (!cur || cur.v !== v) { if (cur) cur.pts.push(p); cur = { v, pts: [p] }; runs.push(cur); } else cur.pts.push(p);
  }
  return runs;
}

/* Precomputed concrete speckle so every frame draws the same aggregate. */
const SPK = (() => { const r = rng(7), side = [], face = []; for (let i = 0; i < 900; i++) side.push([r(), r() * TAU, .6 + r() * 1.4, r()]); for (let i = 0; i < 380; i++) face.push([Math.sqrt(r()), r() * TAU, .6 + r() * 1.3, r()]); return { side, face }; })();

/* A spun pipe lying along x. opt: fill 0..1, ink 0..1, speck 0..1, spin (rad), socket, rinFace (bore radius at the open face). */
function pipe(o, x0, x1, r, rin, opt = {}) {
  const fillA = opt.fill ?? 1, inkA = opt.ink ?? 1, sp = opt.spin || 0, alpha = opt.alpha ?? 1;
  if (alpha <= 0.001) return;
  g.save(); g.globalAlpha = alpha;
  if (opt.socket && x1 - x0 > 60) {
    const cl = 46; pipe(o, x0, x0 + cl, r * 1.16, rin, { ...opt, socket: false, speck: 0, bore: false });
    x0 += cl;
  }
  const front = V[0] >= 0 ? x1 : x0, back = V[0] >= 0 ? x0 : x1, len = Math.abs(x1 - x0);
  const ths = Math.atan2(-V[2], V[1]), sil = [ths, ths + Math.PI];
  const pt = (x, th, rr = r) => P(o[0] + x, o[1] + rr * Math.sin(th), o[2] + rr * Math.cos(th));
  // Body fill with a soft top-to-bottom tone so the cylinder reads as a solid.
  if (fillA > 0) {
    g.globalAlpha = alpha * (opt.sideFill ?? fillA);
    const quad = [pt(back, sil[0]), pt(front, sil[0]), pt(front, sil[1]), pt(back, sil[1])];
    const ys = quad.map(p => p[1]).concat(ring(o, front, r, 24).map(p => p[1])), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, C.surf); gr.addColorStop(1, C.shade);
    g.fillStyle = gr;
    poly(ring(o, back, r), true); g.fill();
    poly(quad, true); g.fill();
    g.fillStyle = opt.face || C.surf; poly(ring(o, front, r), true); g.fill();
  }
  // Side speckle, rotating with the spin.
  const spk = (opt.speck ?? 0) * fillA;
  if (spk > 0 && len > 4) {
    g.fillStyle = C.mid;
    for (const [u, th0, sz, k] of SPK.side) {
      const th = th0 + sp, v = visA(th); if (v < .06) continue;
      const p = pt(lerp(x0, x1, u), th);
      g.globalAlpha = alpha * spk * Math.min(1, v * 2.2) * (.35 + .4 * k);
      g.fillRect(p[0] - sz * .5, p[1] - sz * .5, sz, sz);
    }
  }
  g.globalAlpha = alpha;
  // Open face: annulus, then the bore with light at the far end.
  const rf = opt.rinFace ?? rin;
  if (opt.bore !== false && rf > 2 && fillA > 0) {
    g.save(); g.globalAlpha = alpha * fillA;
    poly(ring(o, front, rf), true);
    const bgr = g.createLinearGradient(0, CY - 200 * S, 0, CY + 200 * S); bgr.addColorStop(0, C.bore); bgr.addColorStop(1, '#C9C5BC');
    g.fillStyle = bgr; g.fill(); g.clip();
    if (len > 4) { g.fillStyle = C.page; poly(ring(o, back, rf), true); g.fill(); g.strokeStyle = C.line; g.lineWidth = 1.4; g.stroke(); }
    g.restore();
    if (opt.hatch && V[0] > .02) hatchFace(o, front, rf, sp, alpha * fillA * opt.hatch);
    else if (spk > 0 && V[0] > .05) {
      g.fillStyle = C.mid;
      for (const [q, th0, sz, k] of SPK.face) {
        const th = th0 + sp, rr = lerp(rf + 3, r - 2, q), p = pt(front, th, rr);
        g.globalAlpha = alpha * spk * Math.min(1, V[0] * 3) * (.3 + .45 * k);
        g.fillRect(p[0] - sz * .5, p[1] - sz * .5, sz, sz);
      }
    }
  }
  // Ink: far rim (visible half), silhouettes, near rim, bore rim.
  g.lineJoin = 'round'; g.lineCap = 'round';
  if (inkA > 0) {
    for (const run of ringRuns(o, back, r, 1)) { g.globalAlpha = alpha * inkA * (run.v ? 1 : opt.hidden ?? 0); if (g.globalAlpha > 0) { g.strokeStyle = run.v ? C.ink : C.line; g.lineWidth = run.v ? LW : 1.4; poly(run.pts); g.stroke(); } }
    g.globalAlpha = alpha * inkA; g.strokeStyle = C.ink; g.lineWidth = LW;
    if (len > 2) for (const th of sil) { const a = pt(back, th), b = pt(front, th); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    poly(ring(o, front, r), true); g.stroke();
    if (opt.bore !== false && rf > 2) { g.lineWidth = LW * .9; poly(ring(o, front, rf), true); g.stroke(); }
  }
  g.restore();
}

/* Steel cage: longitudinal bars plus a wound helix. */
function cage(o, x0, x1, rc, bars, helix, alpha = 1) {
  if (alpha <= 0) return;
  g.save(); g.lineCap = 'round';
  const nb = 12;
  for (let k = 0; k < nb; k++) {
    const th = k / nb * TAU + .13, f = clamp(bars * 1.5 - k * .04), vis = visA(th) > 0;
    const pts = [P(o[0] + x1, o[1] + rc * Math.sin(th), o[2] + rc * Math.cos(th)), P(o[0] + x0, o[1] + rc * Math.sin(th), o[2] + rc * Math.cos(th))];
    g.globalAlpha = alpha * (vis ? 1 : .55); g.strokeStyle = vis ? C.ink : C.line; g.lineWidth = vis ? 1.5 : 1.1; strokeFrac(pts, out3(f));
  }
  for (const x of [x0, x1]) { g.globalAlpha = alpha; g.strokeStyle = C.ink; g.lineWidth = 1.6; strokeFrac(ring(o, x, rc), out3(bars)); }
  if (helix > 0) {
    const turns = 13, n = 1300, m = Math.floor(n * helix);
    let run = null;
    const flush = () => { if (run && run.pts.length > 1) { g.globalAlpha = alpha * (run.v ? 1 : .6); g.strokeStyle = run.v ? C.ink : C.line; g.lineWidth = run.v ? 1.5 : 1.1; poly(run.pts); g.stroke(); } };
    for (let i = 0; i <= m; i++) {
      const u = i / n, th = u * turns * TAU, x = lerp(x0, x1, u);
      const p = P(o[0] + x, o[1] + rc * Math.sin(th), o[2] + rc * Math.cos(th)), v = visA(th) > 0;
      if (!run || run.v !== v) { if (run) { run.pts.push(p); flush(); } run = { v, pts: [p] }; } else run.pts.push(p);
    }
    flush();
    // Winding head: a small ring marker where the wire is being laid.
    if (helix < 1) { const u = m / n, th = u * turns * TAU, p = P(o[0] + lerp(x0, x1, u), o[1] + rc * Math.sin(th), o[2] + rc * Math.cos(th)); g.globalAlpha = alpha; g.strokeStyle = C.ink; g.lineWidth = 1.6; g.beginPath(); g.arc(p[0], p[1], 6, 0, TAU); g.stroke(); }
  }
  g.restore();
}

/* Axis-aligned box: o = min corner, s = size. Visible faces only. */
function box(o, s, alpha = 1, fill = C.surf) {
  if (alpha <= 0) return;
  const [x, y, z] = o, [a, b, c] = s;
  const v = (i, j, k) => P(x + i * a, y + j * b, z + k * c);
  const faces = [
    [[1, 0, 0], [v(1,0,0), v(1,1,0), v(1,1,1), v(1,0,1)]], [[-1, 0, 0], [v(0,0,0), v(0,1,0), v(0,1,1), v(0,0,1)]],
    [[0, 1, 0], [v(0,1,0), v(1,1,0), v(1,1,1), v(0,1,1)]], [[0, -1, 0], [v(0,0,0), v(1,0,0), v(1,0,1), v(0,0,1)]],
    [[0, 0, 1], [v(0,0,1), v(1,0,1), v(1,1,1), v(0,1,1)]], [[0, 0, -1], [v(0,0,0), v(1,0,0), v(1,1,0), v(0,1,0)]],
  ];
  g.save(); g.globalAlpha = alpha; g.lineJoin = 'round';
  for (const [n, q] of faces) {
    const d = n[0] * V[0] + n[1] * V[1] + n[2] * V[2]; if (d <= 1e-4) continue;
    g.fillStyle = n[1] === 1 ? C.surf : n[1] === -1 ? C.shade : (d > .6 ? fill : '#ECEAE5');
    poly(q, true); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.stroke();
  }
  g.restore();
}

/* Wheel in the x-y plane at depth z. */
function wheel(cx, cy, cz, r, rot, alpha = 1) {
  const pts = [], hub = [];
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU; pts.push(P(cx + r * Math.cos(a), cy + r * Math.sin(a), cz)); hub.push(P(cx + r * .45 * Math.cos(a), cy + r * .45 * Math.sin(a), cz)); }
  g.save(); g.globalAlpha = alpha; g.fillStyle = C.surf; g.strokeStyle = C.ink; g.lineWidth = 1.8;
  poly(pts, true); g.fill(); g.stroke(); poly(hub, true); g.stroke();
  const s0 = P(cx + r * .45 * Math.cos(rot), cy + r * .45 * Math.sin(rot), cz), s1 = P(cx + r * .9 * Math.cos(rot), cy + r * .9 * Math.sin(rot), cz);
  g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke();
  g.restore();
}


/* ---------- concrete stage kit ---------- */
const HATCH = (() => { const r = rng(21), dots = [], tris = []; for (let i = 0; i < 260; i++) dots.push([r(), r() * TAU, .9 + r() * 1.3]); for (let i = 0; i < 70; i++) tris.push([r(), r() * TAU, r() * TAU, 4 + r() * 4]); return { dots, tris }; })();
// Concrete section hatch (stipple + aggregate triangles) with rebar sections, revealed outside-in.
function hatchFace(o, x, rf, sp, a) {
  if (a <= 0) return;
  const pt = (th, rr) => P(o[0] + x, o[1] + rr * Math.sin(th), o[2] + rr * Math.cos(th));
  g.save();
  g.fillStyle = C.muted;
  for (const [q, th, sz] of HATCH.dots) { const R = lerp(RI + 2, RO - 2, q); if (R < rf + 1) continue; const p = pt(th + sp, R); g.globalAlpha = a * .8; g.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz); }
  g.strokeStyle = C.ink; g.lineWidth = 1.05; g.lineJoin = 'round';
  for (const [q, th, rot, sz] of HATCH.tris) {
    const R = lerp(RI + 4, RO - 4, q); if (R < rf + 3) continue;
    const p = pt(th + sp, R), k = sz * S * .9, rr = rot + sp;
    g.globalAlpha = a * .85; g.beginPath();
    for (let j = 0; j < 3; j++) { const ang = rr + j * TAU / 3; const px = p[0] + Math.cos(ang) * k, py = p[1] + Math.sin(ang) * k * .8; j ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath(); g.stroke();
  }
  // rebar in section: solid dots, as a drawing shows cut steel
  if (rf < RC - 3) { g.fillStyle = C.ink; g.globalAlpha = a; for (let k = 0; k < 12; k++) { const p = pt(k / 12 * TAU + .13 + sp, RC); g.beginPath(); g.arc(p[0], p[1], 3.6 * S, 0, TAU); g.fill(); } }
  g.restore();
}

const RM = 159, RT = 176, TW = 32;             // mould skin radius, end-tyre radius, tyre width (pipe OD is 150)
const vc = () => Math.atan2(V[1], V[2]);       // angle of the surface line facing the camera
function arcPts(o, x, R, a0, a1, n = 60) { const out = []; for (let i = 0; i <= n; i++) { const th = lerp(a0, a1, i / n); out.push(P(o[0] + x, o[1] + R * Math.sin(th), o[2] + R * Math.cos(th))); } return out; }
// Short thick ring (the mould's riding tyre). Its inner disc is left open so the concrete face shows.
function tyre(o, xa, xb, Ro, Ri, a) {
  const front = V[0] >= 0 ? xb : xa, back = V[0] >= 0 ? xa : xb;
  const ths = Math.atan2(-V[2], V[1]), sil = [ths, ths + Math.PI];
  const pt = (x, th, R) => P(o[0] + x, o[1] + R * Math.sin(th), o[2] + R * Math.cos(th));
  g.save(); g.globalAlpha = a;
  g.beginPath(); g.rect(0, 0, W, H); const inner = ring(o, front, Ri); inner.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip('evenodd');
  g.fillStyle = '#E9E7E2'; poly(ring(o, back, Ro), true); g.fill();
  poly([pt(back, sil[0], Ro), pt(front, sil[0], Ro), pt(front, sil[1], Ro), pt(back, sil[1], Ro)], true); g.fill();
  g.fillStyle = C.surf; poly(ring(o, front, Ro), true); g.fill();
  g.restore();
  g.save(); g.globalAlpha = a; g.strokeStyle = C.ink; g.lineCap = 'round'; g.lineJoin = 'round';
  g.lineWidth = 2.8; const c = vc(); poly(arcPts(o, back, Ro, c - Math.PI / 2, c + Math.PI / 2)); g.stroke();
  for (const th of sil) { const p = pt(back, th, Ro), q = pt(front, th, Ro); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  poly(ring(o, front, Ro), true); g.stroke();
  g.lineWidth = 1.4; poly(ring(o, front, Ri), true); g.stroke();
  g.lineWidth = .9; g.globalAlpha = a * .6; poly(ring(o, front, lerp(Ri, Ro, .55)), true); g.stroke();
  g.restore();
}
function mouldBack(o, s, a) { tyre(o, -250 + s, -250 + TW + s, RT, RO, a); }
// Steel mould: translucent skin, double-ruled silhouette, split flanges with bolts that turn with the spin.
function mouldFront(o, s, a, sp) {
  const xa = -250 + TW + s, xb = 250 - TW + s, c = vc();
  const ths = Math.atan2(-V[2], V[1]), sil = [ths, ths + Math.PI];
  const pt = (x, th, R) => P(o[0] + x, o[1] + R * Math.sin(th), o[2] + R * Math.cos(th));
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.globalAlpha = a * .2; g.fillStyle = '#CFCCC5';
  poly([pt(xa, sil[0], RM), pt(xb, sil[0], RM), pt(xb, sil[1], RM), pt(xa, sil[1], RM)], true); g.fill();
  // brushed skin: faint lines running the length on the camera side
  g.strokeStyle = C.mid; g.lineWidth = .8;
  for (let k = 1; k < 16; k++) { const th = c + (k / 16 - .5) * Math.PI * .92; g.globalAlpha = a * .22 * Math.cos((k / 16 - .5) * Math.PI); const p = pt(xa + 6, th, RM), q = pt(xb - 6, th, RM); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  // stiffening hoops
  g.strokeStyle = C.ink; g.lineWidth = 1.6; g.globalAlpha = a;
  for (const f of [1 / 3, 2 / 3]) { const x = lerp(xa, xb, f); poly(arcPts(o, x, RM + 5, c - Math.PI / 2, c + Math.PI / 2)); g.stroke(); }
  // split flanges and bolts
  for (const base of [sp, sp + Math.PI]) {
    const v = visA(base), vis = v > -.15;
    g.globalAlpha = a * (vis ? 1 : .35); g.strokeStyle = vis ? C.ink : C.line; g.lineWidth = vis ? 1.8 : 1;
    for (const R of [RM, RM + 20]) { const p = pt(xa, base, R), q = pt(xb, base, R); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    for (const x of [xa, xb]) { const p = pt(x, base, RM), q = pt(x, base, RM + 20); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    if (vis) for (let x = xa + 28; x < xb - 10; x += 52) { const p = pt(x, base, RM + 11); g.lineWidth = 1.3; g.beginPath(); g.arc(p[0], p[1], 3.4 * S, 0, TAU); g.stroke(); }
  }
  // silhouette, ruled twice for plate thickness
  g.globalAlpha = a; g.strokeStyle = C.ink;
  for (const th of sil) {
    g.lineWidth = 2.8; let p = pt(xa, th, RM), q = pt(xb, th, RM); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
    g.lineWidth = 1; g.globalAlpha = a * .5; p = pt(xa, th, RM - 5); q = pt(xb, th, RM - 5); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); g.globalAlpha = a;
  }
  g.restore();
  tyre(o, 250 - TW + s, 250 + s, RT, RO, a);
}

// The filling machine: a hopper on legs feeding a belt that reaches into the bore.
function feeder(o, f, a, t, sp, rf) {
  const HX = 600 + f, BY = -58, BZ = 30, xh = -175 + f, xt = 860 + f, lvl = lerp(420, 236, io(seg(t, 6.8, 9.0)));
  const Pw = (x, y, z) => P(o[0] + x, o[1] + y, o[2] + z);
  const clipBore = () => { g.beginPath(); ring(o, 250, rf).forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip(); };
  const beltBox = (xA, xB, al) => box([o[0] + xA, o[1] + BY - 16, o[2] - BZ], [xB - xA, 16, BZ * 2], al);
  const chevrons = (xA, xB, al) => {
    g.save(); g.strokeStyle = C.ink; g.lineWidth = 1.5; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = al;
    const step = 46, off = (t * 230) % step;
    for (let x = xB - off; x > xA + 4; x -= step) { const p1 = Pw(x + 12, BY, -14), p2 = Pw(x, BY, 0), p3 = Pw(x + 12, BY, 14); g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.lineTo(p3[0], p3[1]); g.stroke(); }
    g.restore();
  };
  // belt inside the bore, seen only through the open end
  g.save(); clipBore(); beltBox(xh, 252, a * .9); chevrons(xh, 252, a * .7); g.restore();
  // legs under the belt
  g.save(); g.globalAlpha = a; g.strokeStyle = C.ink; g.lineWidth = 2;
  for (const x of [455 + f, 800 + f]) for (const z of [-BZ, BZ]) { const p = Pw(x, BY - 16, z), q = Pw(x + (z > 0 ? 0 : 0), GROUND, z * 2.2); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  g.restore();
  beltBox(252, xt, a); chevrons(252, xt, a);
  // drive drum at the tail
  g.save(); g.globalAlpha = a; g.strokeStyle = C.ink; g.lineWidth = 1.8; g.fillStyle = C.surf;
  const dr = []; for (let i = 0; i <= 40; i++) { const an = i / 40 * TAU; dr.push(Pw(xt + 4 + 18 * Math.cos(an), BY - 8 + 18 * Math.sin(an), BZ + 2)); } poly(dr, true); g.fill(); g.stroke();
  const sa = -t * 9, s0 = Pw(xt + 4, BY - 8, BZ + 2), s1 = Pw(xt + 4 + 15 * Math.cos(sa), BY - 8 + 15 * Math.sin(sa), BZ + 2); g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke();
  g.restore();
  // hopper frame posts
  const T = 108, Bh = 30, TY = 430, BYh = 200;
  g.save(); g.globalAlpha = a; g.strokeStyle = C.ink; g.lineWidth = 2.2;
  for (const [i, j] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = Pw(HX + i * T, TY - 30, j * T), q = Pw(HX + i * T, GROUND, j * T); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  g.restore();
  // hopper: inner faces, concrete level, outer faces, rim
  const top = (i, j) => [HX + i * T, TY, j * T], bot = (i, j) => [HX + i * Bh, BYh, j * Bh];
  const faces = [[[1, -1], [1, 1]], [[-1, 1], [-1, -1]], [[-1, 1], [1, 1]], [[1, -1], [-1, -1]]];
  const fq = ([[i0, j0], [i1, j1]]) => [top(i0, j0), top(i1, j1), bot(i1, j1), bot(i0, j0)];
  const nrm = q => { const u = q[1].map((v, k) => v - q[0][k]), w = q[3].map((v, k) => v - q[0][k]); const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]; const cx = q.reduce((s, p) => s + p[0], 0) / 4 - HX, cz = q.reduce((s, p) => s + p[2], 0) / 4; if (n[0] * cx + n[2] * cz < 0) n.forEach((v, k) => n[k] = -v); return n; };
  const drawQ = (q, fill, lw) => { const pts = q.map(p => Pw(...p)); poly(pts, true); g.fillStyle = fill; g.fill(); g.strokeStyle = C.ink; g.lineWidth = lw; g.stroke(); };
  g.save(); g.globalAlpha = a; g.lineJoin = 'round';
  const fs = faces.map(fq), vis = fs.map(q => { const n = nrm(q); return n[0] * V[0] + n[1] * V[1] + n[2] * V[2] > 0; });
  fs.forEach((q, k) => { if (!vis[k]) drawQ(q, '#DEDBD4', 1.4); });
  // concrete surface inside the hopper, hatched
  const h = Bh + (T - Bh) * (lvl - BYh) / (TY - BYh), lq = [[HX - h, lvl, -h], [HX + h, lvl, -h], [HX + h, lvl, h], [HX - h, lvl, h]].map(p => Pw(...p));
  g.save(); poly(lq, true); g.fillStyle = '#D2CEC5'; g.fill(); g.clip();
  g.fillStyle = C.muted; for (const [q, th, sz] of HATCH.dots) { const u = (q * 7.3) % 1, v = (th / TAU * 5.1) % 1; const p = Pw(HX - h + 2 * h * u, lvl, -h + 2 * h * v); g.fillRect(p[0], p[1], sz, sz); }
  g.restore();
  fs.forEach((q, k) => { if (vis[k]) drawQ(q, k % 2 ? '#ECEAE5' : C.surf, 2); });
  g.strokeStyle = C.ink; g.lineWidth = 2.6; poly([top(-1, -1), top(1, -1), top(1, 1), top(-1, 1)].map(p => Pw(...p)), true); g.stroke();
  // level gauge on the hopper side
  const gx0 = Pw(HX + T + 18, BYh + 10, -T), gx1 = Pw(HX + T + 18, TY - 10, -T), gl = Pw(HX + T + 18, lvl, -T);
  g.lineWidth = 1.2; g.beginPath(); g.moveTo(gx0[0], gx0[1]); g.lineTo(gx1[0], gx1[1]); g.stroke();
  g.fillStyle = C.ink; g.beginPath(); g.moveTo(gl[0] + 9, gl[1]); g.lineTo(gl[0] + 1, gl[1] - 5); g.lineTo(gl[0] + 1, gl[1] + 5); g.closePath(); g.fill();
  g.restore();
  box([o[0] + HX - 22, o[1] + 40, o[2] - 22], [44, BYh - 40, 44], a);      // discharge chute
  // aggregate: drops from the chute, rides the belt, is thrown onto the spinning wall
  const N = 90, Tp = 2.6, r = rng(5), parts = [];
  for (let i = 0; i < N; i++) {
    const ph = r(), th0 = r() * TAU, zr = (r() - .5) * 30, sz = 2.6 + r() * 3.6, kind = r(), wr = r();
    const k = Math.floor((t - ph * Tp) / Tp), born = ph * Tp + k * Tp, u = (t - born) / Tp;
    if (born < 6.75 || born > 8.85) continue;
    let p, inside = false;
    if (u < .12) { const e = in3(u / .12); p = [HX, lerp(40, BY + 3, e), zr * .4]; }
    else if (u < .82) { const e = (u - .12) / .7; p = [lerp(HX, xh + 20, e), BY + 3, zr]; inside = p[0] < 250; }
    else { const e = out3((u - .82) / .18), th = th0 + sp; const R = lerp(rf, RO - 2, wr * .5); p = [lerp(xh + 20, xh + 60, e), lerp(BY + 3, R * Math.sin(th), e), lerp(zr, R * Math.cos(th), e)]; inside = true; }
    parts.push([Pw(...p), sz, kind, inside, i]);
  }
  const drawPart = ([p, sz, kind, , i]) => {
    g.globalAlpha = a; if (kind < .55) { g.fillStyle = C.ink; g.beginPath(); const rr = i * 1.7 + t * 4; for (let j = 0; j < 3; j++) { const an = rr + j * TAU / 3; j ? g.lineTo(p[0] + Math.cos(an) * sz, p[1] + Math.sin(an) * sz) : g.moveTo(p[0] + Math.cos(an) * sz, p[1] + Math.sin(an) * sz); } g.closePath(); g.fill(); }
    else { g.fillStyle = C.muted; g.fillRect(p[0] - sz * .35, p[1] - sz * .35, sz * .7, sz * .7); }
  };
  g.save(); clipBore(); parts.filter(q => q[3]).forEach(drawPart); g.restore();
  g.save(); parts.filter(q => !q[3]).forEach(drawPart); g.restore();
}

// Technical callout: leader draws on, then the label types in with a block cursor.
function callout(t, a, b, anchor, dx, dy, text) {
  if (MODE.compact) return;
  const k = seg(t, a, a + .35), ty = seg(t, a + .25, a + .25 + text.length * .03), out = seg(t, b, b + .3);
  if (k <= 0 || out >= 1) return;
  const e = [anchor[0] + dx, anchor[1] + dy], end = [e[0] + (dx >= 0 ? 34 : -34), e[1]];
  g.save(); g.globalAlpha = 1 - out; g.strokeStyle = C.ink; g.lineWidth = 1.2; g.lineCap = 'round';
  g.fillStyle = C.page; g.beginPath(); g.arc(anchor[0], anchor[1], 4, 0, TAU); g.fill(); g.stroke();
  strokeFrac([anchor, e, end], out3(k));
  if (ty > 0) {
    g.font = font(14, 'mono'); g.letterSpacing = '2.5px'; g.textBaseline = 'middle'; g.fillStyle = C.ink;
    const str = text.slice(0, Math.ceil(text.length * ty)), right = dx < 0;
    g.textAlign = right ? 'right' : 'left'; const x = end[0] + (right ? -10 : 10);
    g.fillText(str, x, end[1] + 1);
    if (ty < 1 || Math.floor(t * 4) % 2 === 0 && t < b - .2 && t < a + 1.6) { const w = g.measureText(str).width; g.fillRect(right ? x - w - 12 : x + w + 3, end[1] - 7, 8, 14); }
  }
  g.restore();
}


/* ---------- dispatch kit ---------- */
const TK = 1.6;   // truck parts are modelled small and drawn 1.6x about their ground point
function scaled(k, pv, fn) {
  const sx = CX, sy = CY, ss = S, pr = pv[0] * R[0] + pv[2] * R[2], pu = pv[0] * U[0] + pv[1] * U[1] + pv[2] * U[2];
  CX = sx + ss * (1 - k) * pr; CY = sy - ss * (1 - k) * pu; S = ss * k;
  try { fn(); } finally { CX = sx; CY = sy; S = ss; }
}
const truckAt = t => t < 18.5 ? keys(t, [[16.45, 2000], [17.65, 0]]) : 2900 * in3(seg(t, 18.5, 19.5));
// A square-section member between two points, drawn as a filled ribbon with a web line.
function beam(a3, b3, w, al) {
  const a = P(...a3), b = P(...b3), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w * S / 2, ny = dx / L * w * S / 2;
  g.save(); g.globalAlpha = al; g.lineJoin = 'round';
  poly([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]], true); g.fillStyle = C.surf; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.stroke();
  g.strokeStyle = C.mid; g.lineWidth = .8; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  g.restore();
}
// Convex prism: a profile in the x-y plane extruded between z0 and z1. Visible faces only.
function prism(pr, z0, z1, ox, oy, al, tone) {
  const n = pr.length, cx = pr.reduce((s, p) => s + p[0], 0) / n, cy = pr.reduce((s, p) => s + p[1], 0) / n;
  const faces = [[[0, 0, 1], pr.map(([x, y]) => P(ox + x, oy + y, z1))], [[0, 0, -1], pr.map(([x, y]) => P(ox + x, oy + y, z0))]];
  for (let i = 0; i < n; i++) {
    const p = pr[i], q = pr[(i + 1) % n]; let nx = q[1] - p[1], ny = -(q[0] - p[0]); const L = Math.hypot(nx, ny);
    nx /= L; ny /= L; if (((p[0] + q[0]) / 2 - cx) * nx + ((p[1] + q[1]) / 2 - cy) * ny < 0) { nx = -nx; ny = -ny; }
    faces.push([[nx, ny, 0], [P(ox + p[0], oy + p[1], z0), P(ox + q[0], oy + q[1], z0), P(ox + q[0], oy + q[1], z1), P(ox + p[0], oy + p[1], z1)]]);
  }
  g.save(); g.globalAlpha = al; g.lineJoin = 'round';
  for (const [nv, q] of faces) {
    const d = nv[0] * V[0] + nv[1] * V[1] + nv[2] * V[2]; if (d <= 1e-4) continue;
    g.fillStyle = tone || (nv[1] > .55 ? C.surf : d > .55 ? '#F1EFEA' : '#E4E1DB'); poly(q, true); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 2; g.stroke();
  }
  g.restore();
}
// Tyre on an axle along z: rubber in solid ink, a pale rim, hub and lug nuts, tread notches that turn.
function tyreZ(cx, cy, zc, r, w, rot, al) {
  const zf = zc + (V[2] >= 0 ? w / 2 : -w / 2), zb = zc - (V[2] >= 0 ? w / 2 : -w / 2);
  const circ = (z, rr, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const an = i / n * TAU; o.push(P(cx + rr * Math.cos(an), cy + rr * Math.sin(an), z)); } return o; };
  const F = circ(zf, r), B = circ(zb, r), a0 = P(0, 0, 0), a1 = P(0, 0, 1), dz = [a1[0] - a0[0], a1[1] - a0[1]], nrm = [-dz[1], dz[0]];
  let hi = 0, lo = 0; F.forEach((p, i) => { const v = p[0] * nrm[0] + p[1] * nrm[1]; if (v > F[hi][0] * nrm[0] + F[hi][1] * nrm[1]) hi = i; if (v < F[lo][0] * nrm[0] + F[lo][1] * nrm[1]) lo = i; });
  g.save(); g.globalAlpha = al; g.fillStyle = C.ink; g.strokeStyle = C.ink; g.lineWidth = 1.6;
  poly(B, true); g.fill(); poly([F[hi], B[hi], B[lo], F[lo]], true); g.fill(); poly(F, true); g.fill();
  g.strokeStyle = C.page; g.lineWidth = 2;
  for (let k = 0; k < 18; k++) { const an = rot + k / 18 * TAU, p = P(cx + r * .97 * Math.cos(an), cy + r * .97 * Math.sin(an), zf), q = P(cx + r * .86 * Math.cos(an), cy + r * .86 * Math.sin(an), zf); g.globalAlpha = al * .55; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  g.globalAlpha = al; g.fillStyle = C.surf; g.strokeStyle = C.ink; g.lineWidth = 1.5;
  poly(circ(zf, r * .62), true); g.fill(); g.stroke();
  poly(circ(zf, r * .26, 24), true); g.stroke();
  g.fillStyle = C.ink; for (let k = 0; k < 6; k++) { const an = rot + k / 6 * TAU, p = P(cx + r * .43 * Math.cos(an), cy + r * .43 * Math.sin(an), zf); g.beginPath(); g.arc(p[0], p[1], 2.4 * S + .6, 0, TAU); g.fill(); }
  g.restore();
}

function dispatchRig(t, add, pd, carry, lift, gone) {
  const tx = truckAt(t), here = seg(t, 16.4, 16.6) * gone;
  // suspension: settles after the reverse, dips when the load lands, squats on pull-away
  const bob = (t > 17.65 ? 6 * Math.sin((t - 17.65) * 20) * Math.exp(-(t - 17.65) * 6) : 0) + (t > 18.02 ? -5 * Math.sin((t - 18.02) * 18) * Math.exp(-(t - 18.02) * 6) : 0) + (t > 18.5 ? -4 * Math.sin(seg(t, 18.5, 18.9) * Math.PI) : 0);
  const rot = -tx / 42, cabY = bob, deckY = bob;
  const gA = io(seg(t, 15.95, 16.5)) * (1 - seg(t, 19.0, 19.4));
  const pipeTop = lift + RO;
  const hookY = t < 18.05 ? lerp(590, pipeTop + 120, io(seg(t, 16.2, 16.6))) : lerp(pipeTop + 120, 590, io(seg(t, 18.1, 18.5)));
  const legH = out3(seg(t, 15.95, 16.45));

  // gantry: far frame, then (after the pipe) beam, hoist and near frame
  const frame = (z, k = 1) => { const a = gA * k, top = [0, lerp(GROUND, 680, legH), z]; beam([-230, GROUND, z], top, 18, a); beam([230, GROUND, z], top, 18, a); if (legH > .6) beam([-130, lerp(GROUND, 680, legH) * .42 + GROUND * .58, z], [130, lerp(GROUND, 680, legH) * .42 + GROUND * .58, z], 11, a * seg(legH, .6, 1)); };
  if (gA > 0) {
    add(pd - 1200, () => frame(-370));
    add(pd + 700, () => {
      box([-26, 680, -400], [52, 44, 800], gA * seg(t, 16.2, 16.45));
      const tr = seg(t, 16.2, 16.45); if (tr > 0) box([-38, 642, -40], [76, 38, 80], gA * tr);
      // twin hoist ropes, hook block, hook
      const ha = gA * seg(t, 16.25, 16.4);
      if (ha > 0) {
        for (const dx of [-7, 7]) ln(P(dx, 642, 0), P(dx, hookY + 34, 0), C.ink, 1.5, ha);
        box([-20, hookY, -15], [40, 34, 30], ha);
        g.save(); g.globalAlpha = ha; g.strokeStyle = C.ink; g.lineWidth = 2.4; const h = P(0, hookY - 4, 0); g.beginPath(); g.arc(h[0], h[1] + 8, 8, -Math.PI * .1, Math.PI * 1.1); g.stroke(); g.restore();
        // two-point sling: draws on after the hook comes down, slackens and lifts away after landing
        const sl = out3(seg(t, 16.55, 16.85)) * (1 - seg(t, 18.05, 18.2));
        if (sl > 0) for (const sx of [-150, 150]) { g.save(); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.globalAlpha = ha; strokeFrac([P(0, hookY - 10, 0), P(carry + sx, pipeTop + 2, 0)], sl); g.restore(); }
      }
    });
    add(pd + 1300, () => frame(370, .42));   // foreground frame ghosted so the truck reads through it
  }
  if (here <= 0) return;

  // road: lane dashes on the ground the truck will use
  add(pd - 2000, () => { g.save(); g.setLineDash([]); for (const z of [-440, 440]) for (let x = -1600; x < 3600; x += 130) ln(P(x, GROUND, z), P(x + 60, GROUND, z), C.line, 2.2, here * .9); g.restore(); });

  const X = tx, Yd = -72 + deckY;
  // far wheels, exhaust stack, chassis, deck, far stakes, chocks
  add(pd - 900, () => scaled(TK, [X, GROUND, 0], () => { for (const [wx, w] of [[450, 30], [-140, 46], [-255, 46]]) tyreZ(X + wx, -133, -150, 42, w, rot, here); }));
  add(pd - 800, () => scaled(TK, [X, GROUND, 0], () => {
    const sx = X + 306, sz = -128, top = 215 + cabY;
    g.save(); g.globalAlpha = here; g.fillStyle = C.surf; g.strokeStyle = C.ink; g.lineWidth = 1.8;
    const l0 = P(sx - 9, -40 + cabY, sz), l1 = P(sx - 9, top, sz), r0 = P(sx + 9, -40 + cabY, sz), r1 = P(sx + 9, top, sz);
    poly([l0, l1, r1, r0], true); g.fill(); g.stroke();
    const e = []; for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU; e.push(P(sx + 9 * Math.cos(an), top, sz + 9 * Math.sin(an))); } poly(e, true); g.fill(); g.stroke();
    g.restore();
  }));
  add(pd - 700, () => scaled(TK, [X, GROUND, 0], () => { box([X - 380, -112 + deckY, -62], [700, 20, 124], here); box([X - 388, -92 + deckY, -178], [708, 20, 356], here); }));
  add(pd - 650, () => scaled(TK, [X, GROUND, 0], () => {
    // deck planks + far stake posts
    g.save(); g.globalAlpha = here * .7; g.strokeStyle = C.mid; g.lineWidth = .9;
    for (let z = -146; z < 178; z += 36) { const a = P(X - 388, Yd, z), b = P(X + 320, Yd, z); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.restore();
    for (let x = -360; x <= 300; x += 110) ln(P(X + x, Yd, -178), P(X + x, Yd + 34, -178), C.ink, 2, here);
  }));
  add(pd - 600, () => scaled(TK, [X, GROUND, 0], () => { for (const x of [-150, 150]) for (const z of [-64, 64]) prism([[-26, 0], [26, 0], [16, 24], [-16, 24]], z - 16, z + 16, X + x, Yd, here, '#E3DCCF'); }));

  // straps over the load (after it lands), then cab, near wheels, guards, tank, near stakes
  const strapF = out3(seg(t, 18.15, 18.55));
  if (strapF > 0) add(pd + 120, () => {
    for (const xs of [-105, 105]) {
      const cy0 = lift, R = RO + 3, Az = 178 * TK, Ay = GROUND + TK * (Yd - GROUND), dy = Ay - cy0, d = Math.hypot(dy, Az), al = Math.atan2(dy, Az), th1 = al + Math.acos(R / d);
      const path = [P(X + xs, Ay, Az)]; for (let i = 0; i <= 40; i++) { const th = lerp(th1, Math.PI - th1, i / 40); path.push(P(X + xs, cy0 + R * Math.sin(th), R * Math.cos(th))); }
      const vis = path.map((p, i) => i === 0 || visA(lerp(th1, Math.PI - th1, (i - 1) / 40)) > 0);
      const n = Math.floor(path.length * strapF);
      g.save(); g.globalAlpha = here; g.strokeStyle = C.ink; g.lineCap = 'round'; g.lineJoin = 'round';
      for (const [lw, col] of [[6, C.ink], [2, '#8C887F']]) { g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); let on = false; for (let i = 0; i < n; i++) { if (!vis[i]) { on = false; continue; } const p = path[i]; on ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); on = true; } g.stroke(); }
      if (strapF > .15) { const m = P(X + xs, lerp(Ay, cy0 + R * Math.sin(th1), .45), lerp(Az, R * Math.cos(th1), .45)); g.fillStyle = C.surf; g.lineWidth = 1.6; g.strokeStyle = C.ink; g.beginPath(); g.rect(m[0] - 9, m[1] - 7, 18, 14); g.fill(); g.stroke(); }
      g.restore();
    }
  });
  add(pd + 300, () => scaled(TK, [X, GROUND, 0], () => {
    const cab = [[318, -92], [535, -92], [535, 28], [490, 150], [318, 150]];
    prism(cab, -160, 160, X, cabY, here);
    prism([[345, 150], [470, 150], [432, 212], [345, 212]], -150, 150, X, cabY, here);   // roof fairing
    prism([[535, -112], [552, -112], [552, -80], [535, -80]], -168, 168, X, cabY, here);  // bumper
    const Q = (pts, z) => pts.map(([x, y]) => P(X + x, y + cabY, z));
    g.save(); g.globalAlpha = here; g.lineJoin = 'round';
    // windscreen on the raked face
    const ws = [[533, 34, -142], [533, 34, 142], [494, 140, 142], [494, 140, -142]].map(([x, y, z]) => P(X + x, y + cabY, z));
    poly(ws, true); g.fillStyle = '#D6D3CB'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = C.page; g.lineWidth = 3; for (const f of [.3, .42]) { const a = P(X + lerp(533, 494, f + .25), lerp(34, 140, f + .25) + cabY, -110), b = P(X + lerp(533, 494, f - .15), lerp(34, 140, f - .15) + cabY, -20); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    // side window, door, handle, step on the near side
    const zN = V[2] >= 0 ? 160.5 : -160.5;
    poly(Q([[428, 46], [528, 46], [498, 134], [428, 134]], zN), true); g.fillStyle = '#D6D3CB'; g.fill(); g.strokeStyle = C.ink; g.lineWidth = 1.6; g.stroke();
    g.strokeStyle = C.page; g.lineWidth = 3; { const a = P(X + 445, 120 + cabY, zN), b = P(X + 475, 60 + cabY, zN); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    g.strokeStyle = C.ink; g.lineWidth = 1.3; poly(Q([[412, -80], [530, -80], [530, 140], [412, 140]], zN), true); g.stroke();
    g.lineWidth = 2.4; { const a = P(X + 422, 18 + cabY, zN), b = P(X + 442, 18 + cabY, zN); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    // grille slats, headlamps on the front face
    g.lineWidth = 1.4; for (let y = -64; y <= 8; y += 12) { const a = P(X + 535.5, y + cabY, -100), b = P(X + 535.5, y + cabY, 100); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    for (const z of [-132, 132]) { poly([P(X + 535.5, -58 + cabY, z - 16), P(X + 535.5, -58 + cabY, z + 16), P(X + 535.5, -30 + cabY, z + 16), P(X + 535.5, -30 + cabY, z - 16)], true); g.fillStyle = C.page; g.fill(); g.stroke(); }
    // mirror on its arm
    const ma = P(X + 505, 110 + cabY, zN), mb = P(X + 518, 118 + cabY, zN + (zN > 0 ? 44 : -44)); g.lineWidth = 1.8; g.beginPath(); g.moveTo(ma[0], ma[1]); g.lineTo(mb[0], mb[1]); g.stroke();
    poly(Q([[512, 70], [524, 70], [524, 122], [512, 122]], zN + (zN > 0 ? 46 : -46)), true); g.fillStyle = C.surf; g.fill(); g.stroke();
    g.restore();
  }));
  add(pd + 400, () => scaled(TK, [X, GROUND, 0], () => {
    for (let x = -360; x <= 300; x += 110) ln(P(X + x, Yd, 178), P(X + x, Yd + 34, 178), C.ink, 2, here);
    pipe([X, -122 + deckY, 150], 336, 404, 24, 0, { alpha: here, bore: false, speck: 0 });                            // fuel tank
    for (const [wx, w] of [[450, 30], [-140, 46], [-255, 46]]) tyreZ(X + wx, -133, 150, 42, w, rot, here);
    g.save(); g.globalAlpha = here; g.strokeStyle = C.ink; g.lineWidth = 2.6; g.lineCap = 'round';
    for (const [cx0, x0, x1] of [[-198, -320, -76]]) { const pts = []; for (let i = 0; i <= 30; i++) { const an = lerp(Math.PI * .96, Math.PI * .04, i / 30); pts.push(P(X + cx0 + 125 * Math.cos(an), -133 + deckY + 58 * Math.sin(an), 176)); } poly(pts); g.stroke(); }
    { const pts = []; for (let i = 0; i <= 24; i++) { const an = lerp(Math.PI * .95, Math.PI * .05, i / 24); pts.push(P(X + 450 + 56 * Math.cos(an), -133 + cabY + 56 * Math.sin(an), 166)); } poly(pts); g.stroke(); }
    g.restore();
  }));

  // exhaust: line-drawn puffs, emitted where the stack was when they left it
  add(pd + 1400, () => {
    g.save(); g.strokeStyle = C.ink; g.lineWidth = 1.3;
    const per = .28, life = 1.5;
    for (let k = Math.floor((t - life) / per); k <= Math.floor(t / per); k++) {
      const born = k * per, u = (t - born) / life; if (u < 0 || u > 1 || born < 16.45 || born > 19.4) continue;
      const bx = truckAt(born) + 306 * TK, rr = (6 + 30 * out3(u)) * S, p = P(bx - 90 * u, GROUND + TK * (222 - GROUND) + 190 * out3(u), -128 * TK + 40 * u);
      g.globalAlpha = .55 * Math.pow(1 - u, 1.4) * gone; g.beginPath(); g.arc(p[0], p[1], rr, 0, TAU); g.stroke();
    }
    // reversing beeper: arcs off the tail while backing in
    const rv = seg(t, 16.55, 16.75) * (1 - seg(t, 17.5, 17.7));
    if (rv > 0) { const p = P(X - 392 * TK, GROUND + TK * (-40 - GROUND), 0), q = P(X - 492 * TK, GROUND + TK * (-40 - GROUND), 0), ang = Math.atan2(q[1] - p[1], q[0] - p[0]); g.lineWidth = 1.6; for (let i = 0; i < 3; i++) { const ph = ((t * 2.2) + i / 3) % 1; g.globalAlpha = rv * (1 - ph); g.beginPath(); g.arc(p[0], p[1], 10 + ph * 34, ang - .5, ang + .5); g.stroke(); } }
    g.restore();
  });
}

function dispatchNotes(t, carry, lift) {
  if (t < 16.4 || t > 19.6) return;
  const X = truckAt(t), hy = lerp(590, lift + RO + 120, io(seg(t, 16.2, 16.6)));
  callout(t, 16.6, 17.75, P(0, hy + 17, -20), 70, -70, 'GANTRY · TWO-POINT LIFT');
  callout(t, 17.85, 18.75, P(X - 150 * TK, GROUND + TK * (-58 - GROUND), 80 * TK), -50, 190, 'TIMBER CHOCKS');
  callout(t, 18.3, 19.2, P(X + 105, lift + RO + 4, 0), 40, -120, 'RATCHET STRAPS');
}

/* ---------- type ---------- */
function font(px, kind, weight = 400) { return kind === 'tight' ? `600 ${px}px "SP Tight", Arial, sans-serif` : kind === 'mono' ? `400 ${px}px "SP Mono", ui-monospace, monospace` : `${weight} ${px}px "SP Inter", Arial, sans-serif`; }
// Masked line reveal: each line rises into its slot, then rises out. Lines are staggered for a soft cascade.
function lines(t, list, x, y, lh, inAt, outAt, style) {
  list.forEach((txt, i) => {
    const a = out5(seg(t, inAt + i * .07, inAt + .75 + i * .07)), b = in3(seg(t, outAt + i * .05, outAt + .5 + i * .05));
    if (a <= 0 || b >= 1) return;
    const top = y + i * lh;
    g.save(); g.beginPath(); g.rect(style.align === 'center' ? x - 800 : x - 20, top - lh * .82, style.align === 'center' ? 1600 : 1100, lh * 1.12); g.clip();
    g.font = style.font; g.fillStyle = style.color; g.textBaseline = 'alphabetic'; g.textAlign = style.align || 'left';
    if (style.track) g.letterSpacing = style.track;
    g.globalAlpha = Math.min(1, a * 1.4) * (1 - b * .6);
    g.fillText(txt, x, top + (1 - a) * lh * .9 - b * lh * .9);
    g.restore();
  });
}

const ST = [
  { n: '01', name: 'Steel',    head: ['Steel.'],    body: ['Mill-certified wire rod,', 'caged in-house.'], tag: 'WIRE ROD · IS 7887 GR 2',     a: 2.5,  b: 5.5 },
  { n: '02', name: 'Concrete', head: ['Concrete.'], body: ['OPC 53 concrete, belt-fed', 'into a closed steel mould.'], tag: 'CEMENT · OPC 53 · IS 269 : 2015', a: 5.5,  b: 9.6 },
  { n: '03', name: 'Spin',     head: ['Spin.'],     body: ['Spun hard, the wall packs', 'dense and even.'],          a: 9.6,  b: 11.4 },
  { n: '04', name: 'Cure',     head: ['Cure.'],     body: ['Rested and cured', 'in our own yards.'],            a: 11.4, b: 13.8 },
  { n: '05', name: 'Test',     head: ['Test.'],     body: ['Compression, dimensional', 'and load tested.'],      a: 13.8, b: 16.0 },
  { n: '06', name: 'Dispatch', head: ['Dispatch.'], body: ['500+ truck dispatches', 'a month.'], tag: 'GANTRY LIFT · CHOCKED · STRAPPED', a: 16.0, b: 19.6 },
];

/* ---------- the shot ---------- */
const O = [0, 0, 0], L = 500, RO = 150, RI = 124, RC = 137, GROUND = -175;
const spinAt = (() => { // integrate spin speed so the angle is smooth through ramps
  const sp = [[6.0, 0], [6.9, .7], [9.3, .7], [10.1, 4.2], [10.9, 4.2], [11.6, 0]];
  const dt = 1 / 240, table = [0]; for (let i = 1; i <= T * 240; i++) table.push(table[i - 1] + keys(i * dt, sp) * TAU * dt);
  return t => { const i = clamp(t * 240, 0, table.length - 1), k = Math.floor(i); return lerp(table[k], table[Math.min(k + 1, table.length - 1)], i - k); };
})();

function drawGrid(t) {
  g.save(); g.fillStyle = C.line; const off = (spline(t, CAM.psi) - 60) * 1.4;
  for (let y = 60; y < H; y += 40) for (let x = (off % 40 + 40) % 40; x < W; x += 40) { g.globalAlpha = .38; g.fillRect(x, y, 1.6, 1.6); }
  g.restore();
}

function render(t) {
  setCam(t);
  g.setTransform(K, 0, 0, K, 0, 0);
  if (MODE.embed) g.clearRect(0, 0, W, H); else { g.fillStyle = C.page; g.fillRect(0, 0, W, H); drawGrid(t); }

  const endA = seg(t, 19.55, 20.1);           // HUD + world fade toward the end card
  g.save(); g.beginPath(); g.rect(0, 70, W, 880); g.clip();

  // Ground line, a long datum the whole process sits on.
  const gA = seg(t, 2.2, 3.4) * (1 - endA);
  if (gA > 0) { ln(P(-4000, GROUND, 0), P(4000, GROUND, 0), C.line, 1.4, gA); }

  // Hero pipe state through the stations.
  const extrude = io(seg(t, 1.9, 3.5));
  const x1 = L / 2, x0 = x1 - L * extrude;
  const body = io(seg(t, 6.9, 7.9));                       // concrete shows through the mould as it lands
  const wall = io(seg(t, 6.9, 9.5));                       // wall builds from the mould inward
  const rinFace = lerp(RO - 3, RI, wall);
  const spin = spinAt(t);
  const heroZ = keys(t, [[11.3, 0], [12.3, -158], [13.5, -158], [14.5, 0]]);
  const lift = keys(t, [[16.85, 0], [17.35, 268], [17.7, 268], [18.05, 178]]);
  const truckX = truckAt(t);
  const carry = t >= 18.5 ? truckX : 0;
  const ho = [carry, lift, heroZ];
  const mouldS = keys(t, [[5.45, 1100], [6.4, 0], [10.95, 0], [11.7, 1300]]);
  const mouldA = seg(t, 5.45, 5.8) * (1 - seg(t, 11.35, 11.7));
  const gone = 1 - seg(t, 19.3, 19.55);

  // Intro ring: drawn flat, it becomes the pipe's open face as the camera turns.
  const ringIn = out3(seg(t, .15, 1.25)), boreIn = out3(seg(t, .45, 1.45));
  const intro = t < 2.2;

  // Ghost envelope: the pipe the cage will live in.
  const ghostA = (t > 1.9 && t < 7.2) ? (1 - body) * .9 : 0;
  if (ghostA > 0 && extrude > 0) {
    g.save(); g.setLineDash([6, 7]);
    pipe(O, x0, x1, RO, RI, { fill: 0, ink: ghostA * .55, bore: true, hidden: 0 });
    g.restore();
  }

  const objs = [];
  const add = (d, fn) => objs.push([d, fn]);

  // Rollers + bed for spinning.
  const rollA = io(seg(t, 5.6, 6.3)) * (1 - io(seg(t, 11.1, 11.7)));
  if (rollA > 0) {
    const rr = 20, ry = -160, rz = 112;
    for (const z of [-rz, rz]) for (const xs of [[-262, -212], [212, 262]]) {
      add(depth(xs[0], ry, z) - 420 + (z > 0 ? 300 : 0), () => box([xs[0] + 5, GROUND, z - 16], [40, ry - GROUND, 32], rollA));
      add(depth(xs[0], ry, z) - 400 + (z > 0 ? 300 : 0), () => pipe([0, ry, z], xs[0], xs[1], rr, 0, { alpha: rollA, bore: false, spin: -spin * 8, speck: 0 }));
    }
  }

  // Hero.
  add(depth(carry, lift, heroZ), () => {
    if (intro) {
      // front-on drawing of the section with draw-on strokes
      g.save(); g.strokeStyle = C.ink; g.lineWidth = LW; g.lineCap = 'round';
      strokeFrac(ring(ho, x1, RO, 160).map((p, i, a) => a[(i + 40) % a.length]), ringIn);
      g.lineWidth = LW * .9; strokeFrac(ring(ho, x1, RI, 160).map((p, i, a) => a[(i + 120) % a.length]), boreIn);
      g.restore();
      if (t > 1.85) pipe(ho, x0, x1, RO, RI, { fill: 0, ink: 1, bore: true });
    } else {
      const cageA = 1 - io(seg(t, 7.3, 8.6)) * .85;
      if (mouldA > 0) mouldBack(ho, mouldS, mouldA, spin);
      if (body < 1) cage(ho, x0 + 8, x1 - 8, RC, io(seg(t, 2.6, 3.9)), io(seg(t, 3.1, 5.7)), cageA);
      const hatch = seg(t, 6.95, 7.3) * (1 - seg(t, 11.2, 11.8));
      if (extrude > 0 && t > 3.4) pipe(ho, x0, x1, RO, RI, { fill: Math.max(body * .94, hatch), ink: Math.max(body, hatch), speck: wall, spin, socket: false, rinFace, hidden: 0, alpha: gone, hatch, face: '#E7E4DD', sideFill: body });
      if (t < 3.5) pipe(ho, x0, x1, RO, RI, { fill: 0, ink: 1, bore: true });
      if (body > 0 && body < 1) cage(ho, x0 + 8, x1 - 8, RC, 1, 1, (1 - body) * .5);
      if (mouldA > 0) mouldFront(ho, mouldS, mouldA, spin);
    }
  });

  // Hopper + belt feeder: rolls up to the open mould, carries concrete in, then backs away.
  const feedX = keys(t, [[5.9, 1300], [6.75, 0], [9.15, 0], [9.9, 1500]]);
  const feedA = seg(t, 5.9, 6.2) * (1 - seg(t, 9.6, 9.9));
  if (feedA > 0) add(depth(L, 0, 0) + 9999, () => feeder(ho, feedX, feedA, t, spin, rinFace));

  // Curing stack.
  const stackIn = seg(t, 11.4, 12.5), stackOut = seg(t, 13.4, 14.3);
  if (stackIn > 0 && stackOut < 1) {
    const zB = keys(t, [[11.5, 900], [12.4, 158], [13.4, 158], [14.2, 900]]);
    const yC = keys(t, [[11.9, 900], [12.8, 274], [13.4, 274], [14.2, 1000]]);
    const aB = seg(t, 11.5, 11.9) * (1 - seg(t, 13.8, 14.2)), aC = seg(t, 11.9, 12.3) * (1 - seg(t, 13.8, 14.2));
    add(depth(0, 0, zB), () => pipe([0, 0, zB], x0, x1, RO, RI, { alpha: aB, speck: 1 }));
    add(depth(0, yC, 0), () => pipe([0, yC, 0], x0, x1, RO, RI, { alpha: aC, speck: 1 }));
    for (const x of [-170, 170]) add(depth(x, GROUND, -500), () => box([x - 20, GROUND, -340], [40, 22, 680], seg(t, 11.5, 12) * (1 - stackOut)));
  }

  // Test rig.
  const rigA = io(seg(t, 13.9, 14.5)) * (1 - io(seg(t, 16.0, 16.5)));
  const beamY = keys(t, [[14.4, 620], [15.15, 164], [15.9, 164], [16.4, 700]]);
  const press = Math.sin(seg(t, 15.15, 15.9) * Math.PI) * 4;
  const stripA = io(seg(t, 13.9, 14.5)) * (1 - io(seg(t, 17.0, 17.4)));
  if (stripA > 0) for (const z of [-48, 48]) add(depth(0, GROUND, z) - 260, () => box([-250, GROUND, z - 8], [500, 30, 16], stripA));
  if (rigA > 0) {
    const postH = 640 * out3(seg(t, 13.9, 14.6));
    add(depth(-345, 0, 0) - 300, () => box([-375, GROUND, -22], [30, postH, 44], rigA));

    add(depth(0, 400, 0) + 200, () => { box([-375, beamY + 14 - press, -26], [750, 34, 52], rigA); box([-250, beamY - press, -8], [500, 14, 16], rigA); });
    add(depth(345, 0, 0) + 300, () => box([345, GROUND, -22], [30, postH, 44], rigA));
  }

  // Dispatch: gantry lift, truck reverses in, pipe is chocked and strapped, truck drives off.
  if (t > 15.9 && t < 19.6) dispatchRig(t, add, depth(carry, lift, heroZ), carry, lift, gone);

  objs.sort((a, b) => a[0] - b[0]).forEach(o => o[1]());

  // Spin cue: arcs orbiting the open face.
  const spinCue = seg(t, 9.9, 10.3) * (1 - seg(t, 10.9, 11.3));
  if (spinCue > 0) {
    g.save(); g.strokeStyle = C.ink; g.lineWidth = 1.8; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a0 = spin * .35 + i * TAU / 3, pts = [];
      for (let j = 0; j <= 30; j++) { const th = a0 + j / 30 * .9; pts.push(P(x1 + 6, (RO + 34) * Math.sin(th), (RO + 34) * Math.cos(th))); }
      g.globalAlpha = spinCue; poly(pts); g.stroke();
      const e = pts[pts.length - 1], d = pts[pts.length - 3], ang = Math.atan2(e[1] - d[1], e[0] - d[0]);
      g.beginPath(); g.moveTo(e[0] - 10 * Math.cos(ang - .5), e[1] - 10 * Math.sin(ang - .5)); g.lineTo(e[0], e[1]); g.lineTo(e[0] - 10 * Math.cos(ang + .5), e[1] - 10 * Math.sin(ang + .5)); g.stroke();
    }
    g.restore();
  }

  // Concrete stage annotations.
  if (t > 5.9 && t < 9.9) {
    const c = Math.atan2(V[1], V[2]);
    callout(t, 6.35, 9.2, P(-150, RM * Math.sin(c) + 2, RM * Math.cos(c)), 10, -105, 'STEEL MOULD');
    callout(t, 6.95, 9.15, P(600 + feedX + 108, 430, -108), 60, -60, 'HOPPER');
    callout(t, 7.2, 9.15, P(760 + feedX, -58, 30), 40, 100, 'BELT FEEDER');
    const wallA = seg(t, 7.7, 8.1) * (1 - seg(t, 9.3, 9.6));
    if (wallA > 0) {
      const th = -.5, A = P(x1, rinFace * Math.sin(th), rinFace * Math.cos(th)), B = P(x1, RO * Math.sin(th), RO * Math.cos(th));
      const ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      g.save(); g.globalAlpha = wallA; g.strokeStyle = C.ink; g.fillStyle = C.ink; g.lineWidth = 1.3;
      g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
      for (const [p, d] of [[A, ang + Math.PI], [B, ang]]) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - 9 * Math.cos(d - .35), p[1] - 9 * Math.sin(d - .35)); g.lineTo(p[0] - 9 * Math.cos(d + .35), p[1] - 9 * Math.sin(d + .35)); g.closePath(); g.fill(); }
      g.restore();
      callout(t, 7.75, 9.3, [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], -70, 150, 'WALL · BUILT OUTSIDE-IN');
    }
  }

  // Curing: a sun arc that cycles over the stack.
  const cureA = seg(t, 12.0, 12.5) * (1 - seg(t, 13.5, 13.9));
  if (cureA > 0) {
    const c = P(0, 300, 0), rr = 470 * S;
    g.save(); g.globalAlpha = cureA; g.strokeStyle = C.line; g.lineWidth = 1.4; g.setLineDash([4, 7]);
    g.beginPath(); g.arc(c[0], c[1] + 120 * S, rr, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.setLineDash([]);
    const u = ((t - 12.0) * 1.25) % 1, a = Math.PI * (1.1 + .8 * u);
    g.fillStyle = C.ink; g.beginPath(); g.arc(c[0] + rr * Math.cos(a), c[1] + 120 * S + rr * Math.sin(a), 7, 0, TAU); g.fill();
    g.font = font(15, 'mono'); g.fillStyle = C.muted; g.letterSpacing = '2px'; g.fillText('CURING STACK', c[0] + rr * .55, c[1] + 120 * S - rr * .62);
    g.restore();
  }

  // Load gauge and pass mark.
  if (rigA > 0) {
    const p = P(375, 470, 0), gx = p[0] + 90, gy = p[1] + 10, rr = 46;
    const needle = lerp(-215, -35, io(seg(t, 15.1, 15.8))) * D;
    g.save(); g.globalAlpha = rigA; g.strokeStyle = C.ink; g.lineWidth = 1.8; g.fillStyle = C.surf;
    g.beginPath(); g.arc(gx, gy, rr, 0, TAU); g.fill(); g.stroke();
    for (let i = 0; i <= 10; i++) { const a = (-215 + i * 18) * D; g.beginPath(); g.moveTo(gx + Math.cos(a) * rr * .78, gy + Math.sin(a) * rr * .78); g.lineTo(gx + Math.cos(a) * rr * .9, gy + Math.sin(a) * rr * .9); g.stroke(); }
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + Math.cos(needle) * rr * .72, gy + Math.sin(needle) * rr * .72); g.stroke();
    g.fillStyle = C.ink; g.beginPath(); g.arc(gx, gy, 4, 0, TAU); g.fill();
    ln([p[0], p[1]], [gx - rr, gy], C.ink, 1.4, rigA);
    g.font = font(15, 'mono'); g.fillStyle = C.muted; g.letterSpacing = '2px'; g.fillText('LOAD', gx - 22, gy + rr + 28);
    const ok = out3(seg(t, 15.7, 16.05));
    if (ok > 0) {
      g.strokeStyle = C.ink; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
      strokeFrac([[gx + rr + 26, gy - 2], [gx + rr + 38, gy + 12], [gx + rr + 62, gy - 18]], ok);
      g.globalAlpha = rigA * ok; g.fillStyle = C.ink; g.fillText('PASS', gx + rr + 76, gy + 4);
    }
    g.restore();
  }

  // Speed streaks as the truck pulls away.
  const go = seg(t, 18.75, 19.0) * (1 - seg(t, 19.35, 19.6));
  if (go > 0) for (let i = 0; i < 7; i++) { const y = -40 + i * 42, x = truckX - 520 - i * 60; ln(P(x - 300, y, -40), P(x, y, -40), C.line, 1.6, go); }
  dispatchNotes(t, carry, lift);

  g.restore(); // world clip

  // Embedded on the page: feather the drawing's edges so no canvas boundary shows.
  if (MODE.embed) {
    g.save(); g.globalCompositeOperation = 'destination-in';
    for (const [x1, y1] of [[W, 0], [0, H]]) {
      const gr = g.createLinearGradient(0, 0, x1, y1);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.07, '#000'); gr.addColorStop(.93, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
    g.restore();
  }

  /* ---------- end card ---------- */
  if (!MODE.embed && t > 19.8) {
    const k = io(seg(t, 19.9, 20.7)), rr = 120, cx = 960, cy = 405;
    g.save();
    g.strokeStyle = C.ink; g.lineCap = 'round';
    g.lineWidth = lerp(2, rr * .45, k);
    const pts = []; for (let i = 0; i <= 120; i++) { const a = -Math.PI / 4 + i / 120 * TAU; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
    strokeFrac(pts, out3(seg(t, 19.8, 20.45)));
    const tick = out3(seg(t, 20.5, 20.85));
    if (tick > 0) { g.strokeStyle = C.acc; g.lineWidth = rr * .3; const s = rr / 10; strokeFrac([[cx + 7.6 * s, cy - 7.6 * s], [cx + 11 * s, cy - 10.6 * s]], tick); }
    // wordmark wipes in from the left
    const wipe = io(seg(t, 20.45, 21.1)), ws = 1.15, wx = cx - WORD_W * ws / 2, wy = 728;
    if (wipe > 0) {
      g.save(); g.beginPath(); g.rect(wx - 10, wy - WORD_H * ws - 20, (WORD_W * ws + 20) * wipe, WORD_H * ws + 40); g.clip();
      g.translate(wx, wy); g.scale(ws, ws); g.fillStyle = C.ink; g.fill(WORD);
      g.lineWidth = 11.5; g.strokeStyle = C.ink; g.beginPath(); g.arc(117.8, -96.1, 12.2, 0, TAU); g.stroke();
      g.strokeStyle = C.acc; g.beginPath(); g.arc(212.1, -96.1, 12.2, 0, TAU); g.stroke();
      g.restore();
    }
    g.restore();
    lines(t, ['Built to carry Telangana.'], 960, 818, 60, 20.7, 99, { font: font(46, 'tight'), color: C.ink, align: 'center' });
    lines(t, ['RCC HUME PIPES · 6 IN–1600 MM · SIX UNITS IN TELANGANA'], 960, 872, 30, 20.85, 99, { font: font(17, 'mono'), color: C.muted, track: '3px', align: 'center' });
  }

  /* ---------- HUD ---------- */
  const hud = MODE.embed ? 0 : seg(t, .1, .7) * (1 - endA);
  if (hud > 0) {
    g.save(); g.globalAlpha = hud;
    // brand mark top-left
    g.strokeStyle = C.ink; g.lineWidth = 4.2; g.beginPath(); g.arc(128, 66, 11, 0, TAU); g.stroke();
    g.strokeStyle = C.acc; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(136.5, 57.5); g.lineTo(140.5, 54); g.stroke();
    g.save(); g.translate(156, 80); g.scale(.25, .25); g.fillStyle = C.ink; g.fill(WORD); g.lineWidth = 11.5; g.strokeStyle = C.ink; g.beginPath(); g.arc(117.8, -96.1, 12.2, 0, TAU); g.stroke(); g.beginPath(); g.arc(212.1, -96.1, 12.2, 0, TAU); g.stroke(); g.restore();
    g.font = font(14, 'mono'); g.fillStyle = C.muted; g.letterSpacing = '2.5px';
    g.fillText('RCC HUME PIPES · CEMENT WORKS', 292, 72);
    // timecode top-right
    g.textAlign = 'right'; g.fillText(`${t.toFixed(2).padStart(5, '0')} / ${T.toFixed(2)} S`, W - 120, 72);
    g.restore();

    // bottom rail with the six stations
    const x0r = 120, x1r = W - 120, yr = 1000;
    const prog = clamp((t - 2.5) / (19.6 - 2.5));
    g.save(); g.globalAlpha = hud;
    ln([x0r, yr], [x1r, yr], C.line, 2, hud);
    ln([x0r, yr], [lerp(x0r, x1r, prog), yr], C.ink, 2, hud);
    g.font = font(14, 'mono'); g.letterSpacing = '2.5px';
    ST.forEach((s, i) => {
      const x = lerp(x0r, x1r, i / 6), on = t >= s.a && t < s.b, done = t >= s.b;
      g.fillStyle = on ? C.ink : done ? C.muted : C.mid;
      g.fillRect(x, yr - 8, 2, 16);
      g.fillText(`${s.n} ${s.name.toUpperCase()}`, x + 12, yr + 34);
    });
    // playhead
    const ph = lerp(x0r, x1r, prog); g.fillStyle = C.ink; g.beginPath(); g.arc(ph, yr, 5.5, 0, TAU); g.fill();
    g.restore();
  }

  // Left column copy: intro, then each station hands over to the next.
  const X = MODE.embed ? 0 : 120;
  if (!MODE.embed) {
    lines(t, ['FIG. 00 · SECTION, Ø 1200 MM NP3'], X, 300, 30, .35, 2.2, { font: font(16, 'mono'), color: C.muted, track: '3px' });
    lines(t, ['How a spun', 'pipe is made.'], X, 420, 118, .5, 2.15, { font: font(112, 'tight'), color: C.ink, track: '-3.5px' });
  }
  if (MODE.compact) ST.forEach(s => lines(t, [`${s.n} · ${s.name.toUpperCase()}`], 60, 120, 80, s.a + .05, s.b - .25, { font: font(58, 'mono'), color: C.ink, track: '8px' }));
  else ST.forEach(s => {
    lines(t, [`${s.n} / 06`], X, 330, 30, s.a + .05, s.b - .25, { font: font(16, 'mono'), color: C.muted, track: '3px' });
    lines(t, s.head, X, 470, 140, s.a + .12, s.b - .3, { font: font(136, 'tight'), color: C.ink, track: '-4.5px' });
    lines(t, s.body, X, 560, 44, s.a + .3, s.b - .4, { font: font(32, 'body'), color: C.muted });
    if (s.tag) lines(t, [s.tag], X, 680, 30, s.a + .45, s.b - .45, { font: font(15, 'mono'), color: C.ink, track: '3px' });
  });

  // Dimension callout during the intro.
  const dimA = out3(seg(t, 1.0, 1.5)) * (1 - seg(t, 1.8, 2.2));
  if (dimA > 0) {
    const y = CY + RO * S + 46, a = CX - RO * S, b = CX + RO * S;
    g.save(); g.globalAlpha = dimA; ln([a, y], [b, y], C.ink, 1.4, dimA); ln([a, y - 9], [a, y + 9], C.ink, 1.4, dimA); ln([b, y - 9], [b, y + 9], C.ink, 1.4, dimA);
    g.font = font(16, 'mono'); g.fillStyle = C.ink; g.letterSpacing = '2px'; g.textAlign = 'center'; g.fillText('Ø 1200', CX, y + 32); g.restore();
    ln([CX - 18, CY], [CX + 18, CY], C.mid, 1.2, dimA); ln([CX, CY - 18], [CX, CY + 18], C.mid, 1.2, dimA);
  }
}

/* ---------- embedded playback: the drawing sits on the page, no player chrome ---------- */
const cv = document.querySelector('[data-film]');
if (!cv) return;
g = cv.getContext('2d');
let K = 1;
function size() {
  const w = cv.clientWidth || W, dpr = Math.min(window.devicePixelRatio || 1, 2);
  MODE.compact = w < 720;
  K = clamp(w * dpr / W, .35, 1.5); cv.width = Math.round(W * K); cv.height = Math.round(H * K);
}
MODE.embed = true;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let t = 0, last = null, visible = false, raf = 0;
function frame(now) {
  raf = 0;
  if (last != null) t = (t + (now - last) / 1000) % LOOP;
  last = now; render(t);
  if (visible && !reduce) raf = requestAnimationFrame(frame);
}
function start() { if (!raf && !reduce) { last = null; raf = requestAnimationFrame(frame); } }
function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
size();
const fontsReady = Promise.all(['"SP Tight"', '"SP Inter"', '"SP Mono"'].map(f => document.fonts.load(`40px ${f}`))).catch(() => {});
fontsReady.then(() => {
  render(reduce ? 8.4 : 0);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }, { threshold: .15 }).observe(cv);
  new ResizeObserver(() => { size(); render(reduce ? 8.4 : t); }).observe(cv);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : visible && start());
});
})();
