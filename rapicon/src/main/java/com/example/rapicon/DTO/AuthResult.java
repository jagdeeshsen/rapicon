package com.example.rapicon.DTO;


public record AuthResult(String token, String refreshToken, String role, String fullName, Long id, String email, String phone) {

}
