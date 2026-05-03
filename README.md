# Campus PC Entry & Exit Monitoring System

A web-based system for monitoring personal computer entry and exit at Bahir Dar University campus. Security personnel can track which students bring their PCs onto campus in real time.

---

## Features

- **PC Registration** — Students register their PC with their student ID, name, department, PC brand, and serial number
- **Admin Login** — Secure administrator authentication with session management
- **Entry & Exit Recording** — Security staff can record when a PC enters or exits the campus
- **Student Search** — Search registered PCs by student ID or name
- **Activity History** — Full log of all entry and exit events
- **Password Reset** — Admin can reset credentials from the login page

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** PHP (REST API endpoints)
- **Database:** MySQL
- **Server:** Apache via XAMPP

---

## Project Structure

```
Campus_PC_Monitoring_System/
├── api/
│   ├── get_history.php       # Fetch all entry/exit history
│   ├── login.php             # Admin login
│   ├── logout.php            # Admin logout
│   ├── record_entry.php      # Record PC entry
│   ├── record_exit.php       # Record PC exit
│   ├── register_pc.php       # Register a new PC
│   ├── reset_password.php    # Reset admin credentials
│   └── search_student.php    # Search student/PC records
├── config.php                # Database connection (not committed)
├── database.sql              # Database schema
├── setup_admin.php           # Initial admin account setup
├── index.html                # Main frontend
├── script.js                 # Frontend logic
└── styles.css                # Styling
```

---

## Installation

### Requirements
- [XAMPP](https://www.apachefriends.org/) (Apache + MySQL + PHP)

### Steps

1. **Clone the repository** into your XAMPP `htdocs` folder:
   ```bash
   git clone https://github.com/gtilahun2121-beep/campus-pc-monitoring.git Campus_PC_Monitoring_System
   ```

2. **Start XAMPP** — make sure both **Apache** and **MySQL** are running.

3. **Create the database** — open [phpMyAdmin](http://localhost/phpmyadmin), then import `database.sql`.

4. **Configure the database connection** — create a `config.php` file in the root folder:
   ```php
   <?php
   define('DB_SERVER', 'localhost');
   define('DB_USERNAME', 'root');
   define('DB_PASSWORD', '');
   define('DB_NAME', 'campus_pc_system');

   $link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

   if ($link === false) {
       die("ERROR: Could not connect. " . mysqli_connect_error());
   }
   ?>
   ```

5. **Create the admin account** — visit:
   ```
   http://localhost/Campus_PC_Monitoring_System/setup_admin.php
   ```

6. **Open the app** in your browser:
   ```
   http://localhost/Campus_PC_Monitoring_System/
   ```

---

## Usage

1. **Register a PC** — click "Register Your PC" on the home page and fill in the student details
2. **Login** — use your admin credentials to access the security dashboard
3. **Search & Record** — search a student by ID or name, then record entry or exit
4. **View History** — click "View History" in the dashboard to see all activity logs

---

## Security Notes

- Passwords are hashed using PHP `password_hash()` (bcrypt)
- Sessions are regenerated on login to prevent session fixation
- All database queries use prepared statements to prevent SQL injection
- `config.php` is excluded from version control — never commit real credentials

---

## License

This project was developed for Bahir Dar University campus security management.
