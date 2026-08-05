package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.DTO.PackageRequestDTO;
import com.example.rapicon.Models.Package;
import com.example.rapicon.Repository.PackageRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PackageService {


    final private PackageRepo packageRepo;

    public Package createPackage(PackageRequestDTO request){
        Package pkg = new Package();

        pkg.setName(request.getName());
        pkg.setPackageAmount(request.getPkgAmount());
        pkg.setNoOfInstallments(request.getNoOfInstallments());
        pkg.setDescription(request.getDescription());
        pkg.setHighlights(request.getHighlights());

        pkg.setCreatedAt(LocalDateTime.now());

        return packageRepo.save(pkg);
    }

    public Package updatePackage(Long id, PackageRequestDTO request){
        Package pkg = findPackageById(id);

        pkg.setName(request.getName());
        pkg.setPackageAmount(request.getPkgAmount());
        pkg.setNoOfInstallments(request.getNoOfInstallments());
        pkg.setDescription(request.getDescription());
        pkg.setHighlights(request.getHighlights());

        pkg.setUpdatedAt(LocalDateTime.now());

        return packageRepo.save(pkg);
    }

    public String deletePackageById(Long id){
        Package pkg = findPackageById(id);
        packageRepo.deleteById(pkg.getId());
        return "Package deleted successfully!";
    }

    public Package findPackageById(Long id){
        return packageRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: "+ id));
    }

    public List<Package> getAllPackage(){
        return packageRepo.findAll();
    }

    public Package getPackageByName(String name){
        Optional<Package> packageOptional= packageRepo.findByName(name);

        if(packageOptional.isEmpty()){
            throw new ResourceNotFoundException("Package not found with name: "+name);
        }else{
            return packageOptional.get();
        }
    }
}
