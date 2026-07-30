package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Customer_Queries")
@Entity
public class CustomerQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String query;

    private Date createdAt;

    @Enumerated(EnumType.STRING)
    private QueryStatus queryStatus=QueryStatus.NEW;

    public enum QueryStatus{
        NEW,
        IN_PROGRESS,
        PENDING,
        RESOLVED,
        CLOSED;
    }
}
