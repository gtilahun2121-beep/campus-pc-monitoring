<?php
header('Content-Type: application/json');
require_once '../config.php';

// Registration is intentionally public — students register their own PCs
// Input validation is enforced server-side

$student_id    = trim($_POST['student_id']    ?? '');
$student_name  = trim($_POST['student_name']  ?? '');
$department    = trim($_POST['department']    ?? '');
$pc_brand      = trim($_POST['pc_brand']      ?? '');
$serial_number = trim($_POST['serial_number'] ?? '');

// Validate all fields are present
if (empty($student_id) || empty($student_name) || empty($department) || empty($pc_brand) || empty($serial_number)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit;
}

// Validate formats
if (!preg_match('/^[0-9]+$/', $student_id)) {
    echo json_encode(['status' => 'error', 'message' => 'Student ID must contain only numbers.']);
    exit;
}

if (!preg_match('/^[A-Za-z ]+$/', $student_name)) {
    echo json_encode(['status' => 'error', 'message' => 'Student Name must contain only letters.']);
    exit;
}

if (!preg_match('/^[A-Za-z ]+$/', $department)) {
    echo json_encode(['status' => 'error', 'message' => 'Department must contain only letters.']);
    exit;
}

if (!preg_match('/^[A-Za-z ]+$/', $pc_brand)) {
    echo json_encode(['status' => 'error', 'message' => 'PC Brand must contain only letters.']);
    exit;
}

if (!preg_match('/^[A-Za-z0-9]+$/', $serial_number)) {
    echo json_encode(['status' => 'error', 'message' => 'Serial Number must contain only letters and numbers.']);
    exit;
}

// Check for duplicate student_id or serial_number before inserting
$check_sql = "SELECT id FROM pc_registrations WHERE student_id = ? OR serial_number = ?";
if ($check_stmt = mysqli_prepare($link, $check_sql)) {
    mysqli_stmt_bind_param($check_stmt, "ss", $student_id, $serial_number);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);

    if (mysqli_stmt_num_rows($check_stmt) > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Student ID or Serial Number is already registered.']);
        mysqli_stmt_close($check_stmt);
        exit;
    }
    mysqli_stmt_close($check_stmt);
}

$sql = "INSERT INTO pc_registrations (student_id, student_name, department, pc_brand, serial_number, status)
        VALUES (?, ?, ?, ?, ?, 'Outside Campus')";

if ($stmt = mysqli_prepare($link, $sql)) {
    mysqli_stmt_bind_param($stmt, "sssss", $student_id, $student_name, $department, $pc_brand, $serial_number);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(['status' => 'success', 'message' => 'PC registered successfully.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Could not complete registration. ' . mysqli_error($link)]);
    }
    mysqli_stmt_close($stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($link)]);
}

mysqli_close($link);
?>
