package com.example.rapicon.Repository;

import com.example.rapicon.Models.FcmToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FcmTokenRepo extends JpaRepository<FcmToken, Long> {

    List<FcmToken> findByUserId(Long userId);

    Optional<FcmToken> findByUserIdAndToken(Long userId, String token);

    void deleteByToken(String token);

    void deleteByUserId(Long userId);
}
