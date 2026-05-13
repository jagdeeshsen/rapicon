package com.example.rapicon.DTO;

import com.example.rapicon.Enum.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String body;
    private NotificationType type;
    private String entityId;
    private boolean isRead;
    private LocalDateTime createdAt;
}
