package com.example.rapicon.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.fromName}")
    private String fromName;

    @Value("${app.url}")
    private String appUrl;

    /**
     * Send Password Reset Email
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken, String vendorName) {
        try {
            String resetLink = appUrl + "/reset-password.html?token=" + resetToken;

            String subject = "Password Reset Request - Rapicon Infrastructure LLP";
            String htmlContent = buildPasswordResetEmailTemplate(vendorName, resetLink);

            sendHtmlEmail(toEmail, subject, htmlContent);

            log.info("Password reset email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * Send Welcome Email
     */
    public void sendWelcomeEmail(String toEmail, String vendorName) {
        try {
            String subject = "Welcome to Rapicon Infrastructure LLP";
            String htmlContent = buildWelcomeEmailTemplate(vendorName);

            sendHtmlEmail(toEmail, subject, htmlContent);

            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    /**
     * Generic method to send HTML email
     */
    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    /**
     * Password Reset Email Template
     */
    private String buildPasswordResetEmailTemplate(String vendorName, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "        .header { background-color: #007bff; color: white; padding: 30px 20px; text-align: center; }" +
                "        .header h1 { margin: 0; font-size: 28px; }" +
                "        .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }" +
                "        .content { padding: 30px 20px; background-color: #f9f9f9; }" +
                "        .content h2 { color: #007bff; margin-top: 0; }" +
                "        .button { display: inline-block; padding: 14px 32px; background-color: #007bff; " +
                "                 color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
                "        .button:hover { background-color: #0056b3; }" +
                "        .link-box { background-color: #f0f0f0; padding: 12px; word-break: break-all; " +
                "                   border-radius: 4px; margin: 15px 0; font-size: 13px; }" +
                "        .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; " +
                "                  margin: 20px 0; border-radius: 4px; }" +
                "        .warning strong { color: #856404; }" +
                "        .warning ul { margin: 10px 0; padding-left: 20px; }" +
                "        .warning li { margin: 5px 0; }" +
                "        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; " +
                "                 background-color: #f5f5f5; border-top: 1px solid #ddd; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>Rapicon Infrastructure LLP</h1>" +
                "            <p>Design Management System</p>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <h2>Password Reset Request</h2>" +
                "            <p>Hello " + vendorName + ",</p>" +
                "            <p>We received a request to reset your password for your Rapicon Infrastructure vendor account.</p>" +
                "            <p>Click the button below to reset your password:</p>" +
                "            <p style='text-align: center;'>" +
                "                <a href='" + resetLink + "' class='button'>Reset Password</a>" +
                "            </p>" +
                "            <p>Or copy and paste this link into your browser:</p>" +
                "            <div class='link-box'>" + resetLink + "</div>" +
                "            <div class='warning'>" +
                "                <strong>⚠️ Important Security Information:</strong>" +
                "                <ul>" +
                "                    <li>This link will expire in <strong>1 hour</strong></li>" +
                "                    <li>If you didn't request this password reset, please ignore this email</li>" +
                "                    <li>Never share this link with anyone</li>" +
                "                    <li>Our team will never ask for your password</li>" +
                "                </ul>" +
                "            </div>" +
                "            <p>If you're having trouble clicking the button or need assistance, please contact our support team.</p>" +
                "            <p>Best regards,<br><strong>Rapicon Infrastructure Team</strong></p>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>© " + java.time.Year.now().getValue() + " Rapicon Infrastructure LLP. All rights reserved.</p>" +
                "            <p>This is an automated email. Please do not reply to this message.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Welcome Email Template
     */
    private String buildWelcomeEmailTemplate(String vendorName) {
        String loginLink = appUrl + "/login.html";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                "        .container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                "        .header { background-color: #28a745; color: white; padding: 30px 20px; text-align: center; }" +
                "        .content { padding: 30px 20px; background-color: #f9f9f9; }" +
                "        .button { display: inline-block; padding: 14px 32px; background-color: #28a745; " +
                "                 color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                "        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='container'>" +
                "        <div class='header'>" +
                "            <h1>Welcome to Rapicon Infrastructure!</h1>" +
                "        </div>" +
                "        <div class='content'>" +
                "            <h2>Account Created Successfully</h2>" +
                "            <p>Dear " + vendorName + ",</p>" +
                "            <p>Your vendor account has been successfully created in the Rapicon Design Management System.</p>" +
                "            <p>You can now login and start managing your projects.</p>" +
                "            <p style='text-align: center;'>" +
                "                <a href='" + loginLink + "' class='button'>Login Now</a>" +
                "            </p>" +
                "            <p>If you have any questions, feel free to contact our support team.</p>" +
                "            <p>Best regards,<br><strong>Rapicon Infrastructure Team</strong></p>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <p>© " + java.time.Year.now().getValue() + " Rapicon Infrastructure LLP</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}
