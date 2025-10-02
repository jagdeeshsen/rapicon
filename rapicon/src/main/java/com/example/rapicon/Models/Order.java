package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long designId;
    private String designName;
    private String price;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String projectLocation;
    private String paymentMethod;
    private String specialRequirements;
}
