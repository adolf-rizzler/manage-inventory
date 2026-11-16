
// ==========================================
// 1. GET HTML ELEMENTS
// ==========================================

// Get elements from our HTML using their IDs
const toast = document.getElementById('toast');
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const sidebarClose = document.getElementById('sidebarClose');

// We'll use this variable to control the toast timer
let toastTimer;


// ==========================================
// 2. SIDEBAR MENU
// ==========================================

// This function opens or closes the sidebar
function setMenu(open) {

    // Add or remove the 'open' class
    sidebar.classList.toggle('open', open);

    // Show or hide the dark background
    overlay.classList.toggle('show', open);

    // Add or remove menu-open class from body
    document.body.classList.toggle('menu-open', open);

    // Tell the browser whether the menu is open
    menuBtn.setAttribute('aria-expanded', String(open));
}


// Open sidebar when menu button is clicked
menuBtn.addEventListener('click', function() {
    setMenu(true);
});

// Close sidebar when close button is clicked
sidebarClose.addEventListener('click', function() {
    setMenu(false);
});

// Close sidebar when background is clicked
overlay.addEventListener('click', function() {
    setMenu(false);
});

// Close sidebar when Escape key is pressed
document.addEventListener('keydown', function(event) {

    if (event.key === 'Escape') {
        setMenu(false);
    }

});


// ==========================================
// 3. SHOW NOTIFICATION (TOAST)
// ==========================================

function showToast(message) {

    // Display the message
    toast.textContent = message;

    // Make the toast visible
    toast.classList.add('show');

    // Clear the previous timer
    clearTimeout(toastTimer);

    // Hide the toast after 2.4 seconds
    toastTimer = setTimeout(function() {
        toast.classList.remove('show');
    }, 2400);

}


// ==========================================
// 4. PAGE NAVIGATION
// ==========================================

// Connect each section name to its HTML page
const PAGES = {

    'Overview': 'index.html',
    'Sales': 'sales.html',
    'Customers': 'customers.html',
    'Supplier': 'suppliers.html',
    'Inventory': 'inventory.html',
    'Statistics': 'statistics.html',
    'Record Payment': 'hisaab.html',
    'Add Payment': 'hisaab.html'

};


// Find all buttons that have a data-section attribute
const sectionButtons = document.querySelectorAll('[data-section]');

sectionButtons.forEach(function(button) {

    button.addEventListener('click', function() {

        // Get the section name from the button
        const sectionName = button.dataset.section;

        // Find the matching HTML page
        const page = PAGES[sectionName];

        // If we're already on the overview page, just close the menu
        if (page === 'index.html') {
            setMenu(false);
        }

        // Otherwise, open the selected page
        else {
            window.location.href = page;
        }

    });

});


// ==========================================
// 5. NOTIFICATION BUTTON
// ==========================================

document.getElementById('notifications').addEventListener('click', function() {

    showToast('You’re all caught up on notifications.');

});


// When View All is clicked, open the sidebar
document.querySelector('.view-all').addEventListener('click', function(event) {

    // Stop the link from opening another page
    event.preventDefault();

    setMenu(true);

});


// ==========================================
// 6. DISPLAY TODAY'S DATE
// ==========================================

const todayEl = document.getElementById('today-date');

function updateDate() {

    // Get today's date
    const today = new Date();

    // Convert it into a readable format
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    // Display the date in HTML
    todayEl.textContent = formattedDate;

}

// Display date immediately
updateDate();

// Update the date every 60 seconds
setInterval(updateDate, 60000);


// ==========================================
// 7. MONEY FORMAT
// ==========================================

// Convert a number into Indian currency format
// Example: 50000 becomes ₹50,000
function money(amount) {

    return '₹' + Number(amount || 0).toLocaleString('en-IN');

}


// ==========================================
// 8. DATE AND TIME FORMAT
// ==========================================

function when(date) {

    const formattedDate = new Date(date).toLocaleString('en-IN', {

        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit'

    });

    return formattedDate;

}


// ==========================================
// 9. LOAD DASHBOARD DATA
// ==========================================

