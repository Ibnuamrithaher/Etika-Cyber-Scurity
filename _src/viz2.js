/* ===== [SHARED:VIZ2-JS], pustaka visual tambahan (venn, swipe, race, stakeholder, match, hotseat) ===== */
(function(){
"use strict";
const E=window.EHC; if(!E){return}
const {$,$$,store,esc,markDone,body}=E;
const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const mark=(ic,x,y,s,fs)=>{const v=E.svgIn&&E.svgIn(ic,x-s/2,y-s/2,s);return v||`<text x="${x}" y="${y+fs*.4}" text-anchor="middle" font-size="${fs}">${ic}</text>`};
const arr=x=>x==null?[]:Array.isArray(x)?x:[x];

/* =============== VENN: tiga lingkaran, klik wilayah + tempatkan contoh =============== */
/* cfg: {title,intro,sets:[{name,sub},{..},{..}] (urutan a,b,c), zones:{a,b,c,ab,ac,bc,abc,none:{icon,title,text,ex[]}}, items:[{t,z,why}]} */
function venn(el,c){
  const b=body(el);const K=["a","b","c"];
  const CX=[[150,125],[250,125],[200,205]],R=95;
  const POS={a:[98,100],b:[302,100],c:[200,268],ab:[200,92],ac:[148,180],bc:[252,180],abc:[200,148],none:[366,282]};
  const COL=["#0f766e","#7c3aed","#b45309"];
  const done=new Set(store.get(el.id,[]));let pick=null,score=store.get(el.id+":s",0);
  const items=c.items||[];
  b.innerHTML=`<h3>${esc(c.title)}</h3>${c.intro?`<p>${esc(c.intro)}</p>`:""}
  <div class="v2-venn"><div><svg viewBox="0 0 400 326" class="v2-vsvg" role="img" aria-label="Diagram Venn">
   ${CX.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${R}" fill="${COL[i]}" fill-opacity=".16" stroke="${COL[i]}" stroke-width="2.5"/>`).join("")}
   ${c.sets.map((s,i)=>{const lp=[[92,20],[308,20],[200,322]][i];return `<text x="${lp[0]}" y="${lp[1]}" text-anchor="middle" class="v2-vlab" fill="${COL[i]}">${esc(s.name)}</text>`}).join("")}
   ${Object.keys(POS).filter(k=>c.zones[k]).map(k=>`<g class="v2-zone" data-z="${k}" tabindex="0" role="button" aria-label="${esc(c.zones[k].title)}"><circle cx="${POS[k][0]}" cy="${POS[k][1]}" r="15"/>${mark(c.zones[k].icon||"•",POS[k][0],POS[k][1],18,15)}</g>`).join("")}
  </svg><p class="v2-vh"><em>Klik tanda di diagram untuk membuka penjelasan wilayahnya.</em></p></div>
  <div><div class="v2-vdetail" aria-live="polite"><p><em>Pilih wilayah di diagram.</em></p></div>
  ${items.length?`<div class="v2-vgame"><h4>Tempatkan contoh <span class="v2-sc"></span> <button class="btn ghost v2-reset" data-a="vr">Ulangi</button></h4><p><small>Klik satu kartu, lalu klik wilayah yang tepat pada diagram.</small></p><div class="v2-pool"></div><div class="v2-vfb fb"></div></div>`:""}</div></div>`;
  const det=$(".v2-vdetail",b),pool=$(".v2-pool",b),fb=$(".v2-vfb",b);
  function show(k){const z=c.zones[k];if(!z)return;$$(".v2-zone",b).forEach(g=>g.classList.toggle("on",g.dataset.z===k));
    det.innerHTML=`<h4>${z.icon||""} ${esc(z.title)}</h4><p>${esc(z.text)}</p>${arr(z.ex).length?`<ul>${arr(z.ex).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}`}
  function drawPool(){if(!pool)return;pool.innerHTML="";items.forEach((it,i)=>{if(done.has(i))return;const x=document.createElement("button");x.className="v2-chip"+(pick===i?" pick":"");x.textContent=it.t;x.onclick=()=>{pick=pick===i?null:i;drawPool()};pool.appendChild(x)});
    const sc=$(".v2-sc",b);if(sc)sc.textContent=`${done.size}/${items.length} tepat`;
    if(items.length&&done.size===items.length){pool.innerHTML="<p><b>Semua contoh tepat. Kamu sudah memetakan ketiganya.</b></p>";markDone(el.id)}}
  function zoneOf(e){const sv=$(".v2-vsvg",b),r=sv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*400,y=(e.clientY-r.top)/r.height*326;
    const inn=K.filter((_,i)=>Math.hypot(x-CX[i][0],y-CX[i][1])<=R).join("");return inn||"none"}
  function act(k){if(!c.zones[k])k=Object.keys(c.zones).includes(k)?k:"none";
    if(pick!==null){const it=items[pick];const ok=it.z===k;fb.className="fb show"+(ok?" ok":"");
      fb.innerHTML=(ok?"<b>Tepat.</b> ":"<b>Belum tepat.</b> Coba wilayah lain. ")+(ok?esc(it.why||""):"");
      if(ok){done.add(pick);store.set(el.id,[...done]);pick=null;drawPool()}
      show(k);return}
    show(k)}
  b.addEventListener("click",e=>{const g=e.target.closest(".v2-zone");if(g){act(g.dataset.z);return}if(e.target.closest(".v2-vsvg")){act(zoneOf(e))}});
  b.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("v2-zone"))act(e.target.dataset.z)});
  b.addEventListener("click",e=>{if(e.target.dataset&&e.target.dataset.a==="vr"){done.clear();store.set(el.id,[]);pick=null;fb.className="fb";fb.innerHTML="";drawPool()}});
  show(c.zones.abc?"abc":Object.keys(c.zones)[0]);drawPool();
}

