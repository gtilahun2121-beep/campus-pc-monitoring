<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

// Protect: only logged-in admins
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
    exit;
}

$serial_number = trim($_POST['serial_number'] ?? '');

if (empty($serial_number)) {
    echo json_encode(['status' => 'error', 'message' => 'Serial number is required.']);
    exit;
}

// Check if the PC exists and get its current status
$check_sql = "SELECT status, student_id FROM pc_registrations WHERE serial_number = ?";
if ($check_stmt = mysqli_prepare($link, $check_sql)) {
    mysqli_stmt_bind_param($check_stmt, "s", $serial_number);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);

    if (mysqli_stmt_num_rows($check_stmt) == 0) {
        echo json_encode(['status' => 'error', 'message' => 'PC not registered.']);
        exit;
    }

    mysqli_stmt_bind_result($check_stmt, $status, $student_id);
    mysqli_stmt_fetch($check_stmt);
    mysqli_stmt_close($check_stmt);

    if ($status === 'Inside Campus') {
        echo json_encode(['status' => 'error', 'message' => 'PC is already recorded as inside the campus.']);
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
    exit;
}

// Update status and last_entry timestamp
$update_sql = "UPDATE pc_registrations SET status = 'Inside Campus', last_entry = NOW() WHERE serial_number = ?";
if ($update_stmt = mysqli_prepare($link, $update_sql)) {
    mysqli_stmt_bind_param($update_stmt, "s", $serial_number);
    if (!mysqli_stmt_execute($update_stmt)) {
        echo json_encode(['status' => 'error', 'message' => 'Could not update PC status.']);
        exit;
    }
    mysqli_stmt_close($update_stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
    exit;
}

// Insert entry record into history
$history_sql = "INSERT INTO pc_history (student_id, serial_number, entry_time, status) VALUES (?, ?, NOW(), 'Inside Campus')";
if ($history_stmt = mysqli_prepare($link, $history_sql)) {
    mysqli_stmt_bind_param($history_stmt, "ss", $student_id, $serial_number);
    if (mysqli_stmt_execute($history_stmt)) {
        echo json_encode(['status' => 'success', 'message' => 'Entry recorded successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Could not record entry in history.']);
    }
    mysqli_stmt_close($history_stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
}

mysqli_close($link);
?>
