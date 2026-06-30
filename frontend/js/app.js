/* ============================================================
   MAISON NOIR — Frontend Application Logic
   Talks to the FastAPI backend via api.js. STATE.categories and
   STATE.allProducts are populated from the server at boot.
   ============================================================ */

const DECOR_IMG = {
  bag1:'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=700&q=80',
  bag2:'https://images.unsplash.com/photo-1559563458-527698bf5295?w=700&q=80',
  heroPortrait:'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=85',
  collA:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',
  collB:'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80',
  collC:'https://images.unsplash.com/photo-1592945403407-9caf930b2c8e?w=900&q=80',
  collD:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80',
};

let STATE = {
  user: null,
  categories: [],
  allProducts: [],
  cart: [],
  wishlist: [],
  filters: { cat:'all', sort:'featured', price:6000, search:'' },
  currentProduct: null,
  currentReviews: [],
  checkoutStep: 1,
  toastId: 0,
  view: null,
  param: null,
};

function fmt(n){ return '$' + Number(n).toLocaleString('en-US'); }
function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return [...root.querySelectorAll(sel)]; }
function icon(name, size=18){ return `<i data-lucide="${name}" style="width:${size}px;height:${size}px"></i>`; }
function stars(rating){
  let s = '';
  for(let i=1;i<=5;i++){
    s += i <= Math.round(rating) ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }
  return s;
}

function showToast(title, body, type='success'){
  const stack = $('#toastStack');
  if(!stack) return;
  const id = 't' + (++STATE.toastId);
  const el = document.createElement('div');
  el.className = 'toast'; el.id = id;
  const iconName = type==='success' ? 'check' : type==='error' ? 'alert-circle' : 'sparkles';
  el.innerHTML = `
    <div class="toast-icon ${type}">${icon(iconName, 16)}</div>
    <div><div class="toast-title">${title}</div><div class="toast-body">${body}</div></div>
    <button class="toast-close" onclick="dismissToast('${id}')">${icon('x',14)}</button>`;
  stack.appendChild(el);
  lucide.createIcons();
  setTimeout(()=>dismissToast(id), 4200);
}
function dismissToast(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('leaving');
  setTimeout(()=>el.remove(), 350);
}

