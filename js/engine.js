/* ===== CLOVER HOLLOW : engine ===== */
const IMG = {
  "rabbit": "images/rabbit.webp",
  "lion": "images/lion.webp",
  "shiba": "images/shiba.webp",
  "fox": "images/fox.webp",
  "cat": "images/cat.webp",
  "sheep_hi": "images/sheep_hi.webp",
  "sheep_happy": "images/sheep_happy.webp",
  "sheep_proud": "images/sheep_proud.webp",
  "town": "images/bg_town.jpg",
  "pasture": "images/bg_pasture.jpg",
  "home": "images/bg_home.jpg"
};
let AUTO = false;           // test hook: skips input
let S = null;               // game state
let sheepPose = 'hi';
let advanceFn = null, choiceKeys = null;

const $ = s => document.querySelector(s);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random()*n);
const sgn = n => (n>0?'+':'−') + Math.abs(n);
const age = () => START_AGE + Math.floor((S ? S.m : 0)/12);
const seasonOf = m => SEASONS[m % 12];
function fmt(t){ return String(t).replace(/\{n\}/g, S?S.name:'Pip').replace(/\{N\}/g, S?S.name.toUpperCase():'PIP').replace(/\{age\}/g, age()); }

/* ---------- sound ---------- */
let AC = null, muted = false;
try { muted = localStorage.getItem('clover_mute') === '1'; } catch(e){}
function tone(f,d=.12,type='sine',v=.05,t0=0){
  if (muted || AUTO) return;
  try {
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+d+.02);
  } catch(e){}
}
const sfx = {
  click: () => tone(540,.06,'triangle',.035),
  good:  () => [660,880,1100].forEach((f,i)=>tone(f,.16,'triangle',.045,i*.07)),
  bad:   () => { tone(220,.22,'sawtooth',.025); tone(165,.28,'sawtooth',.025,.1); },
  heart: () => { tone(784,.14,'sine',.05); tone(988,.28,'sine',.05,.11); },
  fan:   () => [523,659,784,1047].forEach((f,i)=>tone(f,.45,'triangle',.05,i*.13))
};

/* ---------- storage ---------- */
function save(){ try { localStorage.setItem('clover_save_v1', JSON.stringify(S)); } catch(e){} }
function loadSave(){ try { const s = localStorage.getItem('clover_save_v1'); return s ? JSON.parse(s) : null; } catch(e){ return null; } }
function clearSave(){ try { localStorage.removeItem('clover_save_v1'); } catch(e){} }
function foundEndings(){ try { return JSON.parse(localStorage.getItem('clover_endings_v1')||'[]'); } catch(e){ return []; } }
function markEnding(id){ try { const a = foundEndings(); if(!a.includes(id)){ a.push(id); localStorage.setItem('clover_endings_v1', JSON.stringify(a)); } } catch(e){} }

/* ---------- stage: backgrounds, tint, cast ---------- */
const SEASON_FILTER = {
  spring:'saturate(1.08) brightness(1.02)',
  summer:'saturate(1.3) brightness(1.06) contrast(1.04)',
  autumn:'sepia(.38) saturate(1.35) hue-rotate(-14deg) brightness(.98)',
  winter:'saturate(.5) brightness(1.1) hue-rotate(8deg) contrast(.96)'
};
let curBg = null, bgSlot = 0;
function setScene(key, time){
  const season = S ? seasonOf(S.m) : 'spring';
  const layers = [$('#bg1'), $('#bg2')];
  if (curBg !== key){
    bgSlot = 1 - bgSlot;
    const nl = layers[bgSlot], ol = layers[1-bgSlot];
    nl.style.backgroundImage = `url(${IMG[key]})`;
    nl.classList.add('show'); ol.classList.remove('show');
    curBg = key;
  }
  layers.forEach(l => l.style.filter = SEASON_FILTER[season]);
  $('#tint').className = time || '';
  $('#stage').dataset.season = season;
  particles.set(season, key === 'home');
}
const POS = {1:[50],2:[30,70],3:[20,50,80],4:[13,38,62,87],5:[10,30,50,70,90],6:[9,25,41,59,75,91]};
function sprSrc(id){
  if (id === 'rabbit') return IMG.rabbit;
  if (id === 'sheep') return IMG['sheep_'+sheepPose];
  return IMG[PEOPLE[id].img];
}
function setCast(list){
  list = (list||[]).map(c => typeof c === 'string' ? {id:c} : c);
  const wrap = $('#cast'); const pos = POS[list.length] || POS[6];
  const want = new Set(list.map(c=>c.id));
  [...wrap.children].forEach(el => { if (!want.has(el.dataset.id) && !el.classList.contains('out')){ el.classList.add('out'); setTimeout(()=>el.remove(), 420); } });
  list.forEach((c,i) => {
    let el = wrap.querySelector(`.spr[data-id="${c.id}"]:not(.out)`);
    if (!el){
      el = document.createElement('div'); el.className = 'spr enter'; el.dataset.id = c.id;
      el.innerHTML = `<img alt="" draggable="false">`;
      wrap.appendChild(el);
      requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.remove('enter')));
    }
    el.style.left = (c.x != null ? c.x : pos[i]) + '%';
    el.style.height = (c.h || SPR_H[c.id] || 55) + '%';
    el.style.zIndex = 2 + i;
    const img = el.querySelector('img'), src = sprSrc(c.id);
    if (img.getAttribute('src') !== src) img.src = src;
  });
  highlight(null);
}
function highlight(who){
  const id = who === 'n' ? 'rabbit' : who;
  document.querySelectorAll('#cast .spr').forEach(el => {
    const on = id && el.dataset.id === id;
    el.classList.toggle('talk', !!on);
    el.classList.toggle('dim', !!id && id !== '_' && !on);
  });
}
function setProp(emoji, hop){
  const el = document.querySelector('#cast .spr[data-id="rabbit"]'); if (!el) return;
  el.querySelectorAll('.prop').forEach(p => p.remove());
  el.classList.toggle('hop', !!hop);
  if (emoji) el.insertAdjacentHTML('beforeend', `<span class="prop">${emoji}</span>`);
}

