package com.example.rapicon.Controller;

import com.example.rapicon.DTO.PackageRequestDTO;
import com.example.rapicon.Models.Package;
import com.example.rapicon.Service.PackageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    @PostMapping("/package")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPackage(@RequestBody @Valid PackageRequestDTO request){

        try{
            Package pkg = packageService.createPackage(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("package", pkg, "message", "Package is created successfully!"));
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create package."));
        }
    }

    @PutMapping("/update/package/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody @Valid PackageRequestDTO request){
        try{
            Package updatedPkg = packageService.updatePackage(id, request);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("package", updatedPkg, "message", "Package is updated successfully!"));
        }catch (Exception e){
            log.error(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update package"));
        }
    }

    @GetMapping("/package/{id}")
    public Package findPackageById(@PathVariable Long id){
        return packageService.findPackageById(id);
    }

    @GetMapping("/package/{name}")
    public Package findPackageByName(@PathVariable String name){
        return packageService.getPackageByName(name);
    }

    @GetMapping("/packages")
    public ResponseEntity<List<Package>> getAllPackages(){
        List<Package> packageList= packageService.getAllPackage();
        return ResponseEntity.ok(packageList);
    }

    @DeleteMapping("/package/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePackage(@PathVariable Long id){
        return ResponseEntity.ok(packageService.deletePackageById(id));
    }
}
