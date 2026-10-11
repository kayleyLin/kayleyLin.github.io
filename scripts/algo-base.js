'use strict';
/* ─────────────────────────────────────────────────────────────
   algo-base.js  —  Shared foundation for all algorithm pages
   Provides: AlgoController, setupCanvas, drawing utilities
───────────────────────────────────────────────────────────── */

/* Setup canvas for HiDPI / Retina screens.
   Call once before creating AlgoController.
   Returns { ctx, W, H } in logical (CSS) pixels.          */
function setupCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  const wrap   = canvas.parentElement;
  const dpr    = window.devicePixelRatio || 1;
  const W      = wrap.clientWidth  || 600;
  const H      = wrap.clientHeight || 400;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  canvas.width  = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, W, H };
}

/* ─── AlgoController ────────────────────────────────────────
   Usage:
     const { ctx, W, H } = setupCanvas('canvas');
     const steps = buildSteps();          // array of state objects
     function draw(ctx, step, W, H) { … } // algorithm-specific renderer
     const ctrl = new AlgoController({ ctx, W, H, steps, draw });
──────────────────────────────────────────────────────────── */
class AlgoController {
  constructor({ ctx, W, H, steps, draw }) {
    this.ctx    = ctx;
    this.W      = W;
    this.H      = H;
    this.steps  = steps;
    this.draw   = draw;
    this.idx    = 0;
    this.playing = false;
    this.timer   = null;
    this.speedMs = 800;

    this._bindUI();
    this.render();
  }

  render() {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.draw(this.ctx, this.steps[this.idx], this.W, this.H);
    this._updateUI();
  }

  next() {
    if (this.idx < this.steps.length - 1) { this.idx++; this.render(); }
    else this.pause();
  }

  prev() {
    if (this.idx > 0) { this.idx--; this.render(); }
  }

  reset() {
    this.pause();
    this.idx = 0;
    this.render();
  }

  play() {
    if (this.idx >= this.steps.length - 1) this.idx = 0;
    this.playing = true;
    this._setPlayBtn(true);
    this.timer = setInterval(() => this.next(), this.speedMs);
  }

  pause() {
    this.playing = false;
    this._setPlayBtn(false);
    clearInterval(this.timer);
    this.timer = null;
  }

  toggle() { this.playing ? this.pause() : this.play(); }

  setSpeed(v) {
    const map = { 1:1800, 2:1200, 3:800, 4:400, 5:180 };
    this.speedMs = map[+v] || 800;
    if (this.playing) { this.pause(); this.play(); }
  }

  /* ── private ── */
  _setPlayBtn(on) {
    const b = document.getElementById('btn-play');
    if (b) b.innerHTML = on
      ? '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="2" width="3" height="10" rx="1"/><rect x="9" y="2" width="3" height="10" rx="1"/></svg> Pause'
      : '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M3 2l9 5-9 5z"/></svg> Play';
  }

  _bindUI() {
    const on = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    on('btn-prev',  () => this.prev());
    on('btn-next',  () => this.next());
    on('btn-play',  () => this.toggle());
    on('btn-reset', () => this.reset());
    document.getElementById('speed-slider')
      ?.addEventListener('input', e => this.setSpeed(e.target.value));
  }

  _updateUI() {
    const step = this.steps[this.idx];

    /* counter */
    const ctr = document.getElementById('step-counter');
    if (ctr) ctr.textContent = `${this.idx + 1} / ${this.steps.length}`;

    /* progress bar */
    const bar = document.getElementById('progress-fill');
    if (bar) bar.style.width =
      `${(this.idx / Math.max(this.steps.length - 1, 1)) * 100}%`;

    /* step description */
    const desc = document.getElementById('step-desc');
    if (desc && step?.desc) desc.textContent = step.desc;

    /* pseudocode highlight */
    if (step?.lines) {
      document.querySelectorAll('.code-line').forEach((el, i) =>
        el.classList.toggle('hl', step.lines.includes(i)));
    }
  }
}

/* ─── Drawing utilities (used by multiple algorithms) ──────── */

/* Draw a rounded rectangle path (fill/stroke afterward) */
function roundRect(ctx, x, y, w, h, r = 6) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

/* Draw centred text */
function centreText(ctx, text, x, y, { font = '13px "Newsreader", Georgia, serif', color = '#1C1A16' } = {}) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/* Draw an arrow from (x1,y1) to (x2,y2) */
function arrow(ctx, x1, y1, x2, y2, color = 'rgba(28,26,22,0.45)') {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const hw = 8;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle   = color;
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hw * Math.cos(angle - 0.4), y2 - hw * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - hw * Math.cos(angle + 0.4), y2 - hw * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* Colour palette for algorithms — the notebook system, same tokens as
   algo.css and main.css. The canvas is cleared to transparent, so `bg` is
   the paper showing through rather than a fill anyone paints. Every hue is
   dark enough to carry white text when used as a node fill, and legible as
   a stroke on paper. */
const C = {
  bg:       '#F3EFE6',
  surface:  '#EFE9DD',
  border:   'rgba(28,26,22,0.14)',
  text:     '#1C1A16',
  dim:      'rgba(28,26,22,0.42)',
  accent:   '#BB4A2C',
  blue:     '#54626B',
  green:    '#4B6B4E',
  red:      '#BB4A2C',
  yellow:   '#97711A',
  orange:   '#C0703A',
  purple:   '#6F6091',
  teal:     '#5F7F8C',
  gray:     'rgba(28,26,22,0.16)',
};
