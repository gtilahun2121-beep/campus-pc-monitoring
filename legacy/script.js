// ============================================================
// Campus PC Entry & Exit Monitoring System - Frontend Logic
// All data operations go through PHP API endpoints
// ============================================================

// Currently searched student data (held in memory for entry/exit actions)
let currentStudent = null;

// ---------------------------------------------------------------
// Utility: Show notification banner
// ---------------------------------------------------------------
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3500);
}

// ---------------------------------------------------------------
// Utility: Show a page by ID, hide all others
// ---------------------------------------------------------------
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    const homeNav = document.getElementById('homeNav');
    const userInfo = document.getElementById('userInfo');

    if (['homePage', 'loginPage', 'registerPage', 'resetPasswordPage'].includes(pageId)) {
        homeNav.classList.remove('hidden');
        userInfo.classList.add('hidden');
    } else {
        homeNav.classList.add('hidden');
    }

    if (pageId === 'historyPage') {
        loadHistory();
    }

    if (pageId === 'dashboardPage') {
        // Clear previous search when returning to dashboard
        document.getElementById('searchStudentId').value = '';
        document.getElementById('studentInfo').classList.add('hidden');
        currentStudent = null;
    }
}

// ---------------------------------------------------------------
// Toggle password field visibility
// ---------------------------------------------------------------
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!/^[A-Za-z]+$/.test(username)) {
        showNotification('Username must contain letters only', 'error');
        return;
    }

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const res = await fetch('api/login.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.status === 'success') {
            document.getElementById('loggedUser').textContent = `Welcome, ${username}`;
            document.getElementById('userInfo').classList.remove('hidden');
            document.getElementById('homeNav').classList.add('hidden');
            showPage('dashboardPage');
            showNotification('Login successful');
            this.reset();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        showNotification('Server error. Please try again.', 'error');
    }
});

// ---------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------
async function logout() {
    try {
        await fetch('api/logout.php');
    } catch (_) { /* ignore network errors on logout */ }

    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('homeNav').classList.remove('hidden');
    document.getElementById('loginForm').reset();
    currentStudent = null;
    showPage('homePage');
    showNotification('Logged out successfully');
}

