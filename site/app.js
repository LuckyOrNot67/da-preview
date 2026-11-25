/* Panneau de réglages, détails au survol et animations du site. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement,D=R.dataset,MO=R.classList.contains('mo');
/* réglages */
const SEC=[];
const COL=[['noir','Noir et blanc'],['violet','Violet'],['rouge','Rouge'],['orange','Orange'],['jaune','Jaune']],FONT=[['1','Condensée'],['2','Grasse'],['3','Éditoriale'],['4','Arrondie']];
const KEYS=['bf','bl','xp'];
const keep=()=>{try{localStorage.setItem('adsmove-cfg6',JSON.stringify(Object.fromEntries(KEYS.map(k=>[k,D[k]]))))}catch(e){}};
const row=(key,t,opts)=>`<div><h2>${t}</h2><div class="o" data-k="${key}">${opts.map(([v,l])=>`<button data-v="${v}" aria-pressed="${D[key]===v}">${l}</button>`).join('')}</div></div>`;
const cfg=$('#cfg'),cb=$('#cfgb');
if(cfg){
cfg.innerHTML=row('bf','Barre et pied de page',[['ant','Anthracite'],['noir','Noir du site'],['blanc','Blanc']])+row('bl','Trait sous la barre',[['oui','Oui'],['non','Non']])+row('xp','Expertise',[['phrase','Phrase manifeste'],['voiture','Repères sur la voiture'],['mots','Mots qui défilent'],['grille','Grille'],['fil','Fil (téléphone)']])+'<div class="ln2"><button id="cfgc">Copier mes choix</button><button id="cfgr">Réinitialiser</button><span class="ok" id="cfgs" role="status"></span></div>';
const openC=o=>{cfg.hidden=!o;cb.setAttribute('aria-expanded',o)};
cb.addEventListener('click',()=>openC(cfg.hidden));
addEventListener('keydown',e=>{if(e.key==='Escape'&&!cfg.hidden){openC(false);cb.focus()}});
cfg.addEventListener('click',e=>{const b=e.target.closest('.o button');if(!b)return;const k=b.parentElement.dataset.k;D[k]=b.dataset.v;$$('button',b.parentElement).forEach(x=>x.setAttribute('aria-pressed',x===b));keep();if(k==='xp')location.reload()});
const NM={ant:'anthracite',noir:'noir du site',blanc:'blanc'};
$('#cfgc').addEventListener('click',async()=>{const t='Barre et pied de page : '+NM[D.bf]+'\nTrait sous la barre : '+D.bl;try{await navigator.clipboard.writeText(t);$('#cfgs').textContent='Copié.'}catch(e){$('#cfgs').textContent=t}});
$('#cfgr').addEventListener('click',()=>{try{localStorage.removeItem('adsmove-cfg6')}catch(e){}location.reload()});
}
/* texte qui roule au survol */
$$('.rl').forEach(r=>{r.innerHTML=`<span class="rli">${r.innerHTML}</span>`});
/* titres sur une ligne : la taille s'ajuste pour que le texte ne soit jamais coupé */
const fit=()=>{const y=$$('.fy .say');y.forEach(x=>x.style.minHeight='');if(y.length){const m=Math.max(...y.map(x=>x.offsetHeight));y.forEach(x=>x.style.minHeight=m+'px')}
  $$('.fit').forEach(h=>{h.style.fontSize='';if(innerWidth<=760||h.scrollWidth<=h.clientWidth)return;h.style.fontSize=parseFloat(getComputedStyle(h).fontSize)*h.clientWidth/h.scrollWidth*.995+'px'})};
fit();addEventListener('resize',fit);if(document.fonts)document.fonts.ready.then(fit);
/* concept : les volets s'ouvrent au clic sur téléphone ; sur ordinateur, la photo plein cadre change au défilement (plus bas) */
const nc=$('.nc'),wide=innerWidth>760;let showNc=null;
if(nc){const I=$$('.nc-i',nc),V=$$('.nc-v img',nc);let cur=-1;nc.classList.add('js');
  showNc=i=>{if(i===cur)return;cur=i;I.forEach((x,k)=>{x.classList.toggle('on',k===i);x.classList.toggle('past',k<i);$('.nc-t',x).setAttribute('aria-expanded',k===i)});V.forEach((x,k)=>{x.classList.toggle('on',k===i);x.classList.toggle('past',k<i)})};
  if(MO&&window.gsap){nc.classList.add('vb','vb2');const n=document.createElement('ol');n.className='vb-n';n.setAttribute('aria-hidden','true');n.innerHTML=I.map((x,k)=>`<li>${String(k+1).padStart(2,'0')}</li>`).join('');$('.nc-b',nc).append(n)}
  else I.forEach((x,i)=>$('.nc-t',x).addEventListener('click',()=>showNc(i)));
  showNc(0)}
