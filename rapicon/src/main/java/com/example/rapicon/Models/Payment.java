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
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oder_id", unique = true, nullable = false)
    private Order order;

    @Column(nullable = false, unique = true)
    private String razorpayPaymentId;


    private String razorpayOrderId;
    private String razorpaySignature;

    @Column(nullable = false)
    private BigDecimal amount;

    private String currency="INR";
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private Order.PaymentStatus paymentStatus= Order.PaymentStatus.PENDING;

    private Timestamp createdAt;
}
