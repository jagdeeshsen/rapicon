package com.example.rapicon.Repository;

import com.example.rapicon.Models.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PackageRepo extends JpaRepository<Package, Long> {
    Optional<Package> findByName(String name);
}
