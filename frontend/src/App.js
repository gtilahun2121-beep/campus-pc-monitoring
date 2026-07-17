import React, { useEffect, useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const apiUrl = (path) => `${API_BASE_URL}${path}`;

const validateUsername = (username) => /^[A-Za-z]+$/.test(username);
const validateStudentId = (studentId) => /^[0-9]+$/.test(studentId);
const validateText = (value) => /^[A-Za-z ]+$/.test(value);
const validateSerial = (value) => /^[A-Za-z0-9]+$/.test(value);

function App() {
  const [page, setPage] = useState('homePage');
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('campusPcAuthToken') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetUsername, setResetUsername] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regStudentName, setRegStudentName] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regPcBrand, setRegPcBrand] = useState('');
  const [regSerialNumber, setRegSerialNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentStudent, setCurrentStudent] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);

  useEffect(() => {
    if (page === 'historyPage') {
      loadHistory();
    }
  }, [page]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const saveToken = (value) => {
    localStorage.setItem('campusPcAuthToken', value);
    setToken(value);
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  const login = async (event) => {
    event.preventDefault();

    if (!validateUsername(username)) {
      showNotification('Username must contain letters only', 'error');
      return;
    }
    if (password.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      saveToken(data.token);
      setPage('dashboardPage');
      showNotification('Login successful');
      setUsername('');
      setPassword('');
    } else {
      showNotification(data.message || 'Login failed', 'error');
    }
  };

  const logout = () => {
    localStorage.removeItem('campusPcAuthToken');
    setToken('');
    setCurrentStudent(null);
    setPage('homePage');
    showNotification('Logged out successfully');
  };

  const registerPc = async (event) => {
    event.preventDefault();

    if (!validateStudentId(regStudentId)) {
      showNotification('Student ID must contain only numbers', 'error');
      return;
    }
    if (!validateText(regStudentName)) {
      showNotification('Student Name must contain only letters', 'error');
      return;
    }
    if (!validateText(regDepartment)) {
      showNotification('Department must contain only letters', 'error');
      return;
    }
    if (!validateText(regPcBrand)) {
      showNotification('PC Brand must contain only letters', 'error');
      return;
    }
    if (!validateSerial(regSerialNumber)) {
      showNotification('Serial Number must contain only letters and numbers', 'error');
      return;
    }

    const response = await fetch(apiUrl('/api/pc/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: regStudentId,
        studentName: regStudentName,
        department: regDepartment,
        pcBrand: regPcBrand,
        serialNumber: regSerialNumber,
      }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      showNotification('PC registered successfully');
      setPage('homePage');
      setRegStudentId('');
      setRegStudentName('');
      setRegDepartment('');
      setRegPcBrand('');
      setRegSerialNumber('');
    } else {
      showNotification(data.message || 'Registration failed', 'error');
    }
  };

  const resetAdmin = async (event) => {
    event.preventDefault();

    if (!validateSerial(resetUsername)) {
      showNotification('Username can only contain letters, numbers, and underscores', 'error');
      return;
    }
    if (resetPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }
    if (resetPassword !== resetConfirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (!window.confirm('This will replace the current admin account. Continue?')) {
      return;
    }

    const response = await fetch(apiUrl('/api/auth/reset'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: resetUsername, password: resetPassword }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      showNotification('Admin credentials reset successfully');
      setPage('loginPage');
      setResetUsername('');
      setResetPassword('');
      setResetConfirmPassword('');
    } else {
      showNotification(data.message || 'Reset failed', 'error');
    }
  };

  const searchStudent = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      showNotification('Please enter at least 2 characters', 'error');
      return;
    }

    const response = await fetch(apiUrl(`/api/pc/search?searchTerm=${encodeURIComponent(searchTerm)}`), {
      headers: authHeaders(),
    });
    const data = await response.json();

    if (data.status === 'success' && data.data.length > 0) {
      setCurrentStudent(data.data[0]);
    } else {
      setCurrentStudent(null);
      showNotification(data.message || 'Student not found', 'error');
    }
  };

  const recordEntry = async () => {
    if (!currentStudent) return;
    const response = await fetch(apiUrl('/api/pc/entry'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ serialNumber: currentStudent.serialNumber }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      setCurrentStudent({ ...currentStudent, status: 'Inside Campus' });
      showNotification('Entry recorded successfully');
    } else {
      showNotification(data.message || 'Could not record entry', 'error');
    }
  };

  const recordExit = async () => {
    if (!currentStudent) return;
    const response = await fetch(apiUrl('/api/pc/exit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ serialNumber: currentStudent.serialNumber }),
    });
    const data = await response.json();

    if (data.status === 'success') {
      setCurrentStudent({ ...currentStudent, status: 'Outside Campus' });
      showNotification('Exit recorded successfully');
    } else {
      showNotification(data.message || 'Could not record exit', 'error');
    }
  };

  const loadHistory = async () => {
    const response = await fetch(apiUrl('/api/pc/history'), {
      headers: authHeaders(),
    });
    const data = await response.json();

    if (data.status === 'success') {
      setHistoryRecords(data.data);
    } else {
      showNotification(data.message || 'Could not load history', 'error');
    }
  };

  const navButton = (target) => () => {
    setPage(target);
    if (target === 'dashboardPage') setCurrentStudent(null);
  };

  return (
    <div className="app-container">
      <header>
        <div className="header-left">
          <div className="logo">BDU</div>
          <h1>Campus PC Entry & Exit System</h1>
        </div>
        <div className="header-right">
          {token ? (
            <>
              <span>Administrator</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <div className="home-nav">
              <button onClick={navButton('loginPage')}>Login</button>
              <button onClick={navButton('registerPage')}>Register</button>
            </div>
          )}
        </div>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <main>
        {page === 'homePage' && (
          <section className="home-page">
            <div className="hero-text-large">
              <h1>Welcome to Bahir Dar University</h1>
              <h2>Campus PC Entry & Exit Monitoring System</h2>
              <p>Secure and efficient PC management for campus safety.</p>
              <div className="hero-buttons">
                <button onClick={navButton('loginPage')}>Administrator Login</button>
                <button onClick={navButton('registerPage')} className="secondary">Register Your PC</button>
              </div>
            </div>
          </section>
        )}

        {page === 'loginPage' && (
          <section className="page-card">
            <h2>Administrator Login</h2>
            <form onSubmit={login}>
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} required />
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit">Login</button>
            </form>
            <p className="link" onClick={navButton('registerPage')}>Register New PC →</p>
            <p className="link" onClick={navButton('homePage')}>← Back to Home</p>
            <p className="link" onClick={navButton('resetPasswordPage')} style={{ color: '#ffcccc' }}>
              Forgot Password? Reset Credentials
            </p>
          </section>
        )}

        {page === 'resetPasswordPage' && (
          <section className="page-card">
            <h2>Reset Administrator Credentials</h2>
            <p className="warning">⚠️ Warning: This will replace the current admin account.</p>
            <form onSubmit={resetAdmin}>
              <label>New Username</label>
              <input value={resetUsername} onChange={(e) => setResetUsername(e.target.value)} required />
              <label>New Password</label>
              <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required />
              <label>Confirm New Password</label>
              <input type="password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} required />
              <button type="submit">Reset & Create New Account</button>
            </form>
            <p className="link" onClick={navButton('loginPage')}>← Back to Login</p>
          </section>
        )}

        {page === 'registerPage' && (
          <section className="page-card">
            <h2>PC Registration</h2>
            <form onSubmit={registerPc}>
              <label>Student ID</label>
              <input value={regStudentId} onChange={(e) => setRegStudentId(e.target.value)} required />
              <label>Student Name</label>
              <input value={regStudentName} onChange={(e) => setRegStudentName(e.target.value)} required />
              <label>Department</label>
              <input value={regDepartment} onChange={(e) => setRegDepartment(e.target.value)} required />
              <label>PC Brand</label>
              <input value={regPcBrand} onChange={(e) => setRegPcBrand(e.target.value)} required />
              <label>Serial Number</label>
              <input value={regSerialNumber} onChange={(e) => setRegSerialNumber(e.target.value)} required />
              <button type="submit">Register PC</button>
            </form>
            <p className="link" onClick={navButton('loginPage')}>← Back to Login</p>
            <p className="link" onClick={navButton('homePage')}>← Back to Home</p>
          </section>
        )}

        {page === 'dashboardPage' && (
          <section className="dashboard">
            <h2>Security Dashboard</h2>
            <div className="search-section">
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Enter Student ID or Name" />
              <button onClick={searchStudent}>Search</button>
            </div>
            {currentStudent && (
              <div className="info-card">
                <h3>Student Information</h3>
                <p><strong>ID:</strong> {currentStudent.studentId}</p>
                <p><strong>Name:</strong> {currentStudent.studentName}</p>
                <p><strong>Department:</strong> {currentStudent.department}</p>
                <p><strong>PC Brand:</strong> {currentStudent.pcBrand}</p>
                <p><strong>Serial:</strong> {currentStudent.serialNumber}</p>
                <p><strong>Status:</strong> {currentStudent.status}</p>
                <div className="action-buttons">
                  <button onClick={recordEntry} disabled={currentStudent.status === 'Inside Campus'}>Record Entry</button>
                  <button onClick={recordExit} disabled={currentStudent.status === 'Outside Campus'}>Record Exit</button>
                </div>
              </div>
            )}
            <button className="secondary" onClick={navButton('historyPage')}>View History</button>
          </section>
        )}

        {page === 'historyPage' && (
          <section className="history">
            <h2>Activity History</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>PC Serial</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5">No activity recorded</td>
                    </tr>
                  ) : (
                    historyRecords.map((record) => (
                      <tr key={record._id}>
                        <td>{record.studentId}</td>
                        <td>{record.serialNumber}</td>
                        <td>{record.entryTime ? new Date(record.entryTime).toLocaleString() : '-'}</td>
                        <td>{record.exitTime ? new Date(record.exitTime).toLocaleString() : '-'}</td>
                        <td>{record.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button onClick={navButton('dashboardPage')}>← Back to Dashboard</button>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
