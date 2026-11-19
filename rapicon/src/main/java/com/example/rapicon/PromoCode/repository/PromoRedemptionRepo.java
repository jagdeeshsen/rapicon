package com.example.rapicon.PromoCode.repository;

import com.example.rapicon.PromoCode.entity.PromoRedemption;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromoRedemptionRepo extends JpaRepository<PromoRedemption, Long> {

    /** Fast-path check only; the unique constraint uq_redemption is the real guard. */
    boolean existsByPromoCodeIdAndUserId(Long promoCodeId, Long userId);
}
