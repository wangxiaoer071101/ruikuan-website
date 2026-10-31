(() => {
  'use strict';
  document.documentElement.classList.add('school-enhanced');
  document.querySelectorAll('.school-menu-toggle').forEach(button => {
    const menu=document.getElementById(button.getAttribute('aria-controls'));
    if(!menu)return;
    function close(){button.setAttribute('aria-expanded','false');button.textContent='菜单';menu.classList.remove('is-open');}
    button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.textContent=open?'收起':'菜单';menu.classList.toggle('is-open',open);});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
    document.addEventListener('click',e=>{if(!e.target.closest('nav'))close();});
  });
  const dialog=document.getElementById('school-preview');
  if(dialog){
    let opener;
    document.querySelectorAll('[data-preview]').forEach(a=>a.addEventListener('click',e=>{
      if(!dialog.showModal)return;
      e.preventDefault();opener=a;
      document.getElementById('preview-title').textContent=a.dataset.preview;
      document.getElementById('preview-image').src=a.href;
      document.getElementById('preview-image').alt=a.dataset.preview;
      document.getElementById('preview-original').href=a.href;
      dialog.showModal();document.body.style.overflow='hidden';
      document.getElementById('preview-close').focus();
      dialog.querySelector('.school-image-area').scrollTo(0,0);
    }));
    document.getElementById('preview-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});
    dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  }
  document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
    const status=document.getElementById('consult-status');
    try{await navigator.clipboard.writeText(b.dataset.copy);status.textContent='已复制备注：'+b.dataset.copy;}
    catch{status.textContent='请手动复制备注：'+b.dataset.copy;}
  }));
})();
