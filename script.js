// PR Party — Suche, Theme-Persistenz, Auto-Refresh, Counter
const EMOJIS = ["🎉","🪅","✨","🎈","🪩","🔥","🚀","🍾","💃","🕺"];
const REFRESH_MS = 20000;

let ALL_PRS = [];
let FILTER = "";

const $ = (sel) => document.querySelector(sel);
const root = document.documentElement;

init();

async function init() {
  setupTheme();
  bindUI();
  await loadPRs();
  startAutoRefresh();
  celebrateIfAny();
}

function bindUI() {
  const input = $('#searchInput');
  input.addEventListener('input', () => {
    FILTER = input.value.trim().toLowerCase();
    render(ALL_PRS);
  });

  $('#themeToggle').addEventListener('click', toggleTheme);
}

function setupTheme() {
  const saved = localStorage.getItem('prparty-theme') || 'dark';
  root.setAttribute('data-theme', saved);
  updateThemeButton(saved);
}

function toggleTheme() {
  const current = root.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('prparty-theme', next);
  updateThemeButton(next);
}

function updateThemeButton(theme) {
  const btn = $('#themeToggle');
  btn.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
}

async function loadPRs() {
  try {
    const res = await fetch('data/prs.json?' + Date.now());
    const prs = await res.json();
    ALL_PRS = Array.isArray(prs) ? prs : [];
    render(ALL_PRS);
  } catch (e) {
    console.error('Failed to load prs.json', e);
  }
}

function render(prs) {
  const cards = $('#cards');
  cards.innerHTML = '';

  // Filter
  const filtered = prs.filter(p => {
    if (!FILTER) return true;
    const hay = `${p.title||''} ${p.author||''}`.toLowerCase();
    return hay.includes(FILTER);
  });

  // Leaderboard by author
  const counts = {};
  prs.forEach(p => counts[p.author] = (counts[p.author] || 0) + 1);
  const leader = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  $('#leaderboard').innerHTML = leader.map(([user, n]) => `<span class="badge">👑 ${escapeHtml(user)}: ${n}</span>`).join('');

  // Counter
  $('#counter').textContent = `${filtered.length} ${filtered.length===1?'Ergebnis':'Ergebnisse'}`;

  // Cards
  filtered.slice().reverse().forEach(p => {
    const e = document.createElement('div');
    e.className = 'card';
    const emoji = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    e.innerHTML = `
      <div class="emoji">${emoji}</div>
      <div class="title">${escapeHtml(p.title)}</div>
      <div class="meta">by ${escapeHtml(p.author)} • #${p.number} • ${formatRelative(p.ts)}</div>
      <a href="${p.url}" target="_blank" rel="noopener">Open PR ↗</a>
    `;
    cards.appendChild(e);
  });
}

function startAutoRefresh() {
  $('#refreshInfo').textContent = `${REFRESH_MS/1000}s`;
  setInterval(loadPRs, REFRESH_MS);
}

function celebrateIfAny() {
  if (ALL_PRS.length) {
    confettiBurst();
    ping();
  }
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]
  ));
}

function formatRelative(ts) {
  if (!ts) return '';
  const diff = (Date.now() - new Date(ts).getTime())/1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

// Confetti
function confettiBurst() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = innerWidth;
  const H = canvas.height = innerHeight;
  const parts = Array.from({length: 140}, () => ({
    x: Math.random()*W, y: -20, s: 2+Math.random()*4,
    vx: -1+Math.random()*2, vy: 2+Math.random()*3,
    r: Math.random()*Math.PI
  }));
  let t = 0;
  (function frame(){
    t++;
    ctx.clearRect(0,0,W,H);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.r += 0.05;
      ctx.save();
      ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle = `hsl(${(p.x+p.y+t)%360},90%,60%)`;
      ctx.fillRect(-p.s, -p.s, p.s*2, p.s*2);
      ctx.restore();
    });
    if (t < 260) requestAnimationFrame(frame);
  })();
}

// Tiny success ping
function ping() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + 0.35);
  } catch(e) {}
}