/* ---------- seasonal particles ---------- */
const particles = (() => {
  const cv = $('#fx'), cx = cv.getContext('2d');
  let mode = 'spring', indoor = false, list = [], W = 0, H = 0, run = false;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COL = { spring:['#ffc2d6','#ffd9e6','#fff'], summer:['#fff3a8','#ffe27a','#fff'], autumn:['#e8782a','#c8501e','#f0a63a'], winter:['#fff','#eaf4ff','#dbeaff'] };
  function size(){ const r = cv.getBoundingClientRect(); W = cv.width = r.width|0; H = cv.height = r.height|0; }
  function make(){ return { x:Math.random()*W, y:Math.random()*H, r:2+Math.random()*4, vx:(Math.random()-.5)*.6, vy:.3+Math.random()*.9, a:Math.random()*6.28, va:(Math.random()-.5)*.06, c:COL[mode][rnd(3)] }; }
  function fill(){ const n = indoor ? 14 : 46; list = Array.from({length:n}, make); }
  function tick(){
    if (!run) return;
    cx.clearRect(0,0,W,H);
    for (const p of list){
      p.a += p.va;
      if (indoor){ p.y -= .12; p.x += Math.sin(p.a)*.25; p.c = '#ffe9b0'; }
      else if (mode === 'summer'){ p.y -= .25; p.x += Math.sin(p.a)*.5; }
      else { p.y += p.vy*(mode==='winter'?.7:1); p.x += p.vx + Math.sin(p.a)*.5*(mode==='winter'?.5:1.2); }
      if (p.y > H+10) { p.y = -10; p.x = Math.random()*W; }
      if (p.y < -10)  { p.y = H+10; p.x = Math.random()*W; }
      if (p.x > W+10) p.x = -10; if (p.x < -10) p.x = W+10;
      cx.globalAlpha = indoor ? .5 : .85; cx.fillStyle = p.c; cx.beginPath();
      if (mode === 'winter' || mode === 'summer' || indoor) cx.arc(p.x, p.y, indoor?p.r*.6:p.r*(mode==='winter'?.7:.55), 0, 6.28);
      else cx.ellipse(p.x, p.y, p.r*1.5, p.r*.8, p.a, 0, 6.28);
      cx.fill();
    }
    requestAnimationFrame(tick);
  }
  return {
    set(m, ind){ if (m === mode && ind === indoor && list.length) return; mode = m; indoor = ind; fill(); },
    start(){ if (reduce) return; size(); fill(); run = true; tick(); },
    resize: size
  };
})();

/* ---------- HUD and status panel ---------- */
function renderHud(){
  const d = $('#hudDate'), c = $('#hudCoins');
  if (!S){ d.hidden = true; c.hidden = true; $('#statusBtn').hidden = true; return; }
  d.hidden = c.hidden = false; $('#statusBtn').hidden = false;
  d.textContent = `${MONTH_NAMES[S.m%12]} · Year ${Math.min(3, Math.floor(S.m/12)+1)}`;
  c.textContent = `🪙 ${S.coins}`;
}
const bar = (v,max,color) => `<div class="bar" style="--c:${color}"><i style="width:${clamp(v/max*100,0,100)}%"></i></div>`;
function storyHtml(){
  const f = S.flags;
  let h = `<h3>Story</h3><p class="obj">📜 ${esc(objectiveOf(S))}</p>`;
  if (f.letter1) h += `<div class="petals">${PIDS.map(p => `<span class="${f['piece_'+p]?'got':''}"><i>${f['piece_'+p]?'🍀':'◌'}</i><small>${PEOPLE[p].name}</small></span>`).join('')}</div>`;
  return h;
}
function renderSide(){
  if (AUTO) return;
  const el = $('#side');
  if (!S){ el.innerHTML = ''; return; }
  const stats = STATS.map(s => `<div class="srow" data-s="${s.id}"><span class="sl">${s.icon} ${s.name}</span><span class="sv">${S.st[s.id]}</span>${bar(S.st[s.id],100,s.color)}</div>`).join('');
  const friends = PIDS.map(p => {
    const P = PEOPLE[p];
    if (!S.met[p]) return `<div class="fr unknown"><span class="av"></span><span class="fn">???</span><span class="fh"></span></div>`;
    const segs = [0,1,2,3,4].map(i => `<s style="--f:${clamp((S.aff[p]-i*20)/20,0,1)}"></s>`).join('');
    return `<div class="fr"><span class="av"><img src="${IMG[P.img]}" alt=""></span><span class="fn">${P.name}<small>${P.tag}</small></span><span class="fh">${segs}</span></div>`;
  }).join('');
  el.innerHTML = `
    <button class="btn alt closeSide" id="closeSide">Close ✕</button>
    <div class="who"><span class="av big"><img src="${IMG.rabbit}" alt=""></span><div><h2>${esc(S.name)}</h2><p>Age ${age()} · ${seasonOf(S.m)[0].toUpperCase()+seasonOf(S.m).slice(1)}</p></div></div>
    <div class="prog" title="Month ${S.m+1} of ${TOTAL_MONTHS}"><i style="width:${(S.m)/TOTAL_MONTHS*100}%"></i><span>Month ${Math.min(S.m+1,TOTAL_MONTHS)} / ${TOTAL_MONTHS}</span></div>
    ${storyHtml()}
    <h3>Skills</h3>${stats}
    <h3>Body &amp; mind</h3>
    <div class="srow"><span class="sl">❤️ Health</span><span class="sv">${S.health}</span>${bar(S.health,100,S.health<35?'#e65f5f':'#55b985')}</div>
    <div class="srow"><span class="sl">😖 Stress</span><span class="sv">${S.stress}</span>${bar(S.stress,100,S.stress>70?'#e65f5f':'#a98ae6')}</div>
    <div class="line"><span>🪙 Coins</span><b>${S.coins}</b></div>
    <div class="line"><span>⭐ Renown</span><b>${S.rep}</b></div>
    <h3>Friends</h3>${friends}`;
  const cl = $('#closeSide'); if (cl) cl.onclick = () => $('#side').classList.remove('open');
}
function refresh(){ renderHud(); renderSide(); }

