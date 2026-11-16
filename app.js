
// ======================================================
// 1. BASIC HELPER FUNCTIONS
// ======================================================

// Shortcut to select an HTML element using CSS selectors.
// Example: $('h1') selects the first h1 element.
function $(selector) {
    return document.querySelector(selector);
}


// Convert special characters into safe HTML characters.
// This prevents user-entered text from being treated as HTML.
function esc(text) {

    return String(text ?? '').replace(/[&<>"']/g, function(character) {

        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return replacements[character];

    });

}


// Convert a number into Indian currency format.
// Example: 50000 becomes ₹50,000
function money(amount) {

    return '₹' + Number(amount || 0).toLocaleString('en-IN');

}


// Convert a date into a readable format.
// Example: 2026-11-16 becomes 16 Nov 2026
function day(date) {

    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

}


// Calculate the total of a particular property in an array.
// By default, it adds the "total" property.
//
// Example:
// sum(sales) adds all sale totals.
// sum(sales, 'qty') adds all sold quantities.

function sum(array, property = 'total') {

    let total = 0;

    array.forEach(function(item) {

        total = total + Number(item[property] || 0);

    });

    return total;

}


// Return an array in reverse order.
// We use [...array] so that the original array isn't changed.

function rev(array) {

    return [...array].reverse();

}


// Round a number to 2 decimal places.
// Example: 12.567 becomes 12.57

function r2(number) {

    return Math.round(number * 100) / 100;

}


// Find a person's or bag's name using its ID.
// If the record doesn't exist, return "Removed".

function find(array, id) {

    const item = array.find(function(element) {
        return element.id === id;
    });

    if (item) {
        return item.name;
    }

    return 'Removed';

}


// ======================================================
// 2. NAVIGATION DETAILS
// ======================================================

// This array contains all sidebar navigation information.
//
// Each item contains:
// 1. Button name
// 2. Page name
// 3. SVG code for its icon

const NAV = [

    [
        'Overview',
        'index',
        '<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/>'
    ],

    [
        'Sales',
        'sales',
        '<path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>'
    ],

    [
        'Customers',
        'customers',
        '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/>'
    ],

    [
        'Supplier',
        'suppliers',
        '<path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M3 10h18"/>'
    ],

    [
        'Inventory',
        'inventory',
        '<path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4M12 11v10"/>'
    ],

    [
        'Statistics',
        'statistics',
        '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>'
    ],

    [
        'Hisaab',
        'hisaab',
        '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>'
    ]

];


// Find which page the user is currently visiting.
// This value comes from the data-page attribute in HTML.

const page = document.body.dataset.page;


// Find the title of the current page.

const currentNavigation = NAV.find(function(item) {

    return item[1] === page;

});

const title = currentNavigation[0];


// ======================================================
// 3. CREATE THE MAIN WEBSITE LAYOUT
// ======================================================

// Instead of writing the sidebar separately in every HTML file,
// JavaScript creates it automatically.

document.body.insertAdjacentHTML('afterbegin', `

    <button class="menu-btn" id="menuBtn"
        aria-label="Open menu"
        aria-expanded="false">

        <span></span>
        <span></span>
        <span></span>

    </button>


    <div class="overlay" id="overlay"></div>


    <div class="app">

        <aside class="sidebar" id="sidebar"
            aria-label="Main navigation">

            <button class="sidebar-close" id="sidebarClose">
                &times;
            </button>


            <div class="brand">

                <div class="brand-mark">A</div>

                <div>

                    <div class="brand-name">
                        anrage inventory
                    </div>

                    <div class="brand-sub">
                        Inventory, in order
                    </div>

                </div>

            </div>


            <nav>

                <div class="nav-label">
                    Workspace
                </div>

                <div class="nav-list">

                    ${NAV.map(function(item) {

                        const name = item[0];
                        const pageName = item[1];
                        const icon = item[2];

                        // Check whether this is the current page.
                        const activeClass = pageName === page
                            ? 'active'
                            : '';

                        return `

                            <button class="nav-button ${activeClass}"
                                data-href="${pageName}.html">

                                <span class="nav-icon">

                                    <svg viewBox="0 0 24 24">
                                        ${icon}
                                    </svg>

                                </span>

                                <span class="nav-copy">

                                    <span class="nav-title">
                                        ${name}
                                    </span>

                                </span>

                            </button>

                        `;

                    }).join('')}

                </div>

            </nav>

        </aside>


        <main>

            <header class="topbar">

                <div class="breadcrumb">

                    Northstar Goods&nbsp; / &nbsp;

                    <b>${title}</b>

                </div>


                <div class="top-actions">

                    <label class="search">

                        <svg viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-4-4"/>
                        </svg>

                        <input type="search"
                            aria-label="Search"
                            placeholder="Search anything..." />

                    </label>

                </div>

            </header>


            <!-- JavaScript will display page content here -->

            <div id="view"></div>

        </main>

    </div>


    <!-- Small notification message -->

    <div class="toast"
        role="status"
        aria-live="polite"
        id="toast">

    </div>

`);


// ======================================================
// 4. LOAD SEARCH.JS
// ======================================================

// Create a script element for search.js.

const searchScript = document.createElement('script');

searchScript.src = 'search.js';

// Add search.js to the HTML page.
document.head.appendChild(searchScript);


// ======================================================
// 5. TOAST NOTIFICATIONS
// ======================================================

let toastTimer;


// Display a small notification on the screen.

function toast(message) {

    const toastElement = $('#toast');

    // Display the message.
    toastElement.textContent = message;

    // Make the notification visible.
    toastElement.classList.add('show');

    // Remove the previous timer if one exists.
    clearTimeout(toastTimer);

    // Hide notification after 2.6 seconds.
    toastTimer = setTimeout(function() {

        toastElement.classList.remove('show');

    }, 2600);

}


// ======================================================
// 6. SIDEBAR MENU
// ======================================================

function setMenu(open) {

    // Open or close the sidebar.
    $('#sidebar').classList.toggle('open', open);

    // Show or hide the background overlay.
    $('#overlay').classList.toggle('show', open);

    // Update the body CSS class.
    document.body.classList.toggle('menu-open', open);

    // Update accessibility information.
    $('#menuBtn').setAttribute('aria-expanded', String(open));

}