function findProduct(id){ return STATE.allProducts.find(p=>p.id===id); }
function findCategory(id){ return STATE.categories.find(c=>c.id===id); }

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
      <div><div style="font-size:14px;">${p.name}</div><div class="mono" style="font-size:12px;color:var(--ivory-faint)">${fmt(p.price)}</div></div>
    </div>`).join('') || (q.length ? '<p style="color:var(--ivory-faint); padding:12px;">No pieces found. Try "watch" or "leather."</p>' : '');
}

/* ============ App Chrome ============ */
function renderChrome(){
  return `
  <div class="utility-bar">
    <div class="container">
      <span>Complimentary shipping over $500 &nbsp;·&nbsp; Crafted in small runs</span>
      <div class="ut-right">
        <a href="#" onclick="return false;">Track Order</a>
        <a href="#" onclick="return false;">Our Ateliers</a>
        <a href="#" onclick="return false;">EN / USD</a>
      </div>
    </div>
  </div>

  <nav class="navbar">
    <div class="container">
      <a href="#" class="brand" onclick="navigate('home'); return false;">
        <span class="brand-mark">N</span>
        <span class="brand-name">MAISON <b>NOIR</b></span>
      </a>
      <div class="nav-links">
        <div class="nav-item">
          <a href="#" class="nav-link" onclick="navigate('catalog','all'); return false;">Shop ${icon('chevron-down',13)}</a>
          <div class="mega-menu glass">
            <div class="mega-grid">
              <div class="mega-col">
                <div class="mega-col-title">Categories</div>
                ${STATE.categories.map(c=>`<a href="#" onclick="navigate('catalog','${c.id}'); return false;">${c.name}</a>`).join('')}
                <a href="#" onclick="navigate('catalog','all'); return false;" style="color:var(--copper-bright); margin-top:8px;">View All →</a>
              </div>
              <div class="mega-col">
                <div class="mega-col-title">Edits</div>
                <a href="#" onclick="navigate('catalog','all'); return false;">New Arrivals</a>
                <a href="#" onclick="navigate('catalog','all'); return false;">Best Sellers</a>
                <a href="#" onclick="navigate('catalog','all'); return false;">The Sale Room</a>
                <a href="#" onclick="navigate('catalog','all'); return false;">Gifting</a>
              </div>
              <div class="mega-col">
                <div class="mega-feature">
                  <img src="${DECOR_IMG.collA}" alt="Featured collection">
                  <div class="mega-feature-label">The Atelier Edit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a href="#" class="nav-link" onclick="navigate('catalog','all'); return false;">New Arrivals</a>
        <a href="#" class="nav-link" onclick="navigate('dashboard','orders'); return false;">Track Order</a>
        <a href="#" class="nav-link" onclick="navigate('about'); return false;">The House</a>
      </div>
      <div class="nav-actions">
        <button class="btn-icon" onclick="toggleSearch(true)" aria-label="Search">${icon('search',18)}</button>
        <button class="btn-icon" onclick="navigate('dashboard','wishlist')" aria-label="Wishlist" style="position:relative;">${icon('heart',18)}<span class="nav-badge" id="wishBadge" style="display:none;">0</span></button>
        <button class="btn-icon" onclick="navigate('account')" aria-label="Account">${icon('user',18)}</button>
        <button class="btn-icon" onclick="toggleCart(true)" aria-label="Shopping bag" style="position:relative;">${icon('shopping-bag',18)}<span class="nav-badge" id="cartBadge" style="display:none;">0</span></button>
        <button class="btn-icon hamburger" onclick="toggleMobileNav(true)" aria-label="Menu">${icon('menu',18)}</button>
      </div>
    </div>
  </nav>

  <div class="drawer-overlay" id="drawerOverlay1" onclick="toggleMobileNav(false)"></div>
  <div class="drawer" id="mobileDrawer">
    <div class="drawer-head">
      <span class="brand-name" style="font-size:18px;">Menu</span>
      <button class="btn-icon" onclick="toggleMobileNav(false)">${icon('x',16)}</button>
    </div>
    ${STATE.categories.map(c=>`<a href="#" class="drawer-link" onclick="toggleMobileNav(false); navigate('catalog','${c.id}'); return false;">${c.name} ${icon('arrow-up-right',14)}</a>`).join('')}
    <a href="#" class="drawer-link" onclick="toggleMobileNav(false); navigate('dashboard','orders'); return false;">Track Order</a>
    <a href="#" class="drawer-link" onclick="toggleMobileNav(false); navigate('account'); return false;">Account</a>
    <a href="#" class="drawer-link" onclick="toggleMobileNav(false); navigate('admin'); return false;">Admin Dashboard</a>
  </div>

  <div class="drawer-overlay" id="drawerOverlay2" onclick="toggleCart(false)"></div>
  <div class="cart-drawer" id="cartDrawer">
    <div class="cart-head">
      <span style="font-family:var(--font-display); font-size:19px;">Your Bag</span>
      <button class="btn-icon" onclick="toggleCart(false)">${icon('x',16)}</button>
    </div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-foot">
      <div class="cart-row"><span>Subtotal</span><span class="mono" id="cartSubtotal">$0</span></div>
      <div class="cart-row"><span>Shipping</span><span class="mono" id="cartShipping">Complimentary</span></div>
      <div class="cart-row total"><span>Total</span><span class="mono" id="cartTotal">$0</span></div>
      <button class="btn btn-primary btn-block" style="margin-top:18px;" onclick="toggleCart(false); navigate('checkout')">Proceed to Checkout</button>
      <button class="btn btn-ghost btn-block" style="margin-top:6px;" onclick="toggleCart(false)">Continue Browsing</button>
    </div>
  </div>

  <div class="search-overlay" id="searchOverlay">
    <button class="btn-icon search-close" style="position:absolute; top:28px; right:28px;" onclick="toggleSearch(false)">${icon('x',20)}</button>
    <div class="search-box">
      <div class="search-input-row">
        ${icon('search',24)}
        <input type="text" id="searchInput" class="search-input" placeholder="Search the maison…" oninput="runSearch(this.value)" autocomplete="off">
      </div>
      <div class="search-suggest">
        <div class="search-suggest-label">Popular Searches</div>
        <span class="search-chip" onclick="$('#searchInput').value='tote'; runSearch('tote')">Tote bags</span>
        <span class="search-chip" onclick="$('#searchInput').value='watch'; runSearch('watch')">Timepieces</span>
        <span class="search-chip" onclick="$('#searchInput').value='fragrance'; runSearch('fragrance')">Fragrance</span>
        <span class="search-chip" onclick="$('#searchInput').value='gift'; runSearch('gift')">Gifting under $300</span>
      </div>
      <div class="search-results" id="searchResults"></div>
    </div>
  </div>

  <div class="toast-stack" id="toastStack"></div>

  <main id="mainView"></main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="brand" style="margin-bottom:16px;"><span class="brand-mark">N</span><span class="brand-name">MAISON <b>NOIR</b></span></div>
          <p style="color:var(--ivory-dim); font-size:13px; max-width:280px; line-height:1.7;">Considered objects, made in small runs across three ateliers. Founded 2014.</p>
        </div>
        <div class="footer-col"><h4>Shop</h4>
          ${STATE.categories.slice(0,4).map(c=>`<a href="#" onclick="navigate('catalog','${c.id}'); return false;">${c.name}</a>`).join('')}
        </div>
        <div class="footer-col"><h4>Client Care</h4>
          <a href="#" onclick="return false;">Shipping &amp; Returns</a>
          <a href="#" onclick="return false;">Size Guide</a>
          <a href="#" onclick="navigate('dashboard','orders'); return false;">Track an Order</a>
          <a href="#" onclick="return false;">Contact</a>
        </div>
        <div class="footer-col"><h4>The House</h4>
          <a href="#" onclick="navigate('about'); return false;">Our Story</a>
          <a href="#" onclick="return false;">Ateliers</a>
          <a href="#" onclick="navigate('admin'); return false;">Admin Dashboard</a>
          <a href="#" onclick="return false;">Careers</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Maison Noir. All rights reserved.</span>
        <span>Crafted with restraint, in charcoal and copper.</span>
      </div>
    </div>
  </footer>
  `;
}

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

/* ============ HOME / LANDING ============ */
function renderHome(){
  const featured = STATE.allProducts.filter(p=>p.isNew).slice(0,4);
  const bestSellers = [...STATE.allProducts].sort((a,b)=>b.reviews-a.reviews).slice(0,4);
  return `
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="container">
      <div class="hero-content">
        <div>
          <div class="hero-eyebrow"><span class="eyebrow">Spring Collection — No. 14</span></div>
          <h1>Objects worth <em>keeping</em>,<br>not just owning.</h1>
          <p class="hero-sub">Leather goods, timepieces, and fragrance made in small runs across three ateliers. Every piece is numbered. Nothing is reordered twice the same way.</p>
          <div class="hero-cta-row">
            <button class="btn btn-primary" onclick="navigate('catalog','all')">Shop the Collection ${icon('arrow-right',15)}</button>
            <button class="btn btn-outline" onclick="navigate('about')">Our Story</button>
          </div>
          <div class="hero-stats">
            <div><div class="hero-stat-num">12,400+</div><div class="hero-stat-label">Pieces in circulation</div></div>
            <div><div class="hero-stat-num">3</div><div class="hero-stat-label">Ateliers worldwide</div></div>
            <div><div class="hero-stat-num">4.8/5</div><div class="hero-stat-label">From 2,100 reviews</div></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-visual-frame"><img src="${DECOR_IMG.heroPortrait}" alt="Model wearing the Almeida Tote"></div>
          <div class="hero-float-card glass">
            <div class="fc-icon">${icon('badge-check',18)}</div>
            <div><div class="fc-title">Lifetime Repair</div><div class="fc-sub">Every piece, every era</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="marquee-strip">
    <div class="marquee-track">
      ${Array(2).fill('<span>Free Shipping Over $500</span><span>Numbered Editions</span><span>Lifetime Repair Guarantee</span><span>Made in Small Runs</span><span>Three Ateliers</span>').join('')}
    </div>
  </div>

  <section class="container" style="padding:100px 0 80px;">
    <div class="section-head">
      <div><span class="eyebrow">Curated for the season</span><h2>Featured Collections</h2></div>
      <p>Three rooms, three moods — chosen by our atelier directors this month.</p>
    </div>
    <div class="collection-grid">
      <div class="collection-tile" onclick="navigate('catalog','leather')">
        <img src="${DECOR_IMG.collA}" alt="Leather goods collection"><div class="collection-overlay"><div class="ceyebrow">01 · Leather</div><h3>The Atelier Edit</h3></div>
      </div>
      <div class="collection-tile" onclick="navigate('catalog','timepiece')">
        <img src="${DECOR_IMG.collB}" alt="Timepiece collection"><div class="collection-overlay"><div class="ceyebrow">02 · Timepieces</div><h3>Solane Collection</h3></div>
      </div>
      <div class="collection-tile" onclick="navigate('catalog','fragrance')">
        <img src="${DECOR_IMG.collC}" alt="Fragrance collection"><div class="collection-overlay"><div class="ceyebrow">03 · Fragrance</div><h3>Noir de Cuir</h3></div>
      </div>
      <div class="collection-tile" onclick="navigate('catalog','jewelry')">
        <img src="${DECOR_IMG.collD}" alt="Jewelry collection"><div class="collection-overlay"><div class="ceyebrow">04 · Jewelry</div><h3>Ferro Line</h3></div>
      </div>
    </div>
  </section>

  <section class="container" style="padding:60px 0 100px;">
    <div class="section-head">
      <div><span class="eyebrow">Newly arrived</span><h2>This Season's Arrivals</h2></div>
      <button class="btn btn-outline btn-sm" onclick="navigate('catalog','all')">View All</button>
    </div>
    <div class="product-grid">${featured.map(renderProductCard).join('')}</div>
  </section>

  <section style="background:var(--charcoal-raised); border-top:1px solid var(--hairline); border-bottom:1px solid var(--hairline); padding:90px 0;">
    <div class="container" style="display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center;">
      <div>
        <span class="eyebrow">From the Atelier Journal</span>
        <h2 class="lux-serif" style="font-size:clamp(26px,3.4vw,38px); margin-top:12px; line-height:1.3;">"We measure success in repairs requested, not units replaced."</h2>
        <p style="color:var(--ivory-dim); margin-top:20px; line-height:1.7; max-width:480px;">Every Maison Noir piece ships with a lifetime repair card. Send it back in twenty years — we'll still have the pattern.</p>
        <button class="btn btn-burgundy" style="margin-top:28px;" onclick="navigate('about')">Read Our Philosophy</button>
      </div>
      <div class="hero-visual-frame" style="aspect-ratio:5/4;"><img src="${DECOR_IMG.bag2}" alt="Craftsmanship detail"></div>
    </div>
  </section>

  <section class="container" style="padding:100px 0 60px;">
    <div class="section-head">
      <div><span class="eyebrow">Most loved</span><h2>Best Sellers</h2></div>
      <p>Chosen by repeat orders, not algorithms.</p>
    </div>
    <div class="product-grid">${bestSellers.map(renderProductCard).join('')}</div>
  </section>

  <section class="container" style="padding:40px 0 100px;">
    <div class="glass" style="padding:60px; text-align:center; border-radius:var(--radius-xl); background: linear-gradient(135deg, rgba(92,26,27,0.15), rgba(168,117,74,0.08));">
      <span class="eyebrow">Join the atelier list</span>
      <h2 class="lux-serif" style="font-size:clamp(24px,3vw,34px); margin:14px 0 10px;">First access to numbered editions</h2>
      <p style="color:var(--ivory-dim); margin-bottom:28px;">No noise — one dispatch a month, when there's something worth saying.</p>
      <form style="display:flex; gap:12px; max-width:420px; margin:0 auto; flex-wrap:wrap;" onsubmit="event.preventDefault(); showToast('Welcome to the list', 'Check your inbox for a confirmation.', 'success'); this.reset();">
        <input type="email" required placeholder="you@email.com" class="field-input" style="flex:1; min-width:200px;">
        <button class="btn btn-primary" type="submit">Subscribe</button>
      </form>
    </div>
  </section>
  `;
}
function initHomeAnimations(){ /* reserved for future scroll-reveal hooks */ }

/* ============ Product Card (shared) ============ */
function renderProductCard(p){
  const isFav = STATE.wishlist.includes(p.id);
  return `
  <div class="product-card foil-emboss">
    <div class="product-media" onclick="navigate('product','${p.id}')">
      ${p.isNew ? '<span class="product-tag new">New</span>' : p.was ? '<span class="product-tag sale">Sale</span>' : ''}
      <button class="product-fav ${isFav?'active':''}" data-fav="${p.id}" onclick="event.stopPropagation(); toggleWishlist('${p.id}')">${icon('heart',16)}</button>
      <img class="img-front" src="${p.img}" alt="${p.name}">
      <img class="img-back" src="${p.img2}" alt="">
      <div class="product-quick-add" onclick="event.stopPropagation(); addToCart('${p.id}')">Quick Add</div>
    </div>
    <div class="product-info" onclick="navigate('product','${p.id}')">
      <div class="product-cat">${findCategory(p.cat)?.name || p.cat}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price-row">
        <span class="product-price">${fmt(p.price)}</span>
        ${p.was ? `<span class="product-price was">${fmt(p.was)}</span>` : ''}
      </div>
      <div class="product-swatches">${p.colors.map(c=>`<span class="swatch" style="background:${c}"></span>`).join('')}</div>
    </div>
  </div>`;
}

/* ============ CATALOG ============ */
function renderCatalog(catParam){
  STATE.filters.cat = catParam;
  return `
  <section class="container" style="padding:48px 0 100px;">
    <div style="margin-bottom:8px;"><span class="eyebrow">The Full Collection</span></div>
    <div class="section-head">
      <div><h2 id="catalogTitle">${catParam==='all' ? 'All Pieces' : findCategory(catParam)?.name}</h2></div>
      <div style="display:flex; gap:10px; align-items:center;">
        <span class="mono" style="font-size:12px; color:var(--ivory-faint);" id="resultCount"></span>
        <select class="field-select" style="width:auto; padding:10px 14px;" id="sortSelect" onchange="applyFilters()">
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="new">Newest</option>
        </select>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:240px 1fr; gap:40px; align-items:flex-start;">
      <aside style="position:sticky; top:110px;">
        <div class="card-panel" style="padding:24px;">
          <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--ivory-faint); margin-bottom:16px;">Category</div>
          <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:28px;">
            <button class="dash-nav-link cat-filter-btn ${catParam==='all'?'active':''}" data-cat="all" onclick="filterByCat('all')" style="text-align:left; width:100%;">All Pieces</button>
            ${STATE.categories.map(c=>`<button class="dash-nav-link cat-filter-btn ${catParam===c.id?'active':''}" data-cat="${c.id}" onclick="filterByCat('${c.id}')" style="text-align:left; width:100%;">${c.name}</button>`).join('')}
          </div>
          <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--ivory-faint); margin-bottom:16px;">Max Price</div>
          <input type="range" id="priceSlider" min="100" max="4500" value="4500" style="width:100%; accent-color:var(--copper); margin-bottom:8px;" oninput="$('#priceLabel').textContent=fmt(this.value); applyFilters()">
          <div class="mono" id="priceLabel" style="font-size:13px; color:var(--copper-bright); margin-bottom:28px;">$4,500</div>
          <div style="font-family:var(--font-mono); font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:var(--ivory-faint); margin-bottom:14px;">Availability</div>
          <label class="checkbox-row" style="margin-bottom:10px; font-size:13px;"><input type="checkbox" id="inStockOnly" onchange="applyFilters()"> In stock only</label>
          <label class="checkbox-row" style="font-size:13px;"><input type="checkbox" id="onSaleOnly" onchange="applyFilters()"> On sale</label>
        </div>
      </aside>

      <div>
        <div id="catalogGrid" class="product-grid"></div>
        <div id="catalogEmpty" style="display:none;" class="empty-state">
          ${icon('search-x',48)}<h3>Nothing matches that, yet</h3><p>Try widening your price range or clearing a filter.</p>
          <button class="btn btn-outline" onclick="filterByCat('all')">Clear Filters</button>
        </div>
      </div>
    </div>
  </section>`;
}

function filterByCat(catId){
  STATE.filters.cat = catId;
  $all('.cat-filter-btn').forEach(b=>b.classList.toggle('active', b.dataset.cat===catId));
  $('#catalogTitle').textContent = catId==='all' ? 'All Pieces' : findCategory(catId)?.name;
  applyFilters();
}

async function applyFilters(){
  const grid = $('#catalogGrid');
  if(!grid) return;
  const params = {
    category: STATE.filters.cat !== 'all' ? STATE.filters.cat : undefined,
    max_price: Number($('#priceSlider')?.value || 4500),
    in_stock_only: $('#inStockOnly')?.checked || false,
    on_sale_only: $('#onSaleOnly')?.checked || false,
    sort: $('#sortSelect')?.value || 'featured',
  };
  let list;
  try{
    const res = await api.getProducts(params);
    list = res.items;
  } catch(err){
    showToast('Could not load products', err.message, 'error');
    return;
  }
  $('#resultCount').textContent = `${list.length} piece${list.length!==1?'s':''}`;
  if(list.length === 0){
    grid.style.display = 'none'; $('#catalogEmpty').style.display = 'block';
  } else {
    grid.style.display = 'grid'; $('#catalogEmpty').style.display = 'none';
    grid.innerHTML = list.map(renderProductCard).join('');
    lucide.createIcons();
  }
}
function initCatalogInteractions(){ applyFilters(); }

/* ============ PRODUCT DETAIL ============ */
async function renderProductDetail(id){
  const p = await api.getProduct(id);
  STATE.currentProduct = p.id;
  const revs = await api.getReviews(id);
  STATE.currentReviews = revs;
  const isFav = STATE.wishlist.includes(p.id);
  const related = STATE.allProducts.filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,4);
  const avgRating = p.rating;
  return `
  <section class="container" style="padding:36px 0 100px;">
    <div style="display:flex; gap:8px; font-size:12px; color:var(--ivory-faint); margin-bottom:32px; flex-wrap:wrap;">
      <a href="#" onclick="navigate('home'); return false;">Home</a> /
      <a href="#" onclick="navigate('catalog','${p.cat}'); return false;">${findCategory(p.cat)?.name}</a> /
      <span style="color:var(--ivory-dim);">${p.name}</span>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:60px;" id="pdpGrid">
      <div>
        <div class="hero-visual-frame" id="pdpMainImg" style="aspect-ratio:4/5; margin-bottom:14px;"><img src="${p.img}" alt="${p.name}"></div>
        <div style="display:flex; gap:12px;">
          <div class="hero-visual-frame" style="width:90px; aspect-ratio:4/5; cursor:pointer; border-color:var(--copper);" onclick="$('#pdpMainImg img').src='${p.img}'"><img src="${p.img}"></div>
          <div class="hero-visual-frame" style="width:90px; aspect-ratio:4/5; cursor:pointer;" onclick="$('#pdpMainImg img').src='${p.img2}'"><img src="${p.img2}"></div>
        </div>
      </div>

      <div>
        <div class="product-cat" style="font-size:11px;">${findCategory(p.cat)?.name} &nbsp;·&nbsp; <span class="mono">${p.sku}</span></div>
        <h1 class="lux-serif" style="font-size:clamp(28px,3.4vw,42px); margin:10px 0 14px;">${p.name}</h1>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:20px;">
          <span class="stars">${stars(avgRating)}</span>
          <span style="font-size:13px; color:var(--ivory-dim);">${avgRating} (${p.reviews} reviews)</span>
        </div>
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:24px;">
          <span class="mono" style="font-size:22px;">${fmt(p.price)}</span>
          ${p.was ? `<span class="mono" style="font-size:16px; color:var(--ivory-faint); text-decoration:line-through;">${fmt(p.was)}</span><span class="pill" style="background:var(--burgundy-bright); border-color:transparent; color:var(--ivory);">Save ${fmt(p.was-p.price)}</span>` : ''}
        </div>
        <p style="color:var(--ivory-dim); line-height:1.75; margin-bottom:28px; font-size:14.5px;">${p.description}</p>

        <div style="margin-bottom:24px;">
          <div class="field-label">Colorway</div>
          <div style="display:flex; gap:10px;" id="pdpSwatches">
            ${p.colors.map((c,i)=>`<span class="swatch ${i===0?'active':''}" style="width:28px;height:28px;background:${c};" onclick="selectVariant(this)"></span>`).join('')}
          </div>
        </div>

        <div style="margin-bottom:28px;">
          <div class="field-label">Quantity</div>
          <div class="qty-control" style="border-radius:8px;">
            <button onclick="pdpQty(-1)" style="width:40px;height:40px;">−</button>
            <span id="pdpQty" style="min-width:40px;">1</span>
            <button onclick="pdpQty(1)" style="width:40px;height:40px;">+</button>
          </div>
        </div>

        <div style="display:flex; gap:12px; margin-bottom:20px;">
          <button class="btn btn-primary" style="flex:1;" onclick="addToCart('${p.id}', {color: $('#pdpSwatches .active').style.background})">${icon('shopping-bag',15)} Add to Bag — ${fmt(p.price)}</button>
          <button class="btn-icon" style="width:54px;height:54px;" data-fav="${p.id}" class="product-fav ${isFav?'active':''}" onclick="toggleWishlist('${p.id}')">${icon('heart',20)}</button>
        </div>
        <p style="font-size:12px; color: ${p.stock < 8 ? 'var(--copper-bright)' : 'var(--ivory-faint)'};">${p.stock < 8 ? `Only ${p.stock} left in this colorway` : 'In stock — ships in 2–3 business days'}</p>

        <div class="seal-divider" style="margin:32px 0;"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

        <div class="tab-strip" id="pdpTabs">
          <span class="tab-strip-item active" data-tab="details" onclick="switchPdpTab('details')">Details</span>
          <span class="tab-strip-item" data-tab="materials" onclick="switchPdpTab('materials')">Materials &amp; Care</span>
          <span class="tab-strip-item" data-tab="shipping" onclick="switchPdpTab('shipping')">Shipping</span>
        </div>
        <div id="pdpTabContent" style="font-size:13.5px; color:var(--ivory-dim); line-height:1.8;">
          <p>${p.description}</p>
        </div>
      </div>
    </div>

    <div class="seal-divider" style="margin:80px 0 56px;"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

    <div style="display:grid; grid-template-columns:1fr 1.6fr; gap:60px;" id="reviewsSection">
      <div>
        <h2 class="lux-serif" style="font-size:28px; margin-bottom:18px;">Client Notes</h2>
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
          <div class="lux-serif" style="font-size:48px;">${avgRating}</div>
          <div><span class="stars">${stars(avgRating)}</span><div style="font-size:12px; color:var(--ivory-faint); margin-top:4px;">${p.reviews} verified reviews</div></div>
        </div>
        <button class="btn btn-outline btn-block" id="writeReviewBtn" onclick="toggleReviewForm()">Write a Review</button>
        <div id="reviewForm" style="display:none; margin-top:18px;">
          <div class="field-label">Your Rating</div>
          <div style="display:flex; gap:6px; margin-bottom:14px;" id="reviewStarsInput">
            ${[1,2,3,4,5].map(n=>`<span data-star="${n}" style="cursor:pointer; color:var(--ivory-faint);" onclick="setReviewRating(${n})">${icon('star',22)}</span>`).join('')}
          </div>
          <textarea class="field-input field-textarea" id="reviewText" placeholder="Share your experience with this piece…" maxlength="2000"></textarea>
          <button class="btn btn-primary btn-block" style="margin-top:12px;" onclick="submitReview('${p.id}')">Submit Review</button>
        </div>
      </div>
      <div id="reviewsList">
        ${revs.length ? revs.map(r=>`
          <div style="padding:22px 0; border-bottom:1px solid var(--hairline);">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <div><strong style="font-size:14px;">${r.name}</strong> ${r.verified ? `<span class="pill" style="font-size:10px; padding:3px 8px; margin-left:6px; border-color:var(--copper-dim); color:var(--copper-bright);">Verified</span>` : ''}</div>
              <span style="font-size:12px; color:var(--ivory-faint);">${r.date}</span>
            </div>
            <span class="stars" style="margin-bottom:8px; display:block;">${stars(r.rating)}</span>
            <p style="font-size:13.5px; color:var(--ivory-dim); line-height:1.7;">${r.text}</p>
          </div>`).join('') : `<p style="color:var(--ivory-faint);">No written reviews yet for this piece — the rating reflects verified buyers.</p>`}
      </div>
    </div>

    <div class="seal-divider" style="margin:80px 0 48px;"><span class="line"></span><span class="mark"></span><span class="line"></span></div>

    <div class="section-head"><div><span class="eyebrow">You May Also Like</span><h2>Pairs Well With</h2></div></div>
    <div class="product-grid">${related.map(renderProductCard).join('')}</div>
  </section>`;
}
function selectVariant(el){ $all('#pdpSwatches .swatch').forEach(s=>s.classList.remove('active')); el.classList.add('active'); }
function pdpQty(d){
  const el = $('#pdpQty'); let v = parseInt(el.textContent) + d;
  if(v < 1) v = 1; el.textContent = v;
}
function switchPdpTab(tab){
  $all('#pdpTabs .tab-strip-item').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  const p = findProduct(STATE.currentProduct) || {};
  const content = { details: p.description, materials: (p.materials || '') + ' Wipe clean with a dry cloth; avoid prolonged direct sun.', shipping: 'Ships in 2–3 business days from our Lisbon atelier. Complimentary shipping on orders over $500. Returns accepted within 30 days, unworn.' };
  $('#pdpTabContent').innerHTML = `<p>${content[tab]}</p>`;
}

let reviewRating = 5;
function toggleReviewForm(){
  if(!STATE.user){ showToast('Sign in required', 'Sign in to write a review.', 'error'); navigate('account'); return; }
  const form = $('#reviewForm');
  const open = form.style.display === 'none';
  form.style.display = open ? 'block' : 'none';
  if(open) setReviewRating(5);
}
function setReviewRating(n){
  reviewRating = n;
  $all('#reviewStarsInput [data-star]').forEach(el=>{
    el.style.color = Number(el.dataset.star) <= n ? 'var(--copper-bright)' : 'var(--ivory-faint)';
  });
}
async function submitReview(productId){
  const text = $('#reviewText').value.trim();
  if(!text){ showToast('Add a few words', 'Please write something before submitting.', 'error'); return; }
  try{
    await api.createReview(productId, { rating: reviewRating, text });
    showToast('Review submitted', 'Thank you for sharing your experience.', 'success');
    navigate('product', productId);
  } catch(err){
    showToast('Could not submit review', err.message, 'error');
  }
}
function initProductInteractions(){}

/* ============ CHECKOUT ============ */
function renderCheckout(){
  STATE.checkoutStep = 1;
  promoApplied = null;
  const sub = cartSubtotal();
  const shipping = sub > 500 || sub === 0 ? 0 : 24;
  const tax = Math.round(sub * 0.0775);
  const total = sub + shipping + tax;
  if(STATE.cart.length === 0){
    return `<section class="container" style="padding:100px 0;"><div class="empty-state">${icon('shopping-bag',48)}<h3>Your bag is empty</h3><p>Add a piece to begin checkout.</p><button class="btn btn-primary" onclick="navigate('catalog','all')">Browse the Collection</button></div></section>`;
  }
  const u = STATE.user || {};
  return `
  <section class="container" style="padding:48px 0 100px;">
    <h1 class="lux-serif" style="font-size:32px; margin-bottom:36px;">Checkout</h1>
    <div class="checkout-shell">
      <div>
        <div class="stepper">
          <div class="step active" id="step1Ind"><div class="step-num">1</div><div class="step-label">Shipping</div></div>
          <div class="step" id="step2Ind"><div class="step-num">2</div><div class="step-label">Payment</div></div>
          <div class="step" id="step3Ind"><div class="step-num">3</div><div class="step-label">Review</div></div>
        </div>

        <div class="checkout-panel active" id="panel1">
          <div class="card-panel" style="padding:32px;">
            <h3 class="lux-serif" style="font-size:20px; margin-bottom:24px;">Shipping Address</h3>
            <div class="field-row">
              <div class="field"><label class="field-label">First Name</label><input class="field-input" id="shipFirstName" required value="${u.first_name || ''}"></div>
              <div class="field"><label class="field-label">Last Name</label><input class="field-input" id="shipLastName" required value="${u.last_name || ''}"></div>
            </div>
            <div class="field"><label class="field-label">Address</label><input class="field-input" id="shipAddress" required placeholder="14 Rue de Varenne"></div>
            <div class="field-row">
              <div class="field"><label class="field-label">City</label><input class="field-input" id="shipCity" required placeholder="Paris"></div>
              <div class="field"><label class="field-label">Postal Code</label><input class="field-input" id="shipPostal" required placeholder="75007"></div>
            </div>
            <div class="field-row">
              <div class="field"><label class="field-label">Country</label><select class="field-select" id="shipCountry"><option>France</option><option>United States</option><option>United Kingdom</option><option>Egypt</option><option>UAE</option></select></div>
              <div class="field"><label class="field-label">Phone</label><input class="field-input" id="shipPhone" required placeholder="+33 6 12 34 56 78" value="${u.phone || ''}"></div>
            </div>
            <button class="btn btn-primary btn-block" onclick="goCheckoutStep(2)">Continue to Payment ${icon('arrow-right',14)}</button>
          </div>
        </div>

        <div class="checkout-panel" id="panel2">
          <div class="card-panel" style="padding:32px;">
            <h3 class="lux-serif" style="font-size:20px; margin-bottom:24px;">Payment Method</h3>
            <div class="payment-option active" data-method="card" onclick="selectPayment(this)"><input type="radio" name="pay" checked>${icon('credit-card',20)}<div><strong style="font-size:13px;">Credit / Debit Card</strong><div style="font-size:12px;color:var(--ivory-faint);">Visa, Mastercard, Amex via Stripe</div></div></div>
            <div class="payment-option" data-method="wallet" onclick="selectPayment(this)"><input type="radio" name="pay">${icon('wallet',20)}<div><strong style="font-size:13px;">Apple Pay / Google Pay</strong></div></div>
            <div class="payment-option" data-method="bank_transfer" onclick="selectPayment(this)"><input type="radio" name="pay">${icon('banknote',20)}<div><strong style="font-size:13px;">Bank Transfer</strong><div style="font-size:12px;color:var(--ivory-faint);">Allow 1–3 days to process</div></div></div>

            <div id="cardFields" style="margin-top:24px;">
              <div class="field"><label class="field-label">Card Number</label><input class="field-input mono" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242"></div>
              <div class="field-row">
                <div class="field"><label class="field-label">Expiry</label><input class="field-input mono" placeholder="MM/YY" value="09/29"></div>
                <div class="field"><label class="field-label">CVC</label><input class="field-input mono" placeholder="123" value="123"></div>
              </div>
            </div>
            <div style="margin-top:8px; margin-bottom:24px;">
              <div class="field-label">Promo Code</div>
              <div style="display:flex; gap:10px;">
                <input class="field-input" id="promoInput" placeholder="Enter code (try ATELIER10)">
                <button class="btn btn-outline btn-sm" onclick="applyPromo()">Apply</button>
              </div>
              <p class="field-hint" id="promoMsg"></p>
            </div>
            <div style="display:flex; gap:12px;">
              <button class="btn btn-outline" style="flex:1;" onclick="goCheckoutStep(1)">Back</button>
              <button class="btn btn-primary" style="flex:2;" onclick="goCheckoutStep(3)">Review Order ${icon('arrow-right',14)}</button>
            </div>
          </div>
        </div>

        <div class="checkout-panel" id="panel3">
          <div class="card-panel" style="padding:32px;">
            <h3 class="lux-serif" style="font-size:20px; margin-bottom:20px;">Review &amp; Place Order</h3>
            <p style="font-size:13px; color:var(--ivory-dim); margin-bottom:24px;" id="reviewSummaryText"></p>
            <label class="checkbox-row" style="margin-bottom:28px;"><input type="checkbox" id="agreeTerms" checked> I agree to the Terms of Sale and Return Policy</label>
            <div style="display:flex; gap:12px;">
              <button class="btn btn-outline" style="flex:1;" onclick="goCheckoutStep(2)">Back</button>
              <button class="btn btn-primary" style="flex:2;" id="placeOrderBtn" onclick="placeOrder()">${icon('lock',14)} Place Secure Order — <span id="finalTotalBtn">${fmt(total)}</span></button>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-card card-panel" style="padding:28px;">
        <h3 class="lux-serif" style="font-size:18px; margin-bottom:18px;">Order Summary</h3>
        ${STATE.cart.map(c=>`
          <div class="summary-line-item">
            <img src="${c.img}" alt="">
            <div style="flex:1;">
              <div style="font-size:13px; font-weight:500;">${c.name}</div>
              <div style="font-size:12px; color:var(--ivory-faint);">Qty ${c.qty}</div>
            </div>
            <span class="mono" style="font-size:13px;">${fmt(c.price*c.qty)}</span>
          </div>`).join('')}
        <div class="cart-row" style="margin-top:18px;"><span>Subtotal</span><span class="mono" id="sumSubtotal">${fmt(sub)}</span></div>
        <div class="cart-row"><span>Shipping</span><span class="mono" id="sumShip">${shipping===0?'Complimentary':fmt(shipping)}</span></div>
        <div class="cart-row"><span>Tax (est.)</span><span class="mono" id="sumTax">${fmt(tax)}</span></div>
        <div class="cart-row" id="sumDiscountRow" style="display:none; color:var(--success);"><span id="sumDiscountLabel">Promo</span><span class="mono" id="sumDiscount">-$0</span></div>
        <div class="cart-row total"><span>Total</span><span class="mono" id="sumTotal">${fmt(total)}</span></div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:20px; font-size:12px; color:var(--ivory-faint);">${icon('shield-check',15)} Secured by 256-bit SSL encryption</div>
      </div>
    </div>
  </section>`;
}
function goCheckoutStep(n){
  if(n===3){
    const u = STATE.user || {};
    const first = $('#shipFirstName').value || u.first_name;
    const last = $('#shipLastName').value || u.last_name;
    const addr = $('#shipAddress').value, city = $('#shipCity').value, postal = $('#shipPostal').value, country = $('#shipCountry').value, phone = $('#shipPhone').value;
    if(!addr || !city || !postal || !phone){ showToast('Missing details', 'Please complete your shipping address.', 'error'); goCheckoutStep(1); return; }
    const methodEl = $('.payment-option.active');
    const methodLabel = methodEl ? methodEl.querySelector('strong').textContent : 'Credit / Debit Card';
    $('#reviewSummaryText').textContent = `Shipping to ${first} ${last}, ${addr}, ${city} ${postal}, ${country}. Paying by ${methodLabel}.`;
  }
  STATE.checkoutStep = n;
  [1,2,3].forEach(i=>{
    $(`#panel${i}`).classList.toggle('active', i===n);
    const ind = $(`#step${i}Ind`);
    ind.classList.toggle('active', i===n);
    ind.classList.toggle('done', i<n);
  });
  window.scrollTo({top:200, behavior:'smooth'});
}
function selectPayment(el){
  $all('.payment-option').forEach(o=>o.classList.remove('active'));
  el.classList.add('active');
  $all('.payment-option input').forEach(i=>i.checked=false);
  el.querySelector('input').checked = true;
  $('#cardFields').style.display = el.dataset.method === 'card' ? 'block' : 'none';
}

