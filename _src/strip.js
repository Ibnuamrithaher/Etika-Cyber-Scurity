// Hapus Mode Dosen, catatan dosen, dan timer dari semua pertemuan. Pakai: node _src/strip.js
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const bal=s=>(s.match(/<div\b/g)||[]).length-(s.match(/<\/div>/g)||[]).length;
for(const f of fs.readdirSync(root).filter(x=>/^pertemuan-\d+\.html$/.test(x))){
  const p=path.join(root,f);let s=fs.readFileSync(p,'utf8');const b0=bal(s);
  s=s.replace(/[ \t]*<div class="lecturer">[\s\S]*?<\/div>[ \t]*\r?\n?/g,'');
  s=s.replace(/[ \t]*<button class="timer-btn"[^>]*>[^<]*<\/button>/g,'');
  s=s.replace(/[ \t]*<button class="tbtn" id="lecBtn"[^>]*>[^<]*<\/button>\r?\n?/,'');
  s=s.replace(/<div class="floating-timer" id="ft">[\s\S]*?<\/div>\r?\n?/,'');
  s=s.replace(/\/\* ---------- Lecturer mode & timer ---------- \*\/[\s\S]*?\$\("#ftReset"\)\.onclick=[^\n]*\n/,'');
  fs.writeFileSync(p,s);
  const left=['lecturer"','timer-btn','lecBtn','floating-timer"','ftReset','setLec','Mode Dosen'].filter(k=>s.includes(k));
  console.log(f,'balance',b0,'->',bal(s),left.length?'SISA: '+left.join(','):'bersih');
}
