package com.example.rapicon.PromoCode.controller;


import com.example.rapicon.CustomExceptions.InvalidCredentialsException;
import com.example.rapicon.PromoCode.dto.PromoCodeRequest;
import com.example.rapicon.PromoCode.dto.RedeemRequest;
import com.example.rapicon.PromoCode.dto.PromoCodeResponse;
import com.example.rapicon.PromoCode.service.PromoService;
import com.example.rapicon.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/promo")
@RequiredArgsConstructor
public class PromoController {

    private final PromoService promoService;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> create(@Valid @RequestBody PromoCodeRequest request) {
        return ResponseEntity.ok(promoService.create(request));
    }


    @PostMapping("/redeem")
    public PromoCodeResponse redeem(@RequestHeader("Authorization") String tokenHeader, @Valid @RequestBody RedeemRequest request) {
        if(tokenHeader == null || !tokenHeader.startsWith("Bearer ")){
            throw new InvalidCredentialsException("Invalid or missing token");
        }

        String token = tokenHeader.startsWith("Bearer ") ? tokenHeader.substring(7) : tokenHeader;
        Long userId = jwtUtil.extractUserId(token);

        return promoService.redeem(userId, request);
    }
}
