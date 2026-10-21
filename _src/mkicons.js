// Unduh ikon Phosphor (MIT, regular) dan tulis _src/icons.js. Jalankan sekali: node _src/mkicons.js
const fs=require('fs'),path=require('path'),https=require('https');
const MAP={'📋':'clipboard-text','🏛':'bank','📜':'scroll','⚖':'scales','📊':'chart-bar','🏢':'buildings','✉':'envelope-simple','👤':'user','👥':'users-three','🌟':'star','🎯':'target','✅':'check-circle','🚗':'car','❤':'heart','⚠':'warning','🤔':'question','💻':'laptop','❌':'x-circle','📱':'device-mobile','📝':'note-pencil','🔒':'lock','✖':'x','✔':'check','↔':'arrows-left-right','👨‍💻':'code','👔':'briefcase','🗳':'check-square-offset','📂':'folder-open','🙋':'hand-waving','📰':'newspaper','🪞':'eye','💡':'lightbulb','😰':'smiley-nervous','🔄':'arrows-clockwise','🤝':'handshake','🧭':'compass','🌫':'cloud-fog','🎓':'graduation-cap','🏫':'chalkboard-teacher','📣':'megaphone','☁':'cloud','💳':'credit-card','🔓':'lock-open','🛡':'shield-check','🤖':'robot','⚙':'gear','🖥':'desktop','⚡':'lightning','🔍':'magnifying-glass','☢':'radioactive','💬':'chat-circle-text','🚫':'prohibit','🔎':'magnifying-glass-plus','🌐':'globe','🕵':'detective','📦':'package','📢':'megaphone-simple','🧑‍💼':'user-circle','📄':'file-text','🗣':'chat-teardrop-text','📁':'folder'};
const URL=n=>`https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2.1.1/assets/regular/${n}.svg`;
const get=u=>new Promise((res,rej)=>https.get(u,r=>{if(r.statusCode!==200){r.resume();return rej(new Error(r.statusCode))}let d='';r.on('data',c=>d+=c);r.on('end',()=>res(d))}).on('error',rej));
(async()=>{
  const names=[...new Set(Object.values(MAP))],P={},miss=[];
  for(const n of names){try{const s=await get(URL(n));P[n]=s.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'').trim()}catch(e){miss.push(n+':'+e.message)}}
  console.log('ok',Object.keys(P).length,'gagal',miss.join(' '));
  fs.writeFileSync(path.join(__dirname,'icons.data.json'),JSON.stringify({P,MAP}));
})();
