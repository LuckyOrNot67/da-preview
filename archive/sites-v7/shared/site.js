/* Comportements communs aux trois sites : menu, apparitions, formats, zones, devis. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
window.SITE={reduced};
if(reduced)document.documentElement.classList.add('still');

/* menu mobile */
const mb=$('[data-menu]'),sn=$('[data-sheet]');
if(mb&&sn){
  const set=o=>{sn.classList.toggle('on',o);mb.setAttribute('aria-expanded',o);mb.textContent=o?'Fermer':'Menu';document.body.style.overflow=o?'hidden':'';if(o)$('a',sn).focus()};
  mb.addEventListener('click',()=>set(!sn.classList.contains('on')));
  sn.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&sn.classList.contains('on')){set(false);mb.focus()}});
}

/* apparitions : révèlent le contenu quand il arrive à l'écran */
const rv=$$('.rv');
if(reduced||!('IntersectionObserver'in window))rv.forEach(n=>n.classList.add('in'));
else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});rv.forEach(n=>io.observe(n))}

/* formats */
const FN=['Classique','Medium','Complet'];
const fr=$('[data-formats]');
let setFormat=()=>{};
if(fr){
  const tabs=$$('[role=tab]',fr),imgs=$$('[data-fi]',fr),inc=$$('[data-z]',fr),desc=$('[data-fdesc]',fr),panel=$('[role=tabpanel]',fr);
  setFormat=(n,from)=>{
    tabs.forEach((t,k)=>{t.setAttribute('aria-selected',k===n);t.tabIndex=k===n?0:-1});
    imgs.forEach((m,k)=>m.classList.toggle('on',k===n));
    inc.forEach(l=>l.classList.toggle('on',l.dataset.z.includes(n)));
    desc.textContent=desc.dataset['d'+n];panel.setAttribute('aria-labelledby',tabs[n].id);
    if(from!=='zone'){const r=$$('#z-fmt input');if(r[n]){r[n].checked=true;window.zoneSync&&zoneSync()}}
  };
  tabs.forEach((t,k)=>{t.addEventListener('click',()=>setFormat(k));t.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowLeft:-1}[e.key];if(d){e.preventDefault();const n=(k+d+3)%3;setFormat(n);tabs[n].focus()}})});
}

