package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "designs")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Design {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private Integer bedrooms;
    private Integer bathrooms;
    private Integer floors;

    @Column(nullable = false)
    private Double area;

    @Enumerated(EnumType.STRING)
    private DesignType designType;

    @Enumerated(EnumType.STRING)
    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    @Column(nullable = false)
    private String imageUrl;

    public enum DesignType{
        HOUSE,
        VILLA,
        APARTMENT,
        FORM_HOUSE,
        ROW_HOUSE,
        DUPLEX,
        BUNGALOW,
        STUDIO,
        PENTHOUSE,
        COTTAGE,
        FARMHOUSE,
        MANSION,
        TOWNHOUSE,
        OFFICE,
        RESTAURANT
    }

}
