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

    @PutMapping("/update-vendor/{id}")
    public ResponseEntity<?> updateVendor(@PathVariable String id, @RequestBody Vendor vendor){

        try{
            Vendor existingVendor= vendorService.getVendorById(Long.parseLong(id));

            if(existingVendor==null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Vendor not found"));
            }

            // update details
            existingVendor.setPhone(vendor.getPhone());
            existingVendor.setCompanyName(vendor.getCompanyName());

            // update account details
            existingVendor.setAccountNumber(vendor.getAccountNumber());
            existingVendor.setIfscCode(vendor.getIfscCode());
            existingVendor.setBankName(vendor.getBankName());
            existingVendor.setBranchName(vendor.getBranchName());
            existingVendor.setPanNumber(vendor.getPanNumber());
            existingVendor.setGstNumber(vendor.getGstNumber());

            // update address details
            existingVendor.setStreetAddress(vendor.getStreetAddress());
            existingVendor.setState(vendor.getState());
            existingVendor.setCity(vendor.getCity());
            existingVendor.setZipCode(vendor.getZipCode());
            existingVendor.setCountry(vendor.getCountry());

            Vendor savedVendor= vendorService.updateVendor(existingVendor);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("message", "Vendor profile updated successfully!", "vendor", savedVendor));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update vendor profile", "error", e.getMessage()));
        }
    }
}
