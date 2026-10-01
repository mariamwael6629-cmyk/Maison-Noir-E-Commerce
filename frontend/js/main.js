/* ============ BOOT ============ */
async function boot(){
  try{
    const [categories, productList] = await Promise.all([api.getCategories(), api.getProducts({})]);
    STATE.categories = categories;
    STATE.allProducts = productList.items;
  } catch(err){
    document.getElementById('app').innerHTML = `<div style="padding:120px 40px; text-align:center; color:var(--ivory-dim);"><h1>Could not reach the server</h1><p style="margin-top:12px;">${err.message}</p><p style="margin-top:8px; font-size:13px; color:var(--ivory-faint);">Make sure the backend is running and try refreshing.</p></div>`;
    document.getElementById('luxLoader')?.classList.add('hide');
    return;
  }

  document.getElementById('app').innerHTML = renderChrome();
  lucide.createIcons();

  await restoreSession();
  await navigate('home');
  renderCartBadge();
  setTimeout(()=>{ document.getElementById('luxLoader').classList.add('hide'); }, 900);

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){
      toggleSearch(false); toggleCart(false); toggleMobileNav(false);
      document.getElementById('trackModal')?.remove();
    }
    if(e.key === '/' && document.activeElement.tagName !== 'INPUT'){ e.preventDefault(); toggleSearch(true); }
  });
}
document.addEventListener('DOMContentLoaded', boot);
