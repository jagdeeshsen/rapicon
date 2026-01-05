package com.example.rapicon.Controller;

import com.example.rapicon.DTO.ResetPasswordRequest;
import com.example.rapicon.Models.User;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Security.JwtUtil;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.OTPService;
import com.example.rapicon.Service.PasswordResetService;
import com.example.rapicon.Service.UserService;
import com.example.rapicon.Service.VendorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Slf4j
@CrossOrigin(origins = "*")
public class authController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private OTPService otpService;

    public authController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @Value("${app.test-login.enabled:false}")
    private boolean testLoginEnabled;

    @Value("${app.test-login.phone:}")
    private String testLoginPhone;


    //--------------------------User Authentication Logic---------------------------------------------//

    @PostMapping("/register-user")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> request) {

        try{
            String phone = request.get("phone");
            String email = request.get("email");

            // Validate input
            if (phone == null || phone.isBlank() || email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Phone number and email are required"
                ));
            }

            // check if user already exists
            Optional<User> optionalUser= userService.findUserByPhone(phone);

            if(optionalUser.isPresent()){
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User with this phone number already exists"));
            }

            User user= new User();
            user.setPhone(phone);
            user.setEmail(email);

            userService.registerUser(user);

            Map<String, String> response= new HashMap<>();

            response.put("message", "User registered successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message","Registration failed.","error",e.getMessage()));
        }
    }

    @PostMapping("/logout-user")
    public ResponseEntity<Map<String, String>> logoutUser(@RequestHeader("Authorization") String tokenHeader) {
        try {
            if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Missing or invalid Authorization header"));
            }

            String token = tokenHeader.replace("Bearer ", "").trim();

            // Optionally invalidate the token
            // If you have a blacklist service, add it there
            //jwtUtil.blacklistToken(token); // implement this in your JwtUtil or a separate service

            return ResponseEntity.ok(Map.of(
                    "message", "Logout successful",
                    "status", "success"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed", "error", e.getMessage()));
        }
    }


    // otp verification methods

    // ✅ Step 1: Send OTP to user's phone
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");

        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        }

        // ✅ GOOGLE REVIEW TEST LOGIN (NO OTP)
        if (testLoginEnabled && phone.equals(testLoginPhone)) {
            return ResponseEntity.ok(Map.of(
                    "message", "Test login enabled. OTP not required.",
                    "bypassOtp", true
            ));
        }

        Optional<User> userOpt = userService.findUserByPhone(phone);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No user registered with this phone number"));
        }

        String otp = otpService.generateOtp(phone);
        otpService.sendOtpSms(phone, otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // ✅ Step 2: Verify OTP and Login
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String otp = request.get("otp");

        if (phone == null || phone.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Phone number is required"));
        }

        Optional<User> userOpt= userService.findUserByPhone(phone);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        // ✅ TEST LOGIN (NO OTP REQUIRED)
        if (testLoginEnabled && phone.equals(testLoginPhone)) {

            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            String token = jwtUtil.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", "USER"); // or "USER"
            response.put("id", String.valueOf(user.getId()));
            response.put("fullName", user.getFullName());
            response.put("testLogin", true);

            return ResponseEntity.ok(response);
        }

        if (!otpService.verifyOtp(phone, otp)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        /*Optional<User> userOpt= userService.findUserByPhone(phone);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }*/

        /*User user = userOpt.get();*/
        // Build UserDetailsImpl from your User entity
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        // Generate token with id, email, role, etc.
        String token = jwtUtil.generateToken(userDetails);

        Map<String, Object> response= new HashMap<>();
        response.put("token", token);
        response.put("role", "USER");
        response.put("id", String.valueOf(user.getId()));
        response.put("fullName", user.getFullName());

        return ResponseEntity.ok(response);
    }


    // ----------------------------------Vendor Authentication Logic--------------------------------//

    @PostMapping("/create-vendor")
    public ResponseEntity<Map<String, String>> createVendor(@RequestBody Vendor vendor){
        try {
            // check if vendor exists
            boolean emailExist= vendorService.vendorExistsByEmail(vendor.getEmail());
            boolean usernameExits = vendorService.vendorExistsByUsername(vendor.getUsername());

            if(emailExist){
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already exists try with another email address"));
            } else if (usernameExits) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username already exists try with another username"));
            }

            if (vendor.getPhone() == null || !vendor.getPhone().matches("\\d{10}")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid phone number. Must be 10 digits."));
            }

            vendorService.registerVendor(vendor);
            Map<String, String> response= new HashMap<>();
            response.put("message", "Vendor registered successfully!");
            return ResponseEntity.ok(response);
        }catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message","Registration failed", "error", e.getMessage()));
        }
    }

    @PostMapping("/login-vendor")
    public ResponseEntity<Map<String, String>> loggingVendor(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        Vendor vendor = vendorService.getVendorByUsername(username);
        if(vendor==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No vendor found with this username. Register first to login."));
        }

        // Check password manually
        if (!new BCryptPasswordEncoder().matches(password, vendor.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid username or password"));
            //throw new RuntimeException("Invalid credentials");
        }

        // Build UserDetailsImpl from your User entity
        UserDetailsImpl vendorDetails = UserDetailsImpl.build(vendor);

        // Generate token with id, email, role, etc.
        String token = jwtUtil.generateToken(vendorDetails);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "role", "VENDOR",
                "id", String.valueOf(vendor.getId()), // optional, just for client convenience
                "fullName", vendor.getFullName(),
                "email",vendor.getEmail()
        ));
    }

    @PostMapping("/logout-vendor")
    public ResponseEntity<Map<String, String>> logoutVendor(@RequestHeader("Authorization") String tokenHeader) {
        try {
            if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Missing or invalid Authorization header"));
            }

            String token = tokenHeader.replace("Bearer ", "").trim();

            // Optionally invalidate the token
            // If you have a blacklist service, add it there
            //jwtUtil.blacklistToken(token); // implement this in your JwtUtil or a separate service

            return ResponseEntity.ok(Map.of(
                    "message", "Logout successful",
                    "status", "success"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed", "error", e.getMessage()));
        }
    }

    /**
     * Forgot Password Endpoint
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            passwordResetService.initiatePasswordReset(request.get("email"));

            // Always return success (don't reveal if email exists)
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("message","Password reset link sent successfully to the registered email"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message","Failed to sent password reset link!"));
        }
    }

    /**
     * Validate Reset Token Endpoint
     */
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);

        if (isValid) {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("success",true, "message", "Token is valid"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success",false, "message", "Invalid or expired reset token."));
        }
    }

    /**
     * Reset Password Endpoint
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());

            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("success", true, "message", "Password has been reset successfully. You can now login with your new password."));
        } catch (RuntimeException e) {
            log.error("Error resetting password", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error resetting password", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message","An error occurred. Please try again"));
        }
    }

}
