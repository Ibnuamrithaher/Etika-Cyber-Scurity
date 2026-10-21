// Sisipkan pustaka visual (viz.css, viz.js) ke semua pertemuan-*.html secara idempoten.
// Pakai dari folder induk: node _src/build.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(__dirname,'viz.css'),'utf8').trim();
const js=fs.readFileSync(path.join(__dirname,'viz.js'),'utf8').trim();
const EXPORT='window.EHC={$,$$,store,esc,markDone,body};';
for(const f of fs.readdirSync(root).filter(x=>/^pertemuan-\d+\.html$/.test(x))){
  let s=fs.readFileSync(path.join(root,f),'utf8');
  // 1. ekspor helper (hapus semua versi lama lalu sisipkan satu kali)
  s=s.replace(/^window\.EHC=.*\r?\n?/gm,'');
  const re=/const R=\{[^}]*\};/;
  if(!re.test(s)){console.log(f,'GAGAL: const R tidak ditemukan');continue}
  s=s.replace(re,m=>m+'\n'+EXPORT);
  // 2. CSS
  s=s.replace(/\/\* ===== \[SHARED:VIZ-CSS\][\s\S]*?\[\/SHARED:VIZ-CSS\] ===== \*\/\s*/,()=>'');
  s=s.replace('/* ===== [/SHARED:CSS] ===== */',()=>'/* ===== [/SHARED:CSS] ===== */\n'+css+'\n');
  // 3. JS
  s=s.replace(/<script>\s*\/\* ===== \[SHARED:VIZ-JS\][\s\S]*?\[\/SHARED:VIZ-JS\] ===== \*\/\s*<\/script>\s*/,()=>'');
  s=s.replace('<!-- ===== [/SHARED:JS] ===== -->',()=>'<!-- ===== [/SHARED:JS] ===== -->\n<script>\n'+js+'\n</script>\n');
  fs.writeFileSync(path.join(root,f),s);
  console.log(f,'ok');
}
