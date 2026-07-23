package com.example.rapicon.DTO;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class VendorRegistrationRequest {

    @NotBlank
    private String fullName;
    @NotBlank
    private String username;
    @NotBlank
    private String password;

    @Email
    private String email;
    @NotBlank
    private String phone;

    private String companyName;
    @NotBlank
    private String degree;
    @NotBlank
    private String experience;

    private String accountNumber;
    private String ifscCode;
    private String bankName;
    private String branchName;
    private String panNumber;
    private String gstNumber;

    @NotBlank
    private String streetAddress;
    @NotBlank
    private String city;
    @NotBlank
    private String state;
    @NotBlank
    private String zipCode;
    @NotBlank
    private String country;


}
