/* ============ Cart logic (client-side only — no backend cart endpoint) ============ */
function addToCart(productId, opts={}){
  const p = findProduct(productId);
  if(!p) return;
  const variant = opts.color || p.colors[0];
  const existing = STATE.cart.find(c=>c.id===productId && c.color===variant);
  if(existing){ existing.qty += 1; }
  else { STATE.cart.push({ id:p.id, name:p.name, price:p.price, img:p.img, color:variant, qty:1 }); }
  renderCartBadge();
  renderCartDrawer();
  showToast('Added to bag', p.name, 'success');
}
function removeFromCart(productId, color){
  STATE.cart = STATE.cart.filter(c=>!(c.id===productId && c.color===color));
  renderCartBadge(); renderCartDrawer();
}
function changeQty(productId, color, delta){
  const item = STATE.cart.find(c=>c.id===productId && c.color===color);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) return removeFromCart(productId, color);
  renderCartBadge(); renderCartDrawer();
}
function cartSubtotal(){ return STATE.cart.reduce((s,c)=>s + c.price*c.qty, 0); }
function cartCount(){ return STATE.cart.reduce((s,c)=>s+c.qty, 0); }

async function toggleWishlist(productId){
  if(!STATE.user){ showToast('Sign in required', 'Create an account to save pieces to your wishlist.', 'error'); navigate('account'); return; }
  const p = findProduct(productId);
  const isSaved = STATE.wishlist.includes(productId);
  try{
    if(isSaved){
      const res = await api.removeWishlist(productId);
      STATE.wishlist = res.product_ids;
      showToast('Removed from wishlist', p?.name || '', 'info');
    } else {
      const res = await api.addWishlist(productId);
      STATE.wishlist = res.product_ids;
      showToast('Saved to wishlist', p?.name || '', 'success');
    }
  } catch(err){
    showToast('Could not update wishlist', err.message, 'error');
    return;
  }
  renderCartBadge();
  $all(`[data-fav="${productId}"]`).forEach(el=>el.classList.toggle('active', STATE.wishlist.includes(productId)));
}

function renderCartBadge(){
  const b = $('#cartBadge'); if(b) b.textContent = cartCount();
  const w = $('#wishBadge'); if(w) w.textContent = STATE.wishlist.length;
  $all('#cartBadge, #wishBadge').forEach(el=>{ el.style.display = el.textContent==='0' ? 'none' : 'flex'; });
}

function renderCartDrawer(){
  const wrap = $('#cartItems');
  if(!wrap) return;
  if(STATE.cart.length === 0){
    wrap.innerHTML = `<div class="cart-empty">${icon('shopping-bag',40)}<p style="margin-top:16px;">Your bag is quiet for now.</p></div>`;
  } else {
    wrap.innerHTML = STATE.cart.map(c => `
      <div class="cart-item">
        <img src="${c.img}" alt="${c.name}">
        <div style="flex:1;">
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-meta">Colorway: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.color};vertical-align:middle;margin-left:4px;"></span></div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div class="qty-control">
              <button onclick="changeQty('${c.id}','${c.color}',-1)">−</button>
              <span>${c.qty}</span>
              <button onclick="changeQty('${c.id}','${c.color}',1)">+</button>
            </div>
            <span class="mono">${fmt(c.price*c.qty)}</span>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${c.id}','${c.color}')">Remove</button>
        </div>
      </div>`).join('');
  }
  const sub = cartSubtotal();
  $('#cartSubtotal').textContent = fmt(sub);
  $('#cartShipping').textContent = sub > 500 || sub===0 ? 'Complimentary' : fmt(24);
  $('#cartTotal').textContent = fmt(sub + (sub > 500 || sub===0 ? 0 : 24));
}

function toggleCart(open){
  $('#cartDrawer').classList.toggle('open', open);
  $('#drawerOverlay2').classList.toggle('open', open);
}
function toggleMobileNav(open){
  $('#mobileDrawer').classList.toggle('open', open);
  $('#drawerOverlay1').classList.toggle('open', open);
}
function toggleSearch(open){
  $('#searchOverlay').classList.toggle('open', open);
  if(open) setTimeout(()=>$('#searchInput').focus(), 350);
}
function runSearch(q){
  STATE.filters.search = q;
  const results = q.length < 1 ? [] : STATE.allProducts.filter(p=>p.name.toLowerCase().includes(q.toLowerCase()) || p.cat.includes(q.toLowerCase())).slice(0,6);
  $('#searchResults').innerHTML = results.map(p => `
    <div class="search-result-row" onclick="toggleSearch(false); navigate('product','${p.id}')">
      <img src="${p.img}" alt="">
      <div><div style="font-size:14px;">${p.name}</div><div class="mono" style="font-size:12px;color:var(--dust)">${fmt(p.price)}</div></div>
    </div>`).join('') || (q.length ? '<p style="color:var(--dust); padding:12px;">No pieces found. Try "watch" or "leather."</p>' : '');
}