// Open menu when menu button is clicked.

$('#menuBtn').onclick = function() {

    setMenu(true);

};


// Close menu when close button is clicked.

$('#sidebarClose').onclick = function() {

    setMenu(false);

};


// Close menu when overlay is clicked.

$('#overlay').onclick = function() {

    setMenu(false);

};


// Close menu when Escape key is pressed.
// Also close any open popup form.

document.addEventListener('keydown', function(event) {

    if (event.key === 'Escape') {

        setMenu(false);

        const modal = document.querySelector('.modal');

        if (modal) {
            modal.remove();
        }

    }

});


// ======================================================
// 7. NAVIGATION BUTTONS
// ======================================================

// Find all sidebar buttons.

const navigationButtons = document.querySelectorAll('[data-href]');

navigationButtons.forEach(function(button) {

    button.onclick = function() {

        // Get the destination page from data-href.
        const destination = button.dataset.href;

        // Open that page.
        window.location.href = destination;

    };

});


// ======================================================
// 8. CREATE TABLES
// ======================================================

// This function creates an HTML table.
//
// cols = column headings and instructions for displaying values.
// rows = actual data.
// empty = message shown when there is no data.

function table(cols, rows, emptyMessage) {

    // If there are no records, show an empty message.
    if (rows.length === 0) {

        return `<p class="empty">${emptyMessage}</p>`;

    }


    // Create the table headings.

    let headingHTML = '';

    cols.forEach(function(column) {

        headingHTML += `<th>${column[0]}</th>`;

    });


    // Create table rows.

    let rowsHTML = '';

    rows.forEach(function(row) {

        let cellsHTML = '';

        cols.forEach(function(column) {

            // column[1] is a function that decides
            // what value should appear in this cell.

            cellsHTML += `<td>${column[1](row)}</td>`;

        });


        // If the row has a "go" value, make it clickable.
        let rowAttributes = '';

        if (row.go) {

            rowAttributes = `data-go="${row.go}" class="click"`;

        }

        rowsHTML += `
            <tr ${rowAttributes}>
                ${cellsHTML}
            </tr>
        `;

    });


    // Return the complete table.

    return `

        <div class="tbl">

            <table>

                <thead>
                    <tr>${headingHTML}</tr>
                </thead>

                <tbody>
                    ${rowsHTML}
                </tbody>

            </table>

        </div>

    `;

}


// ======================================================
// 9. POPUP FORMS
// ======================================================

// This function creates a popup form.
//
// heading = popup title.
// fields = input fields.
// save = function that runs when Save is clicked.
// vals = existing values when editing.
// del = optional delete function.

function form(heading, fields, save, vals = {}, del) {

    // Create a new div for the popup.
    const modal = document.createElement('div');

    modal.className = 'modal';


    // --------------------------------------
    // CREATE INPUT FIELDS
    // --------------------------------------

    let fieldsHTML = '';

    fields.forEach(function(field) {

        let inputHTML = '';


        // If the field is a dropdown.
        if (field.t === 'select') {

            let optionsHTML = '';

            field.o.forEach(function(option) {

                const value = option[0];
                const label = option[1];

                const selected = vals[field.n] === value
                    ? 'selected'
                    : '';

                optionsHTML += `
                    <option value="${value}" ${selected}>
                        ${esc(label)}
                    </option>
                `;

            });

            inputHTML = `
                <select name="${field.n}">
                    ${optionsHTML}
                </select>
            `;

        }

        // Otherwise, create a normal input.
        else {

            const inputType = field.t || 'text';

            const required = field.r ? 'required' : '';

            let numberAttributes = '';

            if (field.t === 'number') {

                numberAttributes = 'min="0" step="any"';

            }

            const value = esc(vals[field.n] ?? '');

            inputHTML = `
                <input
                    name="${field.n}"
                    type="${inputType}"
                    ${required}
                    ${numberAttributes}
                    value="${value}"
                >
            `;

        }


        fieldsHTML += `

            <label>

                ${field.l}

                ${inputHTML}

            </label>

        `;

    });


    // --------------------------------------
    // CREATE BUTTONS
    // --------------------------------------

    let deleteButton = '';

    if (del) {

        deleteButton = `
            <button type="button" class="btn danger">
                Delete
            </button>
        `;

    }


    // --------------------------------------
    // CREATE COMPLETE POPUP
    // --------------------------------------

    modal.innerHTML = `

        <form class="modal-box">

            <h3>${heading}</h3>

            ${fieldsHTML}

            <div class="modal-actions">

                ${deleteButton}

                <button type="button" class="btn ghost">
                    Cancel
                </button>

                <button class="btn">
                    Save
                </button>

            </div>

        </form>

    `;


    // Add popup to the webpage.
    document.body.appendChild(modal);


    // --------------------------------------
    // CANCEL BUTTON
    // --------------------------------------

    modal.querySelector('.ghost').onclick = function() {

        modal.remove();

    };


    // --------------------------------------
    // DELETE BUTTON
    // --------------------------------------

    const deleteBtn = modal.querySelector('.danger');

    if (deleteBtn) {

        deleteBtn.onclick = async function() {

            // Ask the user before deleting.
            const confirmed = confirm(
                `Delete this ${heading.replace(/^Edit /, '')}? This cannot be undone.`
            );

            if (!confirmed) {
                return;
            }


            try {

                // Run the delete function.
                await del();

                modal.remove();

                toast('Deleted');

                // Refresh the page content.
                render();

            }
            catch (error) {

                toast(error.message);

            }

        };

    }


    // --------------------------------------
    // CLICK OUTSIDE POPUP
    // --------------------------------------

    modal.onclick = function(event) {

        // Close only if the background itself was clicked.
        if (event.target === modal) {

            modal.remove();

        }

    };


    // Automatically focus on the first input.
    modal.querySelector('input,select')?.focus();


    // --------------------------------------
    // SAVE BUTTON
    // --------------------------------------

    modal.querySelector('form').onsubmit = async function(event) {

        // Stop the form from refreshing the page.
        event.preventDefault();


        const formElement = event.target;

        // Find the Save button.
        const saveButton = formElement.querySelector(
            '.modal-actions button:last-child'
        );

        // Disable the button while saving.
        saveButton.disabled = true;


        // Get all input values.
        const formData = new FormData(formElement);

        const values = Object.fromEntries(formData);


        // Convert number inputs from text into numbers.
        fields.forEach(function(field) {

            if (field.t === 'number') {

                values[field.n] = Number(values[field.n]);

            }

        });


        try {

            // Run the save function.
            await save(values);

            modal.remove();

            toast('Saved');

            // Refresh the page to show updated data.
            render();

        }
        catch (error) {

            toast(error.message);

            // Allow the user to try saving again.
            saveButton.disabled = false;

        }

    };

}


