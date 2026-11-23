package com.example.rapicon.PromoCode.service;

import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.Enum.PromoStatus;
import com.example.rapicon.Models.AIGeneratedDesign;
import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.User;
import com.example.rapicon.PromoCode.dto.AiPlanOrderRequest;
import com.example.rapicon.PromoCode.dto.AiPlanOrderResponse;
import com.example.rapicon.PromoCode.entity.AiPlanOrder;
import com.example.rapicon.PromoCode.entity.PromoCodeUsers;
import com.example.rapicon.PromoCode.entity.PromoRedemption;
import com.example.rapicon.PromoCode.repository.AiPlanOrderRepo;
import com.example.rapicon.PromoCode.repository.PromoCodeUserRepo;
import com.example.rapicon.PromoCode.repository.PromoRedemptionRepo;
import com.example.rapicon.Service.AIGeneratedDesignService;
import com.example.rapicon.Service.FileMailerService;
import com.example.rapicon.Service.TransactionNotificationService;
import com.example.rapicon.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPlanOrderService {

    private final AiPlanOrderRepo planOrderRepo;
    private final PromoRedemptionRepo promoRedemptionRepo;
    private final PromoCodeUserRepo promoCodeUserRepo;
    private final PromoCodeUserService promoCodeUserService;
    private final TransactionNotificationService transactionNotificationService;
    private final UserService userService;
    private final AIGeneratedDesignService aiGeneratedDesignService;
    private final FileMailerService fileMailerService;

    public AiPlanOrderResponse createOrder(AiPlanOrderRequest request){
        try{
            String merchantId = "ORD"+(int)(Math.random() * 900000);
            BigDecimal payableAmount = request.getTotalAmount().multiply(new BigDecimal(100));  // Amount in paise for phonepe

            AiPlanOrder order = new AiPlanOrder();

            order.setUserId(request.getUserId());
            order.setPromoId(request.getPromoId());

            order.setSubtotal(request.getSubtotal());
            order.setDiscountAmount(request.getDiscountAmount());
            order.setTotalAmount(request.getTotalAmount());

            order.setMerchantOrderId(merchantId);
            order.setSessionId(request.getSessionId());
            order.setPackageName(request.getPackageName());

            planOrderRepo.saveAndFlush(order);
            return new AiPlanOrderResponse(order.getId(), merchantId, payableAmount);
        }catch (RuntimeException e){
            log.error("Failed to create AI plan order", e);
            throw e;
        }
    }

    public AiPlanOrder getOrderById(Long id){
        AiPlanOrder order = planOrderRepo.findById(id).orElseThrow( () ->
                new ResourceNotFoundException("AI Plan order not found with thi id: "+ id));
        return order;
    }

    public AiPlanOrder verifyPaymentAndUpdateOrder(Map<String, Object> paymentData){
        Long Id = Long.parseLong(paymentData.get("orderId").toString());
        String merchantOrderId = (String) paymentData.get("merchantOrderId");
        String phonePeOrderId = (String) paymentData.get("phonePeOrderId");
        Long amount = ((Number) paymentData.get("amount")).longValue();


        // 1. Check if order exists
        AiPlanOrder order = getOrderById(Id);

        // 2. Verify amount matches
        BigDecimal savedAmount = order.getTotalAmount();

        BigDecimal amountInPaisa= savedAmount.multiply(new BigDecimal(100));
        System.out.println("saved Amount: "+ savedAmount+ ","+ "amount: "+ amountInPaisa);
        if (amountInPaisa.compareTo(new BigDecimal(amount))!=0) {
            throw new RuntimeException("Amount mismatch");
        }else{
            order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
            order.setOrderStatus(Order.OrderStatus.COMPLETED);
            order.setUpdatedAt(Instant.now());
        }
        order.setPhonePeOrderId(phonePeOrderId);
        // Update order
        planOrderRepo.saveAndFlush(order);

        // Update promo code user table if user use promo code
        if(order.getPromoId()!=null && order.getPromoId() != 0L ){
            PromoCodeUsers promoUser = promoCodeUserService.findByPromoCodeIdAndUserId(order.getPromoId(), order.getUserId());
            promoUser.setUpdatedAt(Instant.now());
            promoCodeUserRepo.save(promoUser);

            // Update promo redemption table
            PromoRedemption promoRedemption = new PromoRedemption();

            promoRedemption.setOrderId(order.getId());
            promoRedemption.setPromoCodeId(order.getPromoId());
            promoRedemption.setUserId(order.getUserId());
            promoRedemption.setStatus(PromoStatus.REDEEMED);
            promoRedemption.setRedeemedAt(Instant.now());
            promoRedemptionRepo.save(promoRedemption);
        }

        // Sent product material to user
        sendProductMaterialToUser(order.getSessionId(), order.getUserId());

        return order;
    }

    public void sendProductMaterialToUser(String sessionId, Long userId){
        User user = userService.findById(userId);
        String senderEmail = user.getEmail();

        List<String> filesUrl = new ArrayList<>();

        List<AIGeneratedDesign> designs = aiGeneratedDesignService.findBySessionId(sessionId);

        for(AIGeneratedDesign design : designs){
            List<String> urls = design.getFileUrls();
            filesUrl.addAll(urls);
        }

        fileMailerService.sendFiles(senderEmail, filesUrl);
    }
}
