/* ===== [SHARED:VIZ-JS], pustaka visual bersama, jangan ubah antar pertemuan ===== */
(function(){
"use strict";
const E=window.EHC; if(!E){return}
const {$,$$,store,esc,markDone,body}=E;
const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const arr=x=>x==null?[]:Array.isArray(x)?x:[x];
const list=(a,tag="ul")=>`<${tag}>${arr(a).map(x=>`<li>${esc(x)}</li>`).join("")}</${tag}>`;

/* =============== FLOW: animasi alur proses antar aktor =============== */
/* cfg: {title, sub, actors:[{id,icon,name,x,y,role,state,badge}], zones:[{x,y,w,h,label}],
         steps:[{title,text,from,to,packet,label,count,bad,set:{id:'safe|warn|danger|lock|active'|['danger','teks']},law,tip,risk}], outcome} */
function flow(el,c,opt){
  opt=opt||{};const b=body(el);
  b.innerHTML=`<h3>${esc(c.title||"")}</h3>${c.sub?`<p>${esc(c.sub)}</p>`:""}
  <div class="v-stage"><svg class="v-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg><div class="v-layer"></div></div>
  <div class="v-ctl"><button class="btn ghost" data-a="rs" title="Ulang dari awal">Ulang</button><button class="btn ghost" data-a="pv">‹ Mundur</button><button class="btn" data-a="pl">Putar otomatis</button><button class="btn ghost" data-a="nx">Lanjut ›</button>
  <label>Kecepatan <select data-a="sp"><option value="1.6">Lambat</option><option value="1" selected>Normal</option><option value="0.6">Cepat</option></select></label></div>
  <div class="v-rail"></div><div class="v-cap" aria-live="polite"></div>`;
  const stage=$(".v-stage",b),svg=$(".v-lines",b),layer=$(".v-layer",b),rail=$(".v-rail",b),cap=$(".v-cap",b),play=$("[data-a=pl]",b);
  const A={},pos={};
  (c.zones||[]).forEach(z=>{const d=document.createElement("div");d.className="v-zone";d.style.cssText=`left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%`;d.textContent=z.label||"";layer.appendChild(d)});
  c.actors.forEach(a=>{pos[a.id]=a;const d=document.createElement("div");d.className="v-actor r-"+(a.role||"neutral");d.style.cssText=`left:${a.x}%;top:${a.y}%`;
    d.innerHTML=`<div class="v-ico">${a.icon}</div><div class="v-name">${esc(a.name)}</div><div class="v-badge"></div>`;layer.appendChild(d);A[a.id]=d});
  const seenPairs=new Set(),L={};
  c.steps.forEach(s=>arr(s.from).forEach(f=>arr(s.to).forEach(t=>{const k=f+">"+t;if(f===t||seenPairs.has(k))return;seenPairs.add(k);
    const ln=document.createElementNS("http://www.w3.org/2000/svg","line");ln.setAttribute("x1",pos[f].x);ln.setAttribute("y1",pos[f].y);ln.setAttribute("x2",pos[t].x);ln.setAttribute("y2",pos[t].y);svg.appendChild(ln);L[k]=ln})));
  c.steps.forEach((s,i)=>{const r=document.createElement("button");r.textContent=`${i+1}. ${s.short||s.title}`;r.onclick=()=>{halt();go(i,true)};rail.appendChild(r)});
  let cur=-1,tm=[],auto=false,max=-1,sp=1;
  const T=(fn,ms)=>{const id=setTimeout(fn,ms);tm.push(id);return id};
  const clr=()=>{tm.forEach(clearTimeout);tm=[];$$(".v-packet",layer).forEach(p=>p.remove())};
  function states(i){
    c.actors.forEach(a=>setSt(a.id,a.state||"",a.badge||""));
    for(let k=0;k<=i;k++){const st=c.steps[k].set||{};for(const id in st){const v=st[id];Array.isArray(v)?setSt(id,v[0],v[1]||""):setSt(id,v,"")}}}
  function setSt(id,s,badge){const d=A[id];if(!d)return;d.className=d.className.replace(/\bs-\w+/g,"").trim();if(s)d.classList.add("s-"+s);$(".v-badge",d).textContent=badge}
  function fire(s){
    const dur=reduce?1:900*sp,n=s.count||1;let d=0;
    arr(s.from).forEach(f=>arr(s.to).forEach(t=>{ if(f===t)return;
      for(let k=0;k<n;k++){T(()=>{const a=pos[f],z=pos[t],p=document.createElement("div");p.className="v-packet";p.style.cssText=`left:${a.x}%;top:${a.y}%;--dur:${dur}ms`;
        p.innerHTML=(s.packet||"✉️")+(s.label&&k===0?`<span class="v-plabel">${esc(s.label)}</span>`:"");layer.appendChild(p);void p.offsetWidth;
        p.style.left=z.x+"%";p.style.top=z.y+"%";T(()=>{p.style.opacity=0;T(()=>p.remove(),320)},dur)},d+k*240*sp)}
      d+=90*sp}));
    return dur+(n-1)*240*sp+d}
  function go(i,animate){
    if(i<0||i>=c.steps.length)return;clr();cur=i;max=Math.max(max,i);const s=c.steps[i];
    states(i-1);$$("line",svg).forEach(l=>l.classList.remove("on","bad"));
    arr(s.from).forEach(f=>arr(s.to).forEach(t=>{const l=L[f+">"+t];if(l){l.classList.add("on");if(s.bad)l.classList.add("bad")}}));
    arr(s.from).forEach(f=>{A[f]&&A[f].classList.add("s-active")});
    const after=animate?fire(s):0;
    T(()=>{states(i);arr(s.from).forEach(f=>{});},animate?Math.min(after,1100*sp):0);
    $$("button",rail).forEach((r,k)=>{r.classList.toggle("on",k===i);r.classList.toggle("seen",k<i||k<=max&&k!==i)});
    cap.innerHTML=`<span class="v-num">Langkah ${i+1} / ${c.steps.length}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p>`
      +((s.law||s.tip||s.risk)?`<div class="v-chips">${s.risk?`<span class="v-chip risk"><b>Risiko</b>${esc(s.risk)}</span>`:""}${s.law?`<span class="v-chip law"><b>Dasar hukum</b>${esc(s.law)}</span>`:""}${s.tip?`<span class="v-chip tip"><b>Tips</b>${esc(s.tip)}</span>`:""}</div>`:"")
      +(i===c.steps.length-1&&c.outcome?`<div class="v-outcome">${esc(c.outcome)}</div>`:"");
    if(i===c.steps.length-1&&!opt.silent)markDone(el.id);
    return after}
  function halt(){auto=false;play.textContent="Putar otomatis"}
  function step(){if(!auto)return;if(cur>=c.steps.length-1){halt();return}const after=go(cur+1,true);T(step,after+2600*sp)}
  b.addEventListener("click",e=>{const a=e.target.dataset&&e.target.dataset.a;if(!a)return;
    if(a==="rs"){halt();clr();cur=-1;states(-1);$$("line",svg).forEach(l=>l.classList.remove("on","bad"));$$("button",rail).forEach(r=>r.className="");cap.innerHTML="<span class=\"v-num\">Siap</span><h4>Tekan “Putar otomatis” atau “Lanjut”</h4><p>Setiap langkah menampilkan apa yang terjadi, dasar hukumnya, dan cara memutus rantainya.</p>"}
    if(a==="nx"){halt();go(Math.min(cur+1,c.steps.length-1),true)}
    if(a==="pv"){halt();go(Math.max(cur-1,0),false)}
    if(a==="pl"){if(auto){halt();return}auto=true;play.textContent="Jeda";if(cur>=c.steps.length-1){cur=-1}step()}
  });
  $("[data-a=sp]",b).onchange=e=>{sp=+e.target.value};
  b.querySelector("[data-a=rs]").click();
}

/* =============== EXPLORER: peta jenis / konsep dengan detail =============== */
/* cfg: {title, intro, items:[{id,icon,name,tag,summary,how[],ex,impact,law,prev[],flow:'kunciFlow'}]} */
function explorer(el,c){
  const b=body(el);const seen=new Set(store.get(el.id,[]));
  b.innerHTML=`<h3>${esc(c.title)}</h3>${c.intro?`<p>${esc(c.intro)}</p>`:""}<div class="v-grid"></div><div class="v-detail-wrap"><p class="v-hintp"><em>Klik salah satu kartu untuk membuka penjelasan, contoh, dasar hukum, dan cara pencegahannya.</em></p></div>`;
  const grid=$(".v-grid",b),wrap=$(".v-detail-wrap",b);
  c.items.forEach((it,i)=>{const t=document.createElement("button");t.className="v-tile"+(seen.has(i)?" seen":"");t.innerHTML=`<span class="ic">${it.icon}</span><b>${esc(it.name)}</b><small>${esc(it.tag||"")}</small>`;t.onclick=()=>open(i);grid.appendChild(t)});
  function open(i,tab){const it=c.items[i];seen.add(i);store.set(el.id,[...seen]);
    $$(".v-tile",grid).forEach((t,k)=>{t.classList.toggle("sel",k===i);if(seen.has(k))t.classList.add("seen")});
    const tabs=[["ap","Apa itu",true],["how","Cara kerja",it.how],["ex","Contoh",it.ex],["im","Dampak",it.impact],["law","Dasar hukum",it.law],["pv","Pencegahan",it.prev]].filter(x=>x[2]);
    tab=tab||"ap";
    const pane={ap:()=>`<p>${esc(it.summary)}</p>`,how:()=>list(it.how,"ol"),ex:()=>Array.isArray(it.ex)?list(it.ex):`<p>${esc(it.ex)}</p>`,im:()=>Array.isArray(it.impact)?list(it.impact):`<p>${esc(it.impact)}</p>`,law:()=>Array.isArray(it.law)?list(it.law):`<p>${esc(it.law)}</p>`,pv:()=>list(it.prev)};
    wrap.innerHTML=`<div class="v-detail"><h3><span style="font-size:1.8rem">${it.icon}</span>${esc(it.name)}</h3><div class="v-tabs">${tabs.map(t=>`<button data-t="${t[0]}" class="${t[0]===tab?"on":""}">${t[1]}</button>`).join("")}</div><div class="v-pane">${pane[tab]()}</div>${it.flow&&PAGE[it.flow]?`<div class="v-sub"><button class="btn" data-f="1">Lihat animasi prosesnya</button><div class="v-flowbox"></div></div>`:""}</div>`;
    wrap.onclick=e=>{const t=e.target.dataset.t;if(t){open(i,t)}if(e.target.dataset.f){e.target.style.display="none";flow($(".v-flowbox",wrap),PAGE[it.flow],{silent:true})}};
    if(seen.size===c.items.length)markDone(el.id)}
  if(seen.size===c.items.length)markDone(el.id)
}

/* =============== MOCK: layar HP / email / web / postingan dengan titik klik =============== */
/* cfg: {title, kind:'chat|email|web|post', header:{name,sub,avatar,from,to,subject,url}, messages:[{from,time,parts}], cta, stats,
         hotspots:[{id,label,why,decoy}], instruct}
   parts: array string | {t:'teks', h:'idHotspot'} */
function mock(el,c){
  const b=body(el);const found=new Set(store.get(el.id,[]));const real=c.hotspots.filter(h=>!h.decoy);const H={};c.hotspots.forEach(h=>H[h.id]=h);
  const P=parts=>arr(parts).map(p=>typeof p==="string"?esc(p):`<span class="v-hot" data-h="${p.h}" tabindex="0" role="button">${esc(p.t)}</span>`).join("");
  const h=c.header||{};let inner="";
  if(c.kind==="email"){inner=`<div class="v-bar"><span>✉️</span><b>Kotak masuk</b></div><div class="v-meta"><div><b>Dari:</b> ${P(h.from)}</div><div><b>Kepada:</b> ${P(h.to)}</div><div><b>Subjek:</b> ${P(h.subject)}</div></div><div class="v-body">${c.messages.map(m=>`<p>${P(m.parts)}</p>`).join("")}${c.cta?`<span class="v-cta">${P(c.cta)}</span>`:""}</div>`}
  else if(c.kind==="web"){inner=`<div class="v-bar"><span>🔒</span><div class="v-url">${P(h.url)}</div></div><div class="v-body">${c.messages.map(m=>`<p>${P(m.parts)}</p>`).join("")}${c.cta?`<span class="v-cta">${P(c.cta)}</span>`:""}</div>`}
  else if(c.kind==="post"){inner=`<div class="v-bar"><div class="av">${h.avatar||"👤"}</div><div><b>${P(h.name)}</b><small>${esc(h.sub||"")}</small></div></div><div class="v-body">${c.messages.map(m=>`<p>${P(m.parts)}</p>`).join("")}</div><div class="v-stats">${esc(c.stats||"")}</div>`}
  else{inner=`<div class="v-bar"><div class="av">${h.avatar||"👤"}</div><div><b>${P(h.name)}</b><small>${esc(h.sub||"")}</small></div></div><div class="v-msgs">${c.messages.map(m=>`<div class="v-msg ${m.from==="me"?"me":""}">${P(m.parts)}${m.time?`<time>${esc(m.time)}</time>`:""}</div>`).join("")}</div>`}
  b.innerHTML=`<h3>${esc(c.title)}</h3><p>${esc(c.instruct||"Klik bagian yang menurutmu mencurigakan. Hati-hati: ada juga bagian yang tampak janggal tetapi wajar.")}</p>
  <div class="v-mockwrap"><div class="v-phone"><div class="v-screen ${c.kind||"chat"}">${inner}</div></div>
  <div><div class="v-spec-lbl"><span>Tanda bahaya ditemukan</span><span class="cnt"></span></div><div class="v-prog"><i></i></div><p><button class="btn ghost" data-a="hint">Tampilkan petunjuk</button> <button class="btn ghost" data-a="reset">Ulangi</button></p><div class="v-finds"></div></div></div>`;
  const scr=$(".v-phone",b),fin=$(".v-finds",b);
  function upd(){const n=[...found].filter(id=>!H[id].decoy).length;$(".cnt",b).textContent=`${n} / ${real.length}`;$(".v-prog i",b).style.width=(n/real.length*100)+"%";if(n===real.length)markDone(el.id)}
  function mark(id){const hs=H[id];if(!hs)return;found.add(id);store.set(el.id,[...found]);$$(`[data-h="${id}"]`,b).forEach(x=>x.classList.add(hs.decoy?"decoy":"found"));
    if(!$(`[data-f="${id}"]`,fin)){const d=document.createElement("div");d.className="v-find"+(hs.decoy?" ok":"");d.dataset.f=id;d.innerHTML=`<b>${hs.decoy?"Ini wajar":"Tanda bahaya: "+esc(hs.label)}</b>${esc(hs.why)}`;fin.appendChild(d)}upd()}
  b.addEventListener("click",e=>{const x=e.target.closest(".v-hot");if(x){mark(x.dataset.h);return}if(e.target.dataset.a==="hint"){scr.classList.toggle("v-hint")}if(e.target.dataset.a==="reset"){found.clear();store.set(el.id,[]);$$(".v-hot",b).forEach(x=>x.classList.remove("found","decoy"));fin.innerHTML="";scr.classList.remove("v-hint");upd()}});
  b.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList.contains("v-hot"))mark(e.target.dataset.h)});
  found.forEach(id=>mark(id));upd();
}

