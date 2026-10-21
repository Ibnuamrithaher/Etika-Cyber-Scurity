// Pasang SKIN (font Geist tertanam + skin.css) ke pertemuan tertentu, idempoten.
// Pakai dari folder induk: node _src/build3.js 1 2
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const font=fs.readFileSync(path.join(__dirname,'fonts','Geist.woff2')).toString('base64');
const css=fs.readFileSync(path.join(__dirname,'skin.css'),'utf8').replace('__GEIST__',font).trim();
for(const n of process.argv.slice(2)){
  const f=`pertemuan-${String(n).padStart(2,'0')}.html`,p=path.join(root,f);let s=fs.readFileSync(p,'utf8');
  s=s.replace(/\/\* ===== \[SHARED:SKIN\][\s\S]*?\[\/SHARED:SKIN\] ===== \*\/\s*/,()=>'');
  const m=s.indexOf('</style>');if(m<0){console.log(f,'GAGAL: tidak ada </style>');continue}
  s=s.slice(0,m)+css+'\n'+s.slice(m);
  if(!s.includes('class="skip"'))s=s.replace(/<body([^>]*)>/,(x)=>x+'\n<a class="skip" href="#main">Lewati ke konten</a>');
  s=s.replace(/<main>/,'<main id="main">');
  fs.writeFileSync(p,s);console.log(f,'ok',(css.length/1024).toFixed(0)+'KB skin');
}
