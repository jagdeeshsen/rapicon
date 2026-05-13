package com.example.rapicon.DTO;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class FcmTokenRequest {

    @NotBlank(message = "FCM token is required")
    private String fcmToken;

    // "android" or "ios"
    private String platform;
}
