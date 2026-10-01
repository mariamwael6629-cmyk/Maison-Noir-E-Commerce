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
