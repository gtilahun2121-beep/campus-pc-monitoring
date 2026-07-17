<?php
require_once 'config.php';

$message = '';
$success = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm'] ?? '';

    if (empty($username) || empty($password)) {
        $message = 'All fields are required.';
    } elseif (!preg_match('/^[A-Za-z0-9_]+$/', $username)) {
        $message = 'Username can only contain letters, numbers and underscores.';
    } elseif (strlen($password) < 8) {
        $message = 'Password must be at least 8 characters.';
    } elseif ($password !== $confirm) {
        $message = 'Passwords do not match.';
    } else {
        mysqli_query($link, "DELETE FROM admins");
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = mysqli_prepare($link, "INSERT INTO admins (username, password) VALUES (?, ?)");
        mysqli_stmt_bind_param($stmt, "ss", $username, $hash);
        if (mysqli_stmt_execute($stmt)) {
            $success = true;
            $message = "Admin account created successfully!";
        } else {
            $message = "Database error: " . mysqli_error($link);
        }
        mysqli_stmt_close($stmt);
    }
    mysqli_close($link);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup Admin — Campus PC Monitoring</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #064e1e, #078930, #FCDD09, #DA121A);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h2 {
            color: #078930;
            text-align: center;
            margin-bottom: 8px;
            font-size: 22px;
        }
        .subtitle {
            text-align: center;
            color: #888;
            font-size: 13px;
            margin-bottom: 28px;
        }
        label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        input {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid #ddd;
            border-radius: 10px;
            font-size: 14px;
            margin-bottom: 18px;
            outline: none;
            transition: border-color 0.2s;
        }
        input:focus { border-color: #078930; }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #078930, #0dbd47);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
        }
        button:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .msg {
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
        }
        .msg.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; }
        .msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #86efac; }
        .warning {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            color: #92400e;
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 13px;
            margin-bottom: 24px;
            text-align: center;
        }
        .go-login {
            display: block;
            text-align: center;
            margin-top: 16px;
            color: #078930;
            font-weight: 600;
            text-decoration: none;
            font-size: 14px;
        }
        .go-login:hover { text-decoration: underline; }
    </style>
</head>
<body>
<div class="card">
    <h2>🔐 Admin Setup</h2>
    <p class="subtitle">Campus PC Monitoring System</p>

    <?php if ($message): ?>
        <div class="msg <?= $success ? 'success' : 'error' ?>"><?= htmlspecialchars($message) ?></div>
    <?php endif; ?>

    <?php if ($success): ?>
        <p class="warning">⚠️ <strong>Delete this file immediately!</strong><br>
        Leaving setup_admin.php on the server is a security risk.</p>
        <a href="index.html" class="go-login">→ Go to Login</a>
    <?php else: ?>
        <div class="warning">⚠️ This will replace any existing admin account.</div>
        <form method="POST">
            <label>Username</label>
            <input type="text" name="username" placeholder="Enter username" required
                   value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">

            <label>Password (min 8 characters)</label>
            <input type="password" name="password" placeholder="Enter password" required>

            <label>Confirm Password</label>
            <input type="password" name="confirm" placeholder="Confirm password" required>

            <button type="submit">Create Admin Account</button>
        </form>
    <?php endif; ?>
</div>
</body>
</html>
