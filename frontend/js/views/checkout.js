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