async function fillDashboard() {

    // Get information from the database/store
    // Promise.all loads all these lists together

    const bags = await Store.list('bags');
    const customers = await Store.list('customers');
    const sales = await Store.list('sales');
    const purchases = await Store.list('purchases');
    const suppliers = await Store.list('suppliers');


    // --------------------------------------
    // UPDATE SIDEBAR COUNTS
    // --------------------------------------

    function setCount(sectionName, number) {

        // Find the count element for this section
        const element = document.querySelector(
            '.nav-button[data-section="' + sectionName + '"] .nav-count'
        );

        // Update the number if the element exists
        if (element) {
            element.textContent = number;
        }

    }

    // Show total number of sales
    setCount('Sales', sales.length);

    // Calculate total stock from all bags
    let totalStock = 0;

    bags.forEach(function(bag) {
        totalStock = totalStock + bag.stock;
    });

    setCount('Inventory', totalStock);


    // --------------------------------------
    // FIND NAMES USING THEIR IDs
    // --------------------------------------

    function getName(list, id) {

        // Find the item whose ID matches
        const item = list.find(function(element) {
            return element.id === id;
        });

        // Return its name
        // If it doesn't exist, return 'Removed'
        if (item) {
            return item.name;
        }

        return 'Removed';

    }


    // --------------------------------------
    // GET THE LATEST ACTIVITY
    // --------------------------------------

    function getLastItem(list) {

        // Get the last item from an array
        return list[list.length - 1];

    }

    const latestSale = getLastItem(sales);
    const latestPurchase = getLastItem(purchases);
    const latestCustomer = getLastItem(customers);


    // Get all activity rows from HTML
    const rows = document.querySelectorAll('.activity-row');


    // --------------------------------------
    // DISPLAY ACTIVITY
    // --------------------------------------

    function setActivity(row, message, date) {

        // Display activity description
        row.querySelector('.activity-desc').innerHTML = message;

        // Display date and time
        if (date) {
            row.querySelector('.activity-time').textContent = when(date);
        }
        else {
            row.querySelector('.activity-time').textContent = '';
        }

    }


    // Show latest sale
    if (latestSale) {

        const customerName = getName(customers, latestSale.customerId);
        const bagName = getName(bags, latestSale.bagId);

        setActivity(
            rows[0],
            '<b>New sale</b> · ' +
            escapeHTML(customerName) + ', ' +
            latestSale.qty + ' × ' +
            escapeHTML(bagName) + ', ' +
            money(latestSale.total),
            latestSale.at
        );

    }
    else {

        setActivity(rows[0], '<b>New sale</b> · none yet', null);

    }


    // Show latest purchase
    if (latestPurchase) {

        const bagName = getName(bags, latestPurchase.bagId);
        const supplierName = getName(suppliers, latestPurchase.supplierId);

        setActivity(
            rows[1],
            '<b>Stock updated</b> · ' +
            latestPurchase.qty + ' × ' +
            escapeHTML(bagName) + ' from ' +
            escapeHTML(supplierName),
            latestPurchase.at
        );

    }
    else {

        setActivity(rows[1], '<b>Stock updated</b> · none yet', null);

    }


    // Show latest customer
    if (latestCustomer) {

        setActivity(
            rows[2],
            '<b>New customer</b> · ' + escapeHTML(latestCustomer.name),
            latestCustomer.at
        );

    }
    else {

        setActivity(rows[2], '<b>New customer</b> · none yet', null);

    }

}


// ==========================================
// 10. PROTECT HTML FROM UNSAFE TEXT
// ==========================================

function escapeHTML(text) {

    // Convert special characters into safe HTML characters
    // This prevents text from being treated as HTML code

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


// ==========================================
// 11. LOAD STORE.JS
// ==========================================

// Create a new script element
const storeScript = document.createElement('script');

// Tell the browser which JavaScript file to load
storeScript.src = 'store.js';

// This runs after store.js has loaded
storeScript.onload = function() {

    // Load dashboard information
    fillDashboard().catch(function() {

        showToast('Could not load your data.');

    });


    // Load search.js
    const searchScript = document.createElement('script');

    searchScript.src = 'search.js';

    document.head.appendChild(searchScript);

};

// Add store.js to the HTML page
document.head.appendChild(storeScript);
