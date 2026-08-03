package com.example.rapicon.Repository;

import com.example.rapicon.Models.Admin;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepo  extends JpaRepository<Admin, Long> {

    Admin findByUsername(String username);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    Optional<Admin> findByEmail(String email);
}
