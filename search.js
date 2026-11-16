// Search customers, suppliers, inventory, sales, purchases and payments

(() => {

  // Get the search box
  const input = document.querySelector('.search input');

  // Stop if search box or Store is missing
  if (!input || typeof Store === 'undefined') return;

  input.autocomplete = 'off';


  // Helper functions

  // Make text safe before displaying it in HTML
  const esc = text =>
    String(text ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

  // Format money
  const money = amount =>
    '₹' + Number(amount || 0).toLocaleString('en-IN');

  // Format date
  const day = date =>
    new Date(date).toLocaleDateString('en-IN');

  // Convert text to lowercase
  const low = text => String(text ?? '').toLowerCase();


  // Create a box to show search results
  const box = document.createElement('div');

  box.className = 'search-results';
  box.hidden = true;

  document.querySelector('.top-actions').appendChild(box);


  // Search function
  async function search() {

    const query = low(input.value).trim();

    // Hide results if search is empty
    if (!query) {
      box.hidden = true;
      return;
    }


    // Get all data from Store
    const bags = await Store.list('bags');
    const customers = await Store.list('customers');
    const suppliers = await Store.list('suppliers');
    const sales = await Store.list('sales');
    const purchases = await Store.list('purchases');
    const payments = await Store.list('payments');


    // Find a person's name using their ID
    function getName(list, id) {
      const person = list.find(item => item.id === id);
      return person ? person.name : 'Removed';
    }


    // Check whether text matches the search
    function matches(...values) {
      return values.some(value =>
        low(value).includes(query)
      );
    }


    // Search customers
    const customerResults = customers
      .filter(c => matches(c.name, c.phone, c.address))
      .map(c => [
        c.name,
        c.phone || '',
        'customers.html#' + c.id
      ]);


    // Search suppliers
    const supplierResults = suppliers
      .filter(s => matches(s.name, s.phone, s.address))
      .map(s => [
        s.name,
        s.phone || '',
        'suppliers.html#' + s.id
      ]);


    // Search inventory
    const bagResults = bags
      .filter(b => matches(b.name))
      .map(b => [
        b.name,
        b.stock + ' in stock',
        'inventory.html'
      ]);


    // Search sales
    const saleResults = sales
      .filter(s =>
        matches(
          getName(customers, s.customerId),
          getName(bags, s.bagId),
          s.total
        )
      )
      .map(s => [
        getName(customers, s.customerId),
        money(s.total),
        'customers.html#' + s.customerId
      ]);


    // Search purchases
    const purchaseResults = purchases
      .filter(p =>
        matches(
          getName(suppliers, p.supplierId),
          getName(bags, p.bagId),
          p.total
        )
      )
      .map(p => [
        getName(suppliers, p.supplierId),
        money(p.total),
        'suppliers.html#' + p.supplierId
      ]);


    // Search payments
    const paymentResults = payments
      .filter(p =>
        matches(p.note, p.amount)
      )
      .map(p => [
        'Payment',
        money(p.amount),
        'hisaab.html'
      ]);


    // Combine all results
    const groups = [
      ['Customers', customerResults],
      ['Suppliers', supplierResults],
      ['Inventory', bagResults],
      ['Sales', saleResults],
      ['Purchases', purchaseResults],
      ['Payments', paymentResults]
    ];


    // Display matching results
    let html = '';

    groups.forEach(([title, results]) => {

      if (results.length === 0) return;

      html += `<div class="sr-group">${title}</div>`;

      results.slice(0, 5).forEach(result => {

        html += `
          <a href="${result[2]}">
            <b>${esc(result[0])}</b>
            <span>${esc(result[1])}</span>
          </a>
        `;

      });

    });


    // Show message if nothing matches
    box.innerHTML = html || '<p>Nothing found!</p>';

    box.hidden = false;

  }


  // Search whenever the user types
  input.addEventListener('input', search);


  // Close results when Escape is pressed
  input.addEventListener('keydown', e => {

    if (e.key === 'Escape') {
      box.hidden = true;
      input.blur();
    }

  });


  // Hide results when clicking outside
  document.addEventListener('click', e => {

    if (!box.contains(e.target) && !input.contains(e.target)) {
      box.hidden = true;
    }

  });


  // Press "/" to open search
  document.addEventListener('keydown', e => {

    if (
      e.key === '/' &&
      !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
    ) {
      e.preventDefault();
      input.focus();
    }

  });

})();