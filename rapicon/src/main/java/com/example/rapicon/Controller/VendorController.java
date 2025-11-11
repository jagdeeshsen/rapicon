package com.example.rapicon.Controller;

import com.example.rapicon.DTO.ApiResponse;
import com.example.rapicon.DTO.ForgotPasswordRequest;
import com.example.rapicon.DTO.ResetPasswordRequest;
import com.example.rapicon.Models.User;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Security.JwtUtil;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.PasswordResetService;
import com.example.rapicon.Service.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/get-vendor/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String id){
        Vendor vendor= vendorService.getVendorById(Long.parseLong(id));
        return ResponseEntity.ok(vendor);
    }
}
