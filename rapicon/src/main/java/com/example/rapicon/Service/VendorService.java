package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.InvalidCredentialsException;
import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.DTO.VendorRegistrationRequest;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Repository.VendorRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.validation.Valid;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepo vendorRepo;
    private final PasswordEncoder passwordEncoder;
    private final DesignService designService;
    private final PasswordResetService passwordResetService;

    public Vendor registerVendor(VendorRegistrationRequest request){
        Vendor vendor = new Vendor();

        vendor.setFullName(request.getFullName());
        vendor.setUsername(request.getUsername());
        vendor.setEmail(request.getEmail());
        vendor.setPhone(request.getPhone());
        vendor.setPassword(passwordEncoder.encode(request.getPassword()));

        vendor.setCompanyName(request.getCompanyName());
        vendor.setDegree(request.getDegree());
        vendor.setExperience(request.getExperience());

        vendor.setAccountNumber(request.getAccountNumber());
        vendor.setIfscCode(request.getIfscCode());
        vendor.setBankName(request.getBankName());
        vendor.setBranchName(request.getBranchName());
        vendor.setPanNumber(request.getPanNumber());
        vendor.setGstNumber(request.getGstNumber());

        vendor.setStreetAddress(request.getStreetAddress());
        vendor.setCity(request.getCity());
        vendor.setState(request.getState());
        vendor.setZipCode(request.getZipCode());
        vendor.setCountry(request.getCountry());

        vendor.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return vendorRepo.save(vendor);
    }

    public Vendor getVendorById(Long id){
        return vendorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id :" + id));
    }

    public List<Vendor> getAllVendors(){
        return vendorRepo.findAll();
    }

    public Page<Vendor> findAllPagination(Pageable pageable){
        return vendorRepo.findAll(pageable);
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
    public void deactivateAccountBasedOnRole(Long id, @Valid String password) {
        Vendor vendor = getVendorById(id);

        if (password == null || password.isBlank()) {
            throw new InvalidCredentialsException("Password require for deactivating account");
        }

        if(!passwordEncoder.matches(password, vendor.getPassword())){
            throw new InvalidCredentialsException("Invalid password");
        }

        vendor.setDeleted(true);
        vendor.setDeletedAt(LocalDateTime.now());

        designService.deactivateVendorDesigns(id);
        passwordResetService.deleteTokensByVendorId(id);

        vendorRepo.save(vendor);
    }
}
