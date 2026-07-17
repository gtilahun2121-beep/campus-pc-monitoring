const API_BASE_URL = (window.API_BASE_URL || '').replace(/\/$/, '');
const authTokenKey = 'campusPcAuthToken';
let currentStudent = null;

const getToken = () => localStorage.getItem(authTokenKey);
const setToken = (token) => localStorage.setItem(authTokenKey, token);
const clearToken = () => localStorage.removeItem(authTokenKey);

const apiUrl = (path) => {
  if (!API_BASE_URL) {
    console.error('API base URL is not configured. Set window.API_BASE_URL in config.js');
  }
  return `${API_BASE_URL}${path}`;
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.remove('hidden');
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3500);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  const homeNav = document.getElementById('homeNav');
  const userInfo = document.getElementById('userInfo');

  if (['homePage', 'loginPage', 'registerPage', 'resetPasswordPage'].includes(pageId)) {
    homeNav.classList.remove('hidden');
    userInfo.classList.add('hidden');
  } else {
    homeNav.classList.add('hidden');
    if (getToken() && pageId !== 'loginPage' && pageId !== 'homePage') {
      userInfo.classList.remove('hidden');
    }
  }

  if (pageId === 'historyPage') {
    loadHistory();
  }

  if (pageId === 'dashboardPage') {
    document.getElementById('searchStudentId').value = '';
    document.getElementById('studentInfo').classList.add('hidden');
    currentStudent = null;
  }
}

function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  field.type = field.type === 'password' ? 'text' : 'password';
}

async function loginUser(username, password) {
  const response = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

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

  try {
    const data = await loginUser(username, password);
    if (data.status === 'success') {
      setToken(data.token);
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

async function logout() {
  clearToken();
  document.getElementById('userInfo').classList.add('hidden');
  document.getElementById('homeNav').classList.remove('hidden');
  document.getElementById('loginForm').reset();
  currentStudent = null;
  showPage('homePage');
  showNotification('Logged out successfully');
}

document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const studentId = document.getElementById('regStudentId').value.trim();
  const studentName = document.getElementById('regStudentName').value.trim();
  const department = document.getElementById('regDepartment').value.trim();
  const pcBrand = document.getElementById('regPcBrand').value.trim();
  const serialNumber = document.getElementById('regSerialNumber').value.trim();

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

  try {
    const response = await fetch(apiUrl('/api/pc/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, studentName, department, pcBrand, serialNumber }),
    });
    const data = await response.json();

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
    const response = await fetch(apiUrl(`/api/pc/search?searchTerm=${encodeURIComponent(searchTerm)}`), {
      headers: {
        ...authHeaders(),
      },
    });
    const data = await response.json();

    if (data.status === 'success' && data.data.length > 0) {
      currentStudent = data.data[0];
      displayStudentInfo(currentStudent);
    } else {
      showNotification(data.message || 'Student not found', 'error');
      document.getElementById('studentInfo').classList.add('hidden');
      currentStudent = null;
    }
  } catch (err) {
    showNotification('Server error. Please try again.', 'error');
  }
}

document.getElementById('searchStudentId').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') searchStudent();
});

function displayStudentInfo(pc) {
  document.getElementById('displayStudentId').textContent = pc.studentId;
  document.getElementById('displayStudentName').textContent = pc.studentName;
  document.getElementById('displayDepartment').textContent = pc.department;
  document.getElementById('displayPcBrand').textContent = pc.pcBrand;
  document.getElementById('displaySerial').textContent = pc.serialNumber;

  const statusSpan = document.getElementById('displayStatus');
  const isInside = pc.status === 'Inside Campus';
  statusSpan.textContent = isInside ? '🟢 Inside Campus' : '🔴 Outside Campus';
  statusSpan.className = isInside ? 'status-inside' : 'status-outside';

  document.getElementById('entryBtn').disabled = isInside;
  document.getElementById('exitBtn').disabled = !isInside;
  document.getElementById('studentInfo').classList.remove('hidden');
}

async function recordEntry() {
  if (!currentStudent) return;

  try {
    const response = await fetch(apiUrl('/api/pc/entry'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ serialNumber: currentStudent.serialNumber }),
    });
    const data = await response.json();

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

async function recordExit() {
  if (!currentStudent) return;

  try {
    const response = await fetch(apiUrl('/api/pc/exit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({ serialNumber: currentStudent.serialNumber }),
    });
    const data = await response.json();

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

async function loadHistory() {
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Loading...</td></tr>';

  try {
    const response = await fetch(apiUrl('/api/pc/history'), {
      headers: {
        ...authHeaders(),
      },
    });
    const data = await response.json();

    tbody.innerHTML = '';
    if (data.status === 'success' && data.data.length > 0) {
      data.data.forEach((record) => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${record.studentId}</td>
          <td>${record.serialNumber}</td>
          <td>${record.entryTime ? new Date(record.entryTime).toLocaleString() : '-'}</td>
          <td>${record.exitTime ? new Date(record.exitTime).toLocaleString() : '-'}</td>
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

document.getElementById('resetPasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('resetUsername').value.trim();
  const password = document.getElementById('resetPassword').value;
  const confirmPassword = document.getElementById('resetConfirmPassword').value;

  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    showNotification('Username can only contain letters, numbers and underscores', 'error');
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
    const response = await fetch(apiUrl('/api/auth/reset'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      showNotification('Admin credentials reset successfully');
      this.reset();
      showPage('loginPage');
    } else {
      showNotification(data.message || 'Reset failed', 'error');
    }
  } catch (err) {
    showNotification('Network error. Please try again.', 'error');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    document.getElementById('loggedUser').textContent = 'Administrator';
  }
});