// ======================================================
// 10. REUSABLE DROPDOWN OPTIONS
// ======================================================


// Convert customers or suppliers into dropdown options.

function opts(array) {

    return array.map(function(item) {

        return [item.id, item.name];

    });

}


// Create dropdown options for bag types.
// Also display their available stock and default price.

function bagOpts(data) {

    return data.bags.map(function(bag) {

        let label = bag.name + ' (' + bag.stock + ' in stock';

        if (bag.rate) {

            label += ', ₹' + bag.rate;

        }

        label += ')';

        return [bag.id, label];

    });

}


// ======================================================
// 11. NEW SALE FORM
// ======================================================

function saleForm(data, values = {}) {

    // We need at least one customer and one bag type.
    if (!data.customers.length || !data.bags.length) {

        toast('Add a customer and a bag type first.');

        return;

    }


    // Find the selected bag, if one was provided.
    const selectedBag = data.bags.find(function(bag) {

        return bag.id === values.bagId;

    });


    let heading = 'New sale';

    if (selectedBag) {

        heading = 'Sell ' + selectedBag.name;

    }


    form(heading, [

        {
            n: 'customerId',
            l: 'Sell to (customer)',
            t: 'select',
            o: opts(data.customers)
        },

        {
            n: 'bagId',
            l: 'Bag type',
            t: 'select',
            o: bagOpts(data)
        },

        {
            n: 'qty',
            l: 'Quantity (bags)',
            t: 'number',
            r: 1
        },

        {
            n: 'rate',
            l: 'Price per bag (₹). Empty uses the default price' +
                (selectedBag && selectedBag.rate
                    ? ` (₹${selectedBag.rate})`
                    : ''),
            t: 'number'
        },

        {
            n: 'paid',
            l: 'Paid now (₹). Empty means on credit',
            t: 'number'
        }

    ],

    async function(values) {

        // Find the selected bag.
        const bag = data.bags.find(function(item) {

            return item.id === values.bagId;

        });


        // Use the entered price.
        // If no price was entered, use the bag's default price.

        let rate = values.rate;

        if (!(rate > 0)) {

            rate = bag && bag.rate;

        }


        if (!(rate > 0)) {

            throw Error(
                'Enter a price, or set a default price for this bag.'
            );

        }


        // Calculate total sale amount.
        const total = values.qty * rate;


        // Paid amount cannot be greater than the sale amount.
        if (r2(values.paid) > r2(total)) {

            throw Error('Paid amount is more than the sale total.');

        }


        // Save the sale.
        const sale = await Store.sell({

            customerId: values.customerId,
            bagId: values.bagId,
            qty: values.qty,
            rate: rate

        });


        // If customer paid something immediately,
        // save that payment too.

        if (values.paid > 0) {

            await Store.pay({

                party: 'customer',
                partyId: values.customerId,
                amount: values.paid,
                note: 'Paid at sale',
                saleId: sale.id

            });

        }

    },

    values

    );

}


// ======================================================
// 12. NEW PURCHASE FORM
// ======================================================

function buyForm(data, values = {}) {

    // At least one bag type must exist.
    if (!data.bags.length) {

        toast('Add a bag type first.');

        return;

    }


    const selectedBag = data.bags.find(function(bag) {

        return bag.id === values.bagId;

    });


    // Check whether a supplier is named Anrage.
    function isDefaultSupplier(supplier) {

        return supplier.name.trim().toLowerCase() === 'anrage';

    }


    // Copy existing values.
    const formValues = { ...values };


    // If Anrage was selected, use the default dropdown option.
    const isAnrage = data.suppliers.some(function(supplier) {

        return supplier.id === values.supplierId &&
               isDefaultSupplier(supplier);

    });

    if (isAnrage) {

        formValues.supplierId = '';

    }


    let heading = 'New purchase';

    if (selectedBag) {

        heading = 'Buy stock: ' + selectedBag.name;

    }


    form(heading, [

        {
            n: 'supplierId',
            l: 'Buy from (supplier)',
            t: 'select',
            o: [
                ['', 'Anrage (default)'],
                ...opts(data.suppliers.filter(function(supplier) {

                    return !isDefaultSupplier(supplier);

                }))
            ]
        },

        {
            n: 'bagId',
            l: 'Bag type',
            t: 'select',
            o: bagOpts(data)
        },

        {
            n: 'qty',
            l: 'Quantity (bags)',
            t: 'number',
            r: 1
        },

        {
            n: 'rate',
            l: 'Buying price per bag (₹). Empty uses the default price' +
                (selectedBag && selectedBag.buyRate
                    ? ` (₹${selectedBag.buyRate})`
                    : ''),
            t: 'number'
        },

        {
            n: 'paid',
            l: 'Paid now (₹). Empty means pay later',
            t: 'number'
        }

    ],

    async function(values) {

        // Find the selected bag.
        const bag = data.bags.find(function(item) {

            return item.id === values.bagId;

        });


        // Get entered price or default buying price.
        let rate = values.rate;

        if (!(rate > 0)) {

            rate = bag && bag.buyRate;

        }


        if (!(rate > 0)) {

            throw Error(
                'Enter a price, or set a default buying price for this bag.'
            );

        }


        // Calculate purchase total.
        const total = values.qty * rate;


        // Paid amount cannot be greater than purchase total.
        if (r2(values.paid) > r2(total)) {

            throw Error('Paid amount is more than the purchase total.');

        }


        // If no supplier was selected, create or find Anrage.
        let supplierId = values.supplierId;

        if (!supplierId) {

            const supplier = await Store.ensureByName(
                'suppliers',
                'Anrage'
            );

            supplierId = supplier.id;

        }


        // Save purchase.
        const purchase = await Store.buy({

            supplierId: supplierId,
            bagId: values.bagId,
            qty: values.qty,
            rate: rate

        });


        // Save immediate payment if any.
        if (values.paid > 0) {

            await Store.pay({

                party: 'supplier',
                partyId: supplierId,
                amount: values.paid,
                note: 'Paid at purchase',
                purchaseId: purchase.id

            });

        }

    },

    formValues

    );

}


