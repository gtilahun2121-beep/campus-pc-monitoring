<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

// Already logged in
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    echo json_encode(['status' => 'success', 'message' => 'Already logged in.']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Username and password are required.']);
    exit;
}

if (!preg_match('/^[A-Za-z]+$/', $username)) {
    echo json_encode(['status' => 'error', 'message' => 'Username must contain letters only.']);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode(['status' => 'error', 'message' => 'Password must be at least 8 characters.']);
    exit;
}

$sql = "SELECT id, password FROM admins WHERE username = ?";
if ($stmt = mysqli_prepare($link, $sql)) {
    mysqli_stmt_bind_param($stmt, "s", $username);
    if (mysqli_stmt_execute($stmt)) {
        mysqli_stmt_store_result($stmt);
        if (mysqli_stmt_num_rows($stmt) == 1) {
            mysqli_stmt_bind_result($stmt, $id, $hashed_password);
            if (mysqli_stmt_fetch($stmt)) {
                if (password_verify($password, $hashed_password)) {
                    session_regenerate_id(true); // prevent session fixation
                    $_SESSION['loggedin'] = true;
                    $_SESSION['id']       = $id;
                    $_SESSION['username'] = $username;
                    echo json_encode(['status' => 'success', 'message' => 'Login successful.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Invalid password.']);
                }
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No account found with that username.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Something went wrong. Please try again.']);
    }
    mysqli_stmt_close($stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
}

mysqli_close($link);
?>