/* =============== SWIPE: kartu geser kiri/kanan =============== */
/* cfg: {title,prompt,left:{label,icon},right:{label,icon},cards:[{t,a:'left'|'right',why}]} */
function swipe(el,c){
  const b=body(el);let i=0,ok=0,streak=0,best=0;const miss=[];
  function render(){
    if(i>=c.cards.length){const p=Math.round(ok/c.cards.length*100);
      b.innerHTML=`<h3>${esc(c.title)}</h3><div class="v2-end"><p class="score">${ok}/${c.cards.length} (${p}%)</p><p>Rangkaian benar terpanjang: <b>${best}</b></p>${miss.length?`<p><b>Yang masih keliru:</b></p><ul>${miss.map(m=>`<li>${esc(m)}</li>`).join("")}</ul>`:"<p>Tidak ada yang keliru. Mantap.</p>"}<p><button class="btn ghost" data-a="r">Ulangi</button></p></div>`;
      markDone(el.id);return}
    const x=c.cards[i];
    b.innerHTML=`<h3>${esc(c.title)}</h3><p>${esc(c.prompt||"Geser kartu ke kategori yang tepat.")} <small>(boleh pakai tombol panah kiri/kanan)</small></p>
    <div class="v2-sw"><div class="v2-swhead"><span>Kartu ${i+1}/${c.cards.length}</span><span>Benar ${ok}</span><span>Beruntun ${streak}</span></div>
    <div class="v2-swstage"><div class="v2-swcard" id="${el.id}-c">${esc(x.t)}</div></div>
    <div class="v2-swbtns"><button class="btn ghost v2-L" data-d="left">‹ ${esc(c.left.label)}</button><button class="btn v2-R" data-d="right">${esc(c.right.label)} ›</button></div>
    <div class="fb v2-swfb"></div></div>`;
  }
  function choose(d){const x=c.cards[i];const card=$(".v2-swcard",b);if(!card||card.dataset.lock)return;card.dataset.lock=1;
    const good=x.a===d;if(good){ok++;streak++;best=Math.max(best,streak)}else{streak=0;miss.push(x.t)}
    card.classList.add(d==="left"?"fly-l":"fly-r",good?"good":"bad");
    const fb=$(".v2-swfb",b);fb.className="fb show v2-swfb"+(good?" ok":"");fb.innerHTML=(good?"<b>Tepat.</b> ":"<b>Belum tepat</b> (seharusnya: "+esc(c[x.a].label)+"). ")+esc(x.why||"");
    $$("button[data-d]",b).forEach(t=>t.disabled=true);
    setTimeout(()=>{i++;const keep=fb.innerHTML,cls=fb.className;render();const f2=$(".v2-swfb",b);if(f2&&i<=c.cards.length){f2.className=cls;f2.innerHTML=keep}},reduce?200:900)}
  b.tabIndex=0;
  b.addEventListener("click",e=>{const d=e.target.dataset&&e.target.dataset.d;if(d)choose(d);if(e.target.dataset&&e.target.dataset.a==="r"){i=0;ok=0;streak=0;miss.length=0;render()}});
  b.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){e.preventDefault();choose("left")}if(e.key==="ArrowRight"){e.preventDefault();choose("right")}});
  render();
}

