package com.example.rapicon.Controller;

import com.example.rapicon.DTO.*;
import com.example.rapicon.Models.Admin;
import com.example.rapicon.Models.User;
import com.example.rapicon.Models.Vendor;
import com.example.rapicon.Security.JwtUtil;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
@Slf4j
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class authController {


    private final UserService userService;
    private final VendorService vendorService;
    private final JwtUtil jwtUtil;
    private final PasswordResetService passwordResetService;
    private final OTPService otpService;
    private final AdminService adminService;
    private final AuthService authService;

    @Value("${app.test-login.enabled:false}")
    private boolean testLoginEnabled;

    @Value("${app.test-login.phone:}")
    private String testLoginPhone;


    //--------------------------User Authentication Logic---------------------------------------------//

    @PostMapping("/user")
    public ResponseEntity<?> register(@RequestBody @Valid UserRegistrationRequest request) {

        if(userService.userExistsByEmail(request.getEmail())){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists try with another email address."));
        }

        if(userService.userExistsByPhone(request.getPhone())){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Phone already exists try with another phone number."));
        }

        User user = userService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registration successfully!", "userId", user.getId()));

    }

    @PostMapping("/logout-user")
    public ResponseEntity<Map<String, String>> logoutUser(@RequestHeader("Authorization") String tokenHeader) {
        try {
            if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Missing or invalid Authorization header"));
            }

            String token = tokenHeader.replace("Bearer ", "").trim();

            return ResponseEntity.ok(Map.of(
                    "message", "Logout successful",
                    "status", "success"
            ));
        } catch (Exception e) {
            log.error("User logout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed"));
        }
    }

    // Send OTP to user's phone
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone").trim();

        if (phone.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number is required"));
        }

        // GOOGLE REVIEW TEST LOGIN (NO OTP)
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

    // Verify OTP and Login
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone").trim();
        String otp = request.get("otp").trim();

        if (phone.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Phone number is required"));
        }

        Optional<User> userOpt= userService.findUserByPhone(phone);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        // TEST LOGIN (NO OTP REQUIRED)
        if (testLoginEnabled && phone.equals(testLoginPhone)) {

            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
            String token = jwtUtil.generateToken(userDetails);
            String refreshToken = jwtUtil.generateRefreshToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("refreshToken", refreshToken);
            response.put("role", "USER");
            response.put("id", String.valueOf(user.getId()));
            response.put("fullName", user.getFullName());
            response.put("testLogin", true);

            return ResponseEntity.ok(response);
        }

        if (!otpService.verifyOtp(phone, otp)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        // Build UserDetailsImpl from your User entity
        UserDetailsImpl userDetails = UserDetailsImpl.build(user);

        // Generate token and refreshToken with id, email, role, etc.
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        Map<String, Object> response= new HashMap<>();
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("role", "USER");
        response.put("id", String.valueOf(user.getId()));
        response.put("fullName", user.getFullName());

        return ResponseEntity.ok(response);
    }


    // ----------------------------------Vendor Authentication Logic--------------------------------//

    @PostMapping("/vendor")
    public ResponseEntity<?> createVendor(@RequestBody @Valid VendorRegistrationRequest request){
        if(vendorService.vendorExistsByEmail(request.getEmail())){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists try with another email address"));
        }

        if (vendorService.vendorExistsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists try with another username"));
        }

        Vendor vendor= vendorService.registerVendor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Vendor registered successfully!", "vendorId", vendor.getId()));
    }

    @PostMapping("/vendor/login")
    public ResponseEntity<?> loginVendor(@RequestBody @Valid LoginRequest request) {
        String username = request.getUsername();
        String password = request.getPassword();

        if(username == null || username.isBlank() || password == null || password.isBlank()){
            return ResponseEntity.badRequest().body(Map.of("message", "Username or password required"));
        }

        AuthResult authResult = authService.authenticateVendor(username.trim(), password);
        return ResponseEntity.ok(Map.of(
                "token", authResult.token(),
                "role", authResult.role(),
                "id", authResult.id(),
                "fullName", authResult.fullName(),
                "email", authResult.email()
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

            return ResponseEntity.ok(Map.of(
                    "message", "Logout successful",
                    "status", "success"
            ));
        } catch (Exception e) {
            log.error("Vendor logout failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Logout failed"));
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
            log.error("Failed to reset password", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message","Failed to sent password reset link!"));
        }
    }

    @PostMapping("/admin/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        passwordResetService.initiatePasswordResetForAdmin(email);
        return ResponseEntity.ok().build();
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
                    .body(Map.of("success", false, "message", "Error resetting password"));
        } catch (Exception e) {
            log.error("Unexpected error resetting password", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message","An error occurred. Please try again"));
        }
    }

    // ------------ refresh token when token is expired ------------------
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");

        // 1. Token missing
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Refresh token is required"));
        }

        // 2. Token invalid or expired
        if (!jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Refresh token expired. Please log in again."));
        }

        // 3. Make sure it is actually a refresh token
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid token type"));
        }

        // 4. Load user from the token subject (username)
        String username = jwtUtil.extractUsername(refreshToken);
        String role = jwtUtil.extractRole(refreshToken);
        Long id = jwtUtil.extractUserId(refreshToken);

        UserDetailsImpl userDetails= null;
        if(role.equals("USER")){
            Optional<User> user= userService.findById(id);
            if(user.isPresent() ) userDetails= UserDetailsImpl.build(user.get());
        }else if(role.equals("VENDOR")){
            Vendor vendor= vendorService.getVendorByUsername(username);
            userDetails = UserDetailsImpl.build(vendor);
        }

        // 5. Issue new token pair
        String newAccessToken  = jwtUtil.generateToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "accessToken",  newAccessToken,
                "refreshToken", newRefreshToken
        ));
    }


    //----------------------------------- Admin Endpoints ---------------------------------

    @PostMapping("/admin")
    public ResponseEntity<?> createAdmin(@RequestBody @Valid AdminRegistrationRequest request){

        if(adminService.adminExistsByEmail(request.getEmail())){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email is already exists try with another email address"));
        }

        if(adminService.adminExistsByUsername(request.getUsername())){
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username is already exists try with another username"));
        }

        Admin created= adminService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Admin registered successfully!", "adminId", created.getId()));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody @Valid LoginRequest request){
        String username= request.getUsername();
        String password = request.getPassword();

        if(username == null || username.isBlank() || password == null || password.isBlank()){
            return ResponseEntity.badRequest().body(Map.of("message", "Username or password required"));
        }

        AuthResult authResult= authService.authenticateAdmin(username.trim(), password);
        return ResponseEntity.ok(Map.of(
                "token", authResult.token(),
                "role", authResult.role(),
                "id", authResult.id(),
                "fullName", authResult.fullName(),
                "email", authResult.email(),
                "phone", authResult.phone()
        ));
    }
}
