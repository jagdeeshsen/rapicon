package com.example.rapicon.DTO;

import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class AdminRegistrationRequest {

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
}
