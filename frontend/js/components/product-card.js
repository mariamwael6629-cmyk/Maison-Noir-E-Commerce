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
