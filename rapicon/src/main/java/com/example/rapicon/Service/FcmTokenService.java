package com.example.rapicon.Service;

import com.example.rapicon.DTO.FcmTokenRequest;
import com.example.rapicon.Models.FcmToken;
import com.example.rapicon.Repository.FcmTokenRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FcmTokenService {

    private final FcmTokenRepo fcmTokenRepo;

    // Save or update token (upsert — don't duplicate)
    @Transactional
    public void saveToken(Long userId, FcmTokenRequest request) {
        boolean exists = fcmTokenRepo
                .findByUserIdAndToken(userId, request.getFcmToken())
                .isPresent();

        if (!exists) {
            FcmToken token = FcmToken.builder()
                    .userId(userId)
                    .token(request.getFcmToken())
                    .platform(request.getPlatform())
                    .build();
            fcmTokenRepo.save(token);
            log.info("FCM token saved. userId={}", userId);
        } else {
            log.info("FCM token already exists. userId={}", userId);
        }
    }

    // Remove specific token (on logout)
    @Transactional
    public void deleteToken(Long userId, String fcmToken) {
        fcmTokenRepo.deleteByToken(fcmToken);
        log.info("FCM token deleted. userId={}", userId);
    }

    // Remove all tokens for user (account deletion / full logout)
    @Transactional
    public void deleteAllTokensForUser(Long userId) {
        fcmTokenRepo.deleteByUserId(userId);
        log.info("All FCM tokens deleted. userId={}", userId);
    }

    // Get all token strings for a user (used when sending notification)
    public List<String> getTokensByUserId(Long userId) {
        return fcmTokenRepo.findByUserId(userId)
                .stream()
                .map(FcmToken::getToken)
                .collect(Collectors.toList());
    }
}
