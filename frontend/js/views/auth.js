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
