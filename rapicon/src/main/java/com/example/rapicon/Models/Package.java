package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "packages")
@AllArgsConstructor
@NoArgsConstructor
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
    private List<String> highlights;

    @Column(nullable = false)
    private BigDecimal packageAmount;

    @Column(nullable = false)
    private int NoOfInstallments=10;  // default is 10

    private boolean isActive=true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
