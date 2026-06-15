package com.example.rapicon.Controller;

import com.example.rapicon.DTO.*;
import com.example.rapicon.Service.PhonePeService;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/phonePe")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class PaymentController {

    private final PhonePeService phonePeService;

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

    @PostMapping("/initiate-sdk")
    public ResponseEntity<?> initiateSDKPayment(@Valid @RequestBody PaymentRequest request) {

        log.info("Initiating SDK payment for order: {}", request.getMerchantOrderId());

        PaymentResponse response = phonePeService.createSDKPayment(request);

        if (response != null && response.getOrderId() != null && response.getPhonepe_token() != null) {
            return ResponseEntity.ok(Map.of(
                    "orderId", response.getOrderId(),
                    "token",   response.getPhonepe_token()
            ));
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "success", false,
                        "message", "SDK payment initiation failed"
                ));
    }
}
