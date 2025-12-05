package com.example.rapicon.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private String orderId;
    private String state;
    private Long expireAt;
    private String redirectUrl;
    private String merchantOrderId;
    private boolean success;
    private String message;
    private String phonepe_token;
}