let promoApplied = null;
function recalcCheckoutTotal(){
  const sub = cartSubtotal();
  const shipping = sub > 500 || sub === 0 ? 0 : 24;
  const tax = Math.round(sub * 0.0775);
  const discount = promoApplied ? Math.round(sub * (promoApplied.discount_percent / 100)) : 0;
  const total = sub + shipping + tax - discount;
  $('#sumSubtotal').textContent = fmt(sub);
  $('#sumShip').textContent = shipping===0 ? 'Complimentary' : fmt(shipping);
  $('#sumTax').textContent = fmt(tax);
  if(promoApplied){
    $('#sumDiscountRow').style.display = 'flex';
    $('#sumDiscountLabel').textContent = `Promo (${promoApplied.code})`;
    $('#sumDiscount').textContent = '-' + fmt(discount);
  } else {
    $('#sumDiscountRow').style.display = 'none';
  }
  $('#sumTotal').textContent = fmt(total);
  $('#finalTotalBtn').textContent = fmt(total);
  return total;
}
async function applyPromo(){
  const code = $('#promoInput').value.trim().toUpperCase();
  const msg = $('#promoMsg');
  if(!code) return;
  try{
    const res = await api.validatePromo(code);
    if(res.valid){
      promoApplied = { code: res.code, discount_percent: res.discount_percent };
      msg.style.color = 'var(--success)'; msg.textContent = res.message;
      recalcCheckoutTotal();
      showToast('Promo applied', res.message, 'success');
    } else {
      promoApplied = null;
      msg.style.color = 'var(--danger)'; msg.textContent = res.message;
      recalcCheckoutTotal();
    }
  } catch(err){
    msg.style.color = 'var(--danger)'; msg.textContent = err.message;
  }
}
async function placeOrder(){
  if(!$('#agreeTerms').checked){ showToast('One more step', 'Please agree to the Terms of Sale.', 'info'); return; }
  const methodEl = $('.payment-option.active');
  const payload = {
    items: STATE.cart.map(c => ({ product_id: c.id, color: c.color, qty: c.qty })),
    shipping_address: {
      first_name: $('#shipFirstName').value,
      last_name: $('#shipLastName').value,
      address: $('#shipAddress').value,
      city: $('#shipCity').value,
      postal_code: $('#shipPostal').value,
      country: $('#shipCountry').value,
      phone: $('#shipPhone').value,
    },
    payment_method: methodEl ? methodEl.dataset.method : 'card',
    promo_code: promoApplied ? promoApplied.code : null,
  };
  const btn = $('#placeOrderBtn');
  btn.disabled = true;
  let order;
  try{
    order = await api.createOrder(payload);
  } catch(err){
    btn.disabled = false;
    showToast('Could not place order', err.message, 'error');
    return;
  }
  STATE.cart = [];
  renderCartBadge();
  const main = $('#mainView');
  main.innerHTML = `
    <section class="container" style="padding:140px 0; text-align:center;">
      <div style="width:80px;height:80px;border-radius:50%;background:var(--burgundy); display:flex; align-items:center; justify-content:center; margin:0 auto 32px;">${icon('check',36)}</div>
      <h1 class="lux-serif" style="font-size:36px; margin-bottom:14px;">Your order is confirmed</h1>
      <p style="color:var(--ivory-dim); max-width:440px; margin:0 auto 8px;">Order <span class="mono" style="color:var(--copper-bright);">${order.id}</span> has been placed.</p>
      <p style="color:var(--ivory-faint); max-width:440px; margin:0 auto 36px; font-size:13px;">A confirmation has been sent to your email. You can track dispatch from your dashboard.</p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button class="btn btn-primary" onclick="navigate('dashboard','orders')">View Order</button>
        <button class="btn btn-outline" onclick="navigate('catalog','all')">Continue Shopping</button>
      </div>
    </section>`;
  lucide.createIcons();
  showToast('Order placed', 'Confirmation sent to your email', 'success');
}
function initCheckoutInteractions(){}

