package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "customer_email", length = 255)
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;


    @Column(nullable = false)
    private BigDecimal totalAmount;

    // PhonePe Payment Details
    @Column(name = "merchant_order_id", unique = true, length = 100)
    private String merchantOrderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus=PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus= OrderStatus.PROCESSING;

    private Timestamp createdAt;
    private  Timestamp updatedAt;

    @Column(nullable = false)
    private int totalInstallments;

    private BigDecimal paidAmount;

    @Column(nullable = false)
    private BigDecimal installmentAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> ordertemList= new ArrayList<>();

    @OneToMany(mappedBy = "order",cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Installments> installmentsList= new ArrayList<>();

    public enum OrderStatus{
        PROCESSING,
        COMPLETED,
        CANCELLED,
        CREATED,
        FAILED,
        REFUNDED,
        EXPIRED;
    }

    public enum PaymentStatus{
        PENDING,
        COMPLETED,
        FAILED;
    }
}
