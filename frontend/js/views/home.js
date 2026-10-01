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
    <div class="glass" style="padding:60px; text-align:center; background:var(--sand); border:1px solid var(--rule);">
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
