package com.example.rapicon.PromoCode.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public record RedeemRequest(
        @NotBlank @Size(max = 64) String code,
        @NotBlank String packageName
) {
}
