package com.cardgame.backend.service;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            Map<String, Object> emailData = new HashMap<>();
            emailData.put("from", "Card Game <onboarding@resend.dev>");
            emailData.put("to", new String[]{toEmail});
            emailData.put("subject", "Reset Your Password - Card Game");
            emailData.put("html", buildPasswordResetHtml(resetLink));

            String jsonBody = objectMapper.writeValueAsString(emailData);

            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json")
            );

            Request request = new Request.Builder()
                    .url("https://api.resend.com/emails")
                    .addHeader("Authorization", "Bearer " + resendApiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    System.err.println("Failed to send email: " + response.body().string());
                } else {
                    System.out.println("Email sent successfully to " + toEmail);
                }
            }
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildPasswordResetHtml(String resetLink) {
        String template = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { 
                    display: inline-block; 
                    padding: 12px 24px; 
                    background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                    color: white; 
                    text-decoration: none; 
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .footer { margin-top: 30px; font-size: 12px; color: #999; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🎴 Reset Your Password</h2>
                <p>Hi there!</p>
                <p>We received a request to reset your password for your Card Game account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="%s" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">%s</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't request this password reset, you can safely ignore this email.</p>
                <div class="footer">
                    <p>Best regards,<br>The Card Game Team</p>
                </div>
            </div>
        </body>
        </html>
        """;

        return template.replaceFirst("%s", resetLink)
                .replaceFirst("%s", resetLink);
    }
}
