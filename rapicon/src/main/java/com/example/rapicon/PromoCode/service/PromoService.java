package com.example.rapicon.PromoCode.service;


import com.example.rapicon.CustomExceptions.PromoAlreadyUsedException;
import com.example.rapicon.CustomExceptions.PromoExistsException;
import com.example.rapicon.CustomExceptions.PromoInvalidException;
import com.example.rapicon.Enum.PromoDiscountType;
import com.example.rapicon.Enum.PromoStatus;
import com.example.rapicon.PromoCode.dto.PromoCodeRequest;
import com.example.rapicon.PromoCode.dto.PromoCodeResponse;
import com.example.rapicon.PromoCode.dto.RedeemRequest;
import com.example.rapicon.PromoCode.entity.AiPlans;
import com.example.rapicon.PromoCode.entity.PromoCode;
import com.example.rapicon.PromoCode.repository.PromoCodeRepo;
import com.example.rapicon.PromoCode.repository.PromoRedemptionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.InvalidPropertiesFormatException;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PromoService {

    private final PromoCodeRepo promoRepo;
    private final PromoRedemptionRepo redemptionRepo;
    private final PromoCodeUserService promoCodeUserService;
    private final AiPlanService aiPlanService;

    @Transactional
    public String create(PromoCodeRequest req) {
        String code = req.code().trim().toUpperCase(Locale.ROOT);

        if (req.validFrom() != null && req.validUntil() != null
                && !req.validUntil().isAfter(req.validFrom())) {
            throw new PromoInvalidException("validUntil must be after validFrom.");
        }

        if (promoRepo.existsByCode(code)) {
            throw new PromoExistsException("A promo code with this name already exists.");
        }

        if(req.discountValue() == 0){
            throw new PromoInvalidException("Invalid discount value.");
        }

        PromoCode promo = new PromoCode();
        promo.setCode(code);
        promo.setDiscountType(req.discountType());
        promo.setDiscountValue(req.discountValue());
        promo.setMaxDiscount(req.maxDiscount());
        promo.setMinOrderAmount(req.minOrderAmount());
        promo.setValidFrom(req.validFrom());
        promo.setValidUntil(req.validUntil());

        promoRepo.saveAndFlush(promo);
        return "Promo code created successfully";
    }

    /*@Transactional(readOnly = true)
    public List<PromoCodeResponse> list() {
        return promoRepo.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream().map(PromoCodeResponse::from).toList();
    }*/

    /**
     * Everything below runs in ONE transaction: if any step throws (including the
     * duplicate-redemption constraint), the redemption_count increment rolls back too,
     * so a rejected attempt never consumes a slot.
     */
    @Transactional
    public PromoCodeResponse redeem(Long userId, RedeemRequest request) {
        String code = request.code().trim().toUpperCase(Locale.ROOT);

        PromoCode promo = promoRepo.findByCodeAndStatus(code, PromoStatus.ACTIVE)
                .orElseThrow(() -> new PromoInvalidException("Invalid or inactive promo code."));

        Instant now = Instant.now();
        if (promo.getValidFrom() != null && promo.getValidFrom().isAfter(now)) {
            throw new PromoInvalidException("This promo code is not active yet.");
        }
        if (promo.getValidUntil() != null && promo.getValidUntil().isBefore(now)) {
            throw new PromoInvalidException("Promo code is expired.");
        }

        // Fast-path only. The unique constraint below is the real guard.
        if (redemptionRepo.existsByPromoCodeIdAndUserId(promo.getId(), userId)) {
            throw new PromoAlreadyUsedException("You have already redeemed this promo code");
        }

        try {
            boolean user = promoCodeUserService.existsByPromoCodeAndUserId(promo.getId(), userId);
            AiPlans plan = aiPlanService.getByName(request.packageName());

            // Calculate discount
            BigDecimal subtotal = plan.getPrice();

            if(subtotal.compareTo(BigDecimal.valueOf(promo.getMinOrderAmount())) < 0){
                throw new RuntimeException("This promo code require minimum order amount of "+String.valueOf(promo.getMinOrderAmount()));
            }
            BigDecimal payableAmount = BigDecimal.ZERO;
            BigDecimal discountAmount = BigDecimal.ZERO;

            if (promo.getDiscountType() == PromoDiscountType.PERCENTAGE) {

                discountAmount = subtotal
                        .multiply(BigDecimal.valueOf(promo.getDiscountValue()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                if (promo.getMaxDiscount() != 0) {
                    BigDecimal maxDiscount = BigDecimal.valueOf(promo.getMaxDiscount());

                    if (discountAmount.compareTo(maxDiscount) > 0) {
                        discountAmount = maxDiscount;
                    }
                }

            } else if (promo.getDiscountType() == PromoDiscountType.FIX) {
                discountAmount = BigDecimal.valueOf(promo.getDiscountValue());
            }

            // Set Payable amount
            payableAmount = subtotal.subtract(discountAmount);


            if(user){
                return new PromoCodeResponse(promo.getId(), subtotal, promo.getDiscountType(), discountAmount, payableAmount);
            }else{
                promoCodeUserService.create(promo.getId(), userId);
                return new PromoCodeResponse(promo.getId(), subtotal, promo.getDiscountType(), discountAmount, payableAmount);
            }
        } catch (DataIntegrityViolationException e) {
            throw new PromoAlreadyUsedException("You have already redeemed this promo code"); // lost a concurrent race
        }
    }
}
