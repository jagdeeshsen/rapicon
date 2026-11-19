package com.example.rapicon.PromoCode.repository;

import com.example.rapicon.PromoCode.entity.PromoCodeUsers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

public interface PromoCodeUserRepo extends JpaRepository<PromoCodeUsers, Long> {

    Optional<PromoCodeUsers> findByUserId(Long userId);
    boolean existsByUserId(Long userid);
    boolean existsByPromoCodeIdAndUserId(Long promoCodeId, Long userId);
}
