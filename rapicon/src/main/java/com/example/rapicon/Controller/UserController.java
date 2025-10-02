package com.example.rapicon.Controller;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Models.User;
import com.example.rapicon.Service.DesignService;
import com.example.rapicon.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private DesignService service;

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getUserDetails(@RequestParam("username") String username){
        User user= userService.findByUserName(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Design>> getApprovedDesigns(){
        List<Design> designs= service.findDesignsByStatus(Status.APPROVED);
        return ResponseEntity.ok(designs);
    }
}
