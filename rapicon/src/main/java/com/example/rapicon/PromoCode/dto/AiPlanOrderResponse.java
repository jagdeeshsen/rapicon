package com.example.rapicon.PromoCode.dto;


import java.math.BigDecimal;


public record AiPlanOrderResponse(
        Long orderId,
        String merchantId,
        BigDecimal payableAmount) {
}
