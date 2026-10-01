/* ============ USER DASHBOARD ============ */
async function renderDashboard(panel){
  const user = STATE.user;
  STATE.dashOrders = await api.getOrders();
  return `
  <section class="container" style="padding:48px 0 100px;">
    <h1 class="lux-serif" style="font-size:30px; margin-bottom:36px;">My Account</h1>
    <div class="dash-shell">
      <aside class="dash-sidebar">
        <div class="dash-profile">
          <div class="dash-avatar">${user.initials}</div>
          <div><strong style="font-size:14px;">${user.full_name}</strong><div style="font-size:12px; color:var(--ivory-faint);">${user.email}</div></div>
        </div>
        <a href="#" class="dash-nav-link ${panel==='orders'?'active':''}" onclick="switchDashPanel('orders'); return false;">${icon('package',17)} Orders</a>
        <a href="#" class="dash-nav-link ${panel==='wishlist'?'active':''}" onclick="switchDashPanel('wishlist'); return false;">${icon('heart',17)} Wishlist</a>
        <a href="#" class="dash-nav-link ${panel==='addresses'?'active':''}" onclick="switchDashPanel('addresses'); return false;">${icon('map-pin',17)} Addresses</a>
        <a href="#" class="dash-nav-link ${panel==='profile'?'active':''}" onclick="switchDashPanel('profile'); return false;">${icon('user-cog',17)} Profile Settings</a>
        <a href="#" class="dash-nav-link" onclick="logout(); return false;" style="margin-top:16px; border-top:1px solid var(--hairline); padding-top:18px;">${icon('log-out',17)} Sign Out</a>
      </aside>

      <div>
        <div class="dash-panel ${panel==='orders'?'active':''}" id="dashOrders">
          <div class="tab-strip">
            <span class="tab-strip-item active" onclick="filterOrders('all', this)">All Orders</span>
            <span class="tab-strip-item" onclick="filterOrders('processing', this)">Processing</span>
            <span class="tab-strip-item" onclick="filterOrders('shipped', this)">Shipped</span>
            <span class="tab-strip-item" onclick="filterOrders('delivered', this)">Delivered</span>
          </div>
          <div id="orderList"></div>
        </div>

        <div class="dash-panel ${panel==='wishlist'?'active':''}" id="dashWishlist">
          <h3 class="lux-serif" style="font-size:20px; margin-bottom:20px;">Saved Pieces</h3>
          <div class="product-grid" id="wishlistGrid" style="grid-template-columns:repeat(3,1fr);"></div>
        </div>

        <div class="dash-panel ${panel==='addresses'?'active':''}" id="dashAddresses">
          <h3 class="lux-serif" style="font-size:20px; margin-bottom:20px;">Saved Addresses</h3>
          <div class="empty-state">
            ${icon('map-pin',40)}<h3>No saved addresses yet</h3>
            <p>Address book management isn't available in this preview — enter your shipping details at checkout each time.</p>
          </div>
        </div>

        <div class="dash-panel ${panel==='profile'?'active':''}" id="dashProfile">
          <h3 class="lux-serif" style="font-size:20px; margin-bottom:20px;">Profile Settings</h3>
          <div class="card-panel" style="padding:28px;">
            <div class="field-row">
              <div class="field"><label class="field-label">First Name</label><input class="field-input" value="${user.first_name}" disabled></div>
              <div class="field"><label class="field-label">Last Name</label><input class="field-input" value="${user.last_name}" disabled></div>
            </div>
            <div class="field"><label class="field-label">Email</label><input class="field-input" value="${user.email}" disabled></div>
            <div class="field"><label class="field-label">Phone</label><input class="field-input" value="${user.phone || '—'}" disabled></div>
            <p style="font-size:12px; color:var(--ivory-faint); margin-top:8px;">Profile editing isn't available in this preview. Contact client care to update your details.</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function switchDashPanel(panel){
  navigate('dashboard', panel);
}

function filterOrders(status, el){
  $all('#dashOrders .tab-strip-item').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  const list = status==='all' ? STATE.dashOrders : STATE.dashOrders.filter(o=>o.status===status);
  renderOrderList(list);
}
function renderOrderList(list){
  const wrap = $('#orderList');
  if(!wrap) return;
  if(list.length === 0){ wrap.innerHTML = `<div class="empty-state">${icon('package-search',40)}<h3>No orders here</h3><p>Nothing in this status yet.</p></div>`; lucide.createIcons(); return; }
  wrap.innerHTML = list.map(o => `
    <div class="order-row" onclick="openOrderTrack('${o.id}')">
      <img src="${o.items[0].img}" alt="">
      <div style="flex:1;">
        <div style="display:flex; justify-content:space-between;">
          <span class="mono" style="font-size:13px;">${o.id}</span>
          <span class="mono" style="font-size:13px;">${fmt(o.total)}</span>
        </div>
        <div style="font-size:13px; color:var(--ivory-dim); margin:4px 0;">${o.items.map(i=>i.name).join(', ')}</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:var(--ivory-faint);">${o.date}</span>
          <span class="status-dot ${o.status==='delivered'?'ok':'pending'}">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span>
        </div>
      </div>
    </div>`).join('');
  lucide.createIcons();
}
function openOrderTrack(orderId){
  const o = STATE.dashOrders.find(x=>x.id===orderId);
  const stages = ['processing','shipped','out_for_delivery','delivered'];
  const stageLabels = ['Order Placed','Shipped','Out for Delivery','Delivered'];
  const currentIdx = o.status==='processing'?0 : o.status==='shipped'?1 : o.status==='delivered'?3:2;
  $('#mainView').insertAdjacentHTML('beforeend', `
    <div class="modal-overlay open" id="trackModal" onclick="if(event.target===this) this.remove()">
      <div class="modal-box card-panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 class="lux-serif" style="font-size:20px;">Order ${o.id}</h3>
          <button class="btn-icon" onclick="document.getElementById('trackModal').remove()">${icon('x',16)}</button>
        </div>
        <p style="font-size:12px; color:var(--ivory-faint); margin-bottom:24px;">Placed ${o.date} · ${fmt(o.total)}</p>
        <div class="track-rail">
          ${stageLabels.map((l,i)=>`<div class="track-node ${i<currentIdx?'done':i===currentIdx?'active':''}"><div class="track-dot">${i<currentIdx?icon('check',11):''}</div><span class="track-label">${l}</span></div>`).join('')}
        </div>
        <div class="card-panel" style="padding:16px; background:var(--sand); margin-top:8px;">
          <p style="font-size:13px; color:var(--ink-light);">Status: <strong style="color:var(--ink);">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</strong></p>
        </div>
      </div>
    </div>`);
  lucide.createIcons();
}

function renderWishlistGrid(){
  const grid = $('#wishlistGrid');
  if(!grid) return;
  const items = STATE.allProducts.filter(p=>STATE.wishlist.includes(p.id));
  if(items.length===0){ grid.innerHTML=''; grid.parentElement.insertAdjacentHTML('beforeend', `<div class="empty-state" id="wishEmpty">${icon('heart',40)}<h3>Nothing saved yet</h3><p>Tap the heart on any piece to save it here.</p><button class="btn btn-outline" onclick="navigate('catalog','all')">Browse the Collection</button></div>`); lucide.createIcons(); return; }
  $('#wishEmpty')?.remove();
  grid.innerHTML = items.map(renderProductCard).join('');
}

function initDashboardInteractions(panel){
  renderOrderList(STATE.dashOrders);
  renderWishlistGrid();
  renderCartBadge();
}
