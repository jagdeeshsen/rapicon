package com.example.rapicon.PromoCode.service;

import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.PromoCode.entity.PromoCodeUsers;
import com.example.rapicon.PromoCode.repository.PromoCodeUserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PromoCodeUserService {

    private final PromoCodeUserRepo repository;

   public void create(Long promoCodeId, Long userId){
       try{
           PromoCodeUsers user = new PromoCodeUsers();

           user.setUserId(userId);
           user.setPromoCodeId(promoCodeId);
           user.setAssignedAt(Instant.now());

           repository.saveAndFlush(user);
       } catch (RuntimeException e) {
           throw new RuntimeException(e);
       }
   }

   public boolean existsByUserId(Long userId){
       return repository.existsByUserId(userId);
   }

   public boolean existsByPromoCodeAndUserId(Long promoCodeId, Long userId){
       return repository.existsByPromoCodeIdAndUserId(promoCodeId, userId);
   }

   public PromoCodeUsers findByUserId(Long userId){
       return repository.findByUserId(userId).
               orElseThrow(() -> new ResourceNotFoundException("User Entitlement not found with user id: "+ userId));
   }

   public PromoCodeUsers findByPromoCodeIdAndUserId(Long promoId, Long userId){
       return repository.findByPromoCodeIdAndUserId(promoId, userId);
   }
}