if(!MO||!window.gsap)return;
gsap.registerPlugin(ScrollTrigger);ScrollTrigger.config({ignoreMobileResize:true});
const small=innerWidth<=760;matchMedia('(max-width:760px)').addEventListener('change',()=>location.reload());
/* scène sticky : le navigateur fixe la section, sans recalcul à chaque image. len = durée en % d'écran, extra = temps laissé à la section suivante pour passer par-dessus */
const stage=(el,len,extra=0)=>{const w=document.createElement('div');w.className='stk';el.before(w);w.append(el);w.style.height=`calc(100svh + ${len+extra}vh)`;return {w,st:{trigger:w,start:'top top',end:`+=${len}%`,scrub:true,invalidateOnRefresh:true}}};
const cover=(el,w,len,extra=100)=>gsap.fromTo(el,{scale:1},{scale:.95,ease:'none',transformOrigin:'center top',immediateRender:false,scrollTrigger:{trigger:w,start:()=>`top+=${innerHeight*len/100} top`,end:`+=${extra}%`,scrub:true}});
/* héros : le titre monte derrière la voiture, qui est là dès le début */
(()=>{const s=$('.h1g');if(!s)return;const T=gsap.timeline({defaults:{ease:'power3.out'}});
  T.from('.bar .logo',{y:-14,opacity:0,duration:.6}).from('.links a',{y:-14,opacity:0,duration:.5,stagger:.06},'-=.4').from('.acts>*',{opacity:0,duration:.7},'-=.4')
   .from($$('.ln>span',s),{yPercent:110,duration:1,stagger:.12,ease:'power4.out'},.15).from($('.art',s),{x:160,opacity:0,duration:1.3,ease:'power3.out'},.1).from($$('.foot p,.foot a',s),{y:24,opacity:0,duration:.7,stagger:.1},.6)})();
const lit=()=>{};/* la barre reste noire partout */
/* concept : scroll continu, chaque carte ralentit en arrivant, puis tout le paquet monte ensemble */
const sb=$('.sb');let sbW;
/* concept sur ordinateur : on descend, la photo plein cadre arrive, puis chaque volet prend sa place au défilement */
if(nc&&nc.classList.contains('vb2')){const b=$('.nc-b',nc),S=stage(b,250),L=$$('.vb-n li',b);
  ScrollTrigger.create({...S.st,onUpdate:s=>{const i=Math.min(2,Math.floor(s.progress*3.25));showNc(i);L.forEach((x,k)=>x.classList.toggle('on',k===i))}})}
{const nh=$('.nc-h');if(nh){const big=$('.huge',nh),txt=big.textContent.trim();big.setAttribute('aria-label',txt);
  const L=small?['Des voitures','roulent déjà.',"Autant qu'elles",'parlent de vous.']:['Des voitures roulent déjà.',"Autant qu'elles parlent de vous."];
  big.innerHTML=L.map((l,k)=>`<span class="l l${k}" aria-hidden="true">${l.split(' ').map(w=>`<span class="w">${[...w].map(c=>`<span class="ch">${c}</span>`).join('')}</span>`).join(' ')}</span>`).join('');
  const S=stage(nh,110,0);nh.classList.add('run');
  gsap.timeline({scrollTrigger:S.st}).fromTo($$('.ch',big),{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.02,duration:.35,ease:'power1.out'},0).to({}, {duration:.25});
  const drift={trigger:S.w,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true},dA=small?.03:.05,dB=small?.035:.06;
  $$('.l',big).forEach((l,k)=>{const s=k%2?-1:1;gsap.fromTo(l,{x:()=>s*innerWidth*dA},{x:()=>-s*innerWidth*dB,ease:'none',scrollTrigger:drift})})}}
