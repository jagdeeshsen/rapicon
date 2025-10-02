package com.example.rapicon.Repository;

import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface OrderRepo extends JpaRepository<Order,Long> {
    Optional findById(Long id);
    //Page<Order> findByUser(Optional<User> user, Pageable pageable);
    //Order findByUser(User user);
}
