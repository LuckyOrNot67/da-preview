/* Comportements du site public : navigation, formats, zones, devis. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,T=window.SITE_T||{m:{}},M=T.m;
const FN=['Classique','Medium','Complet'],CAR={5:'1 à 5',10:'6 à 10',20:'11 à 20',40:'21 à 40'};

/* barre : fond clair une fois le héros passé */
const bar=$('.bar');
if(bar){const on=()=>bar.classList.toggle('s',scrollY>innerHeight*.85);addEventListener('scroll',on,{passive:true});on()}

/* menu mobile */
const mb=$('[data-menu]'),sn=$('[data-sheet]');
if(mb&&sn){
  const label=mb.textContent,set=o=>{sn.classList.toggle('on',o);mb.setAttribute('aria-expanded',o);mb.textContent=o?'Fermer':label;document.body.style.overflow=o?'hidden':'';if(o)$('a',sn).focus()};
  mb.addEventListener('click',()=>set(!sn.classList.contains('on')));
  sn.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&sn.classList.contains('on')){set(false);mb.focus()}});
}

/* formats */
const fr=$('[data-formats]');let setFormat=()=>{},fmt=1;
if(fr){
  const tabs=$$('[role=tab]',fr),imgs=$$('[data-fi]',fr),inc=$$('[data-z]',fr),desc=$('[data-fdesc]',fr),panel=$('[role=tabpanel]',fr);
  setFormat=(n,from)=>{
    fmt=n;
    tabs.forEach((t,k)=>{t.setAttribute('aria-selected',k===n);t.tabIndex=k===n?0:-1});
    imgs.forEach((m,k)=>m.classList.toggle('on',k===n));
    inc.forEach(l=>l.classList.toggle('on',l.dataset.z.includes(n)));
    desc.textContent=desc.dataset['d'+n];panel.setAttribute('aria-labelledby',tabs[n].id);
    if(from!=='zone'){const r=$$('#z-fmt input');if(r[n]){r[n].checked=true;window.zoneSync&&zoneSync()}}
  };
  tabs.forEach((t,k)=>{t.addEventListener('click',()=>setFormat(k));t.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();const n=(k+d+3)%3;setFormat(n);tabs[n].focus()}})});
  const use=$('[data-fuse]',fr),q=$('[data-quote]');
  if(use&&q)use.addEventListener('click',()=>{q.format.value=FN[fmt]});
}