/* =============== RACE: teknologi vs hukum, jurang kekosongan aturan =============== */
/* cfg: {title,sub,from,to,gapLabel,events:[{at:0..1,type:'tech'|'law',icon,label,text}]} */
function race(el,c){
  const b=body(el);const W=600,H=292,pl=44,pr=16,pt=18,pb=46;
  const X=x=>pl+x*(W-pl-pr),Y=v=>H-pb-v*(H-pt-pb);
  const techV=x=>(Math.exp(3.2*x)-1)/(Math.exp(3.2)-1);
  const y0=+c.from,y1=+c.to,yr=e=>e.year||(isFinite(y0)&&isFinite(y1)?Math.round(y0+e.at*(y1-y0)):"");
  const laws=c.events.filter(e=>e.type==="law").sort((a,b)=>a.at-b.at);
  const lawV=x=>{let v=0;laws.forEach(e=>{const tg=Math.max(v,techV(Math.max(0,e.at-0.07)));v=v+(tg-v)*Math.min(1,Math.max(0,(x-e.at)/0.035))});return v};
  b.innerHTML=`<h3>${esc(c.title)}</h3>${c.sub?`<p>${esc(c.sub)}</p>`:""}
  <div class="v2-race"><svg viewBox="0 0 ${W} ${H}" class="v2-rsvg" role="img" aria-label="Grafik teknologi dan hukum">
   <line x1="${pl}" y1="${H-pb}" x2="${W-pr}" y2="${H-pb}" class="ax"/><line x1="${pl}" y1="${pt}" x2="${pl}" y2="${H-pb}" class="ax"/>
   ${(()=>{let t="";if(isFinite(y0)&&isFinite(y1))for(let q=y0+5;q<y1;q+=5){const xx=X((q-y0)/(y1-y0));t+=`<line x1="${xx}" y1="${H-pb}" x2="${xx}" y2="${H-pb+5}" class="ax"/><text x="${xx}" y="${H-pb+18}" class="tk" text-anchor="middle">${q}</text>`}return t})()}<text x="${pl}" y="${H-pb+16}" class="tk">${esc(c.from||"")}</text><text x="${W-pr}" y="${H-pb+16}" class="tk" text-anchor="end">${esc(c.to||"")}</text>
   <text x="${pl+8}" y="${pt+6}" class="tk">Kemampuan / aturan</text>
   <path class="gap"/><path class="tc"/><path class="lc"/><g class="evs"></g>
   <text class="gl" text-anchor="middle">${esc(c.gapLabel||"Kekosongan aturan")}</text></svg>
   <div class="v2-rleg"><span class="t">━ Teknologi</span><span class="l">━ Hukum / regulasi</span><span class="g">■ ${esc(c.gapLabel||"Kekosongan aturan")}</span></div></div>
  <div class="v-ctl"><button class="btn" data-a="p">Putar</button><button class="btn ghost" data-a="r">Ulang</button><label>Geser waktu <input type="range" min="0" max="1000" value="0" data-a="s" style="width:200px"></label></div>
  <div class="v-cap" aria-live="polite"><span class="v-num">Mulai</span><p>Tekan Putar atau geser penggeser untuk melihat kapan teknologi dan hukum bergerak.</p></div>`;
  const tc=$(".tc",b),lc=$(".lc",b),gap=$(".gap",b),gl=$(".gl",b),evs=$(".evs",b),cap=$(".v-cap",b),rg=$("[data-a=s]",b),pbtn=$("[data-a=p]",b);
  c.events.forEach((e,k)=>{const g=document.createElementNS("http://www.w3.org/2000/svg","g");g.setAttribute("class","ev "+e.type);g.dataset.k=k;
    const y=e.type==="tech"?Y(techV(e.at))-14:Y(lawV(Math.min(1,e.at+0.05)))+16;
    g.innerHTML=`<circle cx="${X(e.at)}" cy="${y}" r="13"/>${mark(e.icon||"•",X(e.at),y,16,13)}<text class="yr" x="${X(e.at)}" y="${e.type==="tech"?y-19:y+28}" text-anchor="middle">${yr(e)}</text>`;evs.appendChild(g)});
  const seen=new Set(store.get(el.id,[]));let p=0,timer=null,last=0;
  function draw(){const N=90,n=Math.max(2,Math.round(N*p)||2);let t="",l="",up=[],lo=[];
    for(let k=0;k<=n;k++){const x=Math.min(p,k/n*p);const px=X(x);up.push(`${px},${Y(techV(x))}`);lo.push(`${px},${Y(lawV(x))}`)}
    tc.setAttribute("d","M"+up.join("L"));lc.setAttribute("d","M"+lo.join("L"));
    gap.setAttribute("d","M"+up.join("L")+"L"+lo.slice().reverse().join("L")+"Z");
    const mx=p*0.6;gl.setAttribute("x",X(mx));gl.setAttribute("y",(Y(techV(mx))+Y(lawV(mx)))/2+4);gl.style.opacity=p>0.12&&(techV(mx)-lawV(mx))>0.08?1:0;
    let latest=-1;$$(".ev",evs).forEach(g=>{const e=c.events[+g.dataset.k];const on=p>=e.at;g.classList.toggle("on",on);if(on){seen.add(+g.dataset.k);if(latest<0||e.at>=c.events[latest].at)latest=+g.dataset.k}});
    if(latest>=0){const e=c.events[latest];cap.innerHTML=`<span class="v-num">${esc(yr(e))} · ${e.type==="tech"?"Teknologi":"Hukum"}: ${esc(e.label)}</span><p>${esc(e.text)}</p>`}
    if(p>=1||seen.size===c.events.length){store.set(el.id,[...seen]);if(p>=1)markDone(el.id)}}
  function loop(ts){if(!timer)return;const dt=ts-last;last=ts;p=Math.min(1,p+dt/12000);rg.value=Math.round(p*1000);draw();if(p>=1){stop()}else timer=requestAnimationFrame(loop)}
  function stop(){if(timer)cancelAnimationFrame(timer);timer=null;pbtn.textContent="Putar"}
  b.addEventListener("click",e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==="p"){if(timer){stop();return}if(p>=1)p=0;last=performance.now();timer=requestAnimationFrame(loop);pbtn.textContent="Jeda"}
    if(a==="r"){stop();p=0;rg.value=0;draw()}
    const g=e.target.closest(".ev");if(g){stop();p=Math.min(1,c.events[+g.dataset.k].at+0.001);rg.value=Math.round(p*1000);draw()}});
  rg.addEventListener("input",()=>{stop();p=rg.value/1000;draw()});
  p=reduce?1:0;rg.value=p*1000;draw();
}

