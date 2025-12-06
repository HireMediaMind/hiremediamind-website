<?php
session_start();

// Generate CSRF token if not exists
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Output CSRF token for JavaScript
header('Content-Type: application/json');
echo json_encode([
    'csrf_token' => $_SESSION['csrf_token']
]);
?>