if(sb){const big=$('.big',sb),txt=big.textContent.trim();big.classList.remove('fit');big.style.fontSize='';big.setAttribute('aria-label',txt);
  const W=txt.split(' '),L=small?[W.slice(0,2).join(' '),W.slice(2,3).join(' '),W.slice(3).join(' ')]:[W.slice(0,2).join(' '),W.slice(2).join(' ')];
  big.innerHTML=L.map((l,k)=>`<span class="l l${k}" aria-hidden="true">${l.split(' ').map(w=>`<span class="w">${[...w].map(c=>`<span class="ch">${c}</span>`).join('')}</span>`).join(' ')}</span>`).join('');
  const S=stage(sb,120,100);sbW=S.w;sb.classList.add('run');const ch=$$('.ch',big);
  const t=gsap.timeline({scrollTrigger:S.st});
  t.fromTo(ch,{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.02,duration:.35,ease:'power1.out'},0).to({}, {duration:.2});
  const drift={trigger:S.w,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true};
  const dA=small?.04:.12,dB=small?.05:.14;gsap.fromTo($('.l0',big),{x:()=>innerWidth*dA},{x:()=>-innerWidth*dB,ease:'none',scrollTrigger:drift});
  $$('.l',big).forEach((l,k)=>{if(!k)return;const s=k%2?-1:1;gsap.fromTo(l,{x:()=>s*innerWidth*dA},{x:()=>-s*innerWidth*dB,ease:'none',scrollTrigger:drift})});
  sb.classList.add('card');cover(sb,S.w,120,100);
  gsap.fromTo(sb,{opacity:1},{opacity:.3,ease:'none',immediateRender:false,scrollTrigger:{trigger:S.w,start:()=>`top+=${innerHeight*1.2} top`,end:'+=100%',scrub:true}})}
/* formats : le nom en grand, puis il remonte et la fiche et les photos arrivent */
/* formats : une photo principale par format, on passe à la suivante avec les flèches, au clavier ou en glissant */
$$('.fy .gal').forEach(g=>{const F=$$('figure',g);let i=0;g.classList.add('car');
  const nav=document.createElement('div');nav.className='car-n';nav.innerHTML=`<button class="car-b" data-d="-1" aria-label="Photo précédente">‹</button><span class="car-d">${F.map(()=>'<i></i>').join('')}</span><button class="car-b" data-d="1" aria-label="Photo suivante">›</button>`;g.append(nav);
  const D2=$$('.car-d i',nav),go=k=>{i=(k+F.length)%F.length;F.forEach((x,n)=>x.classList.toggle('on',n===i));D2.forEach((x,n)=>x.classList.toggle('on',n===i))};
  nav.addEventListener('click',e=>{const b=e.target.closest('.car-b');if(b)go(i+ +b.dataset.d)});
  g.tabIndex=0;g.setAttribute('aria-label','Photos du format, flèches gauche et droite pour changer');g.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(i+1);if(e.key==='ArrowLeft')go(i-1)});
  let x0=null;g.addEventListener('pointerdown',e=>{x0=e.clientX});g.addEventListener('pointerup',e=>{if(x0!=null&&Math.abs(e.clientX-x0)>40)go(i+(e.clientX<x0?1:-1));x0=null});
  go(0)});
