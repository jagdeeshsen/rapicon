package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "promoCodeRedemption")
@Data
public class PromoCodeRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String promoCodeId;

    @Column(nullable = false, unique = true)
    private Long userId;

    private LocalDateTime redeemedAt;
    private LocalDateTime createdAt;
}
