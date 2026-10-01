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