/* ---------- applying effects ---------- */
function showChips(list){
  const box = $('#chips');
  list.forEach((c,i) => setTimeout(() => {
    const el = document.createElement('div'); el.className = 'chip ' + c.c; el.textContent = c.t; box.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }, i*140));
}
function applyFx(fx, quiet){
  if (typeof fx === 'function') fx = fx(S);
  const out = [];
  if (!fx) return out;
  for (const k in fx){
    const v = fx[k];
    if (STATD[k]){
      const o = S.st[k]; S.st[k] = clamp(o+v, 0, 100); const d = S.st[k]-o;
      if (d) out.push({t:`${STATD[k].icon} ${STATD[k].name} ${sgn(d)}`, c:d>0?'up':'down'});
    } else if (k === 'stress'){
      const o = S.stress; S.stress = clamp(o+v, 0, 100); const d = S.stress-o;
      if (d) out.push({t:`😖 Stress ${sgn(d)}`, c:d>0?'down':'up'});
    } else if (k === 'health'){
      const o = S.health; S.health = clamp(o+v, 0, 100); const d = S.health-o;
      if (d) out.push({t:`❤️ Health ${sgn(d)}`, c:d>0?'up':'down'});
    } else if (k === 'coins'){
      const o = S.coins; S.coins = Math.max(0, o+v); const d = S.coins-o;
      if (d) out.push({t:`🪙 ${sgn(d)}`, c:d>0?'up':'down'});
    } else if (k === 'rep'){
      S.rep += v; out.push({t:`⭐ Renown ${sgn(v)}`, c:'up'});
    } else if (k === 'aff'){
      for (const p in v){ const o = S.aff[p]; S.aff[p] = clamp(o+v[p], 0, 100); const d = S.aff[p]-o; if (d && S.met[p]) out.push({t:`💗 ${PEOPLE[p].name} ${sgn(d)}`, c:'heart'}); }
    } else if (k === 'flag'){
      [].concat(v).forEach(f => S.flags[f] = true);
    } else if (k === 'met'){
      S.met[v] = true; out.push({t:`New friend: ${PEOPLE[v].name}`, c:'heart'});
    }
  }
  refresh();
  if (!quiet && !AUTO) showChips(out);
  if (out.some(c=>c.c==='heart')) sfx.heart(); else if (out.some(c=>c.c==='up')) sfx.good(); else if (out.length) sfx.bad();
  return out;
}
const chipHtml = list => list.map(c => `<span class="chip s ${c.c}">${esc(c.t)}</span>`).join('');

