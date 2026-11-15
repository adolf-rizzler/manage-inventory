/* Shared shell + logic for sales / customers / suppliers / inventory / hisaab / statistics */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
const day = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const sum = (a, k = 'total') => a.reduce((n, x) => n + Number(x[k] || 0), 0);
const rev = a => [...a].reverse();
const r2 = n => Math.round(n * 100) / 100; // money is rounded to 2 decimals
const find = (a, id) => a.find(x => x.id === id)?.name || 'Removed';

const NAV = [
  ['Overview', 'index', '<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>'],
  ['Sales', 'sales', '<path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>'],
  ['Customers', 'customers', '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/>'],
  ['Supplier', 'suppliers', '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M3 10h18"/>'],
  ['Inventory', 'inventory', '<path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4M12 11v10"/>'],
  ['Statistics', 'statistics', '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>'],
  ['Hisaab', 'hisaab', '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>']
];
const page = document.body.dataset.page;
const title = NAV.find(n => n[1] === page)[0];

/* ---------- shell: drawer, top bar, toast ---------- */
document.body.insertAdjacentHTML('afterbegin', `
<button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
<div class="overlay" id="overlay"></div>
<div class="app">
  <aside class="sidebar" id="sidebar" aria-label="Main navigation">
    <button class="sidebar-close" id="sidebarClose" aria-label="Close menu">&times;</button>
    <div class="brand"><div class="brand-mark">A</div><div><div class="brand-name">anrage inventory</div><div class="brand-sub">Inventory, in order</div></div></div>
    <nav><div class="nav-label">Workspace</div><div class="nav-list">
      ${NAV.map(n => `<button class="nav-button ${n[1] === page ? 'active' : ''}" data-href="${n[1]}.html"><span class="nav-icon"><svg viewBox="0 0 24 24">${n[2]}</svg></span><span class="nav-copy"><span class="nav-title">${n[0]}</span></span></button>`).join('')}
    </div></nav>
  </aside>
  <main>
    <header class="topbar"><div class="breadcrumb">Northstar Goods&nbsp; / &nbsp;<b>${title}</b></div>
      <div class="top-actions"><label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" aria-label="Search" placeholder="Search anything..." /></label></div></header>
    <div id="view"></div>
  </main>
</div>
<div class="toast" role="status" aria-live="polite" id="toast"></div>`);

const searchScript = document.createElement('script'); searchScript.src = 'search.js'; document.head.appendChild(searchScript);

let toastTimer;
function toast(m) {
  const t = $('#toast'); t.textContent = m; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function setMenu(open) {
  $('#sidebar').classList.toggle('open', open);
  $('#overlay').classList.toggle('show', open);
  document.body.classList.toggle('menu-open', open);
  $('#menuBtn').setAttribute('aria-expanded', String(open));
}
$('#menuBtn').onclick = () => setMenu(true);
$('#sidebarClose').onclick = $('#overlay').onclick = () => setMenu(false);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); document.querySelector('.modal')?.remove(); } });
document.querySelectorAll('[data-href]').forEach(b => b.onclick = () => location.href = b.dataset.href);

