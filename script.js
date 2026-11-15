/* Dashboard (index.html) script. Same drawer/toast/date as before, now with real links and live data. */
const toast = document.getElementById('toast');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sidebarClose = document.getElementById('sidebarClose');
let toastTimer;

function setMenu(open) {
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  document.body.classList.toggle('menu-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', () => setMenu(true));
sidebarClose.addEventListener('click', () => setMenu(false));
overlay.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

/* Each section button/card opens its own page */
const PAGES = {
  'Overview': 'index.html', 'Sales': 'sales.html', 'Customers': 'customers.html', 'Supplier': 'suppliers.html',
  'Inventory': 'inventory.html', 'Statistics': 'statistics.html', 'Record Payment': 'hisaab.html', 'Add Payment': 'hisaab.html'
};
document.querySelectorAll('[data-section]').forEach(b => {
  b.addEventListener('click', () => {
    const url = PAGES[b.dataset.section];
    if (url === 'index.html') setMenu(false); else location.href = url;
  });
});

document.getElementById('notifications').addEventListener('click', () => showToast('You’re all caught up on notifications.'));
document.querySelector('.view-all').addEventListener('click', e => { e.preventDefault(); setMenu(true); });

/* Live date */
const todayEl = document.getElementById('today-date');
function updateDate() {
  todayEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
updateDate();
setInterval(updateDate, 60 * 1000);

/* Live data: loads store.js by itself, so index.html needs no changes */
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const when = d => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

async function fillDashboard() {
  const [bags, customers, sales, purchases] = await Promise.all(['bags', 'customers', 'sales', 'purchases'].map(t => Store.list(t)));
  const setCount = (name, n) => { const el = document.querySelector(`.nav-button[data-section="${name}"] .nav-count`); if (el) el.textContent = n; };
  setCount('Sales', sales.length);
  setCount('Inventory', bags.reduce((n, b) => n + b.stock, 0));

  const name = (a, id) => (a.find(x => x.id === id) || {}).name || 'Removed';
  const last = a => a[a.length - 1];
  const rows = document.querySelectorAll('.activity-row');
  const set = (row, text, at, empty) => {
    row.querySelector('.activity-desc').innerHTML = text;
    row.querySelector('.activity-time').textContent = at ? when(at) : '';
  };
  const s = last(sales), p = last(purchases), c = last(customers);
  set(rows[0], s ? `<b>New sale</b> · ${esc(name(customers, s.customerId))}, ${s.qty} × ${esc(name(bags, s.bagId))}, ${money(s.total)}` : '<b>New sale</b> · none yet', s && s.at);
  set(rows[1], p ? `<b>Stock updated</b> · ${p.qty} × ${esc(name(bags, p.bagId))} from ${esc(name(await Store.list('suppliers'), p.supplierId))}` : '<b>Stock updated</b> · none yet', p && p.at);
  set(rows[2], c ? `<b>New customer</b> · ${esc(c.name)}` : '<b>New customer</b> · none yet', c && c.at);
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const storeScript = document.createElement('script');
storeScript.src = 'store.js';
storeScript.onload = () => {
  fillDashboard().catch(() => showToast('Could not load your data.'));
  const searchScript = document.createElement('script');
  searchScript.src = 'search.js';
  document.head.appendChild(searchScript);
};
document.head.appendChild(storeScript);