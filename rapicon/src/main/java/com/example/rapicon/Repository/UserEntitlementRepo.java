package com.example.rapicon.Repository;

import com.example.rapicon.Models.UserEntitlement;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserEntitlementRepo extends JpaRepository<UserEntitlement, Long> {

    // Row lock, used by the generate endpoint so credits can't be double-spent
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM UserEntitlement e WHERE e.userId = :userId")
    Optional<UserEntitlement> findByUserIdForUpdate(@Param("userId") Long userId);

    // Atomic upsert: creates the row or adds to the existing balance
    @Modifying
    @Query(value = """
        INSERT INTO user_entitlement (user_id, remaining_free_generations, source)
        VALUES (:userId, :amount, 'PROMO')
        ON CONFLICT (user_id) DO UPDATE
           SET remaining_free_generations =
               user_entitlement.remaining_free_generations + :amount
        """, nativeQuery = true)
    void addFreeGenerations(@Param("userId") Long userId, @Param("amount") int amount);
}
