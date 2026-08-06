package com.example.rapicon.Controller;

import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Service.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping("/get-vendor/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String id){
        Vendor vendor= vendorService.getVendorById(Long.parseLong(id));
        return ResponseEntity.ok(vendor);
    }

    @PutMapping("/update-vendor/{id}")
    @PreAuthorize("hasRole('VENDOR')")
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
            log.error("Failed to update vendor profile",e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update vendor profile"));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Vendor>> getAllVendors(){
        List<Vendor> vendors= vendorService.getAllVendors();
        if(vendors.isEmpty()){
            return ResponseEntity.noContent().build();
        }else {
            return ResponseEntity.ok(vendors);
        }
    }

    @GetMapping("/page/vendors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Vendor>> findAllVendors(@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)Pageable pageable){
        return ResponseEntity.ok(vendorService.findAllPagination(pageable));
    }

    @PutMapping("/deactivate/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<?> deactivateVendorAccount(@PathVariable Long id, @RequestBody @Valid String password){
        vendorService.deactivateAccountBasedOnRole(id, password);
        return ResponseEntity.ok(Map.of("message", "Account deleted permanently"));
    }
}
