package com.example.rapicon.PromoCode.controller;

import com.example.rapicon.PromoCode.dto.AiPlanOrderRequest;
import com.example.rapicon.PromoCode.dto.AiPlanOrderResponse;
import com.example.rapicon.PromoCode.entity.AiPlanOrder;
import com.example.rapicon.PromoCode.service.AiPlanOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiOrderController {

    private final AiPlanOrderService planOrderService;

    @PostMapping("/order")
    public ResponseEntity<AiPlanOrderResponse> createOrder(@RequestBody @Valid AiPlanOrderRequest request){
        return ResponseEntity.ok(planOrderService.createOrder(request));
    }

    /**
     * Verify Payment
     * This endpoint verifies the payment and updates order status
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            AiPlanOrder order = planOrderService.verifyPaymentAndUpdateOrder(paymentData);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully! Your order has been placed.");
            response.put("orderId", order.getId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Payment verification failed")
            );
        }
    }
}
