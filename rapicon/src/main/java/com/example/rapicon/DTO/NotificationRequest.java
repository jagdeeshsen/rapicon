package com.example.rapicon.DTO;

import com.example.rapicon.Enum.NotificationType;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class NotificationRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String title;

    @NotBlank
    private String body;

    @NotNull
    private NotificationType type;

    private String entityId;    // orderId, chatId, etc.

    private String channelId;   // android channel (default: "default")

    private boolean silent;     // true = data-only, no banner
}
