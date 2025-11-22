package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "designs")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Design {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @Column(nullable = false)
    private String designType;

    @Column(nullable = false)
    private String designCategory;

    @Column(nullable = false)
    private double length;

    @Column(nullable = false)
    private double width;

    @Column(nullable = false)
    private BigDecimal totalArea;

    @ElementCollection
    private List<Floor> floorList= new ArrayList<>();

    private String plotFacing;
    private String plotLocation;
    private String parking;

    @Column(nullable = false)
    private String builtUpArea;

    @Enumerated(EnumType.STRING)
    private Status status= Status.PENDING;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private List<String> elevationUrls;

    @Column(nullable = false)
    private List<String> twoDPlanUrls;

}
