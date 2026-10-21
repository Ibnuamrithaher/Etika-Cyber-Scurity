/* ===== [SHARED:ICONS] — Phosphor Icons (MIT, https://phosphoricons.com), disematkan sebagai SVG. Emoji dipetakan ke ikon. ===== */
(function(){
"use strict";
const E=window.EHC; if(!E){return}
const P=__PATHS__;
const M=__MAP__;
const norm=s=>s.replace(/️/g,"");
const keys=Object.keys(M).sort((a,b)=>b.length-a.length);
const re=new RegExp(keys.map(k=>[...k].map(c=>c.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("\\uFE0F?")+"\\uFE0F?").join("|"),"gu");
const svg=(n,cls)=>`<svg class="ph${cls?" "+cls:""}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false">${P[n]}</svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
E.ic=str=>String(str).replace(re,m=>{const n=M[norm(m)];return n?svg(n):m});
E.svgIn=(emoji,x,y,size)=>{const n=M[norm(String(emoji))];return n?`<svg class="ph" x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${P[n]}</svg>`:""};
function walk(root){
  if(!root||root.nodeType===8)return;
  if(root.nodeType===3){conv(root);return}
  if(root.nodeType!==1)return;
  const tag=root.tagName;if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA"||(tag==="svg"&&root.classList.contains("ph")))return;
  if(tag==="text"&&root.closest&&root.closest("svg"))return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode;if(!p)return NodeFilter.FILTER_REJECT;const t=p.nodeName;return (t==="SCRIPT"||t==="STYLE"||t==="TEXTAREA"||t==="text"||t==="title")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
  const list=[];while(w.nextNode())list.push(w.currentNode);list.forEach(conv);
}
function conv(n){
  const t=n.nodeValue;if(!t||!re.test(t)){re.lastIndex=0;return}re.lastIndex=0;
  const holder=document.createElement("span");holder.innerHTML=E.ic(esc(t));
  const frag=document.createDocumentFragment();while(holder.firstChild)frag.appendChild(holder.firstChild);
  n.parentNode.replaceChild(frag,n);
}
let queued=false;const pend=new Set();
const mo=new MutationObserver(ms=>{ms.forEach(m=>{m.addedNodes.forEach(a=>pend.add(a));if(m.type==="characterData")pend.add(m.target)});
  if(!queued&&pend.size){queued=true;requestAnimationFrame(()=>{queued=false;const L=[...pend];pend.clear();L.forEach(x=>{if(x.isConnected)walk(x)})})}});
walk(document.body);
mo.observe(document.body,{childList:true,subtree:true,characterData:true});
})();
/* ===== [/SHARED:ICONS] ===== */