// ======================================================
// 13. PAYMENT FORM
// ======================================================

function payForm(data, values) {

    // Create dropdown options for customers.
    const customerOptions = data.customers.map(function(customer) {

        return [
            'customer:' + customer.id,
            'Received from ' + customer.name
        ];

    });


    // Create dropdown options for suppliers.
    const supplierOptions = data.suppliers.map(function(supplier) {

        return [
            'supplier:' + supplier.id,
            'Paid to ' + supplier.name
        ];

    });


    // Combine both lists.
    const options = [
        ...customerOptions,
        ...supplierOptions
    ];


    if (!options.length) {

        toast('Add a customer or supplier first.');

        return;

    }


    form('Record payment', [

        {
            n: 'who',
            l: 'Payment',
            t: 'select',
            o: options
        },

        {
            n: 'amount',
            l: 'Amount (₹)',
            t: 'number',
            r: 1
        },

        {
            n: 'note',
            l: 'Note (optional)'
        }

    ],

    function(values) {

        // Example: customer:12345
        // split(':') separates it into two parts.

        const parts = values.who.split(':');

        const party = parts[0];
        const partyId = parts[1];


        // Save the payment.
        return Store.pay({

            party: party,
            partyId: partyId,
            amount: values.amount,
            note: values.note

        });

    },

    values

    );

}


// ======================================================
// 14. TABLE BUTTONS AND TRANSACTION TABLES
// ======================================================


// Create an Edit button for a record.

function editBtn(kind, id) {

    return `
        <button class="btn ghost sm"
            data-do="edit-${kind}:${id}">

            Edit

        </button>
    `;

}


// Create sales or purchase tables.

function tx(data, rows, key, list, kind) {

    const columns = [

        [
            'Date',
            function(row) {
                return day(row.at);
            }
        ]

    ];


    // Add Customer or Supplier column if needed.
    if (key) {

        let heading = 'Customer';

        if (key === 'supplierId') {
            heading = 'Supplier';
        }

        columns.push([

            heading,

            function(row) {
                return esc(find(list, row[key]));
            }

        ]);

    }


    // Add remaining columns.
    columns.push(

        [
            'Bag',
            function(row) {
                return esc(find(data.bags, row.bagId));
            }
        ],

        [
            'Qty',
            function(row) {
                return row.qty;
            }
        ],

        [
            'Rate',
            function(row) {
                return money(row.rate);
            }
        ],

        [
            'Total',
            function(row) {
                return money(row.total);
            }
        ],

        [
            '',
            function(row) {
                return editBtn(kind, row.id);
            }
        ]

    );


    return table(columns, rows, 'Nothing here yet.');

}


// Create payment history table.

function payTable(data, rows) {

    const columns = [

        [
            'Date',
            function(row) {
                return day(row.at);
            }
        ],

        [
            'Party',
            function(row) {

                // Find whether the payment belongs to a customer
                // or a supplier.

                if (row.party === 'customer') {

                    return esc(find(data.customers, row.partyId));

                }

                return esc(find(data.suppliers, row.partyId));

            }
        ],

        [
            'Direction',
            function(row) {

                return row.party === 'customer'
                    ? 'Received'
                    : 'Paid';

            }
        ],

        [
            'Amount',
            function(row) {
                return money(row.amount);
            }
        ],

        [
            'Note',
            function(row) {
                return esc(row.note);
            }
        ],

        [
            '',
            function(row) {
                return editBtn('pay', row.id);
            }
        ]

    ];


    return table(columns, rows, 'No payments yet.');

}


// ======================================================
// 15. PAYMENT CALCULATIONS
// ======================================================


// Calculate how much money a particular person has paid us.

function paid(data, party, id) {

    const matchingPayments = data.payments.filter(function(payment) {

        return payment.party === party &&
               payment.partyId === id;

    });

    return sum(matchingPayments, 'amount');

}


// Calculate how much a customer still owes us.

function owes(data, id) {

    // Find all sales belonging to this customer.
    const customerSales = data.sales.filter(function(sale) {

        return sale.customerId === id;

    });


    // Total sales minus money received.
    const totalSales = sum(customerSales);

    const totalPaid = paid(data, 'customer', id);

    return r2(totalSales - totalPaid);

}


// Calculate how much we still owe a supplier.

function owed(data, id) {

    const supplierPurchases = data.purchases.filter(function(purchase) {

        return purchase.supplierId === id;

    });


    // Total purchases minus money paid.
    const totalPurchases = sum(supplierPurchases);

    const totalPaid = paid(data, 'supplier', id);

    return r2(totalPurchases - totalPaid);

}


// ======================================================
// 16. EDIT EXISTING RECORDS
// ======================================================

