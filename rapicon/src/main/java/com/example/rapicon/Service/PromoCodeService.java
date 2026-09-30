package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.PromoAlreadyUsedException;
import com.example.rapicon.CustomExceptions.PromoExhaustedException;
import com.example.rapicon.CustomExceptions.PromoExpiredException;
import com.example.rapicon.CustomExceptions.PromoInvalidException;
import com.example.rapicon.DTO.PromoCodeRequest;
import com.example.rapicon.Models.PromoCode;
import com.example.rapicon.Models.PromoCodeRedemption;
import com.example.rapicon.Repository.PromoCodeRepo;
import com.example.rapicon.Repository.PromoRedemptionRepo;
import com.example.rapicon.Repository.UserEntitlementRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDateTime;

@Service
@RequiredArgsConstructor
public class PromoCodeService {

    private final PromoCodeRepo promoRepo;
    private final PromoRedemptionRepo promoRedemptionRepo;
    private final UserEntitlementRepo entitlementRepo;

    public String createPromoCode(PromoCodeRequest request){

        PromoCode promoCode = new PromoCode();

        promoCode.setCode(request.getCode());
        promoCode.setDescription(request.getDescription());
        promoCode.setMaxRedemptions(request.getMaxRedemptions());
        promoCode.setRedemptionCount(request.getRedemptionCount());
        promoCode.setMaxRedemptionsPerUser(request.getMaxRedemptionsPerUser());
        promoCode.setGrantType(request.getGrantType());
        promoCode.setGrantValue(request.getGrantValue());

        promoCode.setActive(request.isActive());
        promoCode.setValidFrom(request.getValidFrom());
        promoCode.setValidUntil(request.getValidUntil());

        promoCode.setCreatedAt(LocalDateTime.now());

        promoRepo.save(promoCode);
        return "Promo Code is created successfully";
    }

    @Transactional
    public void redeem(Long userId, String rawCode) {
        String code = rawCode.trim().toUpperCase();

        PromoCode promo = promoRepo.findByCodeAndActiveTrue(code)
                .orElseThrow(() -> new PromoInvalidException("Invalid or inactive code"));

        Instant now = Instant.now();
        if (promo.getValidFrom() != null && promo.getValidFrom().isAfter(ChronoLocalDateTime.from(now)))
            throw new PromoInvalidException("Code not active yet");
        if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(ChronoLocalDateTime.from(now)))
            throw new PromoExpiredException("Promo code expired");

        if (promoRedemptionRepo.existsByPromoCodeIdAndUserId(promo.getId(), userId))
            throw new PromoAlreadyUsedException("Promo code is already used");

        if (promoRepo.tryIncrementRedemption(promo.getId()) == 0)
            throw new PromoExhaustedException( "Promo code exhausted");

        try {
            promoRedemptionRepo.saveAndFlush(new PromoCodeRedemption());
        } catch (DataIntegrityViolationException e) {
            throw new PromoAlreadyUsedException("Promo code is already used"); // concurrent double-click; tx rolls back the increment
        }

        entitlementRepo.addFreeGenerations(userId, promo.getGrantValue());
    }
}
