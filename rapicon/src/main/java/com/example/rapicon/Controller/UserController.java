package com.example.rapicon.Controller;

import com.example.rapicon.Models.User;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/get-user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id){
        Optional<User> user= userService.findById(id);

        if(user.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(user.get());
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found."));
        }
    }

    @PutMapping("/update-user")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, String> request){
        Long id= Long.parseLong(request.get("id"));
        Optional<User> existUser= userService.findById(id);
        if(existUser.isEmpty()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User Not Found"));
        }

        User updatedUser= existUser.get();
        updatedUser.setFullName(request.get("fullName"));
        updatedUser.setEmail(request.get("email"));
        updatedUser.setCity(request.get("city"));
        updatedUser.setState(request.get("state"));
        updatedUser.setCountry(request.get("country"));
        updatedUser.setStreetAddress(request.get("streetAddress"));
        updatedUser.setZipCode(request.get("zipCode"));

        userService.updateUser(updatedUser);

        return ResponseEntity.ok(Map.of("message", "Profile Updated Successfully"));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteUserAccount(@RequestBody Map<String, String> request, Authentication authentication){
        UserDetailsImpl userDetails= (UserDetailsImpl) authentication.getPrincipal();

        Long userId= userDetails.getId();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        userService.deleteAccountBasedOnRole(userId, role, request);
        return ResponseEntity.ok(Map.of("message", "Account deleted permanently"));
    }
}
