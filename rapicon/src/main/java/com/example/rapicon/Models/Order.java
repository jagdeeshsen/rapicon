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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "oder_number", nullable = false, unique = true)
    private String orderNumber;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus=PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false)
    private OrderStatus orderStatus= OrderStatus.PROCESSING;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId; // 🔹 To map Razorpay order


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
        CANCELLED;
    }

    public enum PaymentStatus{
        PENDING,
        COMPLETED,
        FAILED;
    }
}
