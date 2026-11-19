package com.example.rapicon.PromoCode.entity;

import com.example.rapicon.Enum.PromoStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(
        name = "promo_code_redemption",
        uniqueConstraints = @UniqueConstraint(name = "uq_redemption", columnNames = {"promo_code_id", "user_id"})
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PromoRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "promo_code_id", nullable = false)
    private Long promoCodeId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "order_id")
    private Long orderId;

    @Column(nullable = false)
    private double discountAmount;

    private PromoStatus status;

    @Column(name = "redeemed_at", nullable = false)
    private Instant redeemedAt;
}
