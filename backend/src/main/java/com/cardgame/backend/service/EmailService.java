package com.cardgame.backend.service;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.from.email}")
    private String fromEmail;

    @Value("${brevo.from.name}")
    private String fromName;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            // Build sender object
            Map<String, Object> sender = new HashMap<>();
            sender.put("email", fromEmail);
            sender.put("name", fromName);

            // Build recipient object
            Map<String, Object> recipient = new HashMap<>();
            recipient.put("email", toEmail);

            // Build email data
            Map<String, Object> emailData = new HashMap<>();
            emailData.put("sender", sender);
            emailData.put("to", List.of(recipient));
            emailData.put("subject", "Reset Your Password - Card Game");
            emailData.put("htmlContent", buildPasswordResetHtml(resetLink));

            String jsonBody = objectMapper.writeValueAsString(emailData);

            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url("https://api.brevo.com/v3/smtp/email")
                    .addHeader("api-key", brevoApiKey)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("accept", "application/json")
                    .post(body)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    System.out.println("✅ Password reset email sent to: " + toEmail);
                } else {
                    String errorBody = response.body() != null ? response.body().string() : "No error details";
                    System.err.println("❌ Failed to send email. Status: " + response.code());
                    System.err.println("Error: " + errorBody);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildPasswordResetHtml(String resetLink) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                        line-height: 1.6; 
                        color: #333;
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                    }
                    .container { 
                        max-width: 600px; 
                        margin: 40px auto; 
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        color: white;
                        margin: 0;
                        font-size: 28px;
                    }
                    .content {
                        padding: 40px 30px;
                    }
                    .button { 
                        display: inline-block; 
                        padding: 14px 32px; 
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        color: white !important; 
                        text-decoration: none; 
                        border-radius: 8px;
                        margin: 20px 0;
                        font-weight: 600;
                    }
                    .link-box {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 6px;
                        word-break: break-all;
                        color: #667eea;
                        font-size: 14px;
                        margin: 15px 0;
                    }
                    .footer { 
                        background: #f8f9fa;
                        padding: 20px 30px;
                        text-align: center;
                        font-size: 13px; 
                        color: #666;
                        border-top: 1px solid #e0e0e0;
                    }
                    .warning {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 12px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎴 Password Reset</h1>
                    </div>
                    <div class="content">
                        <h2 style="color: #2c3e50; margin-top: 0;">Reset Your Password</h2>
                        <p>Hi there!</p>
                        <p>We received a request to reset your password for your <strong>Card Game</strong> account.</p>
                        <p>Click the button below to create a new password:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" class="button">Reset My Password</a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
                        <div class="link-box">%s</div>
                        
                        <div class="warning">
                            <strong>⏰ Important:</strong> This link will expire in 24 hours for security reasons.
                        </div>
                        
                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            If you didn't request this password reset, you can safely ignore this email. 
                            Your password will remain unchanged.
                        </p>
                    </div>
                    <div class="footer">
                        <p style="margin: 5px 0;"><strong>The Card Game Team</strong></p>
                        <p style="margin: 5px 0; color: #999;">
                            This is an automated email. Please do not reply.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, resetLink, resetLink);
    }
}