/* =============== TIMELINE =============== */
/* cfg: {title, events:[{when,title,text,icon,law}]} */
function timeline(el,c){
  const b=body(el);const seen=new Set(store.get(el.id,[]));let cur=0;
  b.innerHTML=`<h3>${esc(c.title)}</h3><div class="v-tl"><div class="v-tl-track"></div></div><div class="v-cap"></div><p><button class="btn ghost" data-a="p">‹ Sebelumnya</button> <button class="btn" data-a="n">Berikutnya ›</button></p>`;
  const tr=$(".v-tl-track",b),cap=$(".v-cap",b);
  c.events.forEach((ev,i)=>{const p=document.createElement("button");p.className="v-tl-pt";p.innerHTML=`<span class="dot">${ev.icon||"•"}</span><span class="when">${esc(ev.when)}</span><span class="tt">${esc(ev.title)}</span>`;p.onclick=()=>show(i);tr.appendChild(p)});
  function show(i){cur=i;seen.add(i);store.set(el.id,[...seen]);const ev=c.events[i];
    $$(".v-tl-pt",tr).forEach((p,k)=>{p.classList.toggle("on",k===i);p.classList.toggle("seen",seen.has(k))});
    const pt=$(".v-tl-pt",tr)[i],sc=tr.parentElement;if(pt&&sc&&sc.scrollTo){sc.scrollTo({left:pt.getBoundingClientRect().left-sc.getBoundingClientRect().left+sc.scrollLeft-sc.clientWidth/2+pt.offsetWidth/2,behavior:reduce?"auto":"smooth"})}
    cap.innerHTML=`<span class="v-num">${esc(ev.when)}</span><h4>${esc(ev.title)}</h4><p>${esc(ev.text)}</p>${ev.law?`<div class="v-chips"><span class="v-chip law"><b>Dasar hukum</b>${esc(ev.law)}</span></div>`:""}`;
    if(seen.size===c.events.length)markDone(el.id)}
  b.addEventListener("click",e=>{const a=e.target.dataset.a;if(a==="n")show(Math.min(cur+1,c.events.length-1));if(a==="p")show(Math.max(cur-1,0))});
  show(0);
}

