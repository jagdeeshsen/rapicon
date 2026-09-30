package com.example.rapicon.Models;

import com.example.rapicon.Enum.SourceCode;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "userEntitlement")
@Data
public class UserEntitlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String remainingFreeGenerations;

    private SourceCode source = SourceCode.PROMO;
    private LocalDateTime expireAt;
}
