package com.example.rapicon.Controller;

import com.example.rapicon.Models.User;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id){
        return ResponseEntity.status(HttpStatus.OK).body(userService.findById(id));
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody Map<String, String> request){
        Long id= Long.parseLong(request.get("id"));
        User user = userService.findById(id);

        user.setFullName(request.get("fullName"));
        user.setEmail(request.get("email"));
        user.setCity(request.get("city"));
        user.setState(request.get("state"));
        user.setCountry(request.get("country"));
        user.setStreetAddress(request.get("streetAddress"));
        user.setZipCode(request.get("zipCode"));

        User updatedUser = userService.updateUser(user);

        return ResponseEntity.ok(Map.of("user", updatedUser,"message", "Profile Updated Successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUser(){
        List<User> users= userService.getAllUser();
        if(users.isEmpty()){
            return ResponseEntity.noContent().build();
        }else {
            return ResponseEntity.ok(users);
        }
    }

    @GetMapping("/page/users")
    public ResponseEntity<Page<User>> findAllUsers(@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)Pageable pageable){
        return ResponseEntity.ok(userService.findAllPagination(pageable));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUserAccount(@RequestBody Map<String, String> request, Authentication authentication){
        UserDetailsImpl userDetails= (UserDetailsImpl) authentication.getPrincipal();

        Long userId= userDetails.getId();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        userService.deleteAccountBasedOnRole(userId, role, request);
        return ResponseEntity.ok(Map.of("message", "Account deleted permanently"));
    }
}
