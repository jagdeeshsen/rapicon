package com.example.rapicon.PromoCode.repository;

import com.example.rapicon.Enum.PromoStatus;
import com.example.rapicon.PromoCode.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromoCodeRepo extends JpaRepository<PromoCode, Long> {

    Optional<PromoCode> findByCodeAndStatus(String code, PromoStatus status);

    Optional<PromoCode> findByCode(String code);

    boolean existsByCode(String code);
}