/* =============== SPECTRUM: geser untuk melihat trade-off =============== */
/* cfg: {title, prompt, left, right, stops:[{at,label,text,risk}]} */
function spectrum(el,c){
  const b=body(el);const seen=new Set(store.get(el.id,[]));
  b.innerHTML=`<h3>${esc(c.title)}</h3><p>${esc(c.prompt||"")}</p><div class="v-spec"><div class="v-spec-lbl"><span>‹ ${esc(c.left)}</span><span>${esc(c.right)} ›</span></div><input type="range" min="0" max="100" value="50" aria-label="${esc(c.title)}">
  <div class="v-spec-bars"><div><small>${esc(c.left)}</small><div class="bar"><i></i></div></div><div><small>${esc(c.right)}</small><div class="bar r"><i></i></div></div></div></div><div class="v-cap"></div>`;
  const rg=$("input",b),cap=$(".v-cap",b),bl=$(".bar i",b),br=$(".bar.r i",b);
  function upd(){const v=+rg.value;bl.style.width=(100-v)+"%";br.style.width=v+"%";
    let best=0,d=1e9;c.stops.forEach((s,i)=>{const x=Math.abs(s.at-v);if(x<d){d=x;best=i}});const s=c.stops[best];
    cap.innerHTML=`<span class="v-num">${esc(s.label)}</span><p>${esc(s.text)}</p>${s.risk?`<div class="v-chips"><span class="v-chip risk"><b>Risiko</b>${esc(s.risk)}</span></div>`:""}`;
    seen.add(best);store.set(el.id,[...seen]);if(seen.size>=Math.min(3,c.stops.length))markDone(el.id)}
  rg.oninput=upd;upd();
}

