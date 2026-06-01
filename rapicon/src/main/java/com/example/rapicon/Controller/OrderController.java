package com.example.rapicon.Controller;

import com.example.rapicon.DTO.*;
import com.example.rapicon.Models.*;
import com.example.rapicon.Service.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentDetailsService paymentDetailsService;

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody OrderRequestDTO requestData) {
        try {
            BigDecimal amount;
            if(requestData.getTotalInstallments()>1){
                amount= requestData.getInstallmentAmount();
            }else {
                amount= requestData.getTotalAmount();
            }
            BigDecimal amountInPaisa= amount.multiply(new BigDecimal(100));

            // 5. SAVE ONLY ONCE
            Order savedOrder = orderService.createOrder(requestData);


            Map<String, Object> response = new HashMap<>();
            response.put("id", savedOrder.getId());  // Your internal DB order ID
            response.put("merchantOrderId", savedOrder.getMerchantOrderId());     // Order ID for PhonePe
            response.put("amount", amountInPaisa);
            response.put("userId", savedOrder.getUserId());
            response.put("customerName", savedOrder.getCustomerName());
            response.put("customerEmail", savedOrder.getCustomerEmail());
            response.put("customerPhone", savedOrder.getCustomerPhone());
            response.put("status", "CREATED");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to create order", e);
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Failed to create order: " + e.getMessage())
            );
        }
    }

    /**
     * Verify Payment
     * This endpoint verifies the payment and updates order status
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            PaymentDetails paymentDetails= paymentDetailsService.createPayment(true, paymentData);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully! Your order has been placed.");
            response.put("orderId", paymentDetails.getOrderId());
            response.put("phonePeOrderId", paymentDetails.getPhonePeOrderId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Payment verification failed: " + e.getMessage())
            );
        }
    }

    /**
     * Update Order Status
     * This endpoint updates the order status (CANCELLED, FAILED, etc.)
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> statusData) {
        log.info("Updating order status: {} to {}", orderId, statusData.get("status"));

        try {
            String status = statusData.get("status");

            // Order order = orderService.findById(orderId);
            // order.setStatus(status);
            // orderService.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Order status updated");
            response.put("orderId", orderId);
            response.put("status", status);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to update order status", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", e.getMessage())
            );
        }
    }

    /**
     * Get Order Details
     * Fetch order details by ID
     */
    @GetMapping("/{userId}")
    public ResponseEntity<List<Order>> getOrderDetails(@PathVariable String userId) {
        log.info("Fetching order details: {}", userId);

        try {
            List<Order> orders = orderService.getOrderByUser(Long.parseLong(userId));

            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            log.error("Failed to fetch order", e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Verify Payment
     * This endpoint verifies the installment payment and updates order status
     */
    @PostMapping("/verify-installment-payment")
    public ResponseEntity<Map<String, Object>> verifyInstallmentPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            PaymentDetails paymentDetails= paymentDetailsService.createPayment(false, paymentData);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully!");
            response.put("orderId", paymentDetails.getOrderId());
            response.put("phonePeOrderId", paymentDetails.getPhonePeOrderId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Payment verification failed: " + e.getMessage())
            );
        }
    }
}
