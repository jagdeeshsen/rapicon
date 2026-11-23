package com.example.rapicon.PromoCode.entity;

import com.example.rapicon.Models.Order;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "ai-plan-order")
@Data
public class AiPlanOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    private Long promoId;

    @Column(nullable = false)
    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    @Column(nullable = false)
    BigDecimal totalAmount;

    @Column(nullable = false, unique = true)
    private String merchantOrderId;

    private String phonePeOrderId;

    @Column(nullable = false)
    private String packageName;

    @Enumerated(EnumType.STRING)
    private Order.PaymentStatus paymentStatus = Order.PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private Order.OrderStatus orderStatus = Order.OrderStatus.PROCESSING;

    @Column(nullable = false)
    private String sessionId;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    protected void onCreate(){
        if(createdAt == null){
            createdAt = Instant.now();
        }
    }

}