/* =============== ORDER: urutkan langkah =============== */
/* cfg: {title, prompt, items:[{t,why}]} dalam urutan benar */
function order(el,c){
  const b=body(el);const n=c.items.length;
  const idx=c.items.map((_,i)=>i);const sh=idx.map((_,i)=>idx[(i*3+2)%n]).filter((v,i,a)=>a.indexOf(v)===i);idx.forEach(i=>{if(!sh.includes(i))sh.push(i)});
  let pool=sh.slice(),ans=[];if(pool.every((v,i)=>v===i)){pool.reverse()}
  b.innerHTML=`<h3>${esc(c.title)}</h3><p>${esc(c.prompt||"Klik langkah satu per satu sesuai urutan yang benar. Klik langkah di kolom jawaban untuk membatalkannya.")}</p><div class="v-ord"><div><h4>Langkah acak</h4><div class="col pool"></div></div><div><h4>Urutan kamu</h4><div class="col ans"></div></div></div><p><button class="btn" data-a="chk" disabled>Periksa urutan</button> <button class="btn ghost" data-a="rst">Ulangi</button></p><div class="fb"></div>`;
  const P=$(".pool",b),Aw=$(".ans",b),chk=$("[data-a=chk]",b),fb=$(".fb",b);
  function draw(res){P.innerHTML="";Aw.innerHTML="";pool.forEach(i=>{const x=document.createElement("button");x.className="it";x.textContent=c.items[i].t;x.onclick=()=>{ans.push(i);pool=pool.filter(v=>v!==i);fb.className="fb";draw()};P.appendChild(x)});
    ans.forEach((i,k)=>{const x=document.createElement("button");x.className="it"+(res?(i===k?" right":" wrong"):"");x.innerHTML=`<i>${k+1}</i>`+esc(c.items[i].t);x.onclick=()=>{if(res)return;ans=ans.filter(v=>v!==i);pool.push(i);draw()};Aw.appendChild(x)});
    chk.disabled=pool.length>0}
  b.addEventListener("click",e=>{const a=e.target.dataset.a;if(a==="rst"){pool=sh.slice();ans=[];fb.className="fb";draw()}
    if(a==="chk"){const ok=ans.filter((v,k)=>v===k).length;draw(true);fb.className="fb show"+(ok===n?" ok":"");fb.innerHTML=`<b>${ok}/${n} posisi tepat.</b><ol>${c.items.map(x=>`<li>${esc(x.t)}${x.why?`: ${esc(x.why)}`:""}</li>`).join("")}</ol>`;markDone(el.id)}});
  draw();
}

/* ---------- registrasi ---------- */
const V={flow,explorer,mock,timeline,spectrum,order};
$$(".w[data-widget]").forEach(el=>{const t=el.dataset.widget;if(V[t]&&PAGE[el.id])V[t](el,PAGE[el.id])});
/* reveal on scroll */
if(!reduce&&"IntersectionObserver" in window){document.documentElement.classList.add("reveal-on");
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{rootMargin:"0px 0px -8% 0px"});
  $$(".seg").forEach(s=>io.observe(s));
  setTimeout(()=>$$(".seg").forEach(s=>s.classList.add("in")),2500)}
})();
/* ===== [/SHARED:VIZ-JS] ===== */
