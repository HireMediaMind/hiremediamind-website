<?php
// Database Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'u205847150_leadinfo');
define('DB_PASS', 'Himjeet@3812');
define('DB_NAME', 'u205847150_leadinfo_db');

// Payment Gateway Keys (PLACEHOLDERS - User to Replace)
define('STRIPE_PUBLISHABLE_KEY', 'pk_test_...'); 
define('STRIPE_SECRET_KEY', 'sk_test_...');

define('PAYPAL_CLIENT_ID', 'sb-...');
define('PAYPAL_CLIENT_SECRET', '...');
define('PAYPAL_MODE', 'sandbox'); // 'sandbox' or 'live'

define('RAZORPAY_KEY_ID', 'rzp_live_Ri7PMF879mDGn1');
define('RAZORPAY_KEY_SECRET', ''); // Add if needed for backend verification

// Email Settings
define('ADMIN_EMAIL', 'hello@hiremediamind.com');
define('SMTP_HOST', 'smtp.hostinger.com'); // Example
define('SMTP_USER', 'hello@hiremediamind.com');
define('SMTP_PASS', 'YourEmailPassword'); // User needs to set this
?>
