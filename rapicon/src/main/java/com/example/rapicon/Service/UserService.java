package com.example.rapicon.Service;

import com.example.rapicon.Models.Role;
import com.example.rapicon.Models.User;
import com.example.rapicon.Repository.userRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private final userRepo userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;

    public UserService(userRepo userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerUser(User user) {
        // encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        //user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        userRepository.save(user);
    }

    public User findByUserName(String username) {
        Optional<User> user= userRepository.findByUsername(username);
        return user.get();
    }

    public List<User> getAllUser(String role){
        Role enumRole= Role.valueOf(role.toUpperCase());
        return userRepository.findByRole(enumRole);
    }

   public boolean existsByEmail(Long id) {
        return userRepository.existsById(id);
    }

   public Optional<User> findById(Long id){
        return userRepository.findById(id);
   }
}
