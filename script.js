'use strict';
const products = {
  serum: { name: '데일리 듀 세럼', price: 32000 },
  cream: { name: '소프트 엠브레이스 크림', price: 38000 },
  cleanser: { name: '퓨어 모닝 클렌저', price: 24000 }
};
const storageKey = 'onyu-bag-v1';
let bag = {};
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (saved && typeof saved === 'object') {
    for (const id of Object.keys(products)) {
      if (Number.isInteger(saved[id]) && saved[id] > 0) bag[id] = Math.min(saved[id], 99);
    }
  }
} catch { /* Shopping remains available when browser storage is unavailable. */ }
const money = value => `₩${value.toLocaleString('ko-KR')}`;
const cart = document.querySelector('#cart');
const items = document.querySelector('#cart-items');
let toastTimer;
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
}
function renderBag() {
  let count = 0;
  let total = 0;
  items.replaceChildren();
  for (const [id, quantity] of Object.entries(bag)) {
    const product = products[id];
    count += quantity;
    total += product.price * quantity;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `<div class="cart-item-top"><strong>${product.name}</strong><span>${money(product.price * quantity)}</span></div><div class="quantity"><button data-change="-1" data-id="${id}" aria-label="${product.name} 수량 줄이기">−</button><span>${quantity}</span><button data-change="1" data-id="${id}" aria-label="${product.name} 수량 늘리기" ${quantity >= 99 ? 'disabled' : ''}>+</button><button class="remove" data-remove="${id}" aria-label="${product.name} 삭제">삭제</button></div>`;
    items.append(row);
  }
  if (!count) items.innerHTML = '<p class="empty">아직 장바구니가 비어 있어요.<br>나를 위한 작은 선택을 만나보세요.</p>';
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#open-cart').setAttribute('aria-label', `장바구니 열기, ${count}개 제품`);
  document.querySelector('#cart-total').textContent = money(total);
  try { localStorage.setItem(storageKey, JSON.stringify(bag)); } catch { /* Storage is optional. */ }
}
document.querySelectorAll('[data-add]').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.add;
    if ((bag[id] || 0) >= 99) return notify('한 제품은 최대 99개까지 담을 수 있어요.');
    bag[id] = (bag[id] || 0) + 1;
    renderBag();
    notify(`${products[id].name}을 담았어요.`);
  });
});
items.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const id = button.dataset.id || button.dataset.remove;
  if (!products[id]) return;
  const change = button.dataset.change;
  if (button.dataset.remove) delete bag[id];
  else {
    bag[id] = Math.min(99, (bag[id] || 0) + Number(change));
    if (bag[id] <= 0) delete bag[id];
  }
  renderBag();
  const replacement = Array.from(items.querySelectorAll('button')).find(el => el.dataset.id === id && el.dataset.change === change && !el.disabled);
  (replacement || items.querySelector('button') || document.querySelector('#close-cart')).focus();
});
document.querySelector('#open-cart').addEventListener('click', () => {
  cart.showModal();
  document.body.style.overflow = 'hidden';
});
document.querySelector('#close-cart').addEventListener('click', () => cart.close());
document.querySelector('#continue-shopping').addEventListener('click', () => cart.close());
cart.addEventListener('close', () => { document.body.style.overflow = ''; });
cart.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    cart.close();
  }
});
cart.addEventListener('click', event => {
  const rect = cart.getBoundingClientRect();
  if (event.target === cart && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) cart.close();
});
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('.product').forEach(product => {
      product.hidden = button.dataset.filter !== 'all' && product.dataset.category !== button.dataset.filter;
    });
  });
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderBag();
