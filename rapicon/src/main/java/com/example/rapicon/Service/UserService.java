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
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        userRepository.save(user);
    }

    public List<User> getAllUser(){
        return userRepository.findAll();
    }

   public User existsByEmail(String email) {
        Optional<User> user= userRepository.findByEmail(email);
        return user.get();
    }

   public Optional<User> findById(Long id){
        return userRepository.findById(id);
   }

   /// =============================== new code ===================///

   public Optional<User> findUserByPhone(String phone){
        return userRepository.findByPhone(phone);
   }

   public void updateUser(User user){
       userRepository.save(user);
   }
}
