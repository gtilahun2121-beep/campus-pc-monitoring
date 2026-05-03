<?php
header('Content-Type: application/json');
session_start();
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

$data     = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Username and password are required']);
    exit;
}

if (!preg_match('/^[A-Za-z]+$/', $username)) {
    echo json_encode(['success' => false, 'message' => 'Username must contain letters only']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
    exit;
}
$deleteStmt = mysqli_prepare($link, "DELETE FROM admins");
if (!$deleteStmt || !mysqli_stmt_execute($deleteStmt)) {
    echo json_encode(['success' => false, 'message' => 'Failed to clear existing admin']);
    exit;
}
mysqli_stmt_close($deleteStmt);

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$insertStmt = mysqli_prepare($link, "INSERT INTO admins (username, password) VALUES (?, ?)");
if (!$insertStmt) {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . mysqli_error($link)]);
    exit;
}

mysqli_stmt_bind_param($insertStmt, "ss", $username, $hashedPassword);

if (mysqli_stmt_execute($insertStmt)) {
    // Destroy current session so the new admin must log in fresh
    $_SESSION = [];
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Admin credentials reset successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to create new admin']);
}

mysqli_stmt_close($insertStmt);
mysqli_close($link);
?>
