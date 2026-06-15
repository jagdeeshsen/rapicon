package com.example.rapicon.Controller;

import com.example.rapicon.DTO.FcmTokenRequest;
import com.example.rapicon.DTO.NotificationRequest;
import com.example.rapicon.DTO.NotificationResponse;
import com.example.rapicon.Service.FcmTokenService;
import com.example.rapicon.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NotificationController {

    private final FcmTokenService fcmTokenService;
    private final NotificationService notificationService;

    // ─── FCM Token endpoints ──────────────────────────────────────────

    // POST /api/user/fcm-token
    @PostMapping("/user/fcm-token")
    public ResponseEntity<?> saveFcmToken(
            @RequestHeader("X-User-Id") Long userId,   // set by your JWT filter
            @Valid @RequestBody FcmTokenRequest request) {

        fcmTokenService.saveToken(userId, request);
        return ResponseEntity.ok(Map.of("message", "FCM token saved"));
    }

    // DELETE /api/user/fcm-token
    @DeleteMapping("/user/fcm-token")
    public ResponseEntity<?> deleteFcmToken(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody FcmTokenRequest request) {

        fcmTokenService.deleteToken(userId, request.getFcmToken());
        return ResponseEntity.ok(Map.of("message", "FCM token removed"));
    }

    // ─── Send notification endpoints (internal / admin use) ──────────

    // Send to a single user — triggered by order/payment/chat events
    @PostMapping("/notifications/send")
    public ResponseEntity<?> sendNotification(
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendToUser(request);
        return ResponseEntity.ok(Map.of("message", "Notification sent"));
    }

    // Broadcast to all subscribers of a topic
    @PostMapping("/notifications/send/topic")
    public ResponseEntity<?> sendToTopic(
            @RequestParam String topic,
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendToTopic(topic, request);
        return ResponseEntity.ok(Map.of("message", "Topic notification sent"));
    }

    // Send to a list of users (e.g. city-based promo)
    @PostMapping("/notifications/send/multicast")
    public ResponseEntity<?> sendMulticast(
            @RequestParam List<Long> userIds,
            @Valid @RequestBody NotificationRequest request) {

        notificationService.sendToMultipleUsers(userIds, request);
        return ResponseEntity.ok(Map.of("message", "Multicast sent"));
    }

    // ─── Notification history endpoints (for React Native screen) ────

    // GET /api/notifications?page=0&size=20
    @GetMapping("/notifications")
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                notificationService.getNotifications(userId, page, size)
        );
    }

    // GET /api/notifications/unread-count
    @GetMapping("/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestHeader("X-User-Id") Long userId) {

        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // PATCH /api/notifications/{id}/read
    @PatchMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {

        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    // PATCH /api/notifications/read-all
    @PatchMapping("/notifications/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestHeader("X-User-Id") Long userId) {

        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}
