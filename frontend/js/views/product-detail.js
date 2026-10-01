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
