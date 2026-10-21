// Poles teks sesuai aturan tipografi: tanpa em-dash, en-dash jadi tanda hubung, label widget tanpa titik tengah.
// Pakai dari folder induk: node _src/polish.js [pustaka] 1 2
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
function dash(s){
  return s
    .replace(/<\/b> — /g,'</b>: ')
    .replace(/(Posisi \d) — /g,'$1: ')
    .replace(/\? ` — \$\{/g,'? `: ${')
    .replace(/ — /g,', ')
    .replace(/—/g,'-')
    .replace(/–/g,'-');
}
const args=process.argv.slice(2);
if(args[0]==='pustaka'){
  for(const f of ['viz.js','viz2.js','viz.css','viz2.css','skin.css']){const p=path.join(__dirname,f);fs.writeFileSync(p,dash(fs.readFileSync(p,'utf8')));console.log(f,'ok')}
}else{
  for(const n of args){
    const f=`pertemuan-${String(n).padStart(2,'0')}.html`,p=path.join(root,f);let s=fs.readFileSync(p,'utf8');
    s=dash(s);
    s=s.replace(/(<span class="w-label">)([^<]*)(<\/span>)/g,(m,a,b,c)=>a+b.replace(/ · /g,': ')+c);
    fs.writeFileSync(p,s);
    const left=(s.match(/[—–]/g)||[]).length;console.log(f,'sisa dash:',left);
  }
}