function editItem(buttonValue, data) {

    // Remove the first five characters: "edit-"
    const remainingText = buttonValue.slice(5);

    // Separate record type and ID.
    const parts = remainingText.split(':');

    const kind = parts[0];
    const id = parts[1];


    // Connect record types to their storage table names.
    const tableNames = {

        sale: 'sales',
        purchase: 'purchases',
        pay: 'payments',
        customer: 'customers',
        supplier: 'suppliers',
        bag: 'bags'

    };


    const tableName = tableNames[kind];


    // Find the record we want to edit.
    const record = data[tableName].find(function(item) {

        return item.id === id;

    });


    if (!record) {

        toast('Record not found.');

        return;

    }


    // Function for deleting this record.
    function deleteRecord() {

        return Store.remove(tableName, id);

    }


    // Common fields for customers and suppliers.
    const personFields = [

        {
            n: 'name',
            l: 'Business name',
            r: 1
        },

        {
            n: 'phone',
            l: 'Phone'
        },

        {
            n: 'address',
            l: 'Address'
        }

    ];


    // --------------------------------------
    // EDIT BAG
    // --------------------------------------

    if (kind === 'bag') {

        form('Edit bag type', [

            {
                n: 'name',
                l: 'Bag type',
                r: 1
            },

            {
                n: 'rate',
                l: 'Default selling price (₹ per bag)',
                t: 'number'
            },

            {
                n: 'buyRate',
                l: 'Default buying price (₹ per bag)',
                t: 'number'
            },

            {
                n: 'stock',
                l: 'Current stock (bags)',
                t: 'number'
            },

            {
                n: 'low',
                l: 'Warn me when stock is at or below',
                t: 'number'
            }

        ],

        function(values) {

            return Store.update(tableName, id, values);

        },

        record,

        deleteRecord

        );

    }


    // --------------------------------------
    // EDIT CUSTOMER OR SUPPLIER
    // --------------------------------------

    else if (kind === 'customer' || kind === 'supplier') {

        form('Edit ' + kind, personFields,

            function(values) {

                return Store.update(tableName, id, values);

            },

            record,

            deleteRecord

        );

    }


    // --------------------------------------
    // EDIT PAYMENT
    // --------------------------------------

    else if (kind === 'pay') {

        form('Edit payment', [

            {
                n: 'amount',
                l: 'Amount (₹)',
                t: 'number',
                r: 1
            },

            {
                n: 'note',
                l: 'Note (optional)'
            }

        ],

        function(values) {

            if (!(values.amount > 0)) {

                throw Error('Enter an amount.');

            }

            return Store.update(tableName, id, values);

        },

        record,

        deleteRecord

        );

    }


    // --------------------------------------
    // EDIT SALE OR PURCHASE
    // --------------------------------------

    else {

        const isSale = kind === 'sale';


        let personField;

        if (isSale) {

            personField = {

                n: 'customerId',
                l: 'Customer',
                t: 'select',
                o: opts(data.customers)

            };

        }
        else {

            personField = {

                n: 'supplierId',
                l: 'Supplier',
                t: 'select',
                o: opts(data.suppliers)

            };

        }


        form(

            isSale ? 'Edit sale' : 'Edit purchase',

            [

                personField,

                {
                    n: 'bagId',
                    l: 'Bag type',
                    t: 'select',
                    o: bagOpts(data)
                },

                {
                    n: 'qty',
                    l: 'Quantity (bags)',
                    t: 'number',
                    r: 1
                },

                {
                    n: 'rate',
                    l: 'Price per bag (₹)',
                    t: 'number',
                    r: 1
                }

            ],

            function(values) {

                if (isSale) {

                    return Store.editSale(id, values);

                }

                return Store.editPurchase(id, values);

            },

            record,

            deleteRecord

        );

    }

}


// ======================================================
// 17. CUSTOMER / SUPPLIER SUMMARY
// ======================================================

// Create a small summary section for an individual customer
// or supplier.

function summary(person, label, amount) {

    const contactDetails = [
        person.phone,
        person.address
    ].filter(Boolean).join(' · ');


    return `

        <a class="back" href="#">
            &larr; Back to all
        </a>

        <div class="panel summary">

            <b>${esc(person.name)}</b>

            <span>${esc(contactDetails)}</span>

            <span>
                ${label}
                <strong>${money(amount)}</strong>
            </span>

        </div>

    `;

}


// ======================================================
// 18. DIFFERENT WEBSITE PAGES
// ======================================================

// Each function creates the content for one page.
//
// The functions return:
// 1. HTML content
// 2. Buttons and their actions
// 3. Optional handler for special buttons

