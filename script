// Simple confetti + audio ping + PR rendering
const EMOJIS = ["🎉","🪅","✨","🎈","🪩","🔥","🚀","🍾","💃","🕺"];

async function loadPRs() {
  const res = await fetch('data/prs.json?' + Date.now());
  const prs = await res.json();
  render(prs);
  if (prs.length) celebrate();
}

function render(prs) {
  const cards = document.getElementById('cards');
  cards.innerHTML = '';

  // Leaderboard by author
  const counts = {};
  prs.forEach(p => counts[p.author] = (counts[p.author] || 0) + 1);
  const leader = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = leader.map(([user, n]) => `<span class="badge">👑 ${user}: ${n}</span>`).join('');

  prs.slice().reverse().forEach(p => {
    const e = document.createElement('div');
    e.className = 'card';
    const emoji = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    e.innerHTML = `
      <div class="emoji">${emoji}</div>
      <div class="title">${escapeHtml(p.title)}</div>
      <div class="meta">by ${escapeHtml(p.author)} • #${p.number}</div>
      <a href="${p.url}" target="_blank" rel="noopener">Open PR ↗</a>
    `;
    cards.appendChild(e);
  });
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]
  ));
}

function celebrate() {
  confettiBurst();
  ping();
}

// Tiny confetti
function confettiBurst() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  const W = canvas.width = innerWidth;
  const H = canvas.height = innerHeight;
  const parts = Array.from({length: 120}, () => ({
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
    if (t < 240) requestAnimationFrame(frame);
  })();
}

// Tiny success "ping"
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

loadPRs();
