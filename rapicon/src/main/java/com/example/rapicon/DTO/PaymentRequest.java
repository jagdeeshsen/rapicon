package com.example.rapicon.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {

    @NotBlank(message = "Order ID is required")
    private String merchantOrderId;

    @NotNull(message = "Amount is required")
    @Min(value = 100, message = "Amount must be at least 100 paisa (1 Rupee)")
    private Long amount;

    private String redirectUrl;

    private Map<String, String> metaInfo;

    private Long expireAfter;
}
