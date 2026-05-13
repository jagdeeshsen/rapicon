package com.example.rapicon.Client;

import com.google.firebase.messaging.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class FcmClient {


    // ─── Single device ───────────────────────────────────────────────
    public String sendToToken(String token, String title, String body,
                              Map<String, String> data, boolean silent) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .putAllData(data)                        // ← data goes HERE on Message, not AndroidConfig
                    .setAndroidConfig(buildAndroidConfig(data, silent))
                    .setApnsConfig(buildApnsConfig(silent))
                    .build();

            // Only add visible notification when not silent
            if (!silent) {
                message = Message.builder()
                        .setToken(token)
                        .putAllData(data)
                        .setNotification(
                                Notification.builder()
                                        .setTitle(title)
                                        .setBody(body)
                                        .build()
                        )
                        .setAndroidConfig(buildAndroidConfig(data, silent))
                        .setApnsConfig(buildApnsConfig(silent))
                        .build();
            }

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM sent. messageId={}", response);
            return response;

        } catch (FirebaseMessagingException e) {
            log.error("FCM send failed. token={}, error={}", token, e.getMessage());
            throw new RuntimeException("Failed to send FCM notification", e);
        }
    }

    // ─── Multicast (up to 500 tokens) ────────────────────────────────
    public BatchResponse sendMulticast(List<String> tokens, String title,
                                       String body, Map<String, String> data) {
        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .putAllData(data)                        // ← data goes HERE on MulticastMessage
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )
                    .setAndroidConfig(buildAndroidConfig(data, false))
                    .setApnsConfig(buildApnsConfig(false))
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance()
                    .sendEachForMulticast(message);
            log.info("FCM multicast: success={}, failure={}",
                    response.getSuccessCount(), response.getFailureCount());
            return response;

        } catch (FirebaseMessagingException e) {
            log.error("FCM multicast failed: {}", e.getMessage());
            throw new RuntimeException("Failed to send FCM multicast", e);
        }
    }

    // ─── Topic broadcast ─────────────────────────────────────────────
    public String sendToTopic(String topic, String title, String body,
                              Map<String, String> data) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .putAllData(data)                        // ← data goes HERE on Message
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )
                    .setAndroidConfig(buildAndroidConfig(data, false))
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("FCM topic sent. topic={}, messageId={}", topic, response);
            return response;

        } catch (FirebaseMessagingException e) {
            log.error("FCM topic failed: {}", e.getMessage());
            throw new RuntimeException("Failed to send topic notification", e);
        }
    }

    // ─── Subscribe / unsubscribe ──────────────────────────────────────
    public void subscribeToTopic(List<String> tokens, String topic)
            throws FirebaseMessagingException {
        FirebaseMessaging.getInstance().subscribeToTopic(tokens, topic);
    }

    public void unsubscribeFromTopic(List<String> tokens, String topic)
            throws FirebaseMessagingException {
        FirebaseMessaging.getInstance().unsubscribeFromTopic(tokens, topic);
    }

    // ─── AndroidConfig — NO setData() here ───────────────────────────
    private AndroidConfig buildAndroidConfig(Map<String, String> data, boolean silent) {
        String channelId = data.getOrDefault("channelId", "default");

        AndroidConfig.Builder builder = AndroidConfig.builder()
                .setPriority(AndroidConfig.Priority.HIGH);  // ← removed setData()

        if (!silent) {
            builder.setNotification(
                    AndroidNotification.builder()
                            .setChannelId(channelId)
                            .setSound("default")
                            .build()
            );
        }

        return builder.build();
    }

    // ─── APNs config ──────────────────────────────────────────────────
    private ApnsConfig buildApnsConfig(boolean silent) {
        return ApnsConfig.builder()
                .setAps(
                        Aps.builder()
                                .setContentAvailable(true)
                                .setSound(silent ? null : "default")
                                .build()
                )
                .build();
    }
}
