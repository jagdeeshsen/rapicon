package com.example.rapicon.Service;

import com.example.rapicon.Models.Admin;
import com.example.rapicon.Models.PasswordResetToken;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Repository.AdminRepo;
import com.example.rapicon.Repository.PasswordResetTokenRepo;
import com.example.rapicon.Repository.VendorRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final VendorRepo vendorRepository;
    private final PasswordResetTokenRepo tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AdminRepo adminRepo;

    @Value("${app.token.expiration}")
    private Long tokenExpirationMs;

    /**
     * Initiate password reset process
     */
    @Transactional
    public void initiatePasswordReset(String email) {
        Optional<Vendor> optionalVendor = vendorRepository.findByEmail(email.trim().toLowerCase());

        if (optionalVendor.isEmpty()) {
            log.warn("Password reset requested for non-existent email: {}", email);
            return; // Still return success to user
        }

        Vendor vendor= optionalVendor.get();

        // Generate reset token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(tokenExpirationMs / 1000);

        // Create and save reset token
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setVendorId(vendor.getId());
        resetToken.setEmail(vendor.getEmail());
        resetToken.setToken(token);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // Send reset email
        try {
            emailService.sendPasswordResetEmail(vendor.getEmail(), token, vendor.getFullName(), "vendor");
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
            throw new RuntimeException("Failed to send reset email");
        }
    }

    @Transactional
    public void initiatePasswordResetForAdmin(String email) {
        Optional<Admin> adminOptional = adminRepo.findByEmail(email.trim().toLowerCase());

        if (adminOptional.isEmpty()) {
            log.warn("Password reset requested for non-existent admin email: {}", email);
            return; // Still return success to user
        }

        Admin admin = adminOptional.get();

        // Generate reset token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(tokenExpirationMs / 1000);

        // Create and save reset token
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setAdminId(admin.getId());
        resetToken.setEmail(admin.getEmail());
        resetToken.setToken(token);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // Send reset email
        try {
            emailService.sendPasswordResetEmail(admin.getEmail(), token, admin.getFullName(),"admin");
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email", e);
            throw new RuntimeException("Failed to send reset email");
        }
    }

    /**
     * Validate reset token
     */
    public boolean validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token).orElse(null);

        if (resetToken == null) {
            return false;
        }

        if (resetToken.getUsed()) {
            log.warn("Attempted to use already-used token: {}", token);
            return false;
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Attempted to use expired token: {}", token);
            return false;
        }

        return true;
    }

    /**
     * Reset password using token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Validate token
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.getUsed()) {
            throw new RuntimeException("Reset token has already been used");
        }

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Find vendor
        Vendor vendor = vendorRepository.findById(resetToken.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        // Update password
        vendor.setPassword(passwordEncoder.encode(newPassword));
        vendorRepository.save(vendor);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successful for vendor: {}", vendor.getEmail());
    }

    /**
     * Clean up expired tokens (optional - run as scheduled task)
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        log.info("Expired password reset tokens cleaned up");
    }

    public void deleteTokensByVendorId(Long vendorId){
        tokenRepository.deleteByVendorId(vendorId);
    }
}
