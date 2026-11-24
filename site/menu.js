/* Menu mobile : un bouton à deux traits qui devient une croix ; la page de menu se déroule depuis le haut, les liens arrivent l'un après l'autre. */
(()=>{
const old=document.querySelector('[data-menu]'),sn=document.querySelector('[data-sheet]');if(!old||!sn)return;
const mb=old.cloneNode(false);old.replaceWith(mb);
mb.classList.add('burg');mb.setAttribute('aria-label','Ouvrir le menu');mb.innerHTML='<i></i><i></i>';
sn.classList.add('sh2');[...sn.children].forEach((a,i)=>a.style.setProperty('--i',i));
const set=o=>{sn.classList.toggle('open',o);mb.classList.toggle('x',o);mb.setAttribute('aria-expanded',o);mb.setAttribute('aria-label',o?'Fermer le menu':'Ouvrir le menu');document.body.style.overflow=o?'hidden':'';sn.inert=!o};
sn.inert=true;
mb.addEventListener('click',()=>set(!sn.classList.contains('open')));
sn.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
addEventListener('keydown',e=>{if(e.key==='Escape'&&sn.classList.contains('open')){set(false);mb.focus()}});
addEventListener('resize',()=>{if(innerWidth>1000&&sn.classList.contains('open'))set(false)});
})();
