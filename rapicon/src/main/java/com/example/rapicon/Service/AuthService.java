package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.AccountInactiveException;
import com.example.rapicon.CustomExceptions.InvalidCredentialsException;
import com.example.rapicon.DTO.AuthResult;
import com.example.rapicon.Models.Admin;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Security.JwtUtil;
import com.example.rapicon.Security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminService adminService;
    private final VendorService vendorService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResult authenticateAdmin(String username, String password){
        Admin admin = adminService.getAdminByUsername(username);

        if(admin == null || !passwordEncoder.matches(password, admin.getPassword())){
            throw new InvalidCredentialsException("Invalid username or password");
        }

        UserDetailsImpl adminDetails = UserDetailsImpl.build(admin);

        // Generate token and refreshToken is not require for admin
        String token = jwtUtil.generateToken(adminDetails);

        return new AuthResult(token, "ADMIN", admin.getFullName(), admin.getId(), admin.getEmail(), admin.getPhone());
    }

    public AuthResult authenticateVendor(String username, String password){
        Vendor vendor = vendorService.getVendorByUsername(username);

        if(vendor == null || !passwordEncoder.matches(password, vendor.getPassword())){
            throw new InvalidCredentialsException("Invalid username or password");
        }

        if(vendor.isDeleted()){
            throw new AccountInactiveException("No active vendor account found for this username");
        }

        UserDetailsImpl vendorDetails = UserDetailsImpl.build(vendor);

        // Generate token and refresh token is not require for vendor
        String token = jwtUtil.generateToken(vendorDetails);

        return new AuthResult(token, "VENDOR", vendor.getFullName(), vendor.getId(), vendor.getEmail(), vendor.getPhone());

    }


}
