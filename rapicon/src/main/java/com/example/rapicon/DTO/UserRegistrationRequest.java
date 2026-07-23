package com.example.rapicon.DTO;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class UserRegistrationRequest {

    private String fullName;

    @Email
    private String email;

    @NotBlank
    private String phone;

    private String streetAddress;
    private String city;
    private String state;
    private String country;
    private String zipCode;
}
