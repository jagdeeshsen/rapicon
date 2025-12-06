package com.example.rapicon.Repository;

import com.example.rapicon.Models.Vendor;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRepo extends JpaRepository<Vendor, Long> {
    Vendor findByUsername(String username);
    Vendor findByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
