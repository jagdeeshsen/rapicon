package com.example.rapicon.DTO;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class ResetPasswordRequest {

    //@NotBlank(message = "Token is required")
    @Column(nullable = false)
    private String token;

    //@NotBlank(message = "New password is required")
    //@Size(min = 8, message = "Password must be at least 8 characters long")
    @Column(nullable = false)
    private String newPassword;
}