// ---------------------------------------------------------------
// PC REGISTRATION
// ---------------------------------------------------------------
document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const studentId    = document.getElementById('regStudentId').value.trim();
    const studentName  = document.getElementById('regStudentName').value.trim();
    const department   = document.getElementById('regDepartment').value.trim();
    const pcBrand      = document.getElementById('regPcBrand').value.trim();
    const serialNumber = document.getElementById('regSerialNumber').value.trim();

    // Validation
    if (!/^[0-9]+$/.test(studentId)) {
        showNotification('Student ID must contain only numbers', 'error');
        return;
    }
    if (!/^[A-Za-z ]+$/.test(studentName)) {
        showNotification('Student Name must contain only letters', 'error');
        return;
    }
    if (!/^[A-Za-z ]+$/.test(department)) {
        showNotification('Department must contain only letters', 'error');
        return;
    }
    if (!/^[A-Za-z ]+$/.test(pcBrand)) {
        showNotification('PC Brand must contain only letters', 'error');
        return;
    }
    if (!/^[A-Za-z0-9]+$/.test(serialNumber)) {
        showNotification('Serial Number must contain only letters and numbers', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('student_id',    studentId);
    formData.append('student_name',  studentName);
    formData.append('department',    department);
    formData.append('pc_brand',      pcBrand);
    formData.append('serial_number', serialNumber);

    try {
        const res  = await fetch('api/register_pc.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.status === 'success') {
            showNotification('PC registered successfully');
            this.reset();
            showPage('homePage');
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (err) {
        showNotification('Server error. Please try again.', 'error');
    }
});

// ---------------------------------------------------------------
// SEARCH STUDENT (dashboard)
// ---------------------------------------------------------------
async function searchStudent() {
    const searchTerm = document.getElementById('searchStudentId').value.trim();

    if (!searchTerm) {
        showNotification('Please enter a Student ID or Name to search', 'error');
        return;
    }

    if (searchTerm.length < 2) {
        showNotification('Please enter at least 2 characters', 'error');
        return;
    }

    try {
        const res  = await fetch(`api/search_student.php?search_term=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();

        if (data.status === 'success' && data.data.length > 0) {
            currentStudent = data.data[0]; // use first match
            displayStudentInfo(currentStudent);
        } else {
            showNotification('Student not found', 'error');
            document.getElementById('studentInfo').classList.add('hidden');
            currentStudent = null;
        }
    } catch (err) {
        showNotification('Server error. Please try again.', 'error');
    }
}

// Allow pressing Enter in the search box
document.getElementById('searchStudentId').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') searchStudent();
});

// ---------------------------------------------------------------
// Display student info card
// ---------------------------------------------------------------
function displayStudentInfo(pc) {
    document.getElementById('displayStudentId').textContent   = pc.student_id;
    document.getElementById('displayStudentName').textContent = pc.student_name;
    document.getElementById('displayDepartment').textContent  = pc.department;
    document.getElementById('displayPcBrand').textContent     = pc.pc_brand;
    document.getElementById('displaySerial').textContent      = pc.serial_number;

    const statusSpan = document.getElementById('displayStatus');
    const isInside   = pc.status === 'Inside Campus';
    statusSpan.textContent  = isInside ? '🟢 Inside Campus' : '🔴 Outside Campus';
    statusSpan.className    = isInside ? 'status-inside' : 'status-outside';

    document.getElementById('entryBtn').disabled = isInside;
    document.getElementById('exitBtn').disabled  = !isInside;

    document.getElementById('studentInfo').classList.remove('hidden');
}

// ---------------------------------------------------------------
// RECORD ENTRY
// ---------------------------------------------------------------
async function recordEntry() {
    if (!currentStudent) return;

    const formData = new FormData();
    formData.append('serial_number', currentStudent.serial_number);

    try {
        const res  = await fetch('api/record_entry.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.status === 'success') {
            currentStudent.status = 'Inside Campus';
            displayStudentInfo(currentStudent);
            showNotification('Entry recorded successfully');
        } else {
            showNotification(data.message || 'Could not record entry', 'error');
        }
    } catch (err) {
        showNotification('Server error. Please try again.', 'error');
    }
}

// ---------------------------------------------------------------
// RECORD EXIT
// ---------------------------------------------------------------
async function recordExit() {
    if (!currentStudent) return;

    const formData = new FormData();
    formData.append('serial_number', currentStudent.serial_number);

    try {
        const res  = await fetch('api/record_exit.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.status === 'success') {
            currentStudent.status = 'Outside Campus';
            displayStudentInfo(currentStudent);
            showNotification('Exit recorded successfully');
        } else {
            showNotification(data.message || 'Could not record exit', 'error');
        }
    } catch (err) {
        showNotification('Server error. Please try again.', 'error');
    }
}

// ---------------------------------------------------------------
// LOAD HISTORY (all records, admin view)
// ---------------------------------------------------------------
async function loadHistory() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Loading...</td></tr>';

    try {
        const res  = await fetch('api/get_history.php');
        const data = await res.json();

        tbody.innerHTML = '';

        if (data.status === 'success' && data.data.length > 0) {
            data.data.forEach(record => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${record.student_id}</td>
                    <td>${record.serial_number}</td>
                    <td>${record.entry_time || '-'}</td>
                    <td>${record.exit_time  || '-'}</td>
                    <td class="${record.status === 'Inside Campus' ? 'status-inside' : 'status-outside'}">
                        ${record.status === 'Inside Campus' ? '🟢' : '🔴'} ${record.status}
                    </td>
                `;
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No activity recorded</td></tr>';
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red">Failed to load history</td></tr>';
    }
}

// ---------------------------------------------------------------
// RESET ADMIN CREDENTIALS
// ---------------------------------------------------------------
document.getElementById('resetPasswordForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username        = document.getElementById('resetUsername').value.trim();
    const password        = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;

    if (!/^[A-Za-z0-9_]+$/.test(username)) {
        showNotification('Username must contain letters only', 'error');
        return;
    }

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (!confirm('Are you sure? This will delete the current admin account and create a new one.')) {
        return;
    }

    try {
        const res = await fetch('api/reset_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const raw = await res.text(); // get raw response first
        let data;
        try {
            data = JSON.parse(raw);
        } catch (_) {
            // PHP returned something that isn't JSON — show it for debugging
            showNotification('PHP error: ' + raw.substring(0, 120), 'error');
            return;
        }

        if (data.success) {
            showNotification('Admin credentials reset successfully');
            this.reset();
            showPage('loginPage');
        } else {
            showNotification(data.message || 'Reset failed', 'error');
        }
    } catch (err) {
        showNotification('Network error: ' + err.message, 'error');
    }
});
