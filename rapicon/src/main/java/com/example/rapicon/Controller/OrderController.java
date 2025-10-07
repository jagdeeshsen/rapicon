package com.example.rapicon.Controller;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Models.User;
import com.example.rapicon.Security.UserDetailsImpl;
import com.example.rapicon.Service.DesignService;
import com.example.rapicon.Service.OrderService;
import com.example.rapicon.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private DesignService designService;

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        try {
            Order savedOrder = orderService.createOrder(order);
            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
