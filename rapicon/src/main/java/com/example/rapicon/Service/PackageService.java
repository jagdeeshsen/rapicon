package com.example.rapicon.Service;

import com.example.rapicon.Models.Package;
import com.example.rapicon.Repository.PackageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PackageService {

    @Autowired
    private PackageRepo packageRepo;

    public Package createPackage(Package p){
        p.setCreatedAt(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());
        return packageRepo.save(p);
    }

    public Package updatePackage(Package p){
        p.setUpdatedAt(LocalDateTime.now());
        return packageRepo.save(p);
    }

    public void deletePackageById(Long id){
        packageRepo.deleteById(id);
    }

    public Package getPackageById(Long id){
        Optional<Package> optionalPackage= packageRepo.findById(id);
        if(optionalPackage.isPresent()){
            return optionalPackage.get();
        }else{
            return null;
        }
    }

    public List<Package> getAllPackage(){
        List<Package> packagesList= packageRepo.findAll();
        return packagesList;
    }

    public Package getPackageByName(String name){
        Optional<Package> packageOptional= packageRepo.findByName(name);
        if(packageOptional.isPresent()){
            return packageOptional.get();
        }else{
            return null;
        }
    }
}
