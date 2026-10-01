/* ============ Router ============ */
async function navigate(view, param){
  if((view==='checkout' || view==='dashboard') && !STATE.user){
    showToast('Sign in required', 'Please sign in to continue.', 'error');
    view = 'account';
    param = undefined;
  }
  if(view==='admin' && !(STATE.user && STATE.user.is_admin)){
    showToast('Admin access required', 'Sign in with an admin account to view this page.', 'error');
    view = 'account';
    param = undefined;
  }
  STATE.view = view; STATE.param = param;
  window.scrollTo({top:0, behavior:'instant'});
  const main = $('#mainView');
  if(!main) return;
  main.style.opacity = 0;
  setTimeout(async ()=>{
    try{
      if(view==='home') main.innerHTML = renderHome();
      else if(view==='catalog') main.innerHTML = renderCatalog(param || 'all');
      else if(view==='product') main.innerHTML = await renderProductDetail(param);
      else if(view==='checkout') main.innerHTML = renderCheckout();
      else if(view==='account') main.innerHTML = renderAuth();
      else if(view==='dashboard') main.innerHTML = await renderDashboard(param || 'orders');
      else if(view==='admin') main.innerHTML = await renderAdmin(param || 'overview');
      else if(view==='about') main.innerHTML = renderAbout();
      else main.innerHTML = renderHome();
    } catch(err){
      main.innerHTML = `<section class="container" style="padding:120px 0; text-align:center;"><div class="empty-state">${icon('alert-triangle',44)}<h3>Something went wrong</h3><p>${err.message}</p><button class="btn btn-outline" onclick="navigate('home')">Back Home</button></div></section>`;
    }
    lucide.createIcons();
    main.style.opacity = 1;
    initViewScripts(view);
  }, 180);
}

function initViewScripts(view){
  if(view==='catalog') initCatalogInteractions();
  if(view==='product') initProductInteractions();
  if(view==='checkout') initCheckoutInteractions();
  if(view==='dashboard') initDashboardInteractions(STATE.param);
  if(view==='admin') initAdminInteractions(STATE.param);
  if(view==='account') initAuthInteractions();
  if(view==='home') initHomeAnimations();
}