/* ---------- dock: dialogue, choices, cards ---------- */
const dock = $('#dock');
function onAdvance(fn){ advanceFn = fn; }
dock.addEventListener('click', e => { if (advanceFn && !e.target.closest('button,input,a')) advanceFn(); });
document.addEventListener('keydown', e => {
  const tg = e.target.tagName;
  if (tg === 'INPUT' || tg === 'BUTTON' || tg === 'TEXTAREA') return;
  if ((e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') && advanceFn){ e.preventDefault(); advanceFn(); }
  else if (/^[1-9]$/.test(e.key) && choiceKeys){ choiceKeys(+e.key-1); }
});
function speakerInfo(who, pose){
  if (who === 'n' || who === 'rabbit') return {name:S.name, img:IMG.rabbit};
  if (who === 'sheep') return {name:'Nimbus', img:IMG['sheep_'+(pose||sheepPose)]};
  if (NPC[who]) return {name:NPC[who].name, emoji:NPC[who].icon};
  const P = PEOPLE[who]; return {name:P.name, img:IMG[P.img]};
}
function say(who, text, pose){
  return new Promise(res => {
    if (AUTO){ res(); return; }
    if (who === 'sheep' && pose){ sheepPose = pose; const el = document.querySelector('#cast .spr[data-id="sheep"] img'); if (el) el.src = IMG['sheep_'+pose]; }
    dock.classList.remove('tall');
    const full = fmt(text), narr = who === '_';
    highlight(narr || NPC[who] ? null : who);
    let np = '';
    if (!narr){ const i = speakerInfo(who, pose); np = `<div class="np">${i.emoji ? `<b class="emj">${i.emoji}</b>` : `<img src="${i.img}" alt="">`}<span>${esc(i.name)}</span></div>`; }
    dock.innerHTML = `<div class="dlg patch ${narr?'narr':''}" tabindex="0">${np}<p class="tx"></p><span class="more" hidden>▾</span></div>`;
    const tx = dock.querySelector('.tx'), more = dock.querySelector('.more');
    let i = 0, typing = true, t;
    const finish = () => { typing = false; clearInterval(t); tx.textContent = full; more.hidden = false; };
    t = setInterval(() => { i += 2; tx.textContent = full.slice(0, i); if (i >= full.length) finish(); }, 18);
    onAdvance(() => { if (typing){ finish(); return; } onAdvance(null); sfx.click(); res(); });
  });
}
function choose(labels){
  return new Promise(res => {
    if (AUTO){ res(rnd(labels.length)); return; }
    const old = dock.querySelector('.dlg');
    if (old){ const m = old.querySelector('.more'); if (m) m.hidden = true; }
    const box = document.createElement('div'); box.className = 'choices';
    box.innerHTML = labels.map((l,i) => `<button class="btn alt ch" data-i="${i}"><span class="num">${i+1}</span><span>${esc(fmt(l))}</span></button>`).join('');
    if (!old) dock.innerHTML = '';
    dock.appendChild(box); dock.scrollTop = dock.scrollHeight;
    onAdvance(null);
    const pick = i => { if (i<0 || i>=labels.length) return; choiceKeys = null; sfx.click(); res(i); };
    choiceKeys = pick;
    box.querySelectorAll('.ch').forEach(b => b.onclick = () => pick(+b.dataset.i));
  });
}
function card(html, label){
  return new Promise(res => {
    if (AUTO){ res(); return; }
    dock.classList.remove('tall');
    dock.innerHTML = `<div class="rcard patch">${html}<div class="row"><button class="btn go">${label||'Next ▸'}</button></div></div>`;
    const done = () => { onAdvance(null); sfx.click(); res(); };
    dock.querySelector('.go').onclick = done; onAdvance(done);
  });
}

/* ---------- script runner ---------- */
async function runLines(lines){
  for (const L of lines){
    if (S.over) return;
    if (typeof L === 'function'){ await runLines(L(S) || []); continue; }
    if (Array.isArray(L)){ await say(L[0], L[1], L[2]); continue; }
    if (L.bg) setScene(L.bg, L.time);
    if (L.cast) setCast(L.cast);
    if (L.fx) applyFx(L.fx);
    if (L.c){
      const opts = typeof L.c === 'function' ? L.c(S) : L.c;
      const i = await choose(opts.map(o => o[0])), o = opts[i];
      if (o[1]) applyFx(o[1]);
      if (o[2]) await runLines(typeof o[2] === 'function' ? o[2](S) : o[2]);
    }
  }
}
async function runEvent(ev){
  S.done[ev.id] = true;
  setScene(ev.bg || 'town', ev.time);
  setCast(ev.cast || ['rabbit']);
  await runLines(ev.lines);
  highlight(null);
}

/* ---------- new game ---------- */
function newState(name, keep){
  const s = { v:1, name, m:0, coins:200, health:90, stress:10, rep:0, collapses:0, meltdowns:0,
    st:{str:10,wit:10,charm:10,craft:10,kind:10,nerve:10}, aff:{gareth:0,fenn:0,mugi:0,suzu:0},
    met:{}, flags:{}, done:{}, counts:{}, lastPlan:null, lastRandom:-9, keep:keep.id, over:false };
  for (const k in keep.fx) s.st[k] += keep.fx[k];
  return s;
}

/* ---------- title / setup ---------- */
function showTitle(){
  S = null; sheepPose = 'hi';
  $('#side').classList.remove('open');
  dock.className = ''; $('#title').classList.add('show');
  $('#bg1').classList.add('pan'); $('#bg2').classList.add('pan');
  setScene('town');
  setCast([{id:'gareth',x:12,h:44},{id:'fenn',x:25,h:44},{id:'mugi',x:38,h:40},{id:'suzu',x:62,h:33},{id:'sheep',x:75,h:30},{id:'rabbit',x:50,h:46}]);
  refresh();
  const saved = loadSave(), found = foundEndings().length;
  dock.innerHTML = `<div class="menu">
    <button class="btn big" id="bNew">New game</button>
    ${saved ? `<button class="btn alt big" id="bCont">Continue · ${esc(saved.name)}, ${MONTH_NAMES[saved.m%12]} Y${Math.floor(saved.m/12)+1}</button>` : ''}
    <button class="btn alt big" id="bEnd">Endings ${found}/${ENDING_ORDER.length}</button>
    <p class="fine">Tap or press Space to advance. Number keys choose options.</p></div>`;
  $('#bNew').onclick = () => { sfx.click(); showSetup(); };
  if (saved) $('#bCont').onclick = () => { sfx.click(); S = saved; leaveTitle(); gameLoop(); };
  $('#bEnd').onclick = () => { sfx.click(); showGallery(); };
}
function leaveTitle(){ $('#title').classList.remove('show'); $('#bg1').classList.remove('pan'); $('#bg2').classList.remove('pan'); refresh(); }

function showSetup(){
  setScene('home'); setCast([{id:'rabbit'},{id:'sheep'}]);
  let pick = 0;
  dock.className = 'tall';
  dock.innerHTML = `<div class="setup">
    <h2>Who is moving in?</h2>
    <label class="nm">Name your rabbit <input id="nameIn" maxlength="12" value="Pip" autocomplete="off"></label>
    <h3>Grandma left one keepsake on the desk</h3>
    <div class="cards ks">${KEEPSAKES.map((k,i) => `<button class="card ${i===0?'on':''}" data-i="${i}"><span class="ic">${k.icon}</span><b>${k.name}</b><em>${k.desc}</em></button>`).join('')}</div>
    <div class="row"><button class="btn alt" id="bBack">◂ Back</button><button class="btn big" id="bGo">Begin the promise</button></div></div>`;
  dock.querySelectorAll('.ks .card').forEach(b => b.onclick = () => { pick = +b.dataset.i; dock.querySelectorAll('.ks .card').forEach(x => x.classList.toggle('on', x===b)); sfx.click(); });
  $('#bBack').onclick = showTitle;
  $('#bGo').onclick = async () => {
    const name = ($('#nameIn').value || 'Pip').trim().slice(0,12) || 'Pip';
    S = newState(name, KEEPSAKES[pick]); clearSave(); leaveTitle();
    await prologue(); await gameLoop();
  };
}
async function prologue(){
  setScene('home'); setCast(['rabbit','sheep']);
  await runLines([
    ['sheep', 'Welcome to Clover Hollow, {n}. I’m Nimbus. Your grandmother was my oldest friend, and before she passed I made her a promise.', 'hi'],
    ['sheep', 'Three years. Spring to spring. I’d look after you until you found your own path.'],
    ['n', 'Three years… and then?'],
    ['sheep', 'And then you choose. A sword, a shop, a book, a farm, someone to share it with. All of it is open.', 'happy'],
    ['sheep', 'Every month we’ll plan together: lessons, work, rest, friends. I’ll cover the house. You decide who to become.'],
    ['_', `On the desk sits ${KEEPSAKES.find(k=>k.id===S.keep).name.toLowerCase()}, the one thing Grandma left behind. {n} picks it up, and smiles.`],
    ['n', 'Okay. I’ll try.'],
    ['sheep', 'That’s all anyone can do. Now, kettle’s on.', 'happy']
  ]);
}

function showGallery(){
  const found = foundEndings();
  const items = ENDING_ORDER.map(id => {
    const E = ENDINGS[id], ok = found.includes(id);
    const nm = ok ? E.title.replace(/\{n\}/g,'—') : (E.secret ? '??? (secret)' : '???');
    return `<div class="gi ${ok?'got':''}"><span class="gic">${ok?E.icon:'❔'}</span><div><b>${esc(nm)}</b><small>${esc(ok ? 'Found.' : E.hint)}</small></div></div>`;
  }).join('');
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="patch box"><h2>Endings ${found.length}/${ENDING_ORDER.length}</h2><div class="glist">${items}</div><button class="btn big" id="mClose">Close</button></div>`;
  document.body.appendChild(m);
  m.querySelector('#mClose').onclick = () => { sfx.click(); m.remove(); };
}

/* ---------- planning ---------- */
const slotLabel = ['First half','Second half'];
function actInfo(id){
  if (id.startsWith('hang:')){ const p = PEOPLE[id.slice(5)]; return {icon:'💗', name:`Time with ${p.name}`, cost:HANG_COST, cat:'rest'}; }
  const a = ACT[id]; return {icon:a.icon, name:a.name, cost:a.cost||0, earn:a.earn||0, cat:a.cat};
}
function planOk(plan){
  let c = S.coins;
  for (const id of plan){ const a = actInfo(id); if ((a.cost||0) > c) return false; c += (a.earn||0) - (a.cost||0); }
  return true;
}
function chipsFor(id){
  if (id.startsWith('hang:')) return `<i class="up">💗 bond</i><i class="up">😖 −8</i>`;
  const a = ACT[id], out = [];
  if (a.g) for (const k in a.g) out.push(`<i class="up">${STATD[k].icon}+${a.g[k]}</i>`);
  if (a.stress) out.push(`<i class="${a.stress>0?'down':'up'}">😖${a.stress>0?'+':'−'}${Math.abs(a.stress)}</i>`);
  if (a.health) out.push(`<i class="${a.health>0?'up':'down'}">❤️${a.health>0?'+':'−'}${Math.abs(a.health)}</i>`);
  return out.join('');
}
function planMonth(){
  return new Promise(resolve => {
    if (AUTO){
      for (let t=0;t<30;t++){
        const pool = [].concat(ACT_ORDER.lesson, ACT_ORDER.work, ACT_ORDER.rest, PIDS.filter(p=>S.met[p]).map(p=>'hang:'+p));
        const plan = [pool[rnd(pool.length)], pool[rnd(pool.length)]];
        if (planOk(plan)){ resolve(plan); return; }
      }
      resolve(['rest','rest']); return;
    }
    const [pose, hint] = sheepHint(S);
    sheepPose = pose;
    let slots = [null,null], active = 0, tab = 'lesson';
    setScene('home'); setCast([{id:'rabbit'},{id:'sheep'}]);
    dock.classList.add('tall');
    const tabs = [['lesson','Lessons'],['work','Work'],['rest','Rest & friends']];
    function cardHtml(id){
      const a = actInfo(id), dis = (a.cost||0) > S.coins;
      let top = `<span class="ic">${a.icon}</span>`, desc = ACT[id] ? ACT[id].desc : '';
      if (id.startsWith('hang:')){ const p = PEOPLE[id.slice(5)]; top = `<span class="ic av"><img src="${IMG[p.img]}" alt=""></span>`; desc = p.tag; }
      const price = a.earn ? `<span class="price pos">+${a.earn} 🪙</span>` : (a.cost ? `<span class="price">−${a.cost} 🪙</span>` : `<span class="price free">free</span>`);
      return `<button class="card ${slots.includes(id)?'on':''}" data-id="${id}" ${dis?'disabled':''}>${top}<b>${a.name}</b><em>${esc(desc)}</em><span class="chips">${chipsFor(id)}</span>${price}</button>`;
    }
    function render(){
      const ids = tab === 'rest' ? [...ACT_ORDER.rest, ...PIDS.filter(p=>S.met[p]).map(p=>'hang:'+p)] : ACT_ORDER[tab];
      const full = slots[0] && slots[1], ok = full && planOk(slots);
      dock.innerHTML = `<div class="plan">
        <div class="left">
          <div class="hint patch"><span class="av"><img src="${IMG['sheep_'+pose]}" alt=""></span><p><b>Nimbus:</b> ${esc(hint)}</p></div>
          <div class="slots">${[0,1].map(i => { const a = slots[i] && actInfo(slots[i]); return `<button class="slot ${active===i?'on':''}" data-i="${i}"><small>${slotLabel[i]}</small><b>${a ? a.icon+' '+a.name : 'Choose something…'}</b></button>`; }).join('')}</div>
          <p class="obj">📜 ${esc(objectiveOf(S))}</p>
          <p class="warn">${full && !ok ? 'Not enough coins for that order. Swap a job in first.' : ''}</p>
          <div class="row"><button class="btn go" ${ok?'':'disabled'}>Begin the month</button>${S.lastPlan && planOk(S.lastPlan) ? '<button class="btn alt rep">Repeat last month</button>' : ''}</div>
        </div>
        <div class="right"><div class="tabs">${tabs.map(t => `<button class="tab ${tab===t[0]?'on':''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
        <div class="cards">${ids.map(cardHtml).join('')}</div></div></div>`;
      dock.querySelectorAll('.tab').forEach(b => b.onclick = () => { tab = b.dataset.t; sfx.click(); render(); });
      dock.querySelectorAll('.slot').forEach(b => b.onclick = () => { active = +b.dataset.i; sfx.click(); render(); });
      dock.querySelectorAll('.card').forEach(b => b.onclick = () => {
        slots[active] = b.dataset.id; sfx.click();
        active = !slots[0] ? 0 : !slots[1] ? 1 : active === 0 ? 1 : 0;
        const sc = dock.querySelector('.cards') ? dock.querySelector('.cards').scrollTop : 0;
        render(); const c2 = dock.querySelector('.cards'); if (c2) c2.scrollTop = sc;
      });
      const go = dock.querySelector('.go'); if (go) go.onclick = () => { sfx.click(); dock.classList.remove('tall'); resolve(slots.slice()); };
      const rep = dock.querySelector('.rep'); if (rep) rep.onclick = () => { sfx.click(); dock.classList.remove('tall'); resolve(S.lastPlan.slice()); };
    }
    render();
  });
}

/* ---------- running a month ---------- */
function gradeRoll(){ const r = Math.random(); return r < .15 ? 'great' : r > .88 ? 'flop' : 'ok'; }
async function doHalf(id, h){
  if (id.startsWith('hang:')) return hangout(id.slice(5), h);
  const a = ACT[id], isRest = a.cat === 'rest';
  let person = a.who === 'random' ? (PIDS.filter(p=>S.met[p])[rnd(PIDS.filter(p=>S.met[p]).length||1)] || null) : a.who;
  const meet = person && S.met[person] && Math.random() < .4;
  setScene(a.bg, a.time);
  setCast(meet ? ['rabbit', person] : ['rabbit']);
  setProp(a.icon, true);
  const pen = isRest ? 1 : (S.stress>=80 ? .6 : S.stress>=60 ? .8 : 1) * (S.health<35 ? .75 : 1);
  const grade = isRest ? 'ok' : gradeRoll();
  const gm = {great:1.6, ok:1, flop:.5}[grade];
  const fx = {}; let bonus = false;
  if (a.g) Object.entries(a.g).forEach(([k,v],i) => {
    const x = v*pen*gm*(isRest?1:GROWTH); let g = Math.floor(x) + (Math.random() < x - Math.floor(x) ? 1 : 0);
    if (i === 0 && !isRest){ const mb = Math.min(1, Math.floor((S.counts[id]||0)/8)); if (mb){ g += mb; bonus = true; } }
    g = Math.max(g, isRest ? 1 : 0); if (!g) return;
    fx[k] = g;
  });
  if (a.cost) fx.coins = -a.cost;
  if (a.earn) fx.coins = Math.round(a.earn * (grade==='great'?1.25:grade==='flop'?.8:1));
  fx.stress = (a.stress||0) + (grade==='flop'?2:0) - (grade==='great'&&!isRest?1:0);
  if (a.health) fx.health = a.health;
  if (a.cat === 'work' && grade === 'great') fx.rep = 1;
  if (!fx.stress) delete fx.stress;
  S.counts[id] = (S.counts[id]||0) + 1;
  let cam = '';
  if (meet){
    const P = PEOPLE[person], tier = S.aff[person] < 25 ? 0 : S.aff[person] < 55 ? 1 : 2;
    cam = fmt(CAMEO[person][tier]);
    fx.aff = {[person]: 3 + (S.st[P.likes[0]] >= 30 ? 1 : 0)};
  }
  const chips = applyFx(fx, true);
  const flavor = fmt(a.txt[rnd(a.txt.length)]);
  const gl = {great:'<span class="grade g">Great!</span>', ok:'', flop:'<span class="grade f">Rough day</span>'}[grade];
  const extra = grade==='great' ? ' Everything clicked today.' : grade==='flop' ? ' Not the best day, though.' : '';
  await card(`<h3>${slotLabel[h]}: ${a.icon} ${a.name} ${gl}</h3><p>${esc(flavor + extra)}</p>${bonus?'<p class="note">Practice shows. A little extra growth from experience.</p>':''}${cam?`<p class="cameo">${esc(cam)}</p>`:''}<div class="chipline">${chipHtml(chips)}</div>`);
  setProp(null, false);
  return checkBreak();
}
async function hangout(p, h){
  const P = PEOPLE[p];
  setScene(P.bg, P.time); setCast(['rabbit', p]); setProp(null, false);
  let gain = 5; P.likes.forEach((k,i) => { if (S.st[k] >= 30) gain += 2; if (S.st[k] >= 60 && i === 0) gain += 2; });
  const pool = S.aff[p] >= 40 ? HANGOUT[p] : HANGOUT[p].slice(0,3);
  await runLines(pool[rnd(pool.length)]);
  const chips = applyFx({coins:-HANG_COST, stress:-8, aff:{[p]:gain}}, true);
  await card(`<h3>${slotLabel[h]}: 💗 Time with ${P.name}</h3><p>${esc(fmt('A good day. {n} heads home feeling lighter.'))}</p><div class="chipline">${chipHtml(chips)}</div>`);
  return checkBreak();
}
async function checkBreak(){
  if (S.health <= 10){
    S.collapses++; S.mflag = true;
    setScene('home'); setCast(['rabbit','sheep']);
    if (S.collapses >= 3){ await endGame('frail'); return true; }
    await runLines([['_','{n} wobbles, sways, and quietly folds over in the middle of the day. Nimbus carries them home.'],['sheep','That’s enough. Everything else this month is bed rest. No arguments.','hi']]);
    applyFx({health:35, stress:-15});
  } else if (S.stress >= 100){
    S.meltdowns++; S.mflag = true;
    setScene('home'); setCast(['rabbit','sheep']);
    if (S.meltdowns >= 2){ await endGame('ranaway'); return true; }
    await runLines([['_','Something snaps. {n} sits down on the road, unable to take another step, and cries until the tears run out.'],['sheep','Come home. We’ll cancel everything. The world can wait for one month.','hi']]);
    applyFx({stress:-45});
  }
  return false;
}
async function runMonth(plan){
  S.lastPlan = plan.slice(); S.mflag = false;
  for (let h = 0; h < 2; h++){
    if (S.over) return;
    const id = S.mflag ? 'rest' : plan[h];
    if (await doHalf(id, h)) return;
  }
}
async function endMonth(){
  if (S.over) return;
  const before = {h:S.health, s:S.stress, c:S.coins};
  const lines = [];
  let upkeep = UPKEEP;
  if (S.coins < UPKEEP){ upkeep = S.coins; lines.push('Not enough coins for the house. Nimbus quietly covered the rest.'); applyFx({stress:12}, true); }
  S.coins -= upkeep;
  S.stress = clamp(S.stress - 4, 0, 100);
  S.health = clamp(S.health + (S.stress < 40 ? 4 : S.stress >= 75 ? -6 : 0), 0, 100);
  refresh();
  const nm = MONTH_NAMES[S.m%12];
  await card(`<h3>End of ${nm}</h3><p>House upkeep: −${upkeep} 🪙. A new month starts tomorrow.</p>${lines.map(l=>`<p class="note">${esc(l)}</p>`).join('')}
    <div class="chipline"><span class="chip s">❤️ ${S.health}</span><span class="chip s">😖 ${S.stress}</span><span class="chip s">🪙 ${S.coins}</span></div>`);
  if (S.health <= 0){ await endGame('frail'); return; }
  // month-end events: plot/arc events (priority order, up to two), otherwise maybe a random one
  const elig = EVENTS.filter(ev => ev.phase === 'end' && !S.done[ev.id] && ((ev.endAt !== undefined && ev.endAt === S.m) || (ev.when && ev.when(S))))
    .sort((a,b) => (a.pri===undefined?5:a.pri) - (b.pri===undefined?5:b.pri));
  let ran = 0;
  for (const ev of elig){
    if (S.over || ran >= 2 || (ran === 1 && S.m < 6)) break;
    await runEvent(ev); ran++;
  }
  if (ran) return;
  if (S.m - S.lastRandom >= 2 && Math.random() < .42){
    const pool = EVENTS.filter(e => e.phase === 'random' && (!e.when || e.when(S)) && e.id !== S.lastRandomId);
    if (pool.length){ const ev = pool[rnd(pool.length)]; S.lastRandom = S.m; S.lastRandomId = ev.id; await runEvent(ev); }
  }
}
async function beginMonth(){
  const evs = EVENTS.filter(e => e.phase === 'start' && e.at === S.m && !S.done[e.id]);
  for (const ev of evs){ if (S.over) return; await runEvent(ev); }
}
async function gameLoop(){
  while (!S.over && S.m < TOTAL_MONTHS){
    refresh();
    await beginMonth(); if (S.over) return;
    let plan;
    if (S.health < 25){
      setScene('home'); setCast(['rabbit','sheep']);
      await runLines([['sheep','Absolutely not. You’re spending this month in bed. Soup, tea, naps. Those are the plans.','hi']]);
      plan = ['rest','rest'];
    } else plan = await planMonth();
    await runMonth(plan); if (S.over) return;
    await endMonth(); if (S.over) return;
    S.m++; save();
  }
  if (!S.over) await finale();
}

/* ---------- finale & endings ---------- */
async function confession(p){
  const C = CONFESS[p];
  setScene(C.bg, C.time); setCast(['rabbit', p]);
  await runLines(C.lines);
  const i = await choose([C.yes, C.no]);
  if (i === 0) return true;
  await say(C.noLine[0], C.noLine[1]);
  return false;
}
function careerEnding(){
  const st = S.st, all = STATK.every(k => st[k] >= 40);
  if (S.fate === 'saved' && PIDS.every(p => S.flags['piece_'+p])) return 'keeper';
  if (S.rep >= 11 && st.charm >= 55 && st.wit >= 55 && st.kind >= 55) return 'mayor';
  if (S.coins >= 1800) return 'tycoon';
  const c = [
    {id:'knight',  v:st.str,   ok:st.str>=75 && st.nerve>=50},
    {id:'scholar', v:st.wit,   ok:st.wit>=75},
    {id:'star',    v:st.charm, ok:st.charm>=75},
    {id:'artisan', v:st.craft, ok:st.craft>=75},
    {id:'healer',  v:st.kind,  ok:st.kind>=75},
    {id:'shadow',  v:st.nerve, ok:st.nerve>=75 && st.kind<40}
  ].filter(x => x.ok).sort((a,b) => b.v - a.v);
  if (c.length) return c[0].id;
  if (all) return 'hero';
  if ((S.counts.farm||0) + (S.counts.herbs||0) >= 14) return 'farmer';
  return 'quiet';
}
function romanceEnding(p){
  const st = S.st;
  if (p === 'gareth') return st.str>=60 && st.nerve>=45 ? 'gareth_a' : 'gareth_b';
  if (p === 'fenn')   return st.wit>=60 ? 'fenn_a' : st.nerve>=50 ? 'fenn_c' : 'fenn_b';
  if (p === 'mugi')   return st.craft>=50 ? 'mugi_a' : 'mugi_b';
  return st.charm>=50 && S.coins>=500 ? 'suzu_a' : 'suzu_b';
}
async function hearing(){
  const have = PIDS.filter(p => S.flags['piece_'+p]), missing = PIDS.filter(p => !S.flags['piece_'+p]);
  setScene('town','dusk'); setCast(['rabbit','sheep']);
  await runLines([
    ['_','The Hearing begins at the foot of the festival stage. Steward Brock sets down his ledger, and the whole town holds its breath.'],
    ['brock','By the Crown’s law I must ask: does anyone present hold the Charter of Clover Hollow?'],
    ['sheep','…{n}. Whenever you’re ready.','hi']
  ]);
  let score = 0;
  if (!have.length) await say('_','{n} has nothing in paw. Only a grandmother’s words, and a town full of friends who never knew what they were holding.');
  for (const p of have){ setCast(['rabbit', p]); await say(p, PIECE_SPEECH[p]); score += 15; sfx.heart(); }
  setCast(['rabbit','sheep']);
  if (missing.length && have.length) await say('_', `No petal from ${missing.map(p => PEOPLE[p].name).join(', ')}. The Charter feels incomplete.`);
  await say('brock', have.length === 4 ? 'Four pieces. Four petals. The Keeper’s own design. …I must still hear your case.' : 'An incomplete Charter is difficult to defend. You’ll have to make the rest of the case yourself.');
  const st = S.st;
  const A = [
    ['Argue the law, clause by clause.', Math.round(st.wit*.45), 'The Fourth Clause is read aloud. Then the First. Then, for emphasis, the Second. The crowd murmurs; the clerks in the back start taking notes.'],
    ['Speak to the town’s heart.', Math.round((st.charm+st.kind)/2*.4), '{n} doesn’t speak of law at all. {n} speaks of the bridge, the bread, the lantern nights, the people. Somewhere in the crowd, someone starts to cry. Then several.'],
    ['Stand your ground and say no.', Math.round(st.nerve*.4), '{n} plants both feet, ears high, and says no, clearly and without apology. The square goes so quiet you can hear the fountain.'],
    ['Propose a river road.', Math.round((st.wit+st.craft)/2*.4) + (S.flags.brock_story ? 15 : 0), '{n} unrolls a plan: a road along the river, a mill-bridge, a grain-barge landing. The Steward’s eyebrows rise. The clerks lean in.']
  ];
  const i = await choose(A.map(a => a[0]));
  await say('_', A[i][2]);
  score += A[i][1] + Math.min(S.rep*2, 16) - (S.flags.brock_deal ? 10 : 0);
  if (S.rep >= 6) await say('_','The crowd murmurs approval. {n}’s name is well known in Clover Hollow.');
  if (S.flags.brock_deal) await say('sheep','…I know about the coins, {n}. I’m here anyway.','hi');
  const fate = score >= 85 ? 'saved' : score >= 50 ? 'compromise' : 'lost';
  S.fate = fate;
  setCast(['rabbit','sheep']);
  if (fate === 'saved'){
    await say('brock', S.flags.brock_story ? 'The law is the law. The road will follow the river. And I’ll write north tonight: grain by river barge. Seven days, not nine.' : 'The law is the law. The road will go along the river. I hold myself responsible for the delay.');
    applyFx({rep:2, stress:-10});
    await say('sheep','Keeper. That’s what they’ll call you now.','proud');
  } else if (fate === 'compromise'){
    await say('brock','The lower field, then, and the river road. It isn’t what either of us wanted. It may be what the Hollow needs.');
    applyFx({rep:1, stress:-5});
    await say('sheep','Not a victory. Not a loss. Let’s call it a very good first chapter.','happy');
  } else {
    await say('brock','The Charter is incomplete. I’m sorry. The road will be built.');
    applyFx({stress:6});
    await say('sheep','Then we’ll be the loudest town on the Crown’s Road. Come, {n}. Tea.','hi');
  }
}
async function finale(){
  setScene('town', 'dusk'); setCast(['rabbit','sheep']);
  await runLines([['_','March ends. The three years Nimbus promised have come around, and all of Clover Hollow has gathered for the Spring Festival, and for the Hearing.']]);
  await hearing();
  setScene('town','dusk'); setCast(['rabbit','sheep']);
  await runLines([
    ['sheep','Three years. I wrote that promise on the back of an old shopping list, and look at you.','proud'],
    ['sheep','Whatever you choose from here, {n}, this was never a favor to your grandmother. It was the best thing I did all decade.'],
    ['n','…Nimbus.']
  ]);
  const everyone = PIDS.every(p => S.aff[p] >= 55) && S.st.kind >= 65;
  if (everyone){ S.careerTag = careerEnding(); await endGame('everyone'); return; }
  const cands = PIDS.filter(p => S.aff[p] >= 70).sort((a,b) => S.aff[b] - S.aff[a]);
  if (cands.length){
    const ok = await confession(cands[0]);
    if (ok){ S.careerTag = careerEnding(); await endGame(romanceEnding(cands[0])); return; }
  }
  await endGame(careerEnding());
}
async function endGame(id){
  const st = S;
  await showEnding(id);
  st.over = true;
}
async function showEnding(id){
  const E = ENDINGS[id];
  setScene(E.bg, E.time); setCast(E.cast); setProp(null,false); sfx.fan();
  if (S.fate) await say('_', FATE_LINES[S.fate]);
  for (const l of E.lines){ await say(l[0], l[1], l[2]); }
  const tagLine = S.careerTag && CAREER_LINE[S.careerTag];
  if (tagLine) await say('_', tagLine);
  markEnding(id); clearSave();
  const top = STATS.slice().sort((a,b) => S.st[b.id]-S.st[a.id]).slice(0,3);
  const kindLabel = {love:'Love & partnership', career:'A path of your own', secret:'Secret ending', bad:'A gentler path'}[E.kind];
  const n = foundEndings().length;
  dock.classList.remove('tall');
  if (AUTO) return;
  dock.innerHTML = `<div class="rcard patch final"><div class="medal">${E.icon}</div><h2>${esc(fmt(E.title))}</h2><p class="note">${kindLabel} · Ending ${n} of ${ENDING_ORDER.length}</p>${tagLine ? `<p class="note">Also: ${esc(fmt(ENDINGS[S.careerTag].title))}</p>` : ''}
    <div class="chipline">${top.map(s => `<span class="chip s up">${s.icon} ${s.name} ${S.st[s.id]}</span>`).join('')}<span class="chip s">🪙 ${S.coins}</span><span class="chip s">⭐ ${S.rep}</span></div>
    <div class="row"><button class="btn go" id="bAgain">Play again</button><button class="btn alt" id="bTitle">Title</button><button class="btn alt" id="bGal">Endings</button></div></div>`;
  $('#bAgain').onclick = () => { sfx.click(); showSetup(); };
  $('#bTitle').onclick = () => { sfx.click(); showTitle(); };
  $('#bGal').onclick = () => { sfx.click(); showGallery(); };
}

/* ---------- boot ---------- */
$('#statusBtn').onclick = () => $('#side').classList.toggle('open');
function syncMute(){ $('#muteBtn').textContent = muted ? '🔇' : '🔊'; }
$('#muteBtn').onclick = () => { muted = !muted; try { localStorage.setItem('clover_mute', muted?'1':'0'); } catch(e){} syncMute(); sfx.click(); };
syncMute();
window.addEventListener('resize', () => particles.resize());
if (window.ResizeObserver) new ResizeObserver(() => particles.resize()).observe($('#stage'));
particles.start();
window.__clover = { hearing, get S(){ return S; }, set AUTO(v){ AUTO = v; }, newState, gameLoop, prologue, finale, careerEnding, endGame, KEEPSAKES, leaveTitle, setS(s){ S = s; } };
if (!window.__NOBOOT) showTitle();