const P = {

    // ==========================================
    // INVENTORY PAGE
    // ==========================================

    async inventory(data) {

        // Create buttons used inside the inventory table.
        function button(action, id, text, color) {

            return `
                <button class="btn ${color} sm"
                    data-do="${action}:${id}">

                    ${text}

                </button>
            `;

        }


        // Create inventory table.
        const inventoryTable = table(

            [

                [
                    'Bag type',
                    function(row) {
                        return esc(row.name);
                    }
                ],

                [
                    'In stock',
                    function(row) {
                        return `<b>${row.stock}</b>`;
                    }
                ],

                [
                    'Selling price',
                    function(row) {
                        return row.rate ? money(row.rate) : '-';
                    }
                ],

                [
                    'Buying price',
                    function(row) {
                        return row.buyRate ? money(row.buyRate) : '-';
                    }
                ],

                [
                    'Status',
                    function(row) {

                        if (row.stock <= row.low) {

                            return '<span class="pill low">Low</span>';

                        }

                        return '<span class="pill ok">OK</span>';

                    }
                ],

                [
                    '',
                    function(row) {

                        return button('sell', row.id, 'Sell', '') +

                               button('buy', row.id, 'Buy stock', 'ghost') +

                               button('edit-bag', row.id, 'Edit', 'ghost');

                    }
                ]

            ],

            data.bags,

            'No bag types yet. Add your first one.'

        );


        // Create the Add Bag button.
        const actions = [

            [

                'Add bag type',

                function() {

                    form('New bag type', [

                        {
                            n: 'name',
                            l: 'Bag type',
                            r: 1
                        },

                        {
                            n: 'rate',
                            l: 'Default selling price (₹ per bag)',
                            t: 'number'
                        },

                        {
                            n: 'buyRate',
                            l: 'Default buying price (₹ per bag)',
                            t: 'number'
                        },

                        {
                            n: 'stock',
                            l: 'Opening stock (bags)',
                            t: 'number'
                        },

                        {
                            n: 'low',
                            l: 'Warn me when stock is at or below',
                            t: 'number'
                        }

                    ],

                    function(values) {

                        return Store.add('bags', values);

                    });

                }

            ]

        ];


        // Handle Sell, Buy Stock and Edit buttons.
        function handleButton(buttonValue) {

            const parts = buttonValue.split(':');

            const action = parts[0];
            const id = parts[1];


            if (action === 'sell') {

                saleForm(data, { bagId: id });

            }

            else if (action === 'buy') {

                buyForm(data, { bagId: id });

            }

            else {

                const bag = data.bags.find(function(item) {

                    return item.id === id;

                });

                form('Default selling price', [

                    {
                        n: 'rate',
                        l: 'Price per bag (₹)',
                        t: 'number',
                        r: 1
                    }

                ],

                function(values) {

                    return Store.update('bags', id, {
                        rate: values.rate
                    });

                },

                {
                    rate: bag.rate
                });

            }

        }


        return [
            inventoryTable,
            actions,
            handleButton
        ];

    },


    // ==========================================
    // SALES PAGE
    // ==========================================

    async sales(data) {

        // Show latest sales first.
        const sales = rev(data.sales);

        const salesTable = tx(
            data,
            sales,
            'customerId',
            data.customers,
            'sale'
        );


        const actions = [

            [
                'New sale',

                function() {

                    saleForm(data);

                }

            ]

        ];


        return [
            salesTable,
            actions
        ];

    },


    // ==========================================
    // HISAAB PAGE
    // ==========================================

    async hisaab(data) {

        // Calculate how much each customer owes us.
        const customersWithDue = data.customers.map(function(customer) {

            return {
                ...customer,
                due: owes(data, customer.id)
            };

        });


        // Show only customers who owe money.
        const customersWhoOwe = customersWithDue.filter(function(customer) {

            return customer.due > 0;

        });


        // Calculate how much we owe each supplier.
        const suppliersWithDue = data.suppliers.map(function(supplier) {

            return {
                ...supplier,
                due: owed(data, supplier.id)
            };

        });


        // Show only suppliers we owe money to.
        const suppliersWeOwe = suppliersWithDue.filter(function(supplier) {

            return supplier.due > 0;

        });


        // Calculate total amounts.
        const customerTotal = sum(customersWhoOwe, 'due');

        const supplierTotal = sum(suppliersWeOwe, 'due');


        // Create payment buttons.
        function paymentButton(action, text) {

            return `
                <button class="btn sm" data-do="${action}">
                    ${text}
                </button>
            `;

        }


        // Customer dues table.
        const customerTable = table(

            [

                [
                    'Customer',
                    function(row) {
                        return esc(row.name);
                    }
                ],

                [
                    'Owes you',
                    function(row) {
                        return `<b>${money(row.due)}</b>`;
                    }
                ],

                [
                    '',
                    function(row) {
                        return paymentButton(
                            'in:customer:' + row.id,
                            'Receive payment'
                        );
                    }
                ]

            ],

            customersWhoOwe,

            'No customer owes you anything.'

        );


        // Supplier dues table.
        const supplierTable = table(

            [

                [
                    'Supplier',
                    function(row) {
                        return esc(row.name);
                    }
                ],

                [
                    'You owe',
                    function(row) {
                        return `<b>${money(row.due)}</b>`;
                    }
                ],

                [
                    '',
                    function(row) {
                        return paymentButton(
                            'out:supplier:' + row.id,
                            'Pay'
                        );
                    }
                ]

            ],

            suppliersWeOwe,

            'You owe no supplier anything.'

        );


        // Payment history.
        const paymentHistory = payTable(
            data,
            rev(data.payments)
        );


        // Complete page HTML.
        const html = `

            <h3>
                Customers owe you: ${money(customerTotal)}
            </h3>

            ${customerTable}


            <h3>
                You owe suppliers: ${money(supplierTotal)}
            </h3>

            ${supplierTable}


            <h3>Payment history</h3>

            ${paymentHistory}

        `;


        // Page buttons.
        const actions = [

            [
                'Record payment',

                function() {

                    payForm(data);

                }

            ]

        ];


        // Handle Receive Payment and Pay buttons.
        function handlePayment(buttonValue) {

            const parts = buttonValue.split(':');

            const party = parts[1];
            const id = parts[2];


            let amount;

            if (party === 'customer') {

                amount = owes(data, id);

            }
            else {

                amount = owed(data, id);

            }


            payForm(data, {

                who: party + ':' + id,
                amount: amount

            });

        }


        return [
            html,
            actions,
            handlePayment
        ];

    },


    // ==========================================
    // CUSTOMERS PAGE
    // ==========================================

    async customers(data) {

        // Check whether a particular customer was selected.
        // The customer's ID is stored in the URL hash.

        const customerId = location.hash.slice(1);


        const selectedCustomer = data.customers.find(function(customer) {

            return customer.id === customerId;

        });


        // --------------------------------------
        // SHOW ALL CUSTOMERS
        // --------------------------------------

        if (!selectedCustomer) {

            const customerTable = table(

                [

                    [
                        'Customer',
                        function(row) {
                            return esc(row.name);
                        }
                    ],

                    [
                        'Phone',
                        function(row) {
                            return esc(row.phone);
                        }
                    ],

                    [
                        'Total sales',
                        function(row) {

                            const sales = data.sales.filter(function(sale) {

                                return sale.customerId === row.id;

                            });

                            return money(sum(sales));

                        }
                    ],

                    [
                        'Owes you',
                        function(row) {
                            return money(owes(data, row.id));
                        }
                    ],

                    [
                        '',
                        function(row) {
                            return editBtn('customer', row.id);
                        }
                    ]

                ],

                // Add a go property to make rows clickable.
                data.customers.map(function(customer) {

                    return {
                        ...customer,
                        go: customer.id
                    };

                }),

                'No customers yet. Add your first one.'

            );


            const actions = [

                [
                    'Add customer',

                    function() {

                        form('New customer', [

                            {
                                n: 'name',
                                l: 'Business name',
                                r: 1
                            },

                            {
                                n: 'phone',
                                l: 'Phone'
                            },

                            {
                                n: 'address',
                                l: 'Address'
                            }

                        ],

                        function(values) {

                            return Store.add('customers', values);

                        });

                    }

                ]

            ];


            return [
                customerTable,
                actions
            ];

        }


        // --------------------------------------
        // SHOW INDIVIDUAL CUSTOMER
        // --------------------------------------

        const customerSales = data.sales.filter(function(sale) {

            return sale.customerId === selectedCustomer.id;

        });


        const customerPayments = data.payments.filter(function(payment) {

            return payment.party === 'customer' &&
                   payment.partyId === selectedCustomer.id;

        });


        const html =

            summary(
                selectedCustomer,
                'Owes you',
                owes(data, selectedCustomer.id)
            )

            +

            '<h3>Sales</h3>'

            +

            tx(
                data,
                rev(customerSales),
                null,
                null,
                'sale'
            )

            +

            '<h3>Payments received</h3>'

            +

            payTable(
                data,
                rev(customerPayments)
            );


        const actions = [

            [
                'New sale',

                function() {

                    saleForm(data, {
                        customerId: selectedCustomer.id
                    });

                }

            ],

            [
                'Record payment',

                function() {

                    payForm(data, {
                        who: 'customer:' + selectedCustomer.id
                    });

                }

            ],

            [
                'Edit customer',

                function() {

                    editItem(
                        'edit-customer:' + selectedCustomer.id,
                        data
                    );

                }

            ]

        ];


        return [
            html,
            actions
        ];

    },


    // ==========================================
    // SUPPLIERS PAGE
    // ==========================================

    async suppliers(data) {

        const supplierId = location.hash.slice(1);


        const selectedSupplier = data.suppliers.find(function(supplier) {

            return supplier.id === supplierId;

        });


        // --------------------------------------
        // SHOW ALL SUPPLIERS
        // --------------------------------------

        if (!selectedSupplier) {

            const supplierTable = table(

                [

                    [
                        'Supplier',
                        function(row) {
                            return esc(row.name);
                        }
                    ],

                    [
                        'Phone',
                        function(row) {
                            return esc(row.phone);
                        }
                    ],

                    [
                        'Total bought',
                        function(row) {

                            const purchases = data.purchases.filter(function(purchase) {

                                return purchase.supplierId === row.id;

                            });

                            return money(sum(purchases));

                        }
                    ],

                    [
                        'You owe',
                        function(row) {
                            return money(owed(data, row.id));
                        }
                    ],

                    [
                        '',
                        function(row) {
                            return editBtn('supplier', row.id);
                        }
                    ]

                ],

                data.suppliers.map(function(supplier) {

                    return {
                        ...supplier,
                        go: supplier.id
                    };

                }),

                'No suppliers yet. Add your first one.'

            );


            const actions = [

                [

                    'Add supplier',

                    function() {

                        form('New supplier', [

                            {
                                n: 'name',
                                l: 'Business name',
                                r: 1
                            },

                            {
                                n: 'phone',
                                l: 'Phone'
                            },

                            {
                                n: 'address',
                                l: 'Address'
                            }

                        ],

                        function(values) {

                            return Store.add('suppliers', values);

                        });

                    }

                ],

                [

                    'New purchase',

                    function() {

                        buyForm(data);

                    }

                ]

            ];


            return [
                supplierTable,
                actions
            ];

        }


        // --------------------------------------
        // SHOW INDIVIDUAL SUPPLIER
        // --------------------------------------

        const supplierPurchases = data.purchases.filter(function(purchase) {

            return purchase.supplierId === selectedSupplier.id;

        });


        const supplierPayments = data.payments.filter(function(payment) {

            return payment.party === 'supplier' &&
                   payment.partyId === selectedSupplier.id;

        });


        const html =

            summary(
                selectedSupplier,
                'You owe',
                owed(data, selectedSupplier.id)
            )

            +

            '<h3>Purchases</h3>'

            +

            tx(
                data,
                rev(supplierPurchases),
                null,
                null,
                'purchase'
            )

            +

            '<h3>Payments made</h3>'

            +

            payTable(
                data,
                rev(supplierPayments)
            );


        const actions = [

            [
                'New purchase',

                function() {

                    buyForm(data, {
                        supplierId: selectedSupplier.id
                    });

                }

            ],

            [
                'Record payment',

                function() {

                    payForm(data, {
                        who: 'supplier:' + selectedSupplier.id
                    });

                }

            ],

            [
                'Edit supplier',

                function() {

                    editItem(
                        'edit-supplier:' + selectedSupplier.id,
                        data
                    );

                }

            ]

        ];


        return [
            html,
            actions
        ];

    },


    // ==========================================
    // STATISTICS PAGE
    // ==========================================

    async statistics(data) {

        // Calculate total sales.
        const totalSales = sum(data.sales);


        // Calculate total purchases.
        const totalPurchases = sum(data.purchases);


        // Calculate money received from customers.
        const receivedPayments = data.payments.filter(function(payment) {

            return payment.party === 'customer';

        });

        const totalReceived = sum(receivedPayments, 'amount');


        // Calculate money paid to suppliers.
        const supplierPayments = data.payments.filter(function(payment) {

            return payment.party === 'supplier';

        });

        const totalPaid = sum(supplierPayments, 'amount');


        // --------------------------------------
        // CREATE STATISTICS CARDS
        // --------------------------------------

        function card(label, amount) {

            return `

                <div class="panel stat">

                    <span>${label}</span>

                    <b>${money(r2(amount))}</b>

                </div>

            `;

        }


        // --------------------------------------
        // SALES BY CUSTOMER
        // --------------------------------------

        const customerStatistics = data.customers.map(function(customer) {

            // Find this customer's sales.
            const customerSales = data.sales.filter(function(sale) {

                return sale.customerId === customer.id;

            });


            // Calculate total sales.
            const customerTotal = sum(customerSales);


            // Calculate total bags sold.
            const bagsSold = sum(customerSales, 'qty');


            return {

                ...customer,

                t: customerTotal,

                q: bagsSold

            };

        });


        // Sort customers by total sales.
        // Highest sales should appear first.

        customerStatistics.sort(function(a, b) {

            return b.t - a.t;

        });


        // Create the customer statistics table.
        const customerTable = table(

            [

                [
                    'Customer',
                    function(row) {
                        return esc(row.name);
                    }
                ],

                [
                    'Bags sold',
                    function(row) {
                        return row.q;
                    }
                ],

                [
                    'Sales',
                    function(row) {
                        return money(row.t);
                    }
                ]

            ],

            customerStatistics,

            'No sales yet.'

        );


        // --------------------------------------
        // COMPLETE STATISTICS PAGE
        // --------------------------------------

        const html = `

            <div class="stats">

                ${card('Total sales', totalSales)}

                ${card('Total purchases', totalPurchases)}

                ${card('Net total (sales - purchases)',
                    totalSales - totalPurchases)}

                ${card('Received from customers', totalReceived)}

                ${card('Paid to suppliers', totalPaid)}

                ${card('Cash net (received - paid)',
                    totalReceived - totalPaid)}

                ${card('Customers owe you',
                    totalSales - totalReceived)}

                ${card('You owe suppliers',
                    totalPurchases - totalPaid)}

            </div>


            <h3>Sales by customer</h3>

            ${customerTable}

        `;


        // --------------------------------------
        // EXPORT AND IMPORT BACKUP
        // --------------------------------------

        const actions = [

            [

                'Export backup',

                async function() {

                    // Get all website data as JSON.
                    const backup = await Store.exportAll();


                    // Create a downloadable file.
                    const file = new Blob(

                        [backup],

                        {
                            type: 'application/json'
                        }

                    );


                    // Create a temporary download URL.
                    const url = URL.createObjectURL(file);


                    // Create an invisible download link.
                    const link = document.createElement('a');

                    link.href = url;


                    // Give the backup file a name.
                    const date = new Date().toISOString().slice(0, 10);

                    link.download = 'anrage-backup-' + date + '.json';


                    // Start downloading.
                    link.click();


                    // Release the temporary URL.
                    URL.revokeObjectURL(url);

                }

            ],


            [

                'Import backup',

                function() {

                    // Create a file input.
                    const input = document.createElement('input');

                    input.type = 'file';

                    input.accept = '.json';


                    // Run when the user selects a file.
                    input.onchange = async function() {

                        try {

                            // Read the selected file.
                            const file = input.files[0];

                            if (!file) {
                                return;
                            }

                            const json = await file.text();


                            // Restore website data.
                            await Store.importAll(json);

                            toast('Backup restored');

                            // Refresh the website.
                            render();

                        }
                        catch (error) {

                            toast(error.message);

                        }

                    };


                    // Open the file selection window.
                    input.click();

                }

            ]

        ];


        return [
            html,
            actions
        ];

    }

};


