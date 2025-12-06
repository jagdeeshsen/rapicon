package com.example.rapicon.Service;

import com.example.rapicon.Models.*;
import com.example.rapicon.Repository.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    public Order createOrder(Order order){
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

}
