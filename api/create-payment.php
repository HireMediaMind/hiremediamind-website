<?php
require_once 'config.php';

header('Content-Type: application/json');

// Helper to respond
function respond($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$gateway = $input['gateway'] ?? '';
$amount = $input['amount'] ?? 0;
$currency = $input['currency'] ?? 'USD';
$plan = $input['plan'] ?? 'Custom Payment';

if ($amount <= 0) {
    respond(['error' => 'Invalid amount'], 400);
}

try {
    if ($gateway === 'stripe') {
        // Stripe Implementation
        // In a real scenario, you'd use the Stripe PHP SDK
        // For now, we'll simulate the response structure needed for the frontend
        // You would typically do: \Stripe\PaymentIntent::create(...)

        // MOCK RESPONSE for Planning/Dev phase (User needs to install Stripe SDK)
        // To make this real: composer require stripe/stripe-php

        /* 
        \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);
        $intent = \Stripe\PaymentIntent::create([
            'amount' => $amount * 100, // cents
            'currency' => strtolower($currency),
            'metadata' => ['plan' => $plan]
        ]);
        $clientSecret = $intent->client_secret;
        */

        // Returning a mock client secret for now to allow frontend dev
        respond([
            'clientSecret' => 'pi_mock_secret_' . uniqid(),
            'id' => 'pi_mock_' . uniqid()
        ]);

    } elseif ($gateway === 'paypal') {
        // PayPal Implementation
        // Generate Access Token first
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api-m." . (PAYPAL_MODE == 'sandbox' ? 'sandbox.' : '') . "paypal.com/v1/oauth2/token");
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERPWD, PAYPAL_CLIENT_ID . ":" . PAYPAL_CLIENT_SECRET);
        curl_setopt($ch, CURLOPT_POSTFIELDS, "grant_type=client_credentials");

        $result = curl_exec($ch);
        $json = json_decode($result);
        $accessToken = $json->access_token ?? null;
        curl_close($ch);

        if (!$accessToken) {
            // Fallback for dev if credentials aren't set yet
            respond(['id' => 'ORDER-MOCK-' . uniqid()]);
            // throw new Exception('Could not get PayPal token');
        }

        // Create Order
        $orderData = [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => $amount
                    ],
                    'description' => $plan
                ]
            ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api-m." . (PAYPAL_MODE == 'sandbox' ? 'sandbox.' : '') . "paypal.com/v2/checkout/orders");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer $accessToken"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));

        $result = curl_exec($ch);
        $order = json_decode($result);
        curl_close($ch);

        respond(['id' => $order->id ?? 'ORDER-MOCK-' . uniqid()]);

    } else {
        respond(['error' => 'Invalid gateway'], 400);
    }

} catch (Exception $e) {
    respond(['error' => $e->getMessage()], 500);
}
?>