package com.example.rapicon.PromoCode.dto;

import com.example.rapicon.Models.Order;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

@Data
@RequiredArgsConstructor
public class AiPlanOrderRequest {

    @NotBlank
    @Positive
    private Long userId;

    @NotBlank
    @Positive
    private Long promoId;

    @NotNull
    @Positive
    private BigDecimal subtotal;

    @NotNull
    @Positive
    private BigDecimal discountAmount;

    @NotNull
    @Positive
    BigDecimal totalAmount;

    @NotNull
    private String sessionId;

    @NotNull
    private String packageName;
}
