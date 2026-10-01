/* ============ ADMIN DASHBOARD ============ */
const ADMIN_NAV = [
  { id:'overview', label:'Overview', icon:'layout-dashboard' },
  { id:'products', label:'Products', icon:'package' },
  { id:'orders', label:'Orders', icon:'receipt' },
  { id:'customers', label:'Customers', icon:'users' },
  { id:'analytics', label:'Analytics', icon:'bar-chart-3' },
  { id:'promos', label:'Discounts', icon:'ticket-percent' },
];

async function renderAdmin(panel){
  const content = await renderAdminPanel(panel);
  return `
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <a href="#" class="brand" style="margin-bottom:32px; padding:0 8px;" onclick="navigate('home'); return false;"><span class="brand-mark">N</span><span class="brand-name" style="font-size:16px;">MAISON <b>NOIR</b></span></a>
      ${ADMIN_NAV.map(n=>`<a href="#" class="dash-nav-link ${panel===n.id?'active':''}" onclick="navigate('admin','${n.id}'); return false;">${icon(n.icon,17)} ${n.label}</a>`).join('')}
      <a href="#" class="dash-nav-link" style="margin-top:24px; border-top:1px solid var(--hairline); padding-top:18px;" onclick="navigate('home'); return false;">${icon('arrow-left',17)} Exit Admin</a>
    </aside>
    <main class="admin-main">
      <div class="admin-topbar">
        <div><span class="eyebrow">Admin · Atelier Console</span><h1 class="lux-serif" style="font-size:26px; margin-top:6px;">${ADMIN_NAV.find(n=>n.id===panel)?.label}</h1></div>
        <div style="display:flex; align-items:center; gap:14px;">
          <span class="badge-dot-online"></span><span style="font-size:12px; color:var(--ivory-faint);">All systems normal</span>
          <div class="dash-avatar" style="width:38px;height:38px;font-size:14px;">${STATE.user?.initials || 'A'}</div>
        </div>
      </div>
      <div id="adminContent">${content}</div>
    </main>
  </div>`;
}

async function renderAdminPanel(panel){
  if(panel==='overview') return await renderAdminOverview();
  if(panel==='products') return renderAdminProducts();
  if(panel==='orders') return await renderAdminOrders();
  if(panel==='customers') return await renderAdminCustomers();
  if(panel==='analytics') return renderAdminAnalytics();
  if(panel==='promos') return await renderAdminPromos();
  return await renderAdminOverview();
}

