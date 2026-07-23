package com.example.rapicon.Service;


import com.example.rapicon.DTO.UserRegistrationRequest;
import com.example.rapicon.Models.User;
import com.example.rapicon.Repository.userRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final userRepo userRepository;
    private final OTPService otpService;
    private final CartItemService cartItemService;
    private final PaymentDetailsService paymentDetailsService;
    private final OrderService orderService;
    private final FcmTokenService fcmTokenService;
    private final NotificationService notificationService;

    public User registerUser(UserRegistrationRequest request) {

        User user= new User();

        String fullName = request.getFullName();

        user.setFullName((fullName == null || fullName.isBlank()) ? "Guest": fullName.trim());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());

        user.setStreetAddress(request.getStreetAddress());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setZipCode(request.getZipCode());
        user.setCountry(request.getCountry());

        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        return userRepository.save(user);
    }

    public List<User> getAllUser(){
        return userRepository.findAll();
    }

   public Optional<User> findById(Long id){
        return userRepository.findById(id);
   }


   public Optional<User> findUserByPhone(String phone){
        return userRepository.findByPhone(phone);
   }

   public void updateUser(User user){
       userRepository.save(user);
   }


   public boolean userExistsByEmail(String email){
        return userRepository.existsByEmail(email);
   }

   public boolean userExistsByPhone(String phone){
        return userRepository.existsByPhone(phone);
   }

    // user account delete method
    @Transactional
   public void deleteAccountBasedOnRole(Long id, String role, Map<String, String> request){

        if(role.equals("ROLE_USER")){
            Optional<User> user = userRepository.findById(id);

            if(user.isEmpty()){
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
            }

            String otp= request.get("otp");
            String phone = user.get().getPhone();

            if (otp == null || otp.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP required");
            }

            if(!otpService.verifyOtp(phone, otp)){
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid otp");
            }
            deleteUserData(id);
        }
   }

   private void deleteUserData(Long id){
        fcmTokenService.deleteAllTokensForUser(id);
        cartItemService.deleteItemByUser(id);
        notificationService.deleteByUserId(id);
        paymentDetailsService.deleteByUserId(id);
        orderService.deleteByUser(id);
        userRepository.deleteById(id);
   }
}