/* =============== STAKEHOLDER: simulator dampak keputusan =============== */
/* cfg: {title,prompt,stakeholders:[{id,icon,name}],rounds:[{q,options:[{t,fx:{id:n},rights:bool,rightsNote,virtue,say}]}]} */
function stakeholder(el,c){
  const b=body(el);let r=0,total=0,viol=0,chosen=null;const log=[];
  function render(){
    if(r>=c.rounds.length){b.innerHTML=`<h3>${esc(c.title)}</h3><div class="v2-end"><p class="score">Total manfaat bersih: ${total>0?"+":""}${total}</p><p>Pelanggaran hak dasar yang kamu ambil: <b>${viol}</b></p><ul>${log.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><p>Keputusan terbaik tidak selalu yang bernilai manfaat tertinggi. Ia juga menghormati hak orang dan mencerminkan karakter yang bisa dipertanggungjawabkan.</p><p><button class="btn ghost" data-a="r">Ulangi simulasi</button></p></div>`;markDone(el.id);return}
    const R=c.rounds[r];chosen=null;
    b.innerHTML=`<h3>${esc(c.title)} · Keputusan ${r+1}/${c.rounds.length}</h3>${c.prompt&&r===0?`<p>${esc(c.prompt)}</p>`:""}<p class="scn-text"><b>${esc(R.q)}</b></p>
    <div class="opts v2-opts"></div>
    <div class="v2-sh">${c.stakeholders.map(s=>`<div class="v2-shrow" data-id="${s.id}"><span class="n">${s.icon} ${esc(s.name)}</span><div class="trk"><i class="mid"></i><b class="fill"></b></div><span class="val">0</span></div>`).join("")}</div>
    <div class="v2-lens"></div><p><button class="btn" data-a="n" disabled>${r===c.rounds.length-1?"Lihat hasil":"Keputusan berikutnya ›"}</button></p>`;
    const o=$(".v2-opts",b);R.options.forEach((op,k)=>{const x=document.createElement("button");x.className="opt";x.textContent=op.t;x.onclick=()=>pickOpt(k);o.appendChild(x)})}
  function pickOpt(k){const R=c.rounds[r],op=R.options[k];chosen=k;
    $$(".opt",b).forEach((e,j)=>e.classList.toggle("sel",j===k));
    let sum=0;$$(".v2-shrow",b).forEach(row=>{const v=(op.fx||{})[row.dataset.id]||0;sum+=v;const f=$(".fill",row);const w=Math.abs(v)/3*50;
      f.style.cssText=`width:${w}%;${v>=0?"left:50%":"right:50%"};background:${v>=0?"var(--ok)":"var(--bad)"}`;$(".val",row).textContent=(v>0?"+":"")+v});
    $(".v2-lens",b).innerHTML=`<div class="v2-l u"><b>📊 Utilitarian</b>Manfaat bersih keputusan ini: <b>${sum>0?"+":""}${sum}</b></div><div class="v2-l d ${op.rights===false?"bad":""}"><b>📋 Deontologi</b>${op.rights===false?"✖ ":"✔ "}${esc(op.rightsNote||(op.rights===false?"Ada hak orang yang dilanggar.":"Hak dasar terhormati."))}</div><div class="v2-l v"><b>🌟 Keutamaan</b>${esc(op.virtue||"")}</div>${op.say?`<p class="v2-say">${esc(op.say)}</p>`:""}`;
    $("[data-a=n]",b).disabled=false;op._sum=sum}
  b.addEventListener("click",e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==="n"&&chosen!==null){const op=c.rounds[r].options[chosen];total+=op._sum||0;if(op.rights===false)viol++;log.push(`Keputusan ${r+1}: ${op.t} (manfaat ${op._sum>0?"+":""}${op._sum||0}${op.rights===false?", melanggar hak":""})`);r++;render()}
    if(a==="r"){r=0;total=0;viol=0;log.length=0;render()}});
  render();
}

