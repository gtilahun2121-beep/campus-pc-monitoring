<?php
session_start();
header('Content-Type: application/json');
require_once '../config.php';

// Protect: only logged-in admins
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Please log in.']);
    exit;
}

$search_term = trim($_GET['search_term'] ?? '');

if (empty($search_term)) {
    echo json_encode(['status' => 'error', 'message' => 'Search term is required.']);
    exit;
}

$sql = "SELECT student_id, student_name, department, pc_brand, serial_number,
               status, last_entry, last_exit
        FROM pc_registrations
        WHERE student_id LIKE ? OR student_name LIKE ?
        ORDER BY student_name ASC";

if ($stmt = mysqli_prepare($link, $sql)) {
    $search_param = "%{$search_term}%";
    mysqli_stmt_bind_param($stmt, "ss", $search_param, $search_param);

    if (mysqli_stmt_execute($stmt)) {
        $result   = mysqli_stmt_get_result($stmt);
        $students = mysqli_fetch_all($result, MYSQLI_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $students]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Could not execute search.']);
    }
    mysqli_stmt_close($stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
}

mysqli_close($link);
?>
