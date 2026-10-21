// Tangkap layar satu widget. Pakai dari folder induk:
// node _src/shot.js <file.html> <idWidget> "<js klik>" <out.png> [tinggi]
const fs=require('fs'),cp=require('child_process'),path=require('path');
const [,, file, id, clicks, out, h]=process.argv;
let s=fs.readFileSync(file,'utf8');
const th=process.env.THEME?`document.documentElement.setAttribute('data-theme','${process.env.THEME}');`:'';
const inj=`<script>${th}setTimeout(()=>{const m=document.querySelector('main');const w=document.getElementById('${id}');m.prepend(w);document.querySelectorAll('.hero,.seg,.card').forEach(x=>{if(!x.contains(w)&&!w.contains(x))x.style.display='none'});document.querySelectorAll('.seg').forEach(x=>x.classList.add('in'));${clicks||''}},300);</script></body>`;
s=s.replace('</body>',()=>inj);
const tmp=path.join(__dirname,'_shot.html');fs.writeFileSync(tmp,s);
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const url='file:///'+tmp.split(path.sep).join('/');
cp.spawnSync(edge,['--headless','--disable-gpu','--window-size=1280,'+(h||1000),'--virtual-time-budget=9000','--screenshot='+path.resolve(out),url],{stdio:'ignore'});
console.log('ok',out);
