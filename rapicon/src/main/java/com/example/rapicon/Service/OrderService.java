package com.example.rapicon.Service;

import com.example.rapicon.DTO.OrderRequestDTO;
import com.example.rapicon.Models.*;
import com.example.rapicon.Repository.OrderRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepo orderRepo;
    private final UserService userService;
    private final TransactionNotificationService transactionNotificationService;

    public Order createOrder(OrderRequestDTO requestData){
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

        return orderRepo.save(order);
    }

    public Order getOrderById(Long id){
        Optional<Order> order= orderRepo.findById(id);
        return  order.get();
    }

    public List<Order> getAllOrders(){
        return orderRepo.findAll();
    }

    public List<Order> getOrderByUser(Long userId){
        return orderRepo.findByUserId(userId);
    }

    public Order updateOrder(Order order){
        return orderRepo.save(order);
    }

    public void deleteByUser(Long userId){
        orderRepo.deleteByUserId(userId);
    }

}
