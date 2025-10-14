package com.example.rapicon.Service;

import com.example.rapicon.Models.*;
import com.example.rapicon.Repository.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private UserService userService;

    @Autowired
    private DesignService designService;

    @Autowired
    private OrderItemService orderItemService;

    public void createOrder(Order order){
        orderRepo.save(order);
    }

    public Order getOrderById(Long id){
        Optional<Order> order= orderRepo.findById(id);
        return  order.get();
    }

    public List<Order> getAllOrders(){
        return orderRepo.findAll();
    }

    public List<Order> getOrderByUser(User user){
        return orderRepo.findByUser(user);
    }

    public Optional<Order> findByRazorpayOrderId(String orderId){
        return orderRepo.findByRazorpayOrderId(orderId);
    }

    public Order updateOrder(Order order){
        return orderRepo.save(order);
    }

}