/* =============== MATCH: pasangkan dua kolom =============== */
/* cfg: {title,prompt,left:[..],right:[..],pairs:[[l,r],..],why:[..]} */
function match(el,c){
  const b=body(el);const n=c.left.length;const asg={};let pickL=null;
  const ord=[...Array(n).keys()].sort((a,z)=>((a*7+3)%n)-((z*7+3)%n)||a-z);if(ord.every((v,i)=>v===i))ord.reverse();
  const ans={};c.pairs.forEach(p=>ans[p[0]]=p[1]);
  const COL=["#0f766e","#7c3aed","#b45309","#be123c","#1d4ed8","#15803d","#a21caf","#c2410c"];
  b.innerHTML=`<h3>${esc(c.title)}</h3><p>${esc(c.prompt||"Klik satu item di kiri, lalu pasangannya di kanan.")}</p><div class="v2-match"><div class="L"></div><div class="Rr"></div></div><p><button class="btn" data-a="c">Periksa</button> <button class="btn ghost" data-a="x">Ulangi</button> <span class="score"></span></p><div class="fb"></div>`;
  const L=$(".L",b),Rr=$(".Rr",b),fb=$(".fb",b);
  function draw(res){L.innerHTML="";Rr.innerHTML="";
    c.left.forEach((t,i)=>{const x=document.createElement("button");x.className="v2-m"+(pickL===i?" pick":"");const ci=asg[i]!==undefined?i:-1;
      x.innerHTML=(ci>=0?`<i style="background:${COL[i%8]}">${i+1}</i>`:"")+esc(t);if(res&&asg[i]!==undefined)x.classList.add(asg[i]===ans[i]?"right":"wrong");x.onclick=()=>{if(res)return;pickL=pickL===i?null:i;draw()};L.appendChild(x)});
    ord.forEach(ri=>{const x=document.createElement("button");x.className="v2-m";const owner=Object.keys(asg).find(k=>asg[k]===ri);
      x.innerHTML=(owner!==undefined?`<i style="background:${COL[owner%8]}">${+owner+1}</i>`:"")+esc(c.right[ri]);x.onclick=()=>{if(res||pickL===null)return;Object.keys(asg).forEach(k=>{if(asg[k]===ri)delete asg[k]});asg[pickL]=ri;pickL=null;draw()};Rr.appendChild(x)})}
  b.addEventListener("click",e=>{const a=e.target.dataset&&e.target.dataset.a;
    if(a==="x"){Object.keys(asg).forEach(k=>delete asg[k]);pickL=null;fb.className="fb";$(".score",b).textContent="";draw()}
    if(a==="c"){if(Object.keys(asg).length<n){fb.className="fb show";fb.textContent="Pasangkan semua item dahulu.";return}
      let s=0;c.left.forEach((_,i)=>{if(asg[i]===ans[i])s++});draw(true);$(".score",b).textContent=`Skor ${s}/${n}`;
      fb.className="fb show ok";fb.innerHTML="<ul>"+c.left.map((t,i)=>`<li>${asg[i]===ans[i]?"✓":"✗"} <b>${esc(t)}</b> ↔ ${esc(c.right[ans[i]])}${c.why&&c.why[i]?". "+esc(c.why[i]):""}</li>`).join("")+"</ul>";markDone(el.id)}});
  draw();
}

