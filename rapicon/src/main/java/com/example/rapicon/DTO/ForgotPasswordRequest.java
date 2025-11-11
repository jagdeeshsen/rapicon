package com.example.rapicon.DTO;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    //(message = "Email is required")
    //(message = "Invalid email format")
    @Column(nullable = false)
    private String email;
}
