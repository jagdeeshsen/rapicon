package com.example.rapicon.Repository;

import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order,Long> {
    Optional<Order> findById(Long id);

    List<Order> findByUser(User user);

    // ✅ Find order by Razorpay Order ID
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
}
