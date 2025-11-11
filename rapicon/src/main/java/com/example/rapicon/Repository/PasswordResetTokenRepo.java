package com.example.rapicon.Repository;

import com.example.rapicon.Models.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByEmailAndUsedFalseAndExpiresAtAfter(
            String email, LocalDateTime now
    );

    void deleteByExpiresAtBefore(LocalDateTime now);
}
