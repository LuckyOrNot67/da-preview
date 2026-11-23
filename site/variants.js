/* Variantes à comparer (adresse avec ?b=1, 2 ou 3 pour les volets du Concept, ?d=1, 2 ou 3 pour les trois formats). Sans paramètre, rien ne change. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],D=document.documentElement.dataset;
const MO=document.documentElement.classList.contains('mo')&&window.gsap,small=innerWidth<=760;
if(!D.b&&!D.d)return;
if(MO)gsap.registerPlugin(ScrollTrigger);
const stage=(el,len)=>{const w=document.createElement('div');w.className='stk';el.before(w);w.append(el);w.style.height=`calc(100svh + ${len}vh)`;return w};
const lite=(trigger,endTrigger)=>ScrollTrigger.create({trigger,start:'top 60px',endTrigger:endTrigger||trigger,end:'bottom 60px',toggleClass:{targets:'.bar',className:'lite'}});

/* ---------- Volets du Concept ---------- */
const nc=$('.nc');
if(D.b&&nc&&!small){
  const b=$('.nc-b',nc),I=$$('.nc-i',nc),V=$$('.nc-v img',nc);let cur=-1;
  const show=i=>{if(i===cur)return;cur=i;I.forEach((x,k)=>{x.classList.toggle('on',k===i);$('.nc-t',x).setAttribute('aria-expanded',k===i)});V.forEach((x,k)=>x.classList.toggle('on',k===i))};
  nc.classList.add('js','vb','vb'+D.b);show(0);
  if(D.b==='1'||D.b==='2'){
    /* 1 : la liste s'allume tour à tour, un trait avance sous le volet actif. 2 : la photo prend tout l'écran, le texte du volet actif est posé dessus. */
    if(D.b==='2'){const n=document.createElement('ol');n.className='vb-n';n.innerHTML=I.map((x,k)=>`<li>${String(k+1).padStart(2,'0')}</li>`).join('');b.append(n)}
    const w=stage(b,210);
    if(MO)ScrollTrigger.create({trigger:w,start:'top top',end:'+=210%',scrub:true,onUpdate:s=>{const p=s.progress*3,i=Math.min(2,Math.floor(p));show(i);I.forEach((x,k)=>x.style.setProperty('--p',k<i?1:k===i?Math.min(1,p-i):0));$$('.vb-n li',b).forEach((x,k)=>x.classList.toggle('on',k===i))}});
  }else{
    /* 3 : le texte défile normalement, la photo reste à côté et change quand un volet passe au milieu de l'écran */
    if(MO)I.forEach((x,i)=>ScrollTrigger.create({trigger:x,start:'top 55%',end:'bottom 55%',onToggle:s=>s.isActive&&show(i)}));
  }
}

/* ---------- Les trois formats ---------- */
const fst=$('.fst');
if(D.d&&fst){
  const F=$$('.fy',fst).map(a=>{const dl={};$$('dt',a).forEach(dt=>dl[dt.textContent.trim()]=dt.nextElementSibling.innerHTML);return {name:$('.mega',a).textContent,say:$('.say',a).textContent,dl,zs:$('.zs',a).outerHTML,img:$('.g0 img',a).getAttribute('src'),img2:$('.g1 img',a).getAttribute('src')}});
  const rows=f=>['Intérêt','Visibilité','Graphisme'].map(k=>`<div><dt>${k}</dt><dd>${f.dl[k]??''}</dd></div>`).join('');
  const sec=document.createElement('section');sec.className='vd vd'+D.d;sec.setAttribute('aria-label','Nos trois styles de campagne');
  const note='<p class="sur">Tarif sur devis, selon le nombre de voitures, la durée et les zones. Création, impression, pose, retrait et suivi inclus.</p>';
  if(D.d==='1'){
    /* 1 : la même voiture, trois habillages. La section reste en place, la photo et la fiche changent au défilement. */
    sec.innerHTML=`<div class="vd-in"><div class="vd-t"><ol class="vd-k">${F.map((f,i)=>`<li>${f.name}</li>`).join('')}</ol>${F.map((f,i)=>`<div class="vd-f" data-i="${i}"><h3 class="vd-n">${f.name}</h3><p class="say">${f.say}</p><dl class="vd-dl">${rows(f)}</dl>${f.zs}</div>`).join('')}${note}</div><div class="vd-p">${F.map((f,i)=>`<img src="${f.img}" alt="${f.name} : ${f.say}" data-i="${i}">`).join('')}</div></div>`;
  }else if(D.d==='2'){
    /* 2 : les trois formats côte à côte, une photo et trois infos chacun */
    sec.innerHTML=`<div class="vd-g">${F.map(f=>`<article class="vd-c"><figure><img src="${f.img}" alt="${f.name} : ${f.say}" loading="lazy"></figure><h3 class="vd-n">${f.name}</h3><p class="say">${f.say}</p><dl class="vd-dl">${rows(f)}</dl>${f.zs}</article>`).join('')}</div>${note}`;
  }else{
    /* 3 : des onglets. Un format à la fois, on passe de l'un à l'autre d'un clic. */
    sec.innerHTML=`<div class="vd-tabs" role="tablist" aria-label="Styles de campagne">${F.map((f,i)=>`<button role="tab" id="vt${i}" aria-controls="vp${i}" aria-selected="${!i}" tabindex="${i?-1:0}">${f.name}</button>`).join('')}</div>${F.map((f,i)=>`<div class="vd-pn" role="tabpanel" id="vp${i}" aria-labelledby="vt${i}" ${i?'hidden':''}><figure><img src="${f.img}" alt="${f.name} : ${f.say}"></figure><div><h3 class="vd-n">${f.name}</h3><p class="say">${f.say}</p><dl class="vd-dl">${rows(f)}</dl>${f.zs}</div></div>`).join('')}${note}`;
  }
  fst.replaceWith(sec);
  const show=i=>{$$('.vd-f',sec).forEach((x,k)=>x.classList.toggle('on',k===i));$$('.vd-p img',sec).forEach((x,k)=>x.classList.toggle('on',k===i));$$('.vd-k li',sec).forEach((x,k)=>x.classList.toggle('on',k===i))};
  if(D.d==='1'){show(0);if(MO&&!small){const w=stage(sec,200);ScrollTrigger.create({trigger:w,start:'top top',end:'+=200%',scrub:true,onUpdate:s=>show(Math.min(2,Math.floor(s.progress*3)))});lite(w)}else{sec.classList.add('flat')}}
  if(D.d==='2'&&MO){gsap.from($$('.vd-c',sec),{y:60,opacity:0,duration:.8,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:sec,start:'top 75%'}});lite(sec)}
  if(D.d==='3'){const T=$$('[role=tab]',sec),P=$$('[role=tabpanel]',sec);
    const sel=i=>{T.forEach((t,k)=>{t.setAttribute('aria-selected',k===i);t.tabIndex=k===i?0:-1});P.forEach((p,k)=>{p.hidden=k!==i});if(MO)gsap.fromTo(P[i].children,{y:24,opacity:0},{y:0,opacity:1,duration:.45,stagger:.06,ease:'power2.out'})};
    T.forEach((t,i)=>{t.addEventListener('click',()=>sel(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowRight'?1:2))%3;T[n].focus();sel(n)}})});
    if(MO)lite(sec)}
}
if(MO)addEventListener('load',()=>ScrollTrigger.refresh());if(MO)requestAnimationFrame(()=>ScrollTrigger.refresh());
})();
