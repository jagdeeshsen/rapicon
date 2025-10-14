package com.example.rapicon.Repository;

import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
}