/* ---------- helpers: table + popup form ---------- */
const table = (cols, rows, empty) => rows.length
  ? `<div class="tbl"><table><thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr ${r.go ? `data-go="${r.go}" class="click"` : ''}>${cols.map(c => `<td>${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
  : `<p class="empty">${empty}</p>`;

function form(heading, fields, save, vals = {}) {
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<form class="modal-box"><h3>${heading}</h3>${fields.map(f => `<label>${f.l}${f.t === 'select'
    ? `<select name="${f.n}">${f.o.map(o => `<option value="${o[0]}" ${vals[f.n] === o[0] ? 'selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
    : `<input name="${f.n}" type="${f.t || 'text'}" ${f.r ? 'required' : ''} ${f.t === 'number' ? 'min="0" step="any"' : ''} value="${esc(vals[f.n] ?? '')}">`}</label>`).join('')}
    <div class="modal-actions"><button type="button" class="btn ghost">Cancel</button><button class="btn">Save</button></div></form>`;
  document.body.appendChild(m);
  m.querySelector('.ghost').onclick = () => m.remove();
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('input,select')?.focus();
  m.querySelector('form').onsubmit = async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button:not(.ghost)'); btn.disabled = true;
    const v = Object.fromEntries(new FormData(e.target));
    fields.forEach(f => { if (f.t === 'number') v[f.n] = Number(v[f.n]); });
    try { await save(v); m.remove(); toast('Saved'); render(); } catch (err) { toast(err.message); btn.disabled = false; }
  };
}

/* ---------- reusable forms ---------- */
const opts = a => a.map(x => [x.id, x.name]);
const bagOpts = d => d.bags.map(b => [b.id, `${b.name} (${b.stock} in stock${b.rate ? ', ₹' + b.rate : ''})`]);

const saleForm = (d, v = {}) => {
  if (!d.customers.length || !d.bags.length) return toast('Add a customer and a bag type first.');
  const bag = d.bags.find(b => b.id === v.bagId);
  form(bag ? `Sell ${bag.name}` : 'New sale', [
    { n: 'customerId', l: 'Sell to (customer)', t: 'select', o: opts(d.customers) },
    { n: 'bagId', l: 'Bag type', t: 'select', o: bagOpts(d) },
    { n: 'qty', l: 'Quantity (bags)', t: 'number', r: 1 },
    { n: 'rate', l: 'Price per bag (₹). Empty uses the default price' + (bag && bag.rate ? ` (₹${bag.rate})` : ''), t: 'number' },
    { n: 'paid', l: 'Paid now (₹). Empty means on credit', t: 'number' }
  ], async x => {
    const b = d.bags.find(y => y.id === x.bagId), rate = x.rate > 0 ? x.rate : (b && b.rate);
    if (!(rate > 0)) throw Error('Enter a price, or set a default price for this bag.');
    if (r2(x.paid) > r2(x.qty * rate)) throw Error('Paid amount is more than the sale total.');
    await Store.sell({ customerId: x.customerId, bagId: x.bagId, qty: x.qty, rate });
    if (x.paid > 0) await Store.pay({ party: 'customer', partyId: x.customerId, amount: x.paid, note: 'Paid at sale' });
  }, v);
};
const buyForm = (d, v = {}) => {
  if (!d.bags.length) return toast('Add a bag type first.');
  const bag = d.bags.find(b => b.id === v.bagId);
  const isDefault = s => s.name.trim().toLowerCase() === 'anrage';
  const vv = { ...v };
  if (d.suppliers.some(s => s.id === v.supplierId && isDefault(s))) vv.supplierId = ''; // Anrage's own page -> default option
  form(bag ? `Buy stock: ${bag.name}` : 'New purchase', [
    { n: 'supplierId', l: 'Buy from (supplier)', t: 'select', o: [['', 'Anrage (default)'], ...opts(d.suppliers.filter(s => !isDefault(s)))] },
    { n: 'bagId', l: 'Bag type', t: 'select', o: bagOpts(d) },
    { n: 'qty', l: 'Quantity (bags)', t: 'number', r: 1 },
    { n: 'rate', l: 'Buying price per bag (₹)', t: 'number', r: 1 },
    { n: 'paid', l: 'Paid now (₹). Empty means pay later', t: 'number' }
  ], async x => {
    if (!(x.rate > 0)) throw Error('Enter the buying price.');
    if (r2(x.paid) > r2(x.qty * x.rate)) throw Error('Paid amount is more than the purchase total.');
    const sid = x.supplierId || (await Store.ensureByName('suppliers', 'Anrage')).id;
    await Store.buy({ supplierId: sid, bagId: x.bagId, qty: x.qty, rate: x.rate });
    if (x.paid > 0) await Store.pay({ party: 'supplier', partyId: sid, amount: x.paid, note: 'Paid at purchase' });
  }, vv);
};
const payForm = (d, v) => {
  const o = [...d.customers.map(c => ['customer:' + c.id, 'Received from ' + c.name]), ...d.suppliers.map(s => ['supplier:' + s.id, 'Paid to ' + s.name])];
  if (!o.length) return toast('Add a customer or supplier first.');
  form('Record payment', [{ n: 'who', l: 'Payment', t: 'select', o }, { n: 'amount', l: 'Amount (₹)', t: 'number', r: 1 }, { n: 'note', l: 'Note (optional)' }],
    x => { const [party, partyId] = x.who.split(':'); return Store.pay({ party, partyId, amount: x.amount, note: x.note }); }, v);
};

/* ---------- reusable tables ---------- */
const editBtn = (kind, id) => `<button class="btn ghost sm" data-do="edit-${kind}:${id}">Edit</button>`;
const tx = (d, rows, key, list, kind) => table([['Date', r => day(r.at)], ...(key ? [[key === 'customerId' ? 'Customer' : 'Supplier', r => esc(find(list, r[key]))]] : []),
  ['Bag', r => esc(find(d.bags, r.bagId))], ['Qty', r => r.qty], ['Rate', r => money(r.rate)], ['Total', r => money(r.total)], ['', r => editBtn(kind, r.id)]], rows, 'Nothing here yet.');
const payTable = (d, rows) => table([['Date', r => day(r.at)], ['Party', r => esc(find(r.party === 'customer' ? d.customers : d.suppliers, r.partyId))],
  ['Direction', r => r.party === 'customer' ? 'Received' : 'Paid'], ['Amount', r => money(r.amount)], ['Note', r => esc(r.note)], ['', r => editBtn('pay', r.id)]], rows, 'No payments yet.');

const paid = (d, party, id) => sum(d.payments.filter(p => p.party === party && p.partyId === id), 'amount');
const owes = (d, id) => r2(sum(d.sales.filter(s => s.customerId === id)) - paid(d, 'customer', id));     // customer owes us
const owed = (d, id) => r2(sum(d.purchases.filter(s => s.supplierId === id)) - paid(d, 'supplier', id)); // we owe supplier

/* ---------- edit: one popup for every kind of record ---------- */
const editItem = (k, d) => {
  const [kind, id] = k.slice(5).split(':');
  const tb = { sale: 'sales', purchase: 'purchases', pay: 'payments', customer: 'customers', supplier: 'suppliers', bag: 'bags' }[kind];
  const r = d[tb].find(x => x.id === id);
  if (!r) return toast('Record not found.');
  const person = [{ n: 'name', l: 'Business name', r: 1 }, { n: 'phone', l: 'Phone' }, { n: 'address', l: 'Address' }];
  if (kind === 'bag') form('Edit bag type', [{ n: 'name', l: 'Bag type', r: 1 }, { n: 'rate', l: 'Default selling price (₹ per bag)', t: 'number' },
    { n: 'stock', l: 'Current stock (bags)', t: 'number' }, { n: 'low', l: 'Warn me when stock is at or below', t: 'number' }], v => Store.update(tb, id, v), r);
  else if (kind === 'customer' || kind === 'supplier') form('Edit ' + kind, person, v => Store.update(tb, id, v), r);
  else if (kind === 'pay') form('Edit payment', [{ n: 'amount', l: 'Amount (₹)', t: 'number', r: 1 }, { n: 'note', l: 'Note (optional)' }],
    v => { if (!(v.amount > 0)) throw Error('Enter an amount.'); return Store.update(tb, id, v); }, r);
  else {
    const sale = kind === 'sale';
    form(sale ? 'Edit sale' : 'Edit purchase', [
      sale ? { n: 'customerId', l: 'Customer', t: 'select', o: opts(d.customers) } : { n: 'supplierId', l: 'Supplier', t: 'select', o: opts(d.suppliers) },
      { n: 'bagId', l: 'Bag type', t: 'select', o: bagOpts(d) },
      { n: 'qty', l: 'Quantity (bags)', t: 'number', r: 1 },
      { n: 'rate', l: 'Price per bag (₹)', t: 'number', r: 1 }
    ], v => sale ? Store.editSale(id, v) : Store.editPurchase(id, v), r);
  }
};

/* ---------- pages: each returns [html, [[buttonLabel, handler], ...]] ---------- */
const summary = (c, label, amt) => `<a class="back" href="#">&larr; Back to all</a><div class="panel summary"><b>${esc(c.name)}</b><span>${esc([c.phone, c.address].filter(Boolean).join(' · '))}</span><span>${label} <strong>${money(amt)}</strong></span></div>`;

const P = {
  async inventory(d) {
    const btn = (k, id, t, c) => `<button class="btn ${c} sm" data-do="${k}:${id}">${t}</button>`;
    return [table([['Bag type', r => esc(r.name)], ['In stock', r => `<b>${r.stock}</b>`], ['Default price', r => r.rate ? money(r.rate) : '-'],
      ['Status', r => r.stock <= r.low ? '<span class="pill low">Low</span>' : '<span class="pill ok">OK</span>'],
      ['', r => btn('sell', r.id, 'Sell', '') + btn('buy', r.id, 'Buy stock', 'ghost') + btn('edit-bag', r.id, 'Edit', 'ghost')]], d.bags, 'No bag types yet. Add your first one.'),
      [['Add bag type', () => form('New bag type', [{ n: 'name', l: 'Bag type', r: 1 }, { n: 'rate', l: 'Default selling price (₹ per bag)', t: 'number' }, { n: 'stock', l: 'Opening stock (bags)', t: 'number' }, { n: 'low', l: 'Warn me when stock is at or below', t: 'number' }], v => Store.add('bags', v))]],
      k => {
        const [a, id] = k.split(':');
        if (a === 'sell') saleForm(d, { bagId: id });
        else if (a === 'buy') buyForm(d, { bagId: id });
        else form('Default selling price', [{ n: 'rate', l: 'Price per bag (₹)', t: 'number', r: 1 }], v => Store.update('bags', id, { rate: v.rate }), { rate: d.bags.find(b => b.id === id).rate });
      }];
  },
  async sales(d) {
    return [tx(d, rev(d.sales), 'customerId', d.customers, 'sale'), [['New sale', () => saleForm(d)]]];
  },
  async hisaab(d) {
    const cu = d.customers.map(c => ({ ...c, due: owes(d, c.id) })).filter(c => c.due > 0);
    const su = d.suppliers.map(x => ({ ...x, due: owed(d, x.id) })).filter(x => x.due > 0);
    const btn = (k, t) => `<button class="btn sm" data-do="${k}">${t}</button>`;
    return [`<h3>Customers owe you: ${money(sum(cu, 'due'))}</h3>` +
      table([['Customer', r => esc(r.name)], ['Owes you', r => `<b>${money(r.due)}</b>`], ['', r => btn('in:customer:' + r.id, 'Receive payment')]], cu, 'No customer owes you anything.') +
      `<h3>You owe suppliers: ${money(sum(su, 'due'))}</h3>` +
      table([['Supplier', r => esc(r.name)], ['You owe', r => `<b>${money(r.due)}</b>`], ['', r => btn('out:supplier:' + r.id, 'Pay')]], su, 'You owe no supplier anything.') +
      '<h3>Payment history</h3>' + payTable(d, rev(d.payments)),
      [['Record payment', () => payForm(d)]],
      k => { const [, party, id] = k.split(':'); payForm(d, { who: party + ':' + id, amount: party === 'customer' ? owes(d, id) : owed(d, id) }); }];
  },
  async customers(d) {
    const c = d.customers.find(x => x.id === location.hash.slice(1));
    if (!c) return [table([['Customer', r => esc(r.name)], ['Phone', r => esc(r.phone)], ['Total sales', r => money(sum(d.sales.filter(s => s.customerId === r.id)))], ['Owes you', r => money(owes(d, r.id))], ['', r => editBtn('customer', r.id)]],
      d.customers.map(r => ({ ...r, go: r.id })), 'No customers yet. Add your first one.'),
      [['Add customer', () => form('New customer', [{ n: 'name', l: 'Business name', r: 1 }, { n: 'phone', l: 'Phone' }, { n: 'address', l: 'Address' }], v => Store.add('customers', v))]]];
    return [summary(c, 'Owes you', owes(d, c.id)) + '<h3>Sales</h3>' + tx(d, rev(d.sales.filter(s => s.customerId === c.id)), null, null, 'sale') + '<h3>Payments received</h3>' + payTable(d, rev(d.payments.filter(p => p.party === 'customer' && p.partyId === c.id))),
      [['New sale', () => saleForm(d, { customerId: c.id })], ['Record payment', () => payForm(d, { who: 'customer:' + c.id })], ['Edit customer', () => editItem('edit-customer:' + c.id, d)]]];
  },
  async suppliers(d) {
    const s = d.suppliers.find(x => x.id === location.hash.slice(1));
    if (!s) return [table([['Supplier', r => esc(r.name)], ['Phone', r => esc(r.phone)], ['Total bought', r => money(sum(d.purchases.filter(p => p.supplierId === r.id)))], ['You owe', r => money(owed(d, r.id))], ['', r => editBtn('supplier', r.id)]],
      d.suppliers.map(r => ({ ...r, go: r.id })), 'No suppliers yet. Add your first one.'),
      [['Add supplier', () => form('New supplier', [{ n: 'name', l: 'Business name', r: 1 }, { n: 'phone', l: 'Phone' }, { n: 'address', l: 'Address' }], v => Store.add('suppliers', v))], ['New purchase', () => buyForm(d)]]];
    return [summary(s, 'You owe', owed(d, s.id)) + '<h3>Purchases</h3>' + tx(d, rev(d.purchases.filter(p => p.supplierId === s.id)), null, null, 'purchase') + '<h3>Payments made</h3>' + payTable(d, rev(d.payments.filter(p => p.party === 'supplier' && p.partyId === s.id))),
      [['New purchase', () => buyForm(d, { supplierId: s.id })], ['Record payment', () => payForm(d, { who: 'supplier:' + s.id })], ['Edit supplier', () => editItem('edit-supplier:' + s.id, d)]]];
  },
  async statistics(d) {
    const S = sum(d.sales), B = sum(d.purchases), In = sum(d.payments.filter(p => p.party === 'customer'), 'amount'), Out = sum(d.payments.filter(p => p.party === 'supplier'), 'amount');
    const card = (l, v) => `<div class="panel stat"><span>${l}</span><b>${money(r2(v))}</b></div>`;
    const byCust = d.customers.map(c => ({ ...c, t: sum(d.sales.filter(s => s.customerId === c.id)), q: sum(d.sales.filter(s => s.customerId === c.id), 'qty') })).sort((a, b) => b.t - a.t);
    return [`<div class="stats">${card('Total sales', S)}${card('Total purchases', B)}${card('Net total (sales - purchases)', S - B)}${card('Received from customers', In)}${card('Paid to suppliers', Out)}${card('Cash net (received - paid)', In - Out)}${card('Customers owe you', S - In)}${card('You owe suppliers', B - Out)}</div><h3>Sales by customer</h3>` +
      table([['Customer', r => esc(r.name)], ['Bags sold', r => r.q], ['Sales', r => money(r.t)]], byCust, 'No sales yet.'),
      [['Export backup', async () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([await Store.exportAll()], { type: 'application/json' })); a.download = 'anrage-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); }],
       ['Import backup', () => { const i = document.createElement('input'); i.type = 'file'; i.accept = '.json'; i.onchange = async () => { try { await Store.importAll(await i.files[0].text()); toast('Backup restored'); render(); } catch (e) { toast(e.message); } }; i.click(); }]]];
  }
};

async function render() {
  try {
    const d = {};
    for (const t of ['bags', 'customers', 'suppliers', 'sales', 'purchases', 'payments']) d[t] = await Store.list(t);
    const [html, acts, on] = await P[page](d);
    $('#view').innerHTML = `<div class="section-heading"><h2>${title}</h2><div class="acts">${acts.map((a, i) => `<button class="btn" data-act="${i}">${a[0]}</button>`).join('')}</div></div>${html}`;
    document.querySelectorAll('[data-act]').forEach(b => b.onclick = () => acts[b.dataset.act][1]());
    document.querySelectorAll('[data-do]').forEach(b => b.onclick = e => { e.stopPropagation(); const k = b.dataset.do; k.startsWith('edit-') ? editItem(k, d) : on(k); });
    document.querySelectorAll('[data-go]').forEach(r => r.onclick = () => location.hash = r.dataset.go);
  } catch (e) { toast(e.message); }
}
window.addEventListener('hashchange', render);
render();