/* ============================================================
   MAISON NOIR — API Client
   Thin fetch wrapper around the FastAPI backend (see API_BASE_URL
   in config.js). Injects the JWT bearer token for protected routes
   and normalizes error responses into thrown Error objects.
   ============================================================ */

const TOKEN_KEY = 'mn_token';

function getToken(){ return localStorage.getItem(TOKEN_KEY); }
function setToken(token){
  if(token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function formatApiError(data, status){
  if(data && typeof data.detail === 'string') return data.detail;
  if(data && Array.isArray(data.detail) && data.detail.length){
    return data.detail.map(d => d.msg).join(' ');
  }
  if(status === 401) return 'Please sign in to continue.';
  if(status === 403) return 'You do not have access to do that.';
  if(status === 404) return 'Not found.';
  return 'Something went wrong. Please try again.';
}

async function apiRequest(path, { method = 'GET', body, auth = false } = {}){
  const headers = { 'Content-Type': 'application/json' };
  if(auth){
    const token = getToken();
    if(token) headers['Authorization'] = `Bearer ${token}`;
  }
  let res;
  try{
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch(networkErr){
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if(!res.ok){
    const err = new Error(formatApiError(data, res.status));
    err.status = res.status;
    throw err;
  }
  return data;
}

function buildQuery(params = {}){
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if(value !== undefined && value !== null && value !== '' && value !== false) qs.set(key, value);
  });
  const query = qs.toString();
  return query ? `?${query}` : '';
}

const api = {
  getCategories: () => apiRequest('/categories'),
  getProducts: (params) => apiRequest(`/products${buildQuery(params)}`),
  getProduct: (id) => apiRequest(`/products/${id}`),
  getReviews: (productId) => apiRequest(`/products/${productId}/reviews`),
  createReview: (productId, payload) => apiRequest(`/products/${productId}/reviews`, { method: 'POST', body: payload, auth: true }),

  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiRequest('/auth/login', { method: 'POST', body: payload }),
  me: () => apiRequest('/auth/me', { auth: true }),

  getWishlist: () => apiRequest('/wishlist', { auth: true }),
  addWishlist: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'POST', auth: true }),
  removeWishlist: (productId) => apiRequest(`/wishlist/${productId}`, { method: 'DELETE', auth: true }),

  createOrder: (payload) => apiRequest('/orders', { method: 'POST', body: payload, auth: true }),
  getOrders: () => apiRequest('/orders', { auth: true }),
  getOrder: (orderNumber) => apiRequest(`/orders/${orderNumber}`, { auth: true }),

  validatePromo: (code) => apiRequest('/promo/validate', { method: 'POST', body: { code } }),

  getAdminStats: () => apiRequest('/admin/stats', { auth: true }),
  getAdminOrders: () => apiRequest('/admin/orders', { auth: true }),
  getAdminCustomers: () => apiRequest('/admin/customers', { auth: true }),
  getAdminPromos: () => apiRequest('/admin/promos', { auth: true }),
};
