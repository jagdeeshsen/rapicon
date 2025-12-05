package com.example.rapicon.DTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@RequiredArgsConstructor
public class PaymentDetailDTO {
    private String transactionId;
    private String paymentMode;
    private Timestamp timestamp;
    private BigDecimal amount;
    private BigDecimal payableAmount;
    private BigDecimal feeAmount;
    private String state;
}
