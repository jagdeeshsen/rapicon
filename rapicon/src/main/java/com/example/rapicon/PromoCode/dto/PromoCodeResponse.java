package com.example.rapicon.PromoCode.dto;

import com.example.rapicon.Enum.PromoDiscountType;

import java.math.BigDecimal;

public record PromoCodeResponse(
        Long promoId,
        BigDecimal subtotal,
        PromoDiscountType discountType,
        BigDecimal discountAmount,
        BigDecimal payableAmount
) {
}
