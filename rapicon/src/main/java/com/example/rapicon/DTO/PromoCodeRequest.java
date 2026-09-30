package com.example.rapicon.DTO;

import com.example.rapicon.Enum.GrantType;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.PastOrPresent;
import javax.validation.constraints.Positive;
import java.time.LocalDateTime;

@Data
public class PromoCodeRequest {

    @NotNull
    private String code;

    private String description;

    @Positive
    private int maxRedemptions;
    @Positive
    private int redemptionCount;
    @Positive
    private int maxRedemptionsPerUser;

    @NotNull
    @PastOrPresent
    private LocalDateTime validFrom;

    @NotNull
    @PastOrPresent
    private LocalDateTime validUntil;

    private boolean active;

    private GrantType grantType;
    private int grantValue;

}
