// Hapus label rentang menit dari semua pertemuan. Pakai: node _src/strip-menit.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
for(const f of fs.readdirSync(root).filter(x=>/^pertemuan-\d+\.html$/.test(x))){
  const p=path.join(root,f);let s=fs.readFileSync(p,'utf8');
  s=s.replace(/[ \t]*<span class="chip">Menit [0-9–\-]+<\/span>/g,'');
  s=s.replace(/(<span class="chip act">[^<]*?)\s*·\s*Menit [0-9–\-]+(<\/span>)/g,(m,a,b)=>a+b);
  s=s.split('<span>Menit ${s.dataset.min}</span>').join('');
  s=s.replace('<h4>Agenda · 100 menit</h4>','<h4>Agenda</h4>').replace('aria-label="Agenda 100 menit"','aria-label="Agenda"');
  fs.writeFileSync(p,s);
  const re=/<script[^>]*>([\s\S]*?)<\/script>/g;let m,e=0;
  while((m=re.exec(s))){try{new Function(m[1])}catch(x){console.log(f,x.message);e++}}
  const left=s.match(/[Mm]enit [0-9]+[–\-][0-9]+/g)||[];
  console.log(f,e?'ERR':'OK','sisa label menit:',left.length,left.slice(0,3).join(' | '));
}
