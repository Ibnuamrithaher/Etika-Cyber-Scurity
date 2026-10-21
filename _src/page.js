// Tangkap layar halaman utuh (tanpa mengisolasi widget). node _src/page.js file out [tinggi]  env: W (lebar), THEME (dark|light), Y (scroll px)
const fs=require('fs'),cp=require('child_process'),path=require('path');
const [,, file,out,h]=process.argv;let s=fs.readFileSync(file,'utf8');
const t=process.env.THEME?`document.documentElement.setAttribute('data-theme','${process.env.THEME}');`:'';
const y=process.env.Y?`setTimeout(()=>window.scrollTo(0,${+process.env.Y}),400);`:'';
s=s.replace('</body>',()=>`<script>${t}${y}</script></body>`);
const tmp=path.join(__dirname,'_page.html');fs.writeFileSync(tmp,s);
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
cp.spawnSync(edge,['--headless','--disable-gpu',`--window-size=${process.env.W||1280},${h||900}`,'--virtual-time-budget=9000','--screenshot='+path.resolve(out),'file:///'+tmp.split(path.sep).join('/')],{stdio:'ignore'});
console.log('ok',out);
