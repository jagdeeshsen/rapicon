package com.example.rapicon.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String ifscCode;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String branchName;

    private String companyName;

    @Column(nullable = false)
    private String degree;

    @Column(nullable = false)
    private String experience;

    @Column(nullable = false)
    private String panNumber;

    private String gstNumber;

    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Timestamp createdAt;

}
