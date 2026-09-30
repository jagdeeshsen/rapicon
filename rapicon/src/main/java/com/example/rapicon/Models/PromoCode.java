package com.example.rapicon.Models;

import com.example.rapicon.Enum.GrantType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "promoCode")
@Data
public class PromoCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    private int maxRedemptions;
    private int redemptionCount;
    private int maxRedemptionsPerUser;

    private LocalDateTime validFrom;
    private LocalDateTime validUntil;

    private boolean active;

    private GrantType grantType;
    private int grantValue;

    private LocalDateTime createdAt;

}
