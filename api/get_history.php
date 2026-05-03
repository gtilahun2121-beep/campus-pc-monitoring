<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

// Protect: only logged-in admins can view history
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
    exit;
}

// Optional: filter by student_id if provided
$student_id = $_GET['student_id'] ?? '';

if (!empty($student_id)) {
    $sql = "SELECT h.student_id, h.serial_number, h.entry_time, h.exit_time, h.status
            FROM pc_history h
            WHERE h.student_id = ?
            ORDER BY h.entry_time DESC";

    if ($stmt = mysqli_prepare($link, $sql)) {
        mysqli_stmt_bind_param($stmt, "s", $student_id);
        if (mysqli_stmt_execute($stmt)) {
            $result  = mysqli_stmt_get_result($stmt);
            $history = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $history]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Could not retrieve history.']);
        }
        mysqli_stmt_close($stmt);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
    }
} else {
    // Return all history (admin full view)
    $sql = "SELECT h.student_id, h.serial_number, h.entry_time, h.exit_time, h.status
            FROM pc_history h
            ORDER BY h.entry_time DESC";

    if ($result = mysqli_query($link, $sql)) {
        $history = mysqli_fetch_all($result, MYSQLI_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $history]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Could not retrieve history.']);
    }
}

mysqli_close($link);
?>