/* =============== HOTSEAT: keputusan bertimer =============== */
/* cfg: {title,prompt,stages:[{q,seconds,choices:[{t,res}],timeout}],debrief} */
function hotseat(el,c){
  const b=body(el);const st=c.stages;let k=0,tm=null,picks=[];
  function intro(){b.innerHTML=`<h3>${esc(c.title)}</h3><p>${esc(c.prompt||"Kamu punya waktu terbatas untuk memutuskan. Tidak memutuskan juga sebuah keputusan.")}</p><p><button class="btn" data-a="s">Mulai kursi panas</button></p>`;k=0;picks=[]}
  function stage(){const s=st[k];let left=s.seconds||15;
    b.innerHTML=`<h3>${esc(c.title)} · ${k+1}/${st.length}</h3><div class="v2-timer"><i></i></div><p class="v2-tl"><b class="t">${left}</b> detik</p><p class="scn-text"><b>${esc(s.q)}</b></p><div class="opts"></div><div class="fb"></div>`;
    const bar=$(".v2-timer i",b);void bar.offsetWidth;bar.style.transition=`width ${left}s linear`;bar.style.width="0%";
    const o=$(".opts",b);s.choices.forEach((ch,j)=>{const x=document.createElement("button");x.className="opt";x.textContent=ch.t;x.onclick=()=>fin(j);o.appendChild(x)});
    clearInterval(tm);tm=setInterval(()=>{left--;const t=$(".t",b);if(t)t.textContent=Math.max(left,0);if(left<=0){fin(-1)}},1000)}
  function fin(j){clearInterval(tm);const s=st[k];const bar=$(".v2-timer i",b);if(bar){bar.style.transition="none"}
    $$(".opt",b).forEach((e,i)=>{e.disabled=true;if(i===j)e.classList.add("sel")});
    picks.push(j);const res=j<0?(s.timeout||"Waktu habis. Tidak memutuskan adalah keputusan juga: kamu menyerahkan hasilnya pada orang lain."):s.choices[j].res;
    const fb=$(".fb",b);fb.className="fb show";fb.innerHTML=esc(res);
    const nx=document.createElement("p");nx.innerHTML=`<button class="btn">${k===st.length-1?"Selesai":"Berikutnya ›"}</button>`;b.appendChild(nx);
    nx.firstChild.onclick=()=>{k++;if(k>=st.length){b.innerHTML=`<h3>${esc(c.title)}</h3><div class="v2-end"><p>${esc(c.debrief||"Selesai.")}</p><p><button class="btn ghost" data-a="r">Ulangi</button></p></div>`;markDone(el.id)}else stage()}}
  b.addEventListener("click",e=>{const a=e.target.dataset&&e.target.dataset.a;if(a==="s")stage();if(a==="r")intro()});
  intro();
}

const V2={venn,swipe,race,stakeholder,match,hotseat};
$$(".w[data-widget]").forEach(el=>{const t=el.dataset.widget;if(V2[t]&&PAGE[el.id])V2[t](el,PAGE[el.id])});
})();
/* ===== [/SHARED:VIZ2-JS] ===== */
