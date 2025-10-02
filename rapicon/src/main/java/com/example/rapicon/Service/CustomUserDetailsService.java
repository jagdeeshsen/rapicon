package com.example.rapicon.Service;

import com.example.rapicon.Models.User;
import com.example.rapicon.Repository.userRepo;
import com.example.rapicon.Security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private userRepo userRepository;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user= userRepository.findByUsername(username);
        User user1= user.get();
        if(user1==null){
            System.out.println("User 404");
            throw  new UsernameNotFoundException("User 404");
        }
        return UserDetailsImpl.build(user1);
    }
}