/* zones : simulation sur la carte de Belgique, jamais une couverture réelle */
const zr=$('[data-zones]');
if(zr&&window.BE){
  const BE=window.BE,cv=$('canvas',zr),cx=cv.getContext('2d'),T=zr.dataset;
  const chips=(id,items,type,on)=>{$('#'+id).innerHTML=items.map((t,i)=>`<label><input type="${type}" name="${id}" value="${t}"${on.includes(i)?' checked':''}><span>${t}</span></label>`).join('')};
  chips('z-cities',Object.keys(BE.c),'checkbox',[0,2]);
  chips('z-scope',['Centre-ville','Agglomération'],'radio',[1]);
  chips('z-cars',['5','10','20','40'],'radio',[1]);
  chips('z-dur',['3 mois','4 mois','6 mois'],'radio',[0]);
  chips('z-fmt',FN,'radio',[1]);
  const val=id=>$$(`#${id} input:checked`).map(i=>i.value);
  const dots=BE.d.map(([x,y])=>({x,y,v:0,t:0}));
  let rs=1,dp=1,raf=0;
  const size=()=>{const w=cv.clientWidth;if(!w)return;dp=Math.min(devicePixelRatio||1,2);cv.width=w*dp;cv.height=w*BE.h/BE.w*dp;rs=cv.width/BE.w;paint()};
  const model=()=>{
    const cs=val('z-cities'),rad=val('z-scope')[0]==='Centre-ville'?10:20;
    dots.forEach(o=>{o.t=cs.some(c=>{const p=BE.c[c];return Math.hypot(o.x-p[0],o.y-p[1])<rad})?1:0});
    $('[data-zsum]',zr).textContent=cs.length?`Simulation : ${val('z-cars')[0]} véhicules, ${val('z-dur')[0]}, format ${val('z-fmt')[0]}, ${cs.join(', ')} (${val('z-scope')[0].toLowerCase()}).`:'Choisissez au moins une ville.';
  };
  const draw=()=>{
    const k=rs,sel=val('z-cities'),fs=Math.max(13*dp,k*5.6);let moving=false;
    cx.clearRect(0,0,cv.width,cv.height);
    for(const o of dots){
      const d=o.t-o.v;if(Math.abs(d)>.01&&!reduced){o.v+=d*.16;moving=true}else o.v=o.t;
      cx.fillStyle=o.v>.5?T.on:T.dot;cx.beginPath();cx.arc(o.x*k,o.y*k,k*(1.35+o.v*.5),0,6.3);cx.fill();
    }
    cx.textBaseline='middle';cx.lineJoin='round';cx.font=`600 ${fs}px ${T.font}`;
    for(const[n,p]of Object.entries(BE.c)){
      const on=sel.includes(n),left=n==='Charleroi',tw=cx.measureText(n).width,pad=5*dp,h=fs*1.5,x=p[0]*k,y=p[1]*k,off=k*3.4+pad,tx=left?x-off-tw:x+off;
      cx.beginPath();cx.arc(x,y,k*2,0,6.3);
      if(on){cx.fillStyle=T.pill;cx.fill();cx.beginPath();cx.roundRect(tx-pad,y-h/2,tw+pad*2,h,4*dp);cx.fill();cx.fillStyle=T.pilltx;cx.fillText(n,tx,y+dp*.5)}
      else{cx.strokeStyle=T.mark;cx.lineWidth=1.5*dp;cx.stroke();cx.strokeStyle=T.halo;cx.lineWidth=k*2.2;cx.strokeText(n,tx,y);cx.fillStyle=T.mark;cx.fillText(n,tx,y)}
    }
    return moving;
  };
  const paint=()=>{cancelAnimationFrame(raf);const f=()=>{if(draw())raf=requestAnimationFrame(f)};f()};
  window.zoneSync=()=>{model();paint()};
  zr.addEventListener('change',e=>{if(e.target.name==='z-fmt')setFormat(FN.indexOf(e.target.value),'zone');zoneSync()});
  addEventListener('resize',size);
  model();dots.forEach(o=>o.v=o.t);size();
  if(document.fonts)document.fonts.ready.then(paint);
  $('[data-zuse]',zr).addEventListener('click',()=>{
    const f=$('[data-quote]');if(!f)return;
    f.zones.value=val('z-cities').join(', ');f.format.value=val('z-fmt')[0];
    f.besoin.value=`${val('z-cars')[0]} véhicules pendant ${val('z-dur')[0]}, ${val('z-scope')[0].toLowerCase()}.`;
  });
}
if(fr)setFormat(1);

/* devis : validation, aperçu sans envoi */
const q=$('[data-quote]');
if(q){
  q.noValidate=true;
  const msg=(f)=>{
    if(f.validity.valueMissing)return 'Ce champ est requis.';
    if(f.validity.typeMismatch)return 'Adresse e-mail non valide.';
    return '';
  };
  const check=f=>{const m=msg(f),e=$('#'+f.name+'-err',q);f.setAttribute('aria-invalid',!!m);if(e)e.textContent=m;return !m};
  $$('input[required]',q).forEach(f=>f.addEventListener('blur',()=>{if(f.value)check(f)}));
  q.addEventListener('submit',e=>{
    e.preventDefault();
    const req=$$('input[required]',q),bad=req.filter(f=>!check(f)),st=$('[data-sent]',q);
    if(bad.length){st.textContent='Vérifiez les champs indiqués.';bad[0].focus();return}
    st.textContent="Aperçu : rien n'a été envoyé. Le formulaire sera relié à la mise en ligne.";
  });
}
})();
