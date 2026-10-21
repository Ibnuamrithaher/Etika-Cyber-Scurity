// Pasang viz2 (css+js) ke file pertemuan tertentu, idempoten.
// Pakai dari folder induk: node _src/build2.js 01 02
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(__dirname,'viz2.css'),'utf8').trim();
const js=fs.readFileSync(path.join(__dirname,'viz2.js'),'utf8').trim();
const nums=process.argv.slice(2);
for(const n of nums){
  const f=`pertemuan-${n.padStart(2,'0')}.html`;const p=path.join(root,f);
  let s=fs.readFileSync(p,'utf8');
  s=s.replace(/\/\* ===== \[SHARED:VIZ2-CSS\][\s\S]*?\[\/SHARED:VIZ2-CSS\] ===== \*\/\s*/,()=>'');
  s=s.replace(/<script>\s*\/\* ===== \[SHARED:VIZ2-JS\][\s\S]*?\[\/SHARED:VIZ2-JS\] ===== \*\/\s*<\/script>\s*/,()=>'');
  const cm='/* ===== [/SHARED:VIZ-CSS] ===== */';
  if(!s.includes(cm)){console.log(f,'GAGAL: penanda VIZ-CSS tidak ada');continue}
  s=s.replace(cm,()=>cm+'\n'+css+'\n');
  const jm=s.indexOf('[/SHARED:VIZ-JS]');
  if(jm<0){console.log(f,'GAGAL: penanda VIZ-JS tidak ada');continue}
  const end=s.indexOf('</script>',jm)+'</script>'.length;
  s=s.slice(0,end)+'\n<script>\n'+js+'\n</script>'+s.slice(end);
  fs.writeFileSync(p,s);console.log(f,'ok');
}
