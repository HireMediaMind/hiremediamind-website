# Payment Gateway Setup Guide

This guide will help you set up your Stripe and PayPal accounts and get the necessary keys to make payments work on your website.

## 1. Stripe Setup (For Credit Cards)

1.  **Create Account**: Go to [dashboard.stripe.com/register](https://dashboard.stripe.com/register) and sign up.
2.  **Activate Account**: Fill in your business details to activate payments.
3.  **Get API Keys**:
    *   Go to **Developers** > **API keys** in the dashboard menu.
    *   You will see a **Publishable key** (starts with `pk_live_...`) and a **Secret key** (starts with `sk_live_...`).
    *   **Copy these keys**.
4.  **Update Config**:
    *   Open `api/config.php` on your server (File Manager).
    *   Replace the placeholder keys with your actual keys:
        ```php
        define('STRIPE_PUBLISHABLE_KEY', 'pk_live_your_key_here');
        define('STRIPE_SECRET_KEY', 'sk_live_your_key_here');
        ```
    *   **Important**: In `payment.html`, find `const stripe = Stripe('pk_test_...');` and replace `pk_test_...` with your **Publishable Key**.

## 2. PayPal Setup

1.  **Create Business Account**: Go to [paypal.com/bizsignup](https://www.paypal.com/bizsignup).
2.  **Developer Dashboard**: Go to [developer.paypal.com](https://developer.paypal.com) and log in.
3.  **Create App**:
    *   Go to **Apps & Credentials**.
    *   Toggle to **Live** (for real payments).
    *   Click **Create App**. Name it "HireMediaMind Website".
4.  **Get Credentials**:
    *   Copy the **Client ID** and **Secret**.
5.  **Update Config**:
    *   Open `api/config.php`.
    *   Update the PayPal section:
        ```php
        define('PAYPAL_CLIENT_ID', 'your_client_id_here');
        define('PAYPAL_CLIENT_SECRET', 'your_secret_here');
        define('PAYPAL_MODE', 'live'); // Change 'sandbox' to 'live'
        ```

## 3. Database & Email

1.  **Database**:
    *   Go to your Hostinger hPanel > Databases > phpMyAdmin.
    *   Select your database (`u205847150_leadinfo_db`).
    *   Click **Import** and upload the `database.sql` file I provided.
    *   **OR** Click **SQL** tab and paste the content of `database.sql` and click **Go**.

2.  **Email**:
    *   In `api/config.php`, update the `SMTP_PASS` with your email password so automated invoices can be sent.

## 4. Final Testing

*   Once keys are added, try a small "Custom Payment" of $1 to verify everything works.
*   Check your email to see if you received the "Payment Received" notification.
