package com.example.rapicon.Controller;

import com.example.rapicon.DTO.PackageRequestDTO;
import com.example.rapicon.Models.Package;
import com.example.rapicon.Service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/package")
@CrossOrigin(origins = "*")
public class PackageController {

    @Autowired
    private PackageService packageService;

    @PostMapping("/create-package")
    public ResponseEntity<?> createPackage(PackageRequestDTO request){
        Package pkg= new Package();
        pkg.setName(request.getName());
        pkg.setPackageAmount(request.getPkgAmount());
        pkg.setDescription(request.getDescription());
        pkg.setHighlights(request.getHighlights());
        pkg.setNoOfInstallments(request.getNoOfInstallments());
        Package savedPkg= packageService.createPackage(pkg);

        return ResponseEntity.ok(Map.of("message", "Package created successfully"));
    }

    @PostMapping("/update-package")
    public ResponseEntity<?> updatePackage(PackageRequestDTO request){
        Package pkg= packageService.getPackageByName(request.getName());
        if(pkg==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Package Not found");
        }else{
            pkg.setDescription(request.getDescription());
            pkg.setHighlights(request.getHighlights());
            pkg.setPackageAmount(request.getPkgAmount());
            pkg.setNoOfInstallments(request.getNoOfInstallments());
            packageService.updatePackage(pkg);
            return ResponseEntity.ok(Map.of("message", "Package Updated successfully"));
        }
    }

    @GetMapping("/all-package")
    public ResponseEntity<List<Package>> getAllPackages(){
        List<Package> packageList= packageService.getAllPackage();
        return ResponseEntity.ok(packageList);
    }
}
