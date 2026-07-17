<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

$result = '';

if (file_exists(DB_SCHEMA_FILE)) {
    $schemaSql = file_get_contents(DB_SCHEMA_FILE);
    if ($schemaSql === false) {
        $result = 'Failed to read database schema file.';
    } else {
        if (mysqli_multi_query($link, $schemaSql)) {
            while (mysqli_more_results($link) && mysqli_next_result($link)) {
                // flush
            }
            $result = 'Database schema imported successfully.';
        } else {
            $result = 'Failed to import schema: ' . mysqli_error($link);
        }
    }
} else {
    $result = 'Schema file not found: ' . DB_SCHEMA_FILE;
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Install Database</title>
    <style>body{font-family:sans-serif;background:#0a1628;color:#fff;padding:40px;} .card{background:rgba(255,255,255,0.08);padding:24px;border-radius:16px;max-width:640px;margin:auto;} a{color:#4ade80;text-decoration:none;}</style>
</head>
<body>
    <div class="card">
        <h1>Installation Result</h1>
        <p><?php echo htmlspecialchars($result); ?></p>
        <p><a href="index.html">Open App</a> | <a href="setup_admin.php">Create Admin</a></p>
    </div>
</body>
</html>
