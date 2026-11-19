package com.example.rapicon.PromoCode.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;

@Data
public class AiPlanRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Positive
    private BigDecimal price;

    private String description;

    @NotBlank
    private List<String> includes;
}
