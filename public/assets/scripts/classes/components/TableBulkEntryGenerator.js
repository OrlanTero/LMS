export default class TableBulkEntryGenerator {
    constructor(options) {
        this.options = {
            addRowBtn: document.getElementById('addRowBtn'),
            manualEntryTable: document.getElementById('manualEntryTable'),
            autoGenerateCheckbox: document.getElementById('autoGenerateAccounts'),
            checkDuplicatesCheckbox: document.getElementById('checkDuplicates'),
            ...options
        };

        this.bulkEntryData = [];
        this.onDataChange = null;
        this.stepCallbacks = {};

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.attachInputListeners(this.options.manualEntryTable.querySelector('tbody tr'));
        this.attachRemoveRowListeners();
        this.updateBulkEntryData();
        this.setupTabChangeListener();
    }

    setupTabChangeListener() {
        const tabPanes = document.querySelectorAll('.tab-pane');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const activePane = document.querySelector('.tab-pane.active');
                    if (activePane) {
                        const step = Array.from(tabPanes).indexOf(activePane) + 1;
                        this.onStepChange(step);
                    }
                }
            });
        });

        tabPanes.forEach((pane) => {
            observer.observe(pane, { attributes: true });
        });
    }

    onStepChange(step) {
        if (this.stepCallbacks[step]) {
            this.stepCallbacks[step]();
        }
    }

    addData(newData) {
        this.bulkEntryData.push(newData);
        if (this.onDataChange) this.onDataChange(this.bulkEntryData);
    }

    getData() {
        return this.bulkEntryData;
    }

    setupEventListeners() {
        this.options.addRowBtn.addEventListener('click', () => this.addNewRow());
        this.options.autoGenerateCheckbox.addEventListener('change', () => this.handleAutoGenerateChange());
        this.options.checkDuplicatesCheckbox.addEventListener('change', () => this.handleCheckDuplicatesChange());
    }

    addNewRow() {
        const newRow = this.options.manualEntryTable.insertRow(-1);
        newRow.innerHTML = `
            <td><input type="text" name="firstName[]" required></td>
            <td><input type="text" name="middleName[]"></td>
            <td><input type="text" name="lastName[]" required></td>
            <td><input type="email" name="email[]" required></td>
            <td><input type="text" name="username[]" pattern="^[a-zA-Z0-9_]{3,20}$" title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores" required></td>
            <td><input type="text" name="uniqueId[]"></td>
            <td><input type="text" name="password[]"></td>
            <td><button type="button" class="btn-remove-row"><i data-feather="trash-2"></i></button></td>
        `;
        feather.replace();
        this.attachRemoveRowListeners();
        this.attachInputListeners(newRow);
        this.updateBulkEntryData();
    }

    attachRemoveRowListeners() {
        const removeButtons = document.querySelectorAll('.btn-remove-row');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('tr').remove();
                this.updateBulkEntryData();
            });
        });
    }

    attachInputListeners(row) {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.options.autoGenerateCheckbox.checked) {
                    this.generateAccountInfo(row);
                }
                if (this.options.checkDuplicatesCheckbox.checked) {
                    if (input.name === 'email[]') {
                        this.checkDuplicateEmail(input);
                    } else if (input.name === 'username[]') {
                        this.checkDuplicateUsername(input);
                    }
                }
                this.updateBulkEntryData();
            });
        });
    }

    generateAccountInfo(row) {
        const firstName = row.querySelector('input[name="firstName[]"]').value;
        const lastName = row.querySelector('input[name="lastName[]"]').value;
        const usernameInput = row.querySelector('input[name="username[]"]');
        const uniqueIdInput = row.querySelector('input[name="uniqueId[]"]');
        const passwordInput = row.querySelector('input[name="password[]"]');

        if (!usernameInput.value && firstName) {
            let username = firstName.toLowerCase().replace(/\s+/g, '');
            username += Math.random().toString().substring(2, 8);
            username = this.ensureUniqueUsername(username.substring(0, 20));
            usernameInput.value = username;
        }

        if (!uniqueIdInput.value) {
            const uniqueId = 'STU' + Math.floor(10000 + Math.random() * 90000);
            uniqueIdInput.value = uniqueId;
        }

        if (!passwordInput.value && lastName) {
            const password = lastName + '@' + Math.floor(100000 + Math.random() * 900000);
            passwordInput.value = password;
        }

        this.updateBulkEntryData();
    }

    ensureUniqueUsername(username) {
        const existingUsernames = Array.from(document.querySelectorAll('input[name="username[]"]')).map(el => el.value);
        let uniqueUsername = username;
        let counter = 1;
        while (existingUsernames.includes(uniqueUsername)) {
            uniqueUsername = (username + counter).substring(0, 20);
            counter++;
        }
        return uniqueUsername;
    }

    checkDuplicateEmail(input) {
        const emails = Array.from(document.querySelectorAll('input[name="email[]"]')).map(el => el.value);
        const currentEmail = input.value;
        const isDuplicate = emails.filter(email => email === currentEmail).length > 1;

        if (isDuplicate) {
            input.setCustomValidity('This email address is already in use.');
            input.reportValidity();
        } else {
            input.setCustomValidity('');
        }
    }

    checkDuplicateUsername(input) {
        const usernames = Array.from(document.querySelectorAll('input[name="username[]"]')).map(el => el.value);
        const currentUsername = input.value;
        const isDuplicate = usernames.filter(username => username === currentUsername).length > 1;

        if (isDuplicate) {
            input.setCustomValidity('This username is already in use.');
            input.reportValidity();
        } else {
            input.setCustomValidity('');
        }
    }

    handleAutoGenerateChange() {
        const rows = this.options.manualEntryTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (this.options.autoGenerateCheckbox.checked) {
                this.generateAccountInfo(row);
            }
        });
    }

    handleCheckDuplicatesChange() {
        const emailInputs = document.querySelectorAll('input[name="email[]"]');
        const usernameInputs = document.querySelectorAll('input[name="username[]"]');
        emailInputs.forEach(input => {
            if (this.options.checkDuplicatesCheckbox.checked) {
                this.checkDuplicateEmail(input);
            } else {
                input.setCustomValidity('');
            }
        });
        usernameInputs.forEach(input => {
            if (this.options.checkDuplicatesCheckbox.checked) {
                this.checkDuplicateUsername(input);
            } else {
                input.setCustomValidity('');
            }
        });
    }

    updateBulkEntryData() {
        this.bulkEntryData = [];
        const rows = this.options.manualEntryTable.querySelectorAll('tbody tr');
        if (rows.length === 0) {
            console.warn('No rows found in the table body');
            return;
        }
        rows.forEach(row => {
            const rowData = {
                firstName: row.querySelector('input[name="firstName[]"]')?.value || '',
                middleName: row.querySelector('input[name="middleName[]"]')?.value || '',
                lastName: row.querySelector('input[name="lastName[]"]')?.value || '',
                email: row.querySelector('input[name="email[]"]')?.value || '',
                username: row.querySelector('input[name="username[]"]')?.value || '',
                uniqueId: row.querySelector('input[name="uniqueId[]"]')?.value || '',
                password: row.querySelector('input[name="password[]"]')?.value || ''
            };
            if (Object.values(rowData).some(value => value !== '')) {
                this.bulkEntryData.push(rowData);
            }
        });

        // Trigger onDataChange callback if it exists
        if (this.onDataChange) {
            this.onDataChange(this.bulkEntryData);
        }
    }

    processCSV(csvData) {
        const rows = csvData.split('\n');
        let headerIndex = rows.findIndex(row => row.includes('First Name,Middle Name,Last Name,Email,Username,Unique ID,Password'));
        
        if (headerIndex === -1) {
            console.error('CSV header not found');
            return;
        }
        
        const headers = rows[headerIndex].split(',').map(header => header.trim());
        
        const data = rows.slice(headerIndex + 1)
            .map(row => row.split(',').map(cell => cell.trim()))
            .filter(row => row.length === headers.length)
            .map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index];
                });
                return rowData;
            });
        
        if (data.length === 0) {
            console.warn('No valid data rows found in CSV');
            return;
        }
        
        const tbody = this.options.manualEntryTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        data.forEach(rowData => {
            const newRow = tbody.insertRow(-1);
            newRow.innerHTML = `
                <td><input type="text" name="firstName[]" value="${rowData['First Name'] || ''}" required></td>
                <td><input type="text" name="middleName[]" value="${rowData['Middle Name'] || ''}"></td>
                <td><input type="text" name="lastName[]" value="${rowData['Last Name'] || ''}" required></td>
                <td><input type="email" name="email[]" value="${rowData['Email'] || ''}" required></td>
                <td><input type="text" name="username[]" value="${rowData['Username'] || ''}" pattern="^[a-zA-Z0-9_]{3,20}$" title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores" required></td>
                <td><input type="text" name="uniqueId[]" value="${rowData['Unique ID'] || ''}"></td>
                <td><input type="text" name="password[]" value="${rowData['Password'] || ''}"></td>
                <td><button type="button" class="btn-remove-row"><i data-feather="trash-2"></i></button></td>
            `;
            this.attachInputListeners(newRow);
        });
        
        this.attachRemoveRowListeners();
        feather.replace();
        this.updateBulkEntryData();

        document.querySelector('.file-upload').style.display = 'none';
        document.querySelector('.manual-entry').style.display = 'block';
    }

    onStep(step, callback) {
        this.stepCallbacks[step] = callback;
    }
}