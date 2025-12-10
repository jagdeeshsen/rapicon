package com.example.rapicon.Service;

import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Repository.VendorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    @Autowired
    private VendorRepo vendorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void registerVendor(Vendor vendor){
        vendor.setPassword(passwordEncoder.encode(vendor.getPassword()));
        vendor.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        vendorRepo.save(vendor);
    }

    public Vendor getVendorById(Long id){
        Optional<Vendor> vendor= vendorRepo.findById(id);
        return vendor.get();
    }

    public List<Vendor> getAllVendors(){
        return vendorRepo.findAll();
    }

    public Vendor getVendorByUsername(String username){
        return vendorRepo.findByUsername(username);
    }

    public boolean vendorExistsByEmail(String email){
        return vendorRepo.existsByEmail(email);
    }

    public boolean vendorExistsByUsername(String username){
        return vendorRepo.existsByUsername(username);
    }

    public Vendor updateVendor(Vendor vendor){
        return vendorRepo.save(vendor);
    }
}
