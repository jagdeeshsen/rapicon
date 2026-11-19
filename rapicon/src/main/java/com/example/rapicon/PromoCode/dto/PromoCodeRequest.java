package com.example.rapicon.PromoCode.dto;


import com.example.rapicon.Enum.PromoDiscountType;

import javax.validation.constraints.*;
import java.time.Instant;

public record PromoCodeRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9_-]{4,64}$", message = "must be 4-64 chars: letters, digits, _ or -")
        String code,

        @NotBlank PromoDiscountType discountType,

        /* null = unlimited redemptions */
        @Positive double discountValue,

        double maxDiscount,
        double minOrderAmount,

        Instant validFrom,
        Instant validUntil
) {
}
