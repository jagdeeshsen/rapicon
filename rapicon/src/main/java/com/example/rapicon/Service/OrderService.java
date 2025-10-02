package com.example.rapicon.Service;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.User;
import com.example.rapicon.Repository.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepo orderRepo;

    public Order createOrder(Order order){
        return orderRepo.save(order);
    }

    public Optional getOrderById(Long id){
        return orderRepo.findById(id);
    }

    /*public Order getOrderByUser(Optional<User> user){
        return orderRepo.findByUser(user);
    }*/
}
