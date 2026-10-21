// Pasang ikon Phosphor tertanam ke pertemuan tertentu, idempoten. Jalankan SETELAH build2.js: node _src/build4.js 1 2
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const {P,MAP}=JSON.parse(fs.readFileSync(path.join(__dirname,'icons.data.json'),'utf8'));
const js=fs.readFileSync(path.join(__dirname,'icons.tpl.js'),'utf8').replace('__PATHS__',()=>JSON.stringify(P)).replace('__MAP__',()=>JSON.stringify(MAP)).trim();
for(const n of process.argv.slice(2)){
  const f=`pertemuan-${String(n).padStart(2,'0')}.html`,p=path.join(root,f);let s=fs.readFileSync(p,'utf8');
  s=s.replace(/<script>\s*\/\* ===== \[SHARED:ICONS\][\s\S]*?\[\/SHARED:ICONS\] ===== \*\/\s*<\/script>\s*/,()=>'');
  const m=s.indexOf('<script>\n/* ===== [SHARED:VIZ2-JS]');
  if(m<0){console.log(f,'GAGAL: VIZ2-JS tidak ada');continue}
  s=s.slice(0,m)+'<script>\n'+js+'\n</script>\n'+s.slice(m);
  fs.writeFileSync(p,s);console.log(f,'ok',(js.length/1024).toFixed(0)+'KB ikon');
}
