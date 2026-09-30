package com.example.rapicon.DTO;

import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.time.LocalDateTime;

@Data
public class promoCodeRedemptionRequest {

    @NotNull
    @Positive
    private Long promoCodeId;

    @Positive
    @NotNull
    private Long userId;

    private LocalDateTime redeemedAt;
}
