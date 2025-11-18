package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "loan_query")
public class LoanForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    private String EmploymentType;

    @Column(nullable = false)
    private BigDecimal salary;

    @Column(nullable = false)
    private BigDecimal requiredLoanAmount;

    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
