package com.example.rapicon.Service;

import com.example.rapicon.Client.FcmClient;
import com.example.rapicon.DTO.NotificationRequest;
import com.example.rapicon.DTO.NotificationResponse;
import com.example.rapicon.Models.Notification;
import com.example.rapicon.Repository.NotificationRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final FcmTokenService fcmTokenService;
    private final FcmClient fcmClient;
    private final NotificationRepo notificationRepo;

    // ─── Send to a single user (all their devices) ──────────────────
    public void sendToUser(NotificationRequest request) {
        List<String> tokens = fcmTokenService.getTokensByUserId(request.getUserId());

        if (tokens.isEmpty()) {
            log.warn("No FCM tokens found for userId={}", request.getUserId());
            return;
        }

        Map<String, String> data = buildDataPayload(request);

        // Send to each device token
        for (String token : tokens) {
            try {
                fcmClient.sendToToken(
                        token,
                        request.getTitle(),
                        request.getBody(),
                        data,
                        request.isSilent()
                );
            } catch (Exception e) {
                log.error("Failed to send to token={}. Skipping.", token);
            }
        }

        // Save to notification history (skip for silent)
        if (!request.isSilent()) {
            saveNotificationHistory(request);
        }
    }

    // ─── Send to multiple users (multicast) ─────────────────────────
    public void sendToMultipleUsers(List<Long> userIds, NotificationRequest request) {
        List<String> allTokens = userIds.stream()
                .flatMap(uid -> fcmTokenService.getTokensByUserId(uid).stream())
                .distinct()
                .toList();

        if (allTokens.isEmpty()) return;

        Map<String, String> data = buildDataPayload(request);

        // FCM multicast supports up to 500 tokens per call — chunk them
        int chunkSize = 500;
        for (int i = 0; i < allTokens.size(); i += chunkSize) {
            List<String> chunk = allTokens.subList(
                    i, Math.min(i + chunkSize, allTokens.size())
            );
            fcmClient.sendMulticast(chunk, request.getTitle(), request.getBody(), data);
        }
    }

    // ─── Broadcast to FCM topic ──────────────────────────────────────
    public void sendToTopic(String topic, NotificationRequest request) {
        Map<String, String> data = buildDataPayload(request);
        fcmClient.sendToTopic(topic, request.getTitle(), request.getBody(), data);
    }

    // ─── Notification history — fetch paginated ──────────────────────
    public Page<NotificationResponse> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepo
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndIsReadFalse(userId);
    }

    // ─── Mark as read ────────────────────────────────────────────────
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepo.markAsRead(notificationId, userId);
        if (updated == 0) {
            throw new RuntimeException("Notification not found or unauthorized");
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepo.markAllAsRead(userId);
    }

    // ─── Private helpers ─────────────────────────────────────────────
    private Map<String, String> buildDataPayload(NotificationRequest request) {
        Map<String, String> data = new HashMap<>();
        data.put("type",      request.getType().name().toLowerCase());
        data.put("title",     request.getTitle());
        data.put("body",      request.getBody());
        data.put("channelId", request.getChannelId() != null ? request.getChannelId() : "default");
        data.put("silent",    String.valueOf(request.isSilent()));

        if (request.getEntityId() != null) {
            data.put("entityId", request.getEntityId());
        }
        return data;
    }

    private void saveNotificationHistory(NotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .body(request.getBody())
                .type(request.getType())
                .entityId(request.getEntityId())
                .isRead(false)
                .build();
        notificationRepo.save(notification);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .body(n.getBody())
                .type(n.getType())
                .entityId(n.getEntityId())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    // delete all notification records for user
    public void deleteByUserId(Long userId) {
        notificationRepo.deleteByUserId(userId);
    }
}
