/* Global search: type in the top-bar search box to find any customer, supplier, bag type,
   sale, purchase or payment. Click a result to jump to it. Press "/" anywhere to start typing. */
(() => {
  const input = document.querySelector('.search input');
  if (!input || typeof Store === 'undefined') return;
  input.autocomplete = 'off';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  const day = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const low = s => String(s ?? '').toLowerCase();

  const box = document.createElement('div');
  box.className = 'search-results';
  box.hidden = true;
  (document.querySelector('.top-actions') || input.parentElement).appendChild(box);

  let seq = 0; // ignore out-of-date searches while typing fast
  async function run() {
    const q = low(input.value).trim(), mine = ++seq;
    if (!q) { box.hidden = true; return; }
    const [bags, customers, suppliers, sales, purchases, payments] =
      await Promise.all(['bags', 'customers', 'suppliers', 'sales', 'purchases', 'payments'].map(t => Store.list(t)));
    if (mine !== seq) return;

    const nm = (a, id) => (a.find(x => x.id === id) || {}).name || 'Removed';
    const has = (...f) => f.some(x => low(x).includes(q));
    const person = (list, page) => list.filter(x => has(x.name, x.phone, x.address))
      .map(x => [x.name, [x.phone, x.address].filter(Boolean).join(' · '), page + '#' + x.id]);

    const groups = [
      ['Customers', person(customers, 'customers.html')],
      ['Suppliers', person(suppliers, 'suppliers.html')],
      ['Inventory', bags.filter(b => has(b.name)).map(b => [b.name, b.stock + ' in stock' + (b.rate ? ' · ' + money(b.rate) : ''), 'inventory.html'])],
      ['Sales', [...sales].reverse().filter(s => has(nm(customers, s.customerId), nm(bags, s.bagId), s.total, day(s.at)))
        .map(s => [nm(customers, s.customerId) + ': ' + s.qty + ' × ' + nm(bags, s.bagId), money(s.total) + ' · ' + day(s.at), 'customers.html#' + s.customerId])],
      ['Purchases', [...purchases].reverse().filter(p => has(nm(suppliers, p.supplierId), nm(bags, p.bagId), p.total, day(p.at)))
        .map(p => [nm(suppliers, p.supplierId) + ': ' + p.qty + ' × ' + nm(bags, p.bagId), money(p.total) + ' · ' + day(p.at), 'suppliers.html#' + p.supplierId])],
      ['Payments', [...payments].reverse().filter(p => has(nm(p.party === 'customer' ? customers : suppliers, p.partyId), p.note, p.amount))
        .map(p => [(p.party === 'customer' ? 'Received from ' : 'Paid to ') + nm(p.party === 'customer' ? customers : suppliers, p.partyId),
          money(p.amount) + (p.note ? ' · ' + p.note : '') + ' · ' + day(p.at), (p.party === 'customer' ? 'customers.html#' : 'suppliers.html#') + p.partyId])]
    ].filter(g => g[1].length);

    box.innerHTML = groups.length
      ? groups.map(([g, rows]) => `<div class="sr-group">${g}</div>` + rows.slice(0, 5).map(r => `<a href="${r[2]}"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></a>`).join('')).join('')
      : `<p class="sr-empty">Nothing found for “${esc(input.value.trim())}”.</p>`;
    box.hidden = false;
  }

  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { box.hidden = true; input.blur(); }
    if (e.key === 'Enter') { const a = box.querySelector('a'); if (a) { e.preventDefault(); box.hidden = true; location.href = a.href; } }
  });
  box.addEventListener('click', e => { if (e.target.closest('a')) box.hidden = true; });
  document.addEventListener('click', e => { if (!box.contains(e.target) && !input.closest('.search').contains(e.target)) box.hidden = true; });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
  });
})();