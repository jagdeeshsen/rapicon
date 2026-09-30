package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "promoCodeRedemption")
@Data
@RequiredArgsConstructor
public class PromoCodeRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long promoCodeId;

    @Column(nullable = false, unique = true)
    private Long userId;

    private LocalDateTime redeemedAt;
    private LocalDateTime createdAt;

}
