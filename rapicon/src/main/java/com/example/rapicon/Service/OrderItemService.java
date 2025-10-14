package com.example.rapicon.Service;

import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.OrderItem;
import com.example.rapicon.Repository.OrderItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderItemService {

    @Autowired
    private OrderItemRepo orderItemRepo;

    public void createOrderItem(OrderItem orderItem){
        orderItemRepo.save(orderItem);
    }

    public List<OrderItem> getOrderItemByOrder(Order order){
        return orderItemRepo.findByOrder(order);
    }
}