const f=$('.fst');if(f){const A=$$('.fy',f),len=A.length*(small?248:280)+(small?40:90),{w,st}=stage(f,len,0),t=gsap.timeline({scrollTrigger:st});
  if(sbW)w.classList.add('over');
  A.forEach((a,i)=>{const b=i*3.5,m=$('.mega',a),inf=$('.inf',a),g=$$('.gal',a),parts=[$('.say',inf),...$$('dl>*',inf),...$$('.zs li',inf),$('.sur',inf)].filter(Boolean);
   gsap.set(parts,{opacity:0,y:24});gsap.set(m,{y:()=>(innerHeight-74-m.offsetHeight)/2});
   if(i){t.fromTo(a,{yPercent:102},{yPercent:0,duration:1,ease:'power1.inOut'},b-1).to(A[i-1],{scale:.94,duration:1,ease:'power1.inOut'},b-1)}
   t.to(m,{y:0,scale:small?.6:.48,duration:.7,ease:'power1.inOut'},b+.3)
    .fromTo(g,{y:()=>innerHeight*.5,opacity:0,scale:.82,rotate:-2},{y:0,opacity:1,scale:1,rotate:0,duration:.7,ease:'power3.out'},b+1.05)
    .to(parts,{opacity:1,y:0,stagger:.035,duration:.35,ease:'power2.out'},b+1.3);});t.to({}, {duration:.95});

  /* le menu suit les pages blanches : Classique, puis Complet */
}
/* page conducteur : la photo part d'une carte et s'ouvre sur tout l'écran, uniquement en transform */
const dh=$('.dh'),rd=$('.rd');let dhW,rdW;
if(dh&&!small){const fg=$('.dhi',dh),tx=$('.dht',dh),t2=$('.dh2',dh),len=170,S=stage(dh,len,100),t=gsap.timeline({scrollTrigger:S.st});dhW=S.w;dhW.style.marginTop=-$('.bar').offsetHeight+'px';
  const B=()=>{const W=dh.offsetWidth,H=dh.offsetHeight,G=parseFloat(getComputedStyle(dh).paddingLeft),e=$('h1',dh),y=tx.offsetTop+e.offsetTop+e.offsetHeight+14,h=H-y-22,w=Math.min(h*W/H,W*.6);return {x:W-G-w,y,s:w/W}};
  gsap.set(fg,{transformOrigin:'0 0'});gsap.from($('h1',dh),{y:40,opacity:0,duration:.9,ease:'power3.out'});gsap.from(fg,{opacity:0,duration:.9});
  t.fromTo(fg,{x:()=>B().x,y:()=>B().y,scale:()=>B().s,borderRadius:()=>24/B().s},{x:0,y:0,scale:1,borderRadius:0,duration:1,ease:'power2.inOut'},0).to(tx,{y:-60,opacity:0,duration:.4,ease:'none'},0).fromTo(t2,{opacity:0},{opacity:1,duration:.3,ease:'none'},.75).to({}, {duration:.3});
  cover(dh,S.w,len)}
/* les six étapes : toute la liste est visible, le point descend la ligne et allume chaque étape */
if(rd&&!small){const tr=$('.rt',rd),L=$$('li',tr),dot=$('.rdd',tr),len=L.length*35,S=stage(rd,len,100),t=gsap.timeline({scrollTrigger:S.st}),Y=l=>l.offsetTop+l.offsetHeight/2-8;rdW=S.w;S.w.classList.add('over');
  gsap.set(L.slice(1),{opacity:.3});
  t.fromTo(dot,{y:()=>Y(L[0])},{y:()=>Y(L[L.length-1]),duration:1,ease:'none'},0);
  L.slice(1).forEach((l,i)=>t.to(l,{opacity:1,duration:.05},(i+1)/(L.length-1)-.05));t.to({}, {duration:.12});
  cover(rd,S.w,len)}
