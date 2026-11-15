/* DATA LAYER - the only file that touches localStorage.
   When you learn backend, rewrite the bodies below to use fetch() calls.
   Every function is async already, so no page needs to change. */
const Store = (() => {
  const P = 'anrage:';
  const TABLES = ['bags', 'customers', 'suppliers', 'sales', 'purchases', 'payments'];
  const read = t => { try { return JSON.parse(localStorage.getItem(P + t)) || []; } catch (e) { return []; } };
  const write = (t, v) => {
    try { localStorage.setItem(P + t, JSON.stringify(v)); }
    catch (e) { throw Error('Could not save. Browser storage is full or blocked.'); }
  };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // Moves stock up (+) or down (-) and refuses to go below zero
  const stockMove = (bagId, delta) => {
    const bags = read('bags'), b = bags.find(x => x.id === bagId);
    if (!b) throw Error('Pick a bag type.');
    if (b.stock + delta < 0) throw Error(`Only ${b.stock} ${b.name} in stock.`);
    b.stock += delta;
    write('bags', bags);
  };
  const add = async (t, r) => {
    const a = read(t), n = { ...r, id: uid(), at: new Date().toISOString() };
    a.push(n); write(t, a); return n;
  };

  // Edit a sale (sign -1) or purchase (sign +1): undo its old stock effect, apply the new one,
  // and put everything back if the new numbers don't work (e.g. not enough stock).
  const editTx = async (tb, id, patch, sign) => {
    const a = read(tb), i = a.findIndex(x => x.id === id);
    if (i < 0) throw Error('Record not found.');
    const o = a[i], n = { ...o, ...patch };
    if (!(n.qty > 0)) throw Error('Enter a quantity.');
    if (!(n.rate > 0)) throw Error('Enter a price.');
    stockMove(o.bagId, -sign * o.qty);
    try { stockMove(n.bagId, sign * n.qty); }
    catch (e) { stockMove(o.bagId, sign * o.qty); throw e; }
    const b = read(tb); // re-read: stockMove does not touch this table, but stay safe
    b[i] = { ...n, total: Math.round(n.qty * n.rate * 100) / 100 };
    write(tb, b);
  };

  return {
    editSale: (id, p) => editTx('sales', id, p, -1),
    editPurchase: (id, p) => editTx('purchases', id, p, 1),
    list: async t => read(t),
    ensureByName: async (tb, name) => read(tb).find(r => String(r.name).trim().toLowerCase() === name.toLowerCase()) || add(tb, { name }),
    add,
    update: async (tb, id, patch) => {
      const a = read(tb), i = a.findIndex(x => x.id === id);
      if (i < 0) throw Error('Record not found.');
      a[i] = { ...a[i], ...patch }; write(tb, a);
    },
    // A sale removes stock and is tied to a customer (customerId) and bag type (bagId)
    sell: async s => {
      if (!(s.qty > 0)) throw Error('Enter a quantity.');
      stockMove(s.bagId, -s.qty);
      return add('sales', { ...s, total: Math.round(s.qty * s.rate * 100) / 100 });
    },
    // A purchase adds stock and is tied to a supplier (supplierId)
    buy: async p => {
      if (!(p.qty > 0)) throw Error('Enter a quantity.');
      stockMove(p.bagId, p.qty);
      return add('purchases', { ...p, total: Math.round(p.qty * p.rate * 100) / 100 });
    },
    // party is 'customer' (money in) or 'supplier' (money out)
    pay: async p => add('payments', p),
    exportAll: async () => JSON.stringify(Object.fromEntries(TABLES.map(t => [t, read(t)]))),
    importAll: async json => {
      const o = JSON.parse(json);
      TABLES.forEach(t => { if (!Array.isArray(o[t])) throw Error('This is not a valid backup file.'); });
      TABLES.forEach(t => write(t, o[t]));
    }
  };
})();