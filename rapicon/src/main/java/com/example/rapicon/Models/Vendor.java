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

    // account details
    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;

    private String companyName;

    @Column(nullable = false)
    private String degree;

    @Column(nullable = false)
    private String experience;

    private String panNumber;

    private String gstNumber;

    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private Timestamp createdAt;

}
