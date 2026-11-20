package com.example.rapicon.PromoCode.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * "What is this user allowed to do right now?"
 * Promo codes, trials, purchases and subscriptions all write here;
 * the plan generation endpoint only ever reads from here.
 */
@Entity
@Table(name = "promo_user")
@Data
@NoArgsConstructor
public class PromoCodeUsers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "promo_id", nullable = false)
    private Long promoCodeId;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
