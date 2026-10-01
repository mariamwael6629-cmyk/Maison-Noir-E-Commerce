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
