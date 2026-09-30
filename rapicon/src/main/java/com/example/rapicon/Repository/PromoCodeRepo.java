package com.example.rapicon.Repository;

import com.example.rapicon.Models.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromoCodeRepo  extends JpaRepository<PromoCode, Long> {

    Optional<PromoCode> findByCodeAndActiveTrue(String code);

    // Atomic: increments only if capacity remains. Returns 1 on success, 0 if exhausted.
    @Modifying
    @Query("""
        UPDATE PromoCode p
           SET p.redemptionCount = p.redemptionCount + 1
         WHERE p.id = :id
           AND (p.maxRedemptions IS NULL OR p.redemptionCount < p.maxRedemptions)
        """)
    int tryIncrementRedemption(@Param("id") Long id);
}
