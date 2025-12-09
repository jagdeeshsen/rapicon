package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "payment-details")
public class PaymentDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(unique = true)
    private String phonePeOrderId;

    @Column(unique = true)
    private String transactionId;

    private String paymentMode;

    private Timestamp createdAt;

    @Column(nullable = false)
    private BigDecimal amount;

    private BigDecimal payableAmount;
    private BigDecimal feeAmount;

    private String state;
}