/* zones : simulation sur la carte de Belgique, jamais une couverture réelle */
const zr=$('[data-zones]');
if(zr&&window.BE){
  const BE=window.BE,cv=$('canvas',zr),cx=cv.getContext('2d'),P=zr.dataset;
  /* sur téléphone, la carte passe au-dessus des choix pour rester visible */
  const slot=$('.only-m',zr),mp=cv.parentElement;
  const place=()=>{if(innerWidth<=innerHeight){if(cv.parentElement!==slot)slot.append(cv)}else if(cv.parentElement!==mp)mp.prepend(cv)};
  place();
  const val=id=>$$(`#${id} input:checked`).map(i=>i.value);
  const dots=BE.d.map(([x,y])=>({x,y,v:0,t:0}));
  let rs=1,dp=1,raf=0;
  const model=()=>{
    const cs=val('z-cities'),rad=val('z-scope')[0]==='Centre-ville'?10:20;
    dots.forEach(o=>{o.t=cs.some(c=>{const p=BE.c[c];return Math.hypot(o.x-p[0],o.y-p[1])<rad})?1:0});
    $('[data-zsum]',zr).textContent=cs.length?M.sim.replace('{cars}',val('z-cars')[0]).replace('{dur}',val('z-dur')[0]).replace('{fmt}',val('z-fmt')[0]).replace('{cities}',cs.join(', ')).replace('{scope}',val('z-scope')[0].toLowerCase()):M.none;
  };
  const draw=()=>{
    const k=rs,sel=val('z-cities'),fs=Math.max(13*dp,k*5.6);let moving=false;
    cx.clearRect(0,0,cv.width,cv.height);
    for(const o of dots){
      const d=o.t-o.v;if(Math.abs(d)>.01&&!reduced){o.v+=d*.18;moving=true}else o.v=o.t;
      cx.fillStyle=o.v>.5?P.on:P.dot;cx.beginPath();cx.arc(o.x*k,o.y*k,k*(1.35+o.v*.5),0,6.3);cx.fill();
    }
    cx.textBaseline='middle';cx.lineJoin='round';cx.font=`600 ${fs}px ${P.font}`;
    for(const[n,p]of Object.entries(BE.c)){
      const on=sel.includes(n),left=n==='Charleroi',tw=cx.measureText(n).width,pad=5*dp,h=fs*1.5,x=p[0]*k,y=p[1]*k,off=k*3.4+pad,tx=left?x-off-tw:x+off;
      cx.beginPath();cx.arc(x,y,k*2,0,6.3);
      if(on){cx.fillStyle=P.pill;cx.fill();cx.beginPath();cx.roundRect(tx-pad,y-h/2,tw+pad*2,h,4*dp);cx.fill();cx.fillStyle=P.pilltx;cx.fillText(n,tx,y+dp*.5)}
      else{cx.strokeStyle=P.mark;cx.lineWidth=1.5*dp;cx.stroke();cx.strokeStyle=P.halo;cx.lineWidth=k*2.2;cx.strokeText(n,tx,y);cx.fillStyle=P.mark;cx.fillText(n,tx,y)}
    }
    return moving;
  };
  const paint=()=>{cancelAnimationFrame(raf);const f=()=>{if(draw())raf=requestAnimationFrame(f)};f()};
  const size=()=>{place();const w=cv.clientWidth;if(!w)return;dp=Math.min(devicePixelRatio||1,2);cv.width=w*dp;cv.height=w*BE.h/BE.w*dp;rs=cv.width/BE.w;paint()};
  window.zoneSync=()=>{model();paint()};
  zr.addEventListener('change',e=>{if(e.target.name==='z-fmt')setFormat(FN.indexOf(e.target.value),'zone');zoneSync()});
  addEventListener('resize',size);
  model();dots.forEach(o=>o.v=o.t);size();
  if(document.fonts)document.fonts.ready.then(paint);
  $('[data-zuse]',zr).addEventListener('click',()=>{
    const f=$('[data-quote]');if(!f)return;
    f.zones.value=val('z-cities').join(', ');f.format.value=val('z-fmt')[0];f.vehicles.value=CAR[val('z-cars')[0]];f.duration.value=val('z-dur')[0];
  });
}

/* devis : validation, envoi réel vers quoteEndpoint, états de chargement et d'erreur */
const q=$('[data-quote]');
if(q){
  const cfg=window.SITE_CONFIG||{},st=$('[data-sent]',q),btn=$('button[type=submit]',q),done=$('[data-done]');
  const rule={email:v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),phone:v=>!v||/^[+0-9 ()./-]{8,20}$/.test(v)};
  const msg=f=>{
    if(f.type==='checkbox')return f.checked?'':M.consent;
    const v=f.value.trim();
    if(f.required&&!v)return M.required;
    if(f.name==='email'&&!rule.email(v))return M.email;
    if(f.name==='phone'&&!rule.phone(v))return M.phone;
    return '';
  };
  const check=f=>{const m=msg(f),e=$('#'+f.name+'-err',q);f.setAttribute('aria-invalid',!!m);if(e)e.textContent=m;return !m};
  const fields=$$('[required],[name=phone]',q);
  fields.forEach(f=>{f.addEventListener('blur',()=>{if(f.value)check(f)});f.addEventListener('input',()=>{if(f.getAttribute('aria-invalid')==='true')check(f)})});
  const busy=b=>{btn.disabled=b;st.textContent=b?M.sending:st.textContent};
  q.addEventListener('submit',async e=>{
    e.preventDefault();
    const bad=fields.filter(f=>!check(f));
    if(bad.length){st.textContent=M.check;bad[0].focus();return}
    if(q.website.value)return;                 // champ piège rempli : robot
    if(!cfg.quoteEndpoint){st.textContent=M.unset;return}
    const data=Object.fromEntries(new FormData(q));
    delete data.website;data.consent=true;data.locale=T.lang;data.page=location.pathname;
    busy(true);
    const ac=new AbortController(),to=setTimeout(()=>ac.abort(),cfg.timeoutMs||12000);
    try{
      const r=await fetch(cfg.quoteEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:ac.signal});
      if(!r.ok)throw new Error(r.status);
      q.hidden=true;done.hidden=false;done.focus();
    }catch(err){st.textContent=M.error;btn.disabled=false}
    finally{clearTimeout(to)}
  });
}
})();
