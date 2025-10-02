package com.example.rapicon.Controller;

import com.example.rapicon.Models.Role;
import com.example.rapicon.Models.User;
import com.example.rapicon.Repository.userRepo;
import com.example.rapicon.Security.JwtUtil;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class authController {

    private UserService userService;

    private JwtUtil jwtUtil;

    public authController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (user.getRole() == null) {
            user.setRole(Role.USER); // default role
        }
        userService.registerUser(user);
        return "User registered successfully";
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        User user = userService.findByUserName(username);

        // Check password manually
        if (!new BCryptPasswordEncoder().matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Build UserDetailsImpl from your User entity
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        // Generate token with id, email, role, etc.
        String token = jwtUtil.generateToken(userDetails);

        return Map.of(
                "token", token,
                "role", user.getRole().name(),
                "id", String.valueOf(user.getId()), // optional, just for client convenience
                "fullName", user.getFirstname()+" "+ user.getLastname()
        );
    }
}
