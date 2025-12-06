<?php
// Simple rate limiting class
class RateLimiter
{
    private $file;
    private $limit;
    private $window;

    public function __construct($identifier, $limit = 5, $window = 60)
    {
        $this->file = sys_get_temp_dir() . '/ratelimit_' . md5($identifier) . '.json';
        $this->limit = $limit;
        $this->window = $window;
    }

    public function check()
    {
        $now = time();
        $data = $this->loadData();

        // Clean old entries
        $data = array_filter($data, function ($timestamp) use ($now) {
            return ($now - $timestamp) < $this->window;
        });

        if (count($data) >= $this->limit) {
            return false;
        }

        $data[] = $now;
        $this->saveData($data);
        return true;
    }

    private function loadData()
    {
        if (!file_exists($this->file)) {
            return [];
        }
        return json_decode(file_get_contents($this->file), true) ?: [];
    }

    private function saveData($data)
    {
        file_put_contents($this->file, json_encode($data));
    }
}

header('Content-Type: application/json');

function respond($status, $message, $code = 200)
{
    http_response_code($code);
    echo json_encode([
        'status' => $status,
        'msg' => $message
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond('error', 'Method not allowed', 405);
}

// Rate limiting - 5 requests per minute per IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimiter = new RateLimiter($ip, 5, 60);
if (!$rateLimiter->check()) {
    respond('error', 'Too many requests. Please try again later.', 429);
}

// CSRF Token validation
session_start();
$csrf_token = $_POST['csrf_token'] ?? '';
if (!hash_equals($_SESSION['csrf_token'] ?? '', $csrf_token)) {
    respond('error', 'Invalid security token. Please refresh and try again.', 403);
}

// Honeypot check
$honeypot = $_POST['website_url'] ?? '';
if (!empty($honeypot)) {
    respond('success', 'Thanks!', 200);
}

// Collect & sanitize data
$name = trim(filter_var($_POST['name'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$emailRaw = trim($_POST['email'] ?? '');
$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
$phone = preg_replace('/[^0-9+\-\s()]/', '', $_POST['phone'] ?? '');
$business = trim(filter_var($_POST['business'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$message = trim(filter_var($_POST['message'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$service = trim(filter_var($_POST['service'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$page_source = trim(filter_var($_POST['page_source'] ?? '', FILTER_SANITIZE_URL));
$country = trim(filter_var($_POST['country'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$city = trim(filter_var($_POST['city'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$region = trim(filter_var($_POST['region'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS));
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
$created_at = date("Y-m-d H:i:s");

// Validation
if (strlen($name) < 2 || !$email || empty($message)) {
    respond('error', 'Please provide name, valid email, and message.', 422);
}

// DB Connection
$db_host = getenv('HMM_DB_HOST') ?: 'localhost';
$db_user = getenv('HMM_DB_USER') ?: 'u205847150_leadinfo';
$db_pass = getenv('HMM_DB_PASS') ?: 'Himjeet@3812';
$db_name = getenv('HMM_DB_NAME') ?: 'u205847150_leadinfo_db';

try {
    $mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);
    if ($mysqli->connect_error) {
        throw new Exception('Database connection failed');
    }
    $mysqli->set_charset('utf8mb4');

    $sql = "INSERT INTO leads (name, email, phone, business, message, service_type, page_source, ip_address, country, city, created_at, region, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $mysqli->prepare($sql);
    if (!$stmt) {
        throw new Exception('Database prepare failed');
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

    $stmt->execute();
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    error_log('DB Error: ' . $e->getMessage());
    respond('error', 'Unable to save your information. Please try again.', 500);
}

// Google Sheet Integration
try {
    $google_script_url = "https://script.google.com/macros/s/AKfycbxfenWT389VpsSXKuNppa4TOyIXqvhp0CmCj7osy6NhNyU76Ain2lvzXXwwYUGLawU/exec";
    $data = compact("name", "email", "phone", "business", "message", "service", "page_source", "ip", "country", "city", "created_at", "region");
    $data['timestamp'] = $created_at;

    $ch = curl_init($google_script_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_exec($ch);
    curl_close($ch);
} catch (Exception $e) {
    // Fail silently for Google Sheets - main data is saved
    error_log('Google Sheets Error: ' . $e->getMessage());
}

respond('success', 'Lead captured successfully.', 200);
?>