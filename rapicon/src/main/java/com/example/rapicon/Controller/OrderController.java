package com.example.rapicon.Controller;

import com.example.rapicon.DTO.OrderHistoryDTO;
import com.example.rapicon.DTO.OrderRequestDTO;
import com.example.rapicon.DTO.PaymentVerificationDTO;
import com.example.rapicon.Models.*;
import com.example.rapicon.Repository.CartItemRepo;
import com.example.rapicon.Service.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private OrderItemService orderItemService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private DesignService designService;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO requestData) {

        try {
            BigDecimal amount;
            if(requestData.getTotalInstallments()>1){
                amount= requestData.getInstallmentAmount();
            }else {
                amount= requestData.getTotalAmount();
            }
            // 1. Razorpay
            com.razorpay.Order razorpayOrder = razorpayService.createRazorpayOrder(amount);

            // 2. Build order
            User user = userService.findById(requestData.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Order order = new Order();
            order.setUser(user);
            order.setOrderNumber(UUID.randomUUID().toString());
            order.setTotalAmount(requestData.getTotalAmount());
            order.setRazorpayOrderId(razorpayOrder.get("id"));
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
                orderItem.setTotalInstallments(item.getTotalInstallments());
                orderItem.setOrder(order);
                orderItem.setCreatedAt(new Timestamp(System.currentTimeMillis()));
                orderItem.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                orderItems.add(orderItem);
            }
            order.setOrdertemList(orderItems);

            // 5. SAVE ONLY ONCE
            orderService.createOrder(order);   // <--- ONLY THIS SAVE

            // 6. Response
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getId());
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("amount", razorpayOrder.get("amount"));
            response.put("currency", razorpayOrder.get("currency"));
            response.put("key", razorpayService.getKeyId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationDTO req) {
        try {
            String data = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
            boolean isValid = razorpayService.verifySignature(data, req.getRazorpaySignature());

            System.out.println("Data for signature: '" + data + "'");
            System.out.println("Received signature: '" + req.getRazorpaySignature() + "'");

            Optional<Order> optionalOrder = orderService.findByRazorpayOrderId(req.getRazorpayOrderId());

            if (optionalOrder.isEmpty()){
                return ResponseEntity.badRequest().body("Verification failed: Order not found");
            }

            Order order=optionalOrder.get();
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setRazorpayOrderId(req.getRazorpayOrderId());
            payment.setRazorpayPaymentId(req.getRazorpayPaymentId());
            payment.setRazorpaySignature(req.getRazorpaySignature());

            BigDecimal paidAmount;
            if(order.getTotalInstallments()>1){
                paidAmount= order.getInstallmentAmount();
            }else{
                paidAmount= order.getTotalAmount();
            }
            payment.setAmount(paidAmount);
            payment.setCreatedAt(new Timestamp(System.currentTimeMillis()));

            // save payment in db
            paymentService.createPayment(payment);

            if (isValid) {
                order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
                order.setOrderStatus(Order.OrderStatus.COMPLETED);
                payment.setPaymentStatus(Order.PaymentStatus.COMPLETED);
                order.setPaidAmount(paidAmount);

                // set installment status
                Installments installments=order.getInstallmentsList().get(0);
                installments.setPaidDate(LocalDateTime.now());
                installments.setInstallmentStatus(Installments.InstallmentStatus.PAID);
                orderService.updateOrder(order);
                paymentService.updatePayment(payment);

                return ResponseEntity.ok("Payment verified successfully");
            } else {
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                orderService.updateOrder(order);
                return ResponseEntity.badRequest().body("Invalid payment signature");
            }

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Verification failed: " + e.getMessage());
        }
    }

    @GetMapping("/fetch-order")
    public ResponseEntity<?> getAllOrders(){
        try{
            List<Order> order= orderService.getAllOrders();
            return ResponseEntity.ok(order);
        }catch (Exception e){
            throw  new RuntimeException("Error to send orderItemsHistory");
        }
    }

    @GetMapping("/fetch-user-order/{userId}")
    public ResponseEntity<List<Order>> getOrderById(@PathVariable Long userId){
        Optional<User> user= userService.findById(userId);
        List<Order> orderList= orderService.getOrderByUser(user.get());
        return ResponseEntity.ok(orderList);
    }
}
