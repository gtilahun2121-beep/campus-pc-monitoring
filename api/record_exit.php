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

    if ($status === 'Outside Campus') {
        echo json_encode(['status' => 'error', 'message' => 'PC is already recorded as outside the campus.']);
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
    exit;
}

// Update status and last_exit timestamp
$update_sql = "UPDATE pc_registrations SET status = 'Outside Campus', last_exit = NOW() WHERE serial_number = ?";
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

// Close the open history record (set exit_time on the latest unexited entry)
$history_sql = "UPDATE pc_history SET exit_time = NOW(), status = 'Outside Campus'
                WHERE serial_number = ? AND exit_time IS NULL
                ORDER BY entry_time DESC LIMIT 1";
if ($history_stmt = mysqli_prepare($link, $history_sql)) {
    mysqli_stmt_bind_param($history_stmt, "s", $serial_number);
    if (mysqli_stmt_execute($history_stmt)) {
        echo json_encode(['status' => 'success', 'message' => 'Exit recorded successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Could not record exit in history.']);
    }
    mysqli_stmt_close($history_stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
}

mysqli_close($link);
?>