async function renderAdminOverview(){
  const stats = await api.getAdminStats();
  const orders = await api.getAdminOrders();
  STATE.adminOrders = orders;
  return `
  <div class="admin-grid-4">
    <div class="stat-card"><div class="stat-label">Revenue (30d)</div><div class="stat-value mono">${fmt(Math.round(stats.revenue_30d))}</div></div>
    <div class="stat-card"><div class="stat-label">Orders</div><div class="stat-value mono">${stats.orders_count}</div></div>
    <div class="stat-card"><div class="stat-label">Avg. Order Value</div><div class="stat-value mono">${fmt(Math.round(stats.avg_order_value))}</div></div>
    <div class="stat-card"><div class="stat-label">Customers</div><div class="stat-value mono">${stats.customers_count}</div></div>
  </div>
  <div class="admin-chart-card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
      <h3 style="font-size:15px; font-weight:600;">Recent Orders</h3>
      <button class="btn btn-outline btn-sm" onclick="navigate('admin','orders')">View All</button>
    </div>
    <table class="lux-table">
      <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>${orders.slice(0,5).map(o=>`
        <tr><td class="mono">${o.id}</td><td>${o.customer}</td><td>${o.date}</td><td>${o.items}</td><td class="mono">${fmt(o.total)}</td>
        <td><span class="status-dot ${o.status==='delivered'?'ok':o.status==='cancelled'?'alert':'pending'}">${o.status}</span></td></tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function renderAdminProducts(){
  return `
  <div style="display:flex; justify-content:space-between; margin-bottom:20px; gap:12px; flex-wrap:wrap;">
    <input class="field-input" style="max-width:320px;" placeholder="Search products…" oninput="filterAdminProducts(this.value)">
    <button class="btn btn-primary btn-sm" onclick="showToast('Not available','Adding products isn\\'t supported in this preview.','info')">${icon('plus',14)} Add Product</button>
  </div>
  <div class="card-panel" style="padding:0; overflow-x:auto;">
    <table class="lux-table">
      <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
      <tbody id="adminProductsBody">
        ${STATE.allProducts.map(p=>`
          <tr>
            <td style="display:flex; align-items:center; gap:12px;"><img src="${p.img}" class="row-img"><span>${p.name}</span></td>
            <td class="mono" style="font-size:11px;">${p.sku}</td>
            <td>${findCategory(p.cat)?.name}</td>
            <td class="mono">${fmt(p.price)}</td>
            <td><span class="status-dot ${p.stock<8?'pending':'ok'}">${p.stock} units</span></td>
            <td>${p.rating} ★</td>
            <td><button class="btn-icon" style="width:34px;height:34px;" onclick="showToast('Not available','Editing products isn\\'t supported in this preview.','info')">${icon('pencil',14)}</button></td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function filterAdminProducts(q){
  const rows = $all('#adminProductsBody tr');
  rows.forEach(r=>{ r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none'; });
}

async function renderAdminOrders(){
  const orders = await api.getAdminOrders();
  STATE.adminOrders = orders;
  return `
  <div class="tab-strip">
    <span class="tab-strip-item active" onclick="filterAdminOrders('all',this)">All</span>
    <span class="tab-strip-item" onclick="filterAdminOrders('pending',this)">Pending</span>
    <span class="tab-strip-item" onclick="filterAdminOrders('shipped',this)">Shipped</span>
    <span class="tab-strip-item" onclick="filterAdminOrders('delivered',this)">Delivered</span>
    <span class="tab-strip-item" onclick="filterAdminOrders('cancelled',this)">Cancelled</span>
  </div>
  <div class="card-panel" style="padding:0; overflow-x:auto;">
    <table class="lux-table">
      <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody id="adminOrdersBody">${adminOrderRows(orders)}</tbody>
    </table>
  </div>`;
}
function adminOrderRows(list){
  return list.map(o=>`
    <tr>
      <td class="mono">${o.id}</td><td>${o.customer}</td><td>${o.date}</td><td>${o.items}</td><td class="mono">${fmt(o.total)}</td>
      <td><span class="status-dot ${o.status==='delivered'?'ok':o.status==='cancelled'?'alert':'pending'}">${o.status}</span></td>
      <td><button class="btn btn-outline btn-sm" onclick="showToast('Not available','Updating order status isn\\'t supported in this preview.','info')">Update</button></td>
    </tr>`).join('');
}
function filterAdminOrders(status, el){
  $all('.tab-strip-item').forEach(t=>t.classList.remove('active')); el.classList.add('active');
  const list = status==='all' ? STATE.adminOrders : STATE.adminOrders.filter(o=>o.status===status);
  $('#adminOrdersBody').innerHTML = adminOrderRows(list);
}

async function renderAdminCustomers(){
  const customers = await api.getAdminCustomers();
  return `
  <div class="card-panel" style="padding:0; overflow-x:auto;">
    <table class="lux-table">
      <thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Lifetime Spend</th></tr></thead>
      <tbody>${customers.map(c=>`
        <tr>
          <td style="display:flex; align-items:center; gap:12px;"><div class="dash-avatar" style="width:34px;height:34px;font-size:12px;">${c.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>${c.name}</td>
          <td style="color:var(--ivory-dim);">${c.email}</td><td>${c.orders}</td><td class="mono">${fmt(c.spent)}</td>
        </tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function renderAdminAnalytics(){
  return `
  <div class="card-panel" style="padding:16px 20px; margin-bottom:20px; font-size:12px; color:var(--ivory-faint);">
    ${icon('info',14)} Illustrative figures — engagement analytics aren't tracked by the backend in this preview.
  </div>
  <div class="admin-grid-4">
    <div class="stat-card"><div class="stat-label">Traffic (30d)</div><div class="stat-value mono">48.2k</div></div>
    <div class="stat-card"><div class="stat-label">Cart Abandonment</div><div class="stat-value mono">61%</div></div>
    <div class="stat-card"><div class="stat-label">Repeat Purchase</div><div class="stat-value mono">34%</div></div>
    <div class="stat-card"><div class="stat-label">Returns Rate</div><div class="stat-value mono">2.1%</div></div>
  </div>`;
}

async function renderAdminPromos(){
  const promos = await api.getAdminPromos();
  return `
  <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
    <p style="color:var(--ivory-dim); font-size:13px;">Active promo codes and redemption performance.</p>
    <button class="btn btn-primary btn-sm" onclick="showToast('Not available','Creating promo codes isn\\'t supported in this preview.','info')">${icon('plus',14)} Create Code</button>
  </div>
  <div class="card-panel" style="padding:0; overflow-x:auto;">
    <table class="lux-table">
      <thead><tr><th>Code</th><th>Description</th><th>Redemptions</th><th>Status</th></tr></thead>
      <tbody>${promos.map(p=>`
        <tr><td class="mono">${p.code}</td><td>${p.description}</td><td>${p.uses}</td>
        <td><span class="status-dot ${p.status==='active'?'ok':'alert'}">${p.status}</span></td></tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function initAdminInteractions(panel){}
