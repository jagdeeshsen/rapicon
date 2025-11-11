package com.example.rapicon.Controller;

import com.example.rapicon.DTO.OrderHistoryDTO;
import com.example.rapicon.DTO.OrderRequestDTO;
import com.example.rapicon.DTO.PaymentVerificationDTO;
import com.example.rapicon.Models.*;
import com.example.rapicon.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

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
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO requestData) {
        try {
            // create razorpay order
            com.razorpay.Order razorpayOrder = razorpayService.createRazorpayOrder(requestData.getTotalAmount());

            // save order in db
            Optional<User> user= userService.findById(requestData.getUserId());

            Order userOrder= new Order();
            userOrder.setUser(user.get());
            userOrder.setOrderNumber(UUID.randomUUID().toString());
            userOrder.setTotalAmount(requestData.getTotalAmount());
            userOrder.setRazorpayOrderId(razorpayOrder.get("id"));
            userOrder.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            userOrder.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            orderService.createOrder(userOrder);

            // save order item
            for(Design design: requestData.getDesignList()){
                OrderItem orderItem= new OrderItem();
                orderItem.setDesign(design);
                orderItem.setOrder(userOrder);
                orderItem.setPriceAtPurchase(new BigDecimal(2500));
                orderItem.setCreatedAt(new Timestamp(System.currentTimeMillis()));
                orderItemService.createOrderItem(orderItem);
            }

            // Step 4: Send Razorpay details to frontend
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", userOrder.getId());
            response.put("razorpayOrderId", razorpayOrder.get("id"));
            response.put("amount", razorpayOrder.get("amount"));
            response.put("currency", razorpayOrder.get("currency"));
            response.put("key", razorpayService.getKeyId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
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
            payment.setAmount(order.getTotalAmount());
            payment.setCreatedAt(new Timestamp(System.currentTimeMillis()));

            // save payment in db
            paymentService.createPayment(payment);

            if (isValid) {
                order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
                order.setOrderStatus(Order.OrderStatus.COMPLETED);
                payment.setPaymentStatus(Order.PaymentStatus.COMPLETED);
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
}
