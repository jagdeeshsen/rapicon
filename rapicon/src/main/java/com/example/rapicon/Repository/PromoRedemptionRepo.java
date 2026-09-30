package com.example.rapicon.Repository;

import com.example.rapicon.Models.PromoCodeRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromoRedemptionRepo extends JpaRepository<PromoCodeRedemption, Long> {
    boolean existsByPromoCodeIdAndUserId(Long promoCodeId, Long userId);
}
