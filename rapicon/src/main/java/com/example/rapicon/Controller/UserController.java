package com.example.rapicon.Controller;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Models.User;
import com.example.rapicon.Service.DesignService;
import com.example.rapicon.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private DesignService service;

    @Autowired
    private UserService userService;

    /*@GetMapping("/me")
    public ResponseEntity<User> getUserDetails(@RequestParam("username") String username){
        User user= userService.findByUserName(username);
        return ResponseEntity.ok(user);
    }*/

    @GetMapping("/approved")
    public ResponseEntity<List<Design>> getApprovedDesigns(){
        List<Design> designs= service.findDesignsByStatus(Status.APPROVED);
        return ResponseEntity.ok(designs);
    }

    @GetMapping("/get-user")
    public ResponseEntity<User> getUserById(@RequestParam Long id){
        Optional<User> user= userService.findById(id);
        return ResponseEntity.ok(user.get());
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
        //updatedUser.setEmail(existUser.get().getEmail());
        updatedUser.setPhone(request.get("phone"));
        updatedUser.setCity(request.get("city"));
        updatedUser.setState(request.get("state"));
        updatedUser.setCountry(request.get("country"));
        updatedUser.setStreetAddress(request.get("streetAddress"));
        updatedUser.setZipCode(request.get("zipCode"));

        userService.updateUser(updatedUser);

        return ResponseEntity.ok(Map.of("message", "Profile Updated Successfully"));
    }
}
