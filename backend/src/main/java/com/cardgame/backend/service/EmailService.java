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
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
                
                <h1 style="color: #667eea; margin-bottom: 20px;">Password Reset Request</h1>
                
                <p>Hello,</p>
                
                <p>You recently requested to reset your password for your Card Game account. Use the button below to reset it.</p>
                
                <p style="margin: 30px 0;">
                    <a href="%s" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Your Password</a>
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    If the button doesn't work, copy and paste this link into your browser:
                </p>
                
                <p style="font-size: 13px; color: #667eea; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                    %s
                </p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #666;">
                    <strong>Security Note:</strong> This password reset link will expire in 24 hours for your security. If you did not request this reset, please ignore this email and your password will remain unchanged.
                </p>
                
                <p style="font-size: 13px; color: #666; margin-top: 20px;">
                    If you have any questions, feel free to contact us.
                </p>
                
                <p style="font-size: 13px; color: #666; margin-top: 20px;">
                    Best regards,<br>
                    The Card Game Team
                </p>
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #999; text-align: center;">
                    <p>This is an automated message from Card Game. Please do not reply to this email.</p>
                   
                </div>
                
            </div>
        </body>
        </html>
        """, resetLink, resetLink);
    }
}