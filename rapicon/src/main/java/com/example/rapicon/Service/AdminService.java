package com.example.rapicon.Service;

import com.example.rapicon.DTO.AdminRegistrationRequest;
import com.example.rapicon.Models.Admin;
import com.example.rapicon.Repository.AdminRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepo adminRepo;
    private final PasswordEncoder passwordEncoder;

    public Admin register(AdminRegistrationRequest request){

        Admin admin = new Admin();

        admin.setFullName(request.getFullName());
        admin.setUsername(request.getUsername());
        admin.setEmail(request.getEmail());
        admin.setPhone(request.getPhone());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));

        admin.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return adminRepo.save(admin);
    }

    public Optional<Admin> getAdminById(Long id){
        return adminRepo.findById(id);
    }

    public Admin getAdminByUsername(String username){
        return adminRepo.findByUsername(username);
    }

    public boolean adminExistsByEmail( String email){
        return adminRepo.existsByEmail(email);
    }

    public boolean adminExistsByUsername(String username){
        return adminRepo.existsByUsername(username);
    }
}
