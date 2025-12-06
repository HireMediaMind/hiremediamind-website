<?php
// Simple mailer function using PHP mail() for now. 
// For better deliverability, use PHPMailer with SMTP credentials from config.php

function sendPaymentConfirmation($toEmail, $name, $plan, $amount, $currency, $txId)
{
    $subject = "Payment Confirmation & Contract - HireMediaMind";

    $date = date("F j, Y");

    // HTML Email Template
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
            .header { background: #7C3AED; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; }
            .details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
            .btn { display: inline-block; background: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Payment Received</h1>
            </div>
            <div class='content'>
                <p>Dear $name,</p>
                <p>Thank you for choosing HireMediaMind! We have successfully received your payment.</p>
                
                <div class='details'>
                    <h3>Transaction Details</h3>
                    <p><strong>Plan:</strong> $plan</p>
                    <p><strong>Amount:</strong> $currency $amount</p>
                    <p><strong>Transaction ID:</strong> $txId</p>
                    <p><strong>Date:</strong> $date</p>
                </div>
                
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>We have attached your Service Agreement/Contract below (or it will follow in a separate email).</li>
                    <li>Our team will reach out within 24 hours to initiate the onboarding process.</li>
                </ol>
                
                <p>You can download your invoice from your client portal or by replying to this email.</p>
                
                <p>Best regards,<br>The HireMediaMind Team</p>
            </div>
            <div class='footer'>
                <p>&copy; " . date("Y") . " HireMediaMind. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: HireMediaMind <" . ADMIN_EMAIL . ">" . "\r\n";

    // Send to Customer
    mail($toEmail, $subject, $message, $headers);

    // Send Alert to Admin
    $adminSubject = "New Payment Received: $amount $currency";
    $adminMsg = "New payment from $name ($toEmail) for $plan.\nTransaction ID: $txId";
    mail(ADMIN_EMAIL, $adminSubject, $adminMsg);
}
?>