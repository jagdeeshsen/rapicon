package com.example.rapicon.Controller;

import com.example.rapicon.DTO.*;
import com.example.rapicon.Service.PhonePeService;
import com.phonepe.sdk.pg.common.models.response.CallbackResponse;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.jpa.event.spi.CallbackType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/phonePe")
@CrossOrigin(origins = "*")
@Slf4j
public class PaymentController {

    @Autowired
    private PhonePeService phonePeService;

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@Valid @RequestBody PaymentRequest request) {

        log.info("Initiating payment for order: {}", request.getMerchantOrderId());

        PaymentResponse response = phonePeService.createPayment(request);

        // Payment is valid if redirect URL exists
        if (response != null && response.getRedirectUrl() != null) {
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "message", response != null ? response.getMessage() : "Payment initiation failed"
                ));
    }

    @GetMapping("/status/{merchantOrderId}")
    public ResponseEntity<?> getOrderStatus(@PathVariable String merchantOrderId) {
        log.info("Fetching order status for: {}", merchantOrderId);
        OrderStatusResponse response = phonePeService.checkOrderStatus(merchantOrderId);
        return ResponseEntity.ok(response);
    }

    /*@PostMapping("/refund")
    public ResponseEntity<RefundResponse> initiateRefund(
            @Valid @RequestBody RefundRequest request) {
        log.info("Initiating refund: {}", request.getMerchantRefundId());
        RefundResponse response = phonePeService.initiateRefund(request);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/refund/status/{merchantRefundId}")
    public ResponseEntity<RefundResponse> getRefundStatus(
            @PathVariable String merchantRefundId) {
        log.info("Fetching refund status for: {}", merchantRefundId);
        RefundResponse response = phonePeService.getRefundStatus(merchantRefundId);
        return ResponseEntity.ok(response);
    }*/
}
