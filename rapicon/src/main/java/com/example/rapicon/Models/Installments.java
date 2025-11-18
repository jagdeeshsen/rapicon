package com.example.rapicon.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "installments")
@AllArgsConstructor
@NoArgsConstructor
public class Installments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;

    @Column(nullable = false)
    private int installmentNumber;

    @Column(nullable = false)
    private BigDecimal installmentAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InstallmentStatus installmentStatus= InstallmentStatus.PENDING;

    private LocalDateTime dueDate;
    private LocalDateTime paidDate;
    private boolean isUnlocked=false;
    private LocalDateTime unlockedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum InstallmentStatus{
        LOCKED,
        PENDING,
        PAID,
        OVERDUE,
        CANCELLED
    }
}
