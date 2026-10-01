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
