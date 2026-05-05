<?php
// Enable errors for troubleshooting.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database credentials
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'campus_pc_system');

define('DB_SCHEMA_FILE', __DIR__ . '/database.sql');

// Connect to MySQL server first, without selecting a database.
$link = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD);

if ($link === false) {
    die('ERROR: Could not connect to MySQL server. ' . mysqli_connect_error());
}

// Create database if it does not exist.
$createDbQuery = 'CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci';
if (!mysqli_query($link, $createDbQuery)) {
    die('ERROR: Could not create database. ' . mysqli_error($link));
}

// Select the database.
if (!mysqli_select_db($link, DB_NAME)) {
    die('ERROR: Could not select database. ' . mysqli_error($link));
}

// If schema file exists and the admins table is missing, import schema.
$checkTable = mysqli_query($link, "SHOW TABLES LIKE 'admins'");
if ($checkTable && mysqli_num_rows($checkTable) === 0 && file_exists(DB_SCHEMA_FILE)) {
    $schemaSql = file_get_contents(DB_SCHEMA_FILE);
    if ($schemaSql !== false) {
        if (!mysqli_multi_query($link, $schemaSql)) {
            die('ERROR: Could not import database schema. ' . mysqli_error($link));
        }
        // Flush multi_query results.
        while (mysqli_more_results($link) && mysqli_next_result($link)) {
            // no-op
        }
    }
}

// Verify final connection state.
if ($link === false) {
    die('ERROR: Database connection failure.');
}
?>