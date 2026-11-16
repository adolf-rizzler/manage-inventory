
// ==========================================
// 1. STORE SETUP
// ==========================================

// Store is an object that contains all our data functions.
// We use localStorage to save data in the browser.

const Store = (function() {

    // Prefix added to every localStorage key
    const PREFIX = 'anrage:';

    // All the different types of data in our website
    const TABLES = [
        'bags',
        'customers',
        'suppliers',
        'sales',
        'purchases',
        'payments'
    ];


    // ==========================================
    // 2. READ DATA
    // ==========================================

    function read(tableName) {

        try {

            // Get data from localStorage
            const data = localStorage.getItem(PREFIX + tableName);

            // Convert JSON text into a JavaScript array
            // If no data exists, return an empty array
            return JSON.parse(data) || [];

        }
        catch (error) {

            // If something goes wrong, return an empty array
            return [];

        }

    }


    // ==========================================
    // 3. SAVE DATA
    // ==========================================

    function write(tableName, data) {

        try {

            // Convert JavaScript data into JSON text
            const jsonData = JSON.stringify(data);

            // Save it inside localStorage
            localStorage.setItem(PREFIX + tableName, jsonData);

        }
        catch (error) {

            // Show an error if browser storage is unavailable
            throw Error('Could not save. Browser storage is full or blocked.');

        }

    }


    // ==========================================
    // 4. GENERATE UNIQUE IDs
    // ==========================================

    function generateID() {

        // Create a unique ID using the current time
        // and a random number
        const time = Date.now().toString(36);
        const random = Math.random().toString(36).slice(2, 6);

        return time + random;

    }


    // ==========================================
    // 5. UPDATE STOCK
    // ==========================================

    function stockMove(bagId, quantityChange) {

        // Get all bags from storage
        const bags = read('bags');

        // Find the bag with the matching ID
        const bag = bags.find(function(item) {
            return item.id === bagId;
        });

        // Check whether the bag exists
        if (!bag) {
            throw Error('Pick a bag type.');
        }

        // Make sure stock doesn't become negative
        if (bag.stock + quantityChange < 0) {

            throw Error(
                'Only ' + bag.stock + ' ' + bag.name + ' in stock.'
            );

        }

        // Update the stock
        bag.stock = bag.stock + quantityChange;

        // Save the updated stock
        write('bags', bags);

    }


    // ==========================================
    // 6. ADD A NEW RECORD
    // ==========================================

    async function add(tableName, record) {

        // Get the existing records
        const records = read(tableName);

        // Create a new record
        const newRecord = {

            ...record,

            // Give it a unique ID
            id: generateID(),

            // Save the current date and time
            at: new Date().toISOString()

        };

        // Add the new record to the array
        records.push(newRecord);

        // Save the updated array
        write(tableName, records);

        // Return the newly created record
        return newRecord;

    }


    // ==========================================
    // 7. EDIT SALES AND PURCHASES
    // ==========================================

    async function editTransaction(tableName, id, changes, sign) {

        // Get all existing records
        const records = read(tableName);

        // Find the position of the record we want to edit
        const index = records.findIndex(function(item) {
            return item.id === id;
        });

        // Check whether the record exists
        if (index === -1) {
            throw Error('Record not found.');
        }

        // Get the old record
        const oldRecord = records[index];

        // Create an updated version of the record
        const newRecord = {
            ...oldRecord,
            ...changes
        };


        // Check quantity
        if (!(newRecord.qty > 0)) {
            throw Error('Enter a quantity.');
        }

        // Check price
        if (!(newRecord.rate > 0)) {
            throw Error('Enter a price.');
        }


        // --------------------------------------
        // STEP 1: UNDO OLD STOCK CHANGE
        // --------------------------------------

        // For a sale, stock was reduced.
        // For a purchase, stock was increased.
        // Reverse that old change first.

        stockMove(
            oldRecord.bagId,
            -sign * oldRecord.qty
        );


        // --------------------------------------
        // STEP 2: APPLY NEW STOCK CHANGE
        // --------------------------------------

        try {

            // Apply the stock change using new values
            stockMove(
                newRecord.bagId,
                sign * newRecord.qty
            );

        }
        catch (error) {

            // If the new stock change fails,
            // restore the old stock amount.

            stockMove(
                oldRecord.bagId,
                sign * oldRecord.qty
            );

            // Show the original error
            throw error;

        }


        // --------------------------------------
        // STEP 3: SAVE UPDATED RECORD
        // --------------------------------------

        // Read the table again
        const updatedRecords = read(tableName);

        // Calculate the new total price
        const total = Math.round(
            newRecord.qty * newRecord.rate * 100
        ) / 100;

        // Replace the old record with the updated record
        updatedRecords[index] = {
            ...newRecord,
            total: total
        };

        // Save everything
        write(tableName, updatedRecords);


        // --------------------------------------
        // STEP 4: UPDATE LINKED PAYMENTS
        // --------------------------------------

        // If a sale or purchase was connected to a customer
        // or supplier, update that connection too.

        let paymentKey;
        let newPartyId;

        if (tableName === 'sales') {

            paymentKey = 'saleId';
            newPartyId = newRecord.customerId;

        }
        else {

            paymentKey = 'purchaseId';
            newPartyId = newRecord.supplierId;

        }

        // Get all payments
        const payments = read('payments');

        let paymentChanged = false;

        // Check every payment
        payments.forEach(function(payment) {

            // Find payments connected to this transaction
            if (payment[paymentKey] === id) {

                // Update the customer/supplier ID
                payment.partyId = newPartyId;

                paymentChanged = true;

            }

        });

        // Save payments only if something changed
        if (paymentChanged) {
            write('payments', payments);
        }

    }


    // ==========================================
    // 8. COUNT RECORDS
    // ==========================================

    function count(tableName, condition) {

        // Get all records
        const records = read(tableName);

        // Keep only records that match the condition
        const matchingRecords = records.filter(condition);

        // Return how many records matched
        return matchingRecords.length;

    }


    // ==========================================
    // 9. DELETE RECORDS
    // ==========================================

    async function remove(tableName, id) {

        // Get all records from the selected table
        const records = read(tableName);

        // Find the record we want to delete
        const index = records.findIndex(function(item) {
            return item.id === id;
        });

        // Check whether the record exists
        if (index === -1) {
            throw Error('Record not found.');
        }

        // Get the record
        const record = records[index];


        // --------------------------------------
        // DELETING A SALE
        // --------------------------------------

        if (tableName === 'sales') {

            // When a sale is deleted,
            // the sold stock should come back.

            stockMove(record.bagId, record.qty);

        }


        // --------------------------------------
        // DELETING A PURCHASE
        // --------------------------------------

        else if (tableName === 'purchases') {

            // When a purchase is deleted,
            // remove the stock that was added.

            try {

                stockMove(record.bagId, -record.qty);

            }
            catch (error) {

                throw Error(
                    'Cannot delete: some of these bags are already sold, so stock would go below zero.'
                );

            }

        }


        // --------------------------------------
        // DELETING A CUSTOMER
        // --------------------------------------

        else if (tableName === 'customers') {

            // Count their sales
            const salesCount = count('sales', function(item) {
                return item.customerId === id;
            });

            // Count their payments
            const paymentCount = count('payments', function(item) {
                return item.party === 'customer' && item.partyId === id;
            });

            const totalRecords = salesCount + paymentCount;

            // Don't delete a customer who has related records
            if (totalRecords > 0) {

                throw Error(
                    'Cannot delete ' + record.name +
                    ': ' + totalRecords +
                    ' sale/payment record(s) belong to them. Delete those first.'
                );

            }

        }


        // --------------------------------------
        // DELETING A SUPPLIER
        // --------------------------------------

        else if (tableName === 'suppliers') {

            // Count their purchases
            const purchaseCount = count('purchases', function(item) {
                return item.supplierId === id;
            });

            // Count their payments
            const paymentCount = count('payments', function(item) {
                return item.party === 'supplier' && item.partyId === id;
            });

            const totalRecords = purchaseCount + paymentCount;

            // Don't delete a supplier who has related records
            if (totalRecords > 0) {

                throw Error(
                    'Cannot delete ' + record.name +
                    ': ' + totalRecords +
                    ' purchase/payment record(s) belong to them. Delete those first.'
                );

            }

        }


        // --------------------------------------
        // DELETING A BAG TYPE
        // --------------------------------------

        else if (tableName === 'bags') {

            // Check whether this bag is used in any sales
            const salesCount = count('sales', function(item) {
                return item.bagId === id;
            });

            // Check whether this bag is used in any purchases
            const purchaseCount = count('purchases', function(item) {
                return item.bagId === id;
            });

            const totalRecords = salesCount + purchaseCount;

            // Don't delete a bag that is used in transactions
            if (totalRecords > 0) {

                throw Error(
                    'Cannot delete ' + record.name +
                    ': ' + totalRecords +
                    ' sale/purchase record(s) use it. Delete those first.'
                );

            }

        }


        // --------------------------------------
        // REMOVE THE RECORD
        // --------------------------------------

        // Remove one item from the array
        records.splice(index, 1);

        // Save the updated array
        write(tableName, records);


        // --------------------------------------
        // DELETE LINKED PAYMENTS
        // --------------------------------------

        // If we deleted a sale or purchase,
        // delete its connected payments too.

        if (tableName === 'sales' || tableName === 'purchases') {

            let key;

            if (tableName === 'sales') {
                key = 'saleId';
            }
            else {
                key = 'purchaseId';
            }

            // Get all payments
            const payments = read('payments');

            // Keep only payments that don't belong to this transaction
            const remainingPayments = payments.filter(function(payment) {
                return payment[key] !== id;
            });

            // Save the remaining payments
            write('payments', remainingPayments);

        }

    }


    // ==========================================
    // 10. RETURN STORE FUNCTIONS
    // ==========================================

    // These functions can now be used by other JS files
    return {


        // --------------------------------------
        // EDIT SALE
        // --------------------------------------

        editSale: function(id, changes) {

            // -1 means a sale reduces stock
            return editTransaction('sales', id, changes, -1);

        },


        // --------------------------------------
        // EDIT PURCHASE
        // --------------------------------------

        editPurchase: function(id, changes) {

            // +1 means a purchase increases stock
            return editTransaction('purchases', id, changes, 1);

        },


        // --------------------------------------
        // GET ALL RECORDS
        // --------------------------------------

        list: async function(tableName) {

            return read(tableName);

        },


        // --------------------------------------
        // DELETE RECORD
        // --------------------------------------

        remove: remove,


        // --------------------------------------
        // FIND OR CREATE BY NAME
        // --------------------------------------

        ensureByName: async function(tableName, name) {

            const records = read(tableName);

            // Find a record with the same name
            const existingRecord = records.find(function(record) {

                return String(record.name).trim().toLowerCase() ===
                       name.toLowerCase();

            });

            // If it exists, return it
            if (existingRecord) {
                return existingRecord;
            }

            // Otherwise, create a new record
            return add(tableName, { name: name });

        },


        // --------------------------------------
        // ADD A RECORD
        // --------------------------------------

        add: add,


        // --------------------------------------
        // UPDATE A RECORD
        // --------------------------------------

        update: async function(tableName, id, changes) {

            const records = read(tableName);

            // Find the record
            const index = records.findIndex(function(record) {
                return record.id === id;
            });

            if (index === -1) {
                throw Error('Record not found.');
            }

            // Update its existing values
            records[index] = {
                ...records[index],
                ...changes
            };

            // Save the updated array
            write(tableName, records);

        },


        // --------------------------------------
        // SELL BAGS
        // --------------------------------------

        sell: async function(sale) {

            // Quantity must be greater than zero
            if (!(sale.qty > 0)) {
                throw Error('Enter a quantity.');
            }

            // Reduce stock because bags are being sold
            stockMove(sale.bagId, -sale.qty);

            // Calculate total price
            const total = Math.round(
                sale.qty * sale.rate * 100
            ) / 100;

            // Save the sale
            return add('sales', {
                ...sale,
                total: total
            });

        },


        // --------------------------------------
        // PURCHASE BAGS
        // --------------------------------------

        buy: async function(purchase) {

            // Quantity must be greater than zero
            if (!(purchase.qty > 0)) {
                throw Error('Enter a quantity.');
            }

            // Increase stock because new bags arrived
            stockMove(purchase.bagId, purchase.qty);

            // Calculate total price
            const total = Math.round(
                purchase.qty * purchase.rate * 100
            ) / 100;

            // Save the purchase
            return add('purchases', {
                ...purchase,
                total: total
            });

        },


        // --------------------------------------
        // RECORD PAYMENT
        // --------------------------------------

        pay: async function(payment) {

            // Save the payment
            return add('payments', payment);

        },


        // --------------------------------------
        // EXPORT BACKUP
        // --------------------------------------

        exportAll: async function() {

            // Create an object containing all tables
            const backup = {};

            TABLES.forEach(function(tableName) {

                backup[tableName] = read(tableName);

            });

            // Convert the backup into JSON text
            return JSON.stringify(backup);

        },


        // --------------------------------------
        // IMPORT BACKUP
        // --------------------------------------

        importAll: async function(json) {

            // Convert JSON text into JavaScript object
            const backup = JSON.parse(json);

            // Check whether every required table exists
            TABLES.forEach(function(tableName) {

                if (!Array.isArray(backup[tableName])) {

                    throw Error('This is not a valid backup file.');

                }

            });

            // Save all imported tables
            TABLES.forEach(function(tableName) {

                write(tableName, backup[tableName]);

            });

        }

    };

})();
