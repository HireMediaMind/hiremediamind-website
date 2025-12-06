<?php
// Prevent direct access
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("HTTP/1.1 403 Forbidden");
    exit("Access denied");
}

// Configuration
$recipient_email = "team.hiremediamind@gmail.com";
$subject_prefix = "[Website Inquiry] ";

// Function to sanitize input
function sanitize_input($data)
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// 1. Sanitize Inputs
$plan = isset($_POST['plan']) ? sanitize_input($_POST['plan']) : 'General Inquiry';
$name = isset($_POST['name']) ? sanitize_input($_POST['name']) : '';
$email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
$company = isset($_POST['company']) ? sanitize_input($_POST['company']) : '';
$country = isset($_POST['country']) ? sanitize_input($_POST['country']) : '';
$message_content = isset($_POST['message']) ? sanitize_input($_POST['message']) : '';

// 2. Validate Inputs
$errors = [];

if (empty($name)) {
    $errors[] = "Name is required.";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format.";
}

if (empty($message_content)) {
    $errors[] = "Message is required.";
}

// 3. If validation passes, save to database and send email
if (empty($errors)) {
    // Get user location from IP
    $ip = $_SERVER['REMOTE_ADDR'];
    $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';

    // Get location data from ipapi.co
    $location_data = @file_get_contents("https://ipapi.co/{$ip}/json/");
    $location = json_decode($location_data, true);

    $city = $location['city'] ?? '';
    $region = $location['region'] ?? '';
    $country_name = $location['country_name'] ?? $country;

    // Prepare data for API
    $api_data = [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'business' => $company,
        'message' => $message_content,
        'service' => $plan,
        'page_source' => $_SERVER['HTTP_REFERER'] ?? 'Direct',
        'country' => $country_name,
        'city' => $city,
        'region' => $region,
        'website_url' => '' // Honeypot field
    ];

    // Submit to API (database + Google Sheets)
    $ch = curl_init('https://www.hiremediamind.com/api/submit-lead.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($api_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $api_response = curl_exec($ch);
    curl_close($ch);

    // Send email notification
    $subject = $subject_prefix . $plan . " - " . $name;

    $email_content = "New Inquiry Details:\n\n";
    $email_content .= "Plan/Interest: $plan\n";
    $email_content .= "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n";
    $email_content .= "Company: $company\n";
    $email_content .= "Location: $city, $region, $country_name\n";
    $email_content .= "IP Address: $ip\n\n";
    $email_content .= "Message:\n$message_content\n";

    // Secure Headers
    $headers = "From: noreply@hiremediamind.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    mail($recipient_email, $subject, $email_content, $headers);

    // Redirect to thank you page
    header("Location: thank-you.html");
    exit();
} else {
    // Validation errors
    $error_string = implode("\\n", $errors);
    echo "<script>alert('Please correct the following errors:\\n$error_string'); window.history.back();</script>";
}
?>