if(dh){lit(dhW||dh,-1,rdW||rd,'top 60px');lit('.sim','top 60px','.sim','bottom 60px')}
/* expertise : les quatre étapes arrivent l'une après l'autre ; la section reste en place pendant que la suivante passe par-dessus */
const nx=$('.nx');if(nx){const C=$$('.nx-c',nx),XP=D.xp||'phrase';
  const chars=el=>{el.innerHTML=el.innerHTML.split('<br>').map(l=>`<span class="l">${l.split(' ').map(w=>`<span class="w">${[...w].map(c=>`<span class="ch">${c}</span>`).join('')}</span>`).join(' ')}</span>`).join('');return $$('.ch',el)};
  const ST=C.map(c=>({w:$('h3',c).textContent.trim().split(' ')[0],n:$('h3',c).textContent.trim(),s:($('.nx-s',c)||{}).textContent||''})),pad=i=>String(i+1).padStart(2,'0');
  /* Mots qui défilent : « Notre expertise » en grand, puis chaque étape prend sa place, à la même taille */
  /* Repères sur la voiture : la voiture du haut de page, chaque service s'allume à son endroit */
  /* Phrase manifeste : une seule idée, en grand, puis la liste de ce qu'on prend en charge */
  if(XP==='phrase'){nx.classList.add('xm');const box=document.createElement('div');box.className='xm-b';
   const L=small?['Vous apportez','le message.',"On s'occupe",'du reste.']:['Vous apportez le message.',"On s'occupe du reste."];
   box.innerHTML=`<h2 class="xm-t" aria-label="Vous apportez le message. On s'occupe du reste.">${L.map((l,k)=>`<span class="l l${k}" aria-hidden="true">${l.split(' ').map(w=>`<span class="w">${[...w].map(c=>`<span class="ch">${c}</span>`).join('')}</span>`).join(' ')}</span>`).join('')}</h2><p class="xm-s">${ST.map(s=>`<span>${s.w==='Covering'?'Pose':s.w==='Diffusion'?'Conducteurs':s.w==='Conception'?'Création':s.w}</span>`).join('<i>·</i>')}</p>`;
   nx.append(box);const S=stage(box,110,0),sub=$$('.xm-s>*',box);
   gsap.timeline({scrollTrigger:S.st}).fromTo($$('.ch',box),{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.015,duration:.35,ease:'power1.out'},0).fromTo(sub,{y:14,opacity:0},{y:0,opacity:1,stagger:.04,duration:.3,ease:'power2.out'},.55).to({}, {duration:.3});
   const drift={trigger:S.w,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true},dA=small?.03:.05,dB=small?.035:.06;
   $$('.xm-t .l',box).forEach((l,k)=>{const s=k%2?-1:1;gsap.fromTo(l,{x:()=>s*innerWidth*dA},{x:()=>-s*innerWidth*dB,ease:'none',scrollTrigger:drift})})}
  else if(XP==='voiture'){nx.classList.add('xv');const box=document.createElement('div');box.className='xv-b';
   const P=[[66,44,0],[22,33,0],[50,77,0],[89,31,1]];
   box.innerHTML=`<h3 class="xv-t">Notre expertise</h3><div class="xv-car"><img src="img/hero.webp" alt="" width="2600" height="1188">${ST.map((s,i)=>`<span class="xv-d${P[i][2]?' l':''}" style="left:${P[i][0]}%;top:${P[i][1]}%"><i>${i+1}</i><em>${s.w}</em></span>`).join('')}</div><div class="xv-p">${ST.map((s,i)=>`<p><b>${pad(i)} · ${s.n}</b><span>${s.s}</span></p>`).join('')}</div>`;
   nx.append(box);const Dt=$$('.xv-d',box),Pp=$$('.xv-p p',box),n=ST.length,dur=n+1.4,ch=chars($('.xv-t',box));
   const S=stage(box,100*(n+1)),t=gsap.timeline({scrollTrigger:{...S.st,onUpdate:s=>{const i=Math.min(n-1,Math.floor(s.progress*dur-1));
     Dt.forEach((x,k)=>{x.classList.toggle('on',k===i);x.classList.toggle('past',k<i)});Pp.forEach((x,k)=>x.classList.toggle('on',k===i))}}});
   t.fromTo(ch,{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.02,duration:.4,ease:'power1.out'},0).fromTo($('.xv-car img',box),{x:()=>innerWidth*.12,opacity:0},{x:0,opacity:1,duration:.6,ease:'power2.out'},.15).to({}, {duration:dur-.75})}
  else if(XP==='mots'){nx.classList.add('xa');const box=document.createElement('div');box.className='xa-b';box.setAttribute('aria-label','Notre expertise');
   box.innerHTML=`<div class="xa-w"><h3 class="xa-i">Notre<br>expertise</h3>${ST.map(s=>`<h3 class="xa-i">${s.w}</h3>`).join('')}</div><div class="xa-p">${ST.map(s=>`<p><b>${s.n}</b> · ${s.s}</p>`).join('')}</div><div class="xa-f" aria-hidden="true"><b>01</b><span>/ ${pad(ST.length-1)}</span><span class="nx-bar">${ST.map(()=>'<i></i>').join('')}</span></div>`;
   nx.append(box);const W=$$('.xa-i',box),P=$$('.xa-p p',box),F=$('.xa-f',box),FB=$('b',F),FI=$$('.nx-bar i',F),n=ST.length,dur=n+1.3;
   const ch=chars(W[0]);gsap.set(W.slice(1),{yPercent:115});
   const S=stage(box,100*(n+1)),t=gsap.timeline({scrollTrigger:{...S.st,onUpdate:s=>{const i=Math.max(0,Math.min(n,Math.floor(s.progress*dur-.75)));
     P.forEach((p,k)=>p.classList.toggle('on',k===i-1));F.classList.toggle('on',i>0);if(i>0)FB.textContent=pad(i-1);FI.forEach((x,k)=>x.classList.toggle('on',k<i))}}});
   t.fromTo(ch,{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.02,duration:.4,ease:'power1.out'},0);
   for(let k=1;k<=n;k++)t.to(W[k-1],{yPercent:-115,opacity:0,duration:.5,ease:'power2.inOut'},k+.5).fromTo(W[k],{yPercent:115,opacity:0},{yPercent:0,opacity:1,duration:.5,ease:'power2.inOut'},k+.5);
   t.to({}, {duration:.3},n+1)}
  /* Grille : le titre, puis quatre cases ; chaque case s'allume à son tour */
  else if(XP==='grille'){nx.classList.add('xc');const box=document.createElement('div');box.className='xc-b';
   box.innerHTML=`<h3 class="xc-t">Notre expertise</h3><div class="xc-g">${ST.map((s,i)=>`<div class="xc-c"><span>${pad(i)}</span><div><b>${s.w}</b><p>${s.s}</p></div></div>`).join('')}</div>`;
   nx.append(box);const T=$$('.xc-c',box),n=ST.length,dur=n+1.2,ch=chars($('.xc-t',box));
   const S=stage(box,90*(n+1)),t=gsap.timeline({scrollTrigger:{...S.st,onUpdate:s=>{const i=Math.min(n-1,Math.floor(s.progress*dur-.9));T.forEach((x,k)=>{x.classList.toggle('on',k===i);x.classList.toggle('past',k<i)})}}});
   t.fromTo(ch,{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.02,duration:.4,ease:'power1.out'},0).fromTo(T,{y:40,opacity:0},{y:0,opacity:1,stagger:.06,duration:.4,ease:'power2.out'},.25).to({}, {duration:dur-.65})}
  else if(small){nx.classList.add('ms');const h=$('.nx-h',nx),hb=$('.big',h);hb.setAttribute('aria-label',hb.textContent.trim());
   hb.innerHTML=['Notre','expertise'].map((l,k)=>`<span class="l l${k}" aria-hidden="true"><span class="w">${[...l].map(c=>`<span class="ch">${c}</span>`).join('')}</span></span>`).join('');
   const S0=stage(h,100,0);gsap.timeline({scrollTrigger:S0.st}).fromTo($$('.ch',hb),{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.03,duration:.35,ease:'power1.out'},0).to({}, {duration:.25});
   const dr={trigger:S0.w,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true};$$('.l',hb).forEach((l,k)=>{const s=k%2?-1:1;gsap.fromTo(l,{x:()=>s*innerWidth*.03},{x:()=>-s*innerWidth*.035,ease:'none',scrollTrigger:dr})});
   const g=$('.nx-g',nx),box=document.createElement('div');box.className='ms-b v-'+(D.xp||'fil');g.before(box);box.append(g);
   const ft=document.createElement('div');ft.className='ms-f';ft.setAttribute('aria-hidden','true');ft.innerHTML=`<b>01</b><span>/ ${String(C.length).padStart(2,'0')}</span><span class="nx-bar">${C.map(()=>'<i></i>').join('')}</span>`;box.append(ft);
   const B=$('b',ft),I=$$('.nx-bar i',ft);let cur=-1;const show=i=>{if(i===cur)return;cur=i;B.textContent=String(i+1).padStart(2,'0');C.forEach((c,k)=>{c.classList.toggle('on',k===i);c.classList.toggle('past',k<i)});I.forEach((x,k)=>x.classList.toggle('on',k<=i));g.style.setProperty('--p',i/(C.length-1))};
   show(0);const S=stage(box,300,0);ScrollTrigger.create({...S.st,onUpdate:s=>show(Math.min(C.length-1,Math.floor(s.progress*(C.length+.4))))})}
  else{nx.classList.add('story');const big=document.createElement('div');big.className='nx-big';big.setAttribute('aria-hidden','true');
   big.innerHTML=`<b>01</b><span class="nx-bar">${C.map(()=>'<i></i>').join('')}</span>`;$('.nx-g',nx).before(big);
   const B=$('b',big),I=$$('.nx-bar i',big),css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
   let cur=-1;const show=i=>{if(i===cur)return;const back=i<cur;cur=i;B.textContent=String(i+1).padStart(2,'0');
     C.forEach((c,k)=>{c.classList.toggle('on',k===i);c.classList.toggle('past',k<i)});I.forEach((x,k)=>x.classList.toggle('on',k<=i));
     gsap.fromTo(B,{yPercent:back?-60:60,opacity:0},{yPercent:0,opacity:1,duration:.45,ease:'power3.out'})};
   show(0);if(small){const g=$('.nx-g',nx),fitG=()=>{g.style.height='';g.style.height=Math.max(...C.map(c=>{c.style.position='static';const v=c.offsetHeight;c.style.position='';return v}))+'px'};fitG();addEventListener('resize',fitG);if(document.fonts)document.fonts.ready.then(fitG)}
   const len=320,S=stage(nx,len);
   ScrollTrigger.create({...S.st,onUpdate:s=>show(Math.min(C.length-1,Math.floor(s.progress*C.length*1.0001)))});
   gsap.from([$('.nx-h',nx),big],{y:60,opacity:0,duration:.8,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:S.w,start:'top 70%'}});}}
/* application : uniquement des transformations et de l'opacité. L'étape active est en grand avec son exemple, les précédentes rétrécissent au-dessus */
const ax=$(`[data-sec=app]>[data-v="${D.app}"]`);if(ax){const st=$('.stg',ax),li=$$('.ro li',st),ps=$$('.ps',st),tp=$('.tap',st),spl=$('.spl',st),ttl=$('.ttl',st),n=ps.length,S=stage(st,n*90),t=gsap.timeline({scrollTrigger:S.st}),H=()=>small?0:$('b',li[0]).offsetHeight*.5+6;
  gsap.set(ps,{xPercent:i=>i?100:0});gsap.set(li,{opacity:0,y:small?0:40});
  /* l'application s'ouvre sur son logo, puis le titre laisse toute la place au parcours */
  t.to($('s',spl),{scaleX:1,duration:.85,ease:'none'},0).to(spl,{opacity:0,duration:.2},.85).to(ttl,{opacity:0,y:-50,duration:.25,ease:'power1.in'},.85).to(li[0],{opacity:1,y:0,duration:.3},1.12);
  for(let i=1;i<n;i++){const o=i+1.1;t.fromTo(tp,{opacity:0,scale:1.5},{opacity:1,scale:1,duration:.12},o-.16).to(tp,{opacity:0,scale:.7,duration:.1},o-.03).to(ps[i-1],{xPercent:-28,opacity:.35,duration:.45,ease:'power2.inOut'},o).to(ps[i],{xPercent:0,duration:.45,ease:'power2.inOut'},o);
   if(small)t.to(li[i-1],{opacity:0,duration:.2},o).to(li[i],{opacity:1,duration:.3},o+.1);
   else t.fromTo(li[i],{y:()=>(i-1)*H()+40,opacity:0},{y:()=>i*H(),opacity:1,duration:.3},o+.1).to($('.det',li[i-1]),{opacity:0,duration:.2},o).to($('b',li[i-1]),{scale:.5,opacity:.5,duration:.3},o+.05)}
  t.to({}, {duration:.4});
  if(D.app==='1')lit(S.w,'top 60px',S.w,'bottom 60px')}
/* bloc final : sticky jusqu'au bout, le footer vient se poser dessus sans le cacher entièrement */
const jw=$('.jnw'),sj=()=>{if(jw)jw.style.top=Math.min(0,innerHeight-jw.offsetHeight)+'px'};sj();addEventListener('resize',sj);
if($('.endw'))gsap.to('.cta',{scale:.95,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'max',scrub:true}});
$$('.sb .big,.sb .eye,.cta>h2,.cta>p,.jnh>*,.ct2,.ft').forEach(x=>gsap.from(x,{y:30,opacity:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:x,start:'top 88%'}}));
addEventListener('load',()=>{sj();ScrollTrigger.refresh()});if(document.fonts)document.fonts.ready.then(()=>{sj();ScrollTrigger.refresh()});
})();