/* ============ AUTH ============ */
function renderAuth(){
  return `
  <section class="auth-shell">
    <div class="card-panel auth-card">
      <div style="text-align:center; margin-bottom:28px;">
        <span class="brand-mark" style="margin:0 auto 14px; display:flex;">N</span>
        <h1 class="lux-serif" style="font-size:24px;">Welcome to the House</h1>
        <p style="color:var(--ivory-faint); font-size:13px; margin-top:6px;">Sign in or open your account</p>
      </div>
      <div class="auth-tabs">
        <div class="auth-tab active" data-tab="login" onclick="switchAuthTab('login')">Sign In</div>
        <div class="auth-tab" data-tab="register" onclick="switchAuthTab('register')">Register</div>
      </div>

      <div id="authPanelLogin">
        <form onsubmit="event.preventDefault(); doLogin();">
          <div class="field"><label class="field-label">Email</label><input class="field-input" id="loginEmail" type="email" required placeholder="you@email.com" value="sofia.marin@example.com"></div>
          <div class="field">
            <label class="field-label">Password</label>
            <input class="field-input" id="loginPassword" type="password" required placeholder="••••••••" value="atelier2026">
          </div>
          <p class="field-hint" id="loginError" style="color:var(--danger); display:none;"></p>
          <button class="btn btn-primary btn-block" type="submit" id="loginBtn" style="margin-top:8px;">Sign In</button>
        </form>
        <p style="font-size:12px; color:var(--ivory-faint); margin-top:18px; text-align:center;">Demo accounts: sofia.marin@example.com / atelier2026 · admin@maisonnoir.com / admin123</p>
      </div>

      <div id="authPanelRegister" style="display:none;">
        <form onsubmit="event.preventDefault(); doRegister();">
          <div class="field-row">
            <div class="field"><label class="field-label">First Name</label><input class="field-input" id="regFirstName" required placeholder="Sofia"></div>
            <div class="field"><label class="field-label">Last Name</label><input class="field-input" id="regLastName" required placeholder="Marin"></div>
          </div>
          <div class="field"><label class="field-label">Email</label><input class="field-input" id="regEmail" type="email" required placeholder="you@email.com"></div>
          <div class="field"><label class="field-label">Password</label><input class="field-input" id="regPassword" type="password" required minlength="8" placeholder="At least 8 characters"></div>
          <p class="field-hint" id="registerError" style="color:var(--danger); display:none;"></p>
          <button class="btn btn-primary btn-block" type="submit" id="registerBtn" style="margin-top:8px;">Create Account</button>
        </form>
      </div>
    </div>
  </section>`;
}
function switchAuthTab(tab){
  $all('.auth-tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  ['login','register'].forEach(t=>$(`#authPanel${t.charAt(0).toUpperCase()+t.slice(1)}`).style.display = t===tab ? 'block':'none');
}

async function applySession(token){
  setToken(token);
  const user = await api.me();
  STATE.user = user;
  await syncWishlist();
  return user;
}
async function syncWishlist(){
  if(!STATE.user){ STATE.wishlist = []; return; }
  try{
    const res = await api.getWishlist();
    STATE.wishlist = res.product_ids;
  } catch(err){
    STATE.wishlist = [];
  }
}
async function restoreSession(){
  if(!getToken()) return;
  try{
    const user = await api.me();
    STATE.user = user;
    await syncWishlist();
  } catch(err){
    setToken(null);
    STATE.user = null;
  }
}
function logout(){
  setToken(null);
  STATE.user = null;
  STATE.wishlist = [];
  renderCartBadge();
  showToast('Signed out', 'You have been signed out.', 'info');
  navigate('home');
}

async function doLogin(){
  const btn = $('#loginBtn');
  const errEl = $('#loginError');
  errEl.style.display = 'none';
  btn.disabled = true;
  try{
    const res = await api.login({ email: $('#loginEmail').value, password: $('#loginPassword').value });
    const user = await applySession(res.access_token);
    renderCartBadge();
    showToast(`Welcome back, ${user.first_name}`, 'You are now signed in', 'success');
    navigate(user.is_admin ? 'admin' : 'dashboard', user.is_admin ? 'overview' : 'orders');
  } catch(err){
    errEl.textContent = err.message; errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
  }
}
async function doRegister(){
  const btn = $('#registerBtn');
  const errEl = $('#registerError');
  errEl.style.display = 'none';
  btn.disabled = true;
  try{
    const res = await api.register({
      first_name: $('#regFirstName').value,
      last_name: $('#regLastName').value,
      email: $('#regEmail').value,
      password: $('#regPassword').value,
    });
    const user = await applySession(res.access_token);
    renderCartBadge();
    showToast(`Welcome, ${user.first_name}`, 'Your account has been created', 'success');
    navigate('dashboard','orders');
  } catch(err){
    errEl.textContent = err.message; errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
  }
}
function initAuthInteractions(){}

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
        <div class="card-panel" style="padding:16px; background:rgba(247,241,232,0.03); margin-top:8px;">
          <p style="font-size:13px; color:var(--ivory-dim);">Status: <strong style="color:var(--ivory);">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</strong></p>
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

/* ============ ABOUT ============ */
function renderAbout(){
  return `
  <section class="container" style="padding:80px 0 60px; max-width:760px;">
    <span class="eyebrow">Founded 2014, Lisbon</span>
    <h1 class="lux-serif" style="font-size:clamp(32px,5vw,52px); margin:16px 0 28px; line-height:1.15;">We make fewer things, and stand behind every one of them.</h1>
    <p style="color:var(--ivory-dim); font-size:16px; line-height:1.8; margin-bottom:24px;">Maison Noir began as a single workbench in a converted tannery outside Lisbon, where our founder restored vintage trunks for collectors who couldn't find anyone left who knew how. That same workbench is still in use — now alongside two more, in Florence and Kyoto.</p>
    <p style="color:var(--ivory-dim); font-size:16px; line-height:1.8; margin-bottom:24px;">We don't chase seasons. A piece stays in the collection until we've made what we think is the best version of it, and then it's retired — numbered, documented, and repaired for free for as long as you own it.</p>
    <div class="hero-visual-frame" style="aspect-ratio:16/9; margin:48px 0;"><img src="${DECOR_IMG.collA}" alt="Atelier workbench"></div>
    <div class="seal-divider" style="margin:48px 0;"><span class="line"></span><span class="mark"></span><span class="line"></span></div>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:32px; text-align:center;">
      <div><div class="lux-serif" style="font-size:32px; color:var(--copper-bright);">3</div><div style="font-size:13px; color:var(--ivory-faint); margin-top:4px;">Ateliers</div></div>
      <div><div class="lux-serif" style="font-size:32px; color:var(--copper-bright);">12yrs</div><div style="font-size:13px; color:var(--ivory-faint); margin-top:4px;">In operation</div></div>
      <div><div class="lux-serif" style="font-size:32px; color:var(--copper-bright);">∞</div><div style="font-size:13px; color:var(--ivory-faint); margin-top:4px;">Repair guarantee</div></div>
    </div>
  </section>`;
}

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
