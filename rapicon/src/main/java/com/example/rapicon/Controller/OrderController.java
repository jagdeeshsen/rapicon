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
            // generate merchantOrder id
            String merchantOrderId = "ORD" + (int)(Math.random() * 900000);

            BigDecimal amount;
            if(requestData.getTotalInstallments()>1){
                amount= requestData.getInstallmentAmount();
            }else {
                amount= requestData.getTotalAmount();
            }
            BigDecimal amountInPaisa= amount.multiply(new BigDecimal(100));

            // 2. Build order
            User user = userService.findById(requestData.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Order order = new Order();
            order.setUserId(user.getId());
            order.setCustomerName(user.getFullName());
            order.setCustomerEmail(user.getEmail());
            order.setCustomerPhone(user.getPhone());
            order.setTotalAmount(requestData.getTotalAmount());
            order.setMerchantOrderId(merchantOrderId);
            order.setOrderStatus(Order.OrderStatus.PROCESSING);
            order.setPaymentStatus(Order.PaymentStatus.PENDING);
            order.setTotalInstallments(requestData.getTotalInstallments());
            order.setInstallmentAmount(requestData.getInstallmentAmount());
            order.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            order.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            // 3. Create installments BEFORE saving the order
            List<Installments> installmentsList = new ArrayList<>();

            for (int i = 1; i <= requestData.getTotalInstallments(); i++) {

                Installments inst = new Installments();
                inst.setInstallmentAmount(requestData.getInstallmentAmount());
                inst.setInstallmentNumber(i);
                inst.setUnlocked(i == 1);
                inst.setUnlockedAt(LocalDateTime.now());
                inst.setDueDate(LocalDateTime.now().plusMonths(i-1));
                inst.setInstallmentStatus(Installments.InstallmentStatus.PENDING);
                inst.setCreatedAt(LocalDateTime.now());
                inst.setUpdatedAt(LocalDateTime.now());
                inst.setOrder(order);

                installmentsList.add(inst);
            }

            order.setInstallmentsList(installmentsList);

            // 4. Attach order items
            List<OrderItem> orderItems = new ArrayList<>();
            for(CartItem item: requestData.getCartList()){
                OrderItem orderItem= new OrderItem();
                orderItem.setDesign(item.getDesign());
                orderItem.setPackageName(item.getPackageName());
                orderItem.setTotalAmount(item.getTotalAmount());
                orderItem.setOrder(order);
                orderItem.setCreatedAt(new Timestamp(System.currentTimeMillis()));
                orderItem.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                orderItems.add(orderItem);
            }
            order.setOrdertemList(orderItems);

            // 5. SAVE ONLY ONCE
            Order savedOrder = orderService.createOrder(order);

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedOrder.getId());  // Your internal DB order ID
            response.put("merchantOrderId", merchantOrderId);     // Order ID for PhonePe
            response.put("amount", amountInPaisa);
            response.put("userId", user.getId());
            response.put("customerName", user.getFullName());
            response.put("customerEmail", user.getEmail());
            response.put("customerPhone", user.getPhone());
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
        ObjectMapper mapper= new ObjectMapper();

        try {
            Long Id = Long.parseLong(paymentData.get("orderId").toString());
            String merchantOrderId = (String) paymentData.get("merchantOrderId");
            String phonePeOrderId = (String) paymentData.get("phonePeOrderId");
            String paymentState = (String) paymentData.get("paymentState");
            Long amount = ((Number) paymentData.get("amount")).longValue();

            List<PaymentDetailDTO> paymentDetailList =
                    mapper.convertValue(paymentData.get("paymentDetails"),
                            new TypeReference<List<PaymentDetailDTO>>() {});

            // 1. Check if order exists
            Order order = orderService.getOrderById(Id);

            // 2. Verify amount matches
            BigDecimal savedAmount;
            if(order.getTotalInstallments()>1){
                savedAmount= order.getInstallmentAmount();
            }else {
                savedAmount= order.getTotalAmount();
            }
            BigDecimal amountInPaisa= savedAmount.multiply(new BigDecimal(100));
            System.out.println("saved Amount: "+ savedAmount+ ","+ "amount: "+ amountInPaisa);
            if (amountInPaisa.compareTo(new BigDecimal(amount))!=0) {
                 throw new RuntimeException("Amount mismatch");
            }else{
                order.setPaidAmount(savedAmount);
            }

            // 3. Update order with payment details
            if(paymentState.equalsIgnoreCase("COMPLETED")) {
                order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
            }
            order.setOrderStatus(Order.OrderStatus.COMPLETED);

            PaymentDetailDTO details= paymentDetailList.get(0);

            PaymentDetails pd= new PaymentDetails();
            pd.setOrderId(Id);
            pd.setPhonePeOrderId(phonePeOrderId);
            pd.setAmount(details.getAmount().divide(new BigDecimal(100)));
            pd.setPaymentMode(details.getPaymentMode());
            pd.setState(details.getState());
            pd.setTransactionId(details.getTransactionId());
            pd.setFeeAmount(details.getFeeAmount());
            pd.setPayableAmount(details.getPayableAmount().divide(new BigDecimal(100)));
            pd.setCreatedAt(details.getTimestamp());

            // update installment
            List<Installments> installmentsList= order.getInstallmentsList();

            for(Installments installments: installmentsList){
                if(installments.isUnlocked()){
                    installments.setInstallmentStatus(Installments.InstallmentStatus.PAID);
                    installments.setPaidDate(LocalDateTime.now());
                    continue;
                }

                if(!installments.isUnlocked() && installments.getInstallmentStatus()== Installments.InstallmentStatus.PENDING){
                    installments.setUnlocked(true);
                    break;
                }
            }

            paymentDetailsService.createPayment(pd);

            orderService.updateOrder(order);

            // 4. Send confirmation email/notification
            //emailService.sendOrderConfirmation(order);*/

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully! Your order has been placed.");
            response.put("orderId", Id);
            response.put("phonePeOrderId", phonePeOrderId);

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
        ObjectMapper mapper= new ObjectMapper();

        try {
            Long Id = Long.parseLong(paymentData.get("orderId").toString());
            String merchantOrderId = (String) paymentData.get("merchantOrderId");
            String phonePeOrderId = (String) paymentData.get("phonePeOrderId");
            String paymentState = (String) paymentData.get("paymentState");
            Long amount = ((Number) paymentData.get("amount")).longValue();

            List<PaymentDetailDTO> paymentDetailList =
                    mapper.convertValue(paymentData.get("paymentDetails"),
                            new TypeReference<List<PaymentDetailDTO>>() {});

            // 1. Check if order exists
            Order order = orderService.getOrderById(Id);

            // 2. Verify amount matches
            BigDecimal savedInstallmentAmount= order.getInstallmentAmount();

            BigDecimal amountInRupees= new BigDecimal(amount).divide(new BigDecimal(100));
            if (savedInstallmentAmount.compareTo(amountInRupees)!=0) {
                throw new RuntimeException("Amount mismatch");
            }else{
                // update paid amount
                BigDecimal paidAmount= order.getPaidAmount();
                paidAmount= paidAmount.add(amountInRupees);
                order.setPaidAmount(paidAmount);
            }

            // 3. Update order with payment details
            if(order.getPaidAmount().compareTo(order.getTotalAmount()) == 0) {
                order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
            }
            order.setOrderStatus(Order.OrderStatus.COMPLETED);

            PaymentDetailDTO details= paymentDetailList.get(0);

            PaymentDetails pd= new PaymentDetails();
            pd.setOrderId(Id);
            pd.setPhonePeOrderId(phonePeOrderId);
            pd.setAmount(details.getAmount().divide(new BigDecimal(100)));
            pd.setPaymentMode(details.getPaymentMode());
            pd.setState(details.getState());
            pd.setTransactionId(details.getTransactionId());
            pd.setFeeAmount(details.getFeeAmount());
            pd.setPayableAmount(details.getPayableAmount().divide(new BigDecimal(100)));
            pd.setCreatedAt(details.getTimestamp());

            // update installment
            List<Installments> installmentsList= order.getInstallmentsList();
            installmentsList.sort(
                    Comparator.comparingInt(Installments::getInstallmentNumber)
            );


            for(Installments installments: installmentsList){
                if(installments.isUnlocked() && installments.getInstallmentStatus() != Installments.InstallmentStatus.PAID){
                    installments.setInstallmentStatus(Installments.InstallmentStatus.PAID);
                    installments.setPaidDate(LocalDateTime.now());
                    installments.setUpdatedAt(LocalDateTime.now());
                    continue;
                }

                if(!installments.isUnlocked() && installments.getInstallmentStatus()== Installments.InstallmentStatus.PENDING){
                    installments.setUnlocked(true);
                    installments.setUnlockedAt(LocalDateTime.now());
                    installments.setUpdatedAt(LocalDateTime.now());
                    break;
                }
            }

            paymentDetailsService.createPayment(pd);

            orderService.updateOrder(order);

            // 4. Send confirmation email/notification
            //emailService.sendOrderConfirmation(order);*/

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully!");
            response.put("orderId", Id);
            response.put("phonePeOrderId", phonePeOrderId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Payment verification failed", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "error", "Payment verification failed: " + e.getMessage())
            );
        }
    }
}
