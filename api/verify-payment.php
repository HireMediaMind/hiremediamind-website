<?php
require_once 'config.php';

header('Content-Type: application/json');

function respond($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Data from frontend
$transactionId = $input['transactionId'] ?? '';
$gateway = $input['gateway'] ?? '';
$amount = $input['amount'] ?? 0;
$currency = $input['currency'] ?? 'USD';
$status = $input['status'] ?? 'pending';
$customerName = $input['customerName'] ?? '';
$customerEmail = $input['customerEmail'] ?? '';
$planName = $input['planName'] ?? '';

// Capture IP and Location (Basic GeoIP based on IP)
$ipAddress = $_SERVER['REMOTE_ADDR'];
$location = 'Unknown'; // You could use an API like ipapi.co here if needed server-side, or pass from frontend

// 1. Verify with Gateway (Optional but recommended step for production)
// For now, we trust the frontend success callback for the MVP, 
// but in production you should call Stripe/PayPal API to confirm status.

// 2. Save to Database
$mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_error) {
    // Log error but don't fail the response to the user if possible, or return 500
    error_log("DB Connect Error: " . $mysqli->connect_error);
    respond(['status' => 'success', 'message' => 'Payment successful, but DB save failed'], 200);
}

$stmt = $mysqli->prepare("INSERT INTO payments (transaction_id, gateway, amount, currency, status, customer_name, customer_email, plan_name, ip_address, location_country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

if ($stmt) {
    $country = $input['country'] ?? 'Unknown'; // Passed from frontend
    $stmt->bind_param("sssdssssss", $transactionId, $gateway, $amount, $currency, $status, $customerName, $customerEmail, $planName, $ipAddress, $country);
    $stmt->execute();
    $stmt->close();
}
$mysqli->close();

// 3. Send Emails (Invoice & Contract)
// We'll call a helper function or script
include_once 'send-invoice.php';
sendPaymentConfirmation($customerEmail, $customerName, $planName, $amount, $currency, $transactionId);

respond(['status' => 'success']);
?>