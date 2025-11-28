<?php
header('Content-Type: application/json');

function respond($status, $message, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'status' => $status,
        'msg'    => $message
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond('error', 'Method not allowed', 405);
}

// Honeypot check
$honeypot = $_POST['website_url'] ?? '';
if (!empty($honeypot)) {
    respond('success', 'Thanks!', 200);
}

// Collect & sanitize data
$name        = trim(filter_var($_POST['name'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$emailRaw    = trim($_POST['email'] ?? '');
$email       = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
$phone       = preg_replace('/[^0-9+\-\s()]/', '', $_POST['phone'] ?? '');
$business    = trim(filter_var($_POST['business'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$message     = trim(filter_var($_POST['message'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$service     = trim(filter_var($_POST['service'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$page_source = trim(filter_var($_POST['page_source'] ?? '', FILTER_SANITIZE_URL));
$country     = trim(filter_var($_POST['country'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$city        = trim(filter_var($_POST['city'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$region      = trim(filter_var($_POST['region'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$ip          = $_SERVER['REMOTE_ADDR'] ?? '';
$user_agent  = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$created_at  = date("Y-m-d H:i:s");

if (strlen($name) < 2 || !$email || empty($service)) {
    respond('error', 'Please provide name, valid email, and select a service.', 422);
}

// DB Connection (fall back to env vars if available)
$db_host = getenv('HMM_DB_HOST') ?: 'localhost';
$db_user = getenv('HMM_DB_USER') ?: 'u205847150_leadinfo';
$db_pass = getenv('HMM_DB_PASS') ?: 'Himjeet@3812';
$db_name = getenv('HMM_DB_NAME') ?: 'u205847150_leadinfo_db';

$mysqli = @new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($mysqli->connect_error) {
    error_log('DB Connection Failed: ' . $mysqli->connect_error);
    respond('error', 'Unable to save lead right now. Please try later.', 500);
}
$mysqli->set_charset('utf8mb4');

$sql = "INSERT INTO leads (name, email, phone, business, message, service_type, page_source, ip_address, country, city, created_at, region, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $mysqli->prepare($sql);
if (!$stmt) {
    error_log('Prepare Failed: ' . $mysqli->error);
    respond('error', 'Unable to save lead right now.', 500);
}

$stmt->bind_param(
    "sssssssssssss",
    $name,
    $email,
    $phone,
    $business,
    $message,
    $service,
    $page_source,
    $ip,
    $country,
    $city,
    $created_at,
    $region,
    $user_agent
);

try {
    $stmt->execute();
} catch (Throwable $th) {
    error_log('DB Insert Failed: ' . $th->getMessage());
    respond('error', 'Unable to save lead right now.', 500);
}

$stmt->close();
$mysqli->close();

// Google Sheet Integration (best-effort)
$google_script_url = "https://script.google.com/macros/s/AKfycbyNYT8QZYM7Ac-RtJRJW5QucjK9xZd0JyYrtb8E8xWklDxQAvJGC8dA4GbsAlN7MBKm/exec";
$data = compact("name","email","phone","business","message","service","page_source","ip","country","city","created_at","region");

$ch = curl_init($google_script_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_exec($ch);
curl_close($ch);

respond('success', 'Lead captured successfully.', 200);
