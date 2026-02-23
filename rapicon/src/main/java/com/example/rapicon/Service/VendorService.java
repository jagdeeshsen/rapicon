package com.example.rapicon.Service;

import com.example.rapicon.Models.User;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Repository.VendorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class VendorService {

    @Autowired
    private VendorRepo vendorRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DesignService designService;

    @Autowired
    private PasswordResetService passwordResetService;

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


    @Transactional
    public void deleteAccountBasedOnRole(Long id, String role, Map<String, String> request){

        if(role.equals("ROLE_VENDOR")){
            Optional<Vendor> vendor = vendorRepo.findById(id);

            if(vendor.isEmpty()){
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vendor not found");
            }

            String password= request.get("password");

            if (password == null || password.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password required");
            }

            if(!passwordEncoder.matches(password, vendor.get().getPassword())){
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }

            Vendor deletedVendor= vendor.get();
            deletedVendor.setDeleted(true);
            deletedVendor.setDeletedAt(LocalDateTime.now());

            designService.deactivateVendorDesigns(deletedVendor.getId());
            passwordResetService.deleteTokensByVendorId(deletedVendor.getId());

            vendorRepo.save(deletedVendor);
        }
    }


}