// ======================================================
// 19. RENDER THE PAGE
// ======================================================

// This is one of the most important functions in this file.
//
// It:
// 1. Gets data from Store.js.
// 2. Calls the correct page function.
// 3. Displays the HTML.
// 4. Connects buttons to their functions.

async function render() {

    try {

        // --------------------------------------
        // STEP 1: LOAD ALL WEBSITE DATA
        // --------------------------------------

        const data = {};


        const tableNames = [

            'bags',
            'customers',
            'suppliers',
            'sales',
            'purchases',
            'payments'

        ];


        // Load every table from Store.js.
        for (const tableName of tableNames) {

            data[tableName] = await Store.list(tableName);

        }


        // --------------------------------------
        // STEP 2: GENERATE CURRENT PAGE
        // --------------------------------------

        // Find the function for the current page.
        // Example: P.sales(data) or P.inventory(data).

        const pageFunction = P[page];


        // Run that function.
        const result = await pageFunction(data);


        // Get its returned values.
        const html = result[0];

        const actions = result[1];

        const on = result[2];


        // --------------------------------------
        // STEP 3: DISPLAY HTML
        // --------------------------------------

        let actionButtons = '';

        actions.forEach(function(action, index) {

            actionButtons += `

                <button class="btn" data-act="${index}">

                    ${action[0]}

                </button>

            `;

        });


        $('#view').innerHTML = `

            <div class="section-heading">

                <h2>${title}</h2>

                <div class="acts">

                    ${actionButtons}

                </div>

            </div>

            ${html}

        `;


        // --------------------------------------
        // STEP 4: CONNECT TOP BUTTONS
        // --------------------------------------

        const actionButtonsOnPage = document.querySelectorAll('[data-act]');

        actionButtonsOnPage.forEach(function(button) {

            button.onclick = function() {

                // Get which button was clicked.
                const index = button.dataset.act;

                // Run its connected function.
                actions[index][1]();

            };

        });


        // --------------------------------------
        // STEP 5: CONNECT TABLE BUTTONS
        // --------------------------------------

        const tableButtons = document.querySelectorAll('[data-do]');

        tableButtons.forEach(function(button) {

            button.onclick = function(event) {

                // Prevent the table row from also being clicked.
                event.stopPropagation();


                // Get the action stored in data-do.
                const action = button.dataset.do;


                // If it's an edit button, open the edit popup.
                if (action.startsWith('edit-')) {

                    editItem(action, data);

                }

                // Otherwise, call the page's special handler.
                else if (on) {

                    on(action);

                }

            };

        });


        // --------------------------------------
        // STEP 6: CONNECT CLICKABLE TABLE ROWS
        // --------------------------------------

        const clickableRows = document.querySelectorAll('[data-go]');

        clickableRows.forEach(function(row) {

            row.onclick = function() {

                // Store the selected person's ID in the URL.
                // This allows us to open their individual details.

                location.hash = row.dataset.go;

            };

        });

    }

    catch (error) {

        // Show any error that occurs while rendering.
        toast(error.message);

    }

}


// ======================================================
// 20. AUTOMATIC PAGE UPDATES
// ======================================================

// If the URL hash changes, render the page again.
// This is useful when opening a customer or supplier.

window.addEventListener('hashchange', function() {

    render();

});


// Display the page when the website first loads.

render();
