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

   /* @PostMapping("/purchase")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Order> createOrders(@RequestParam("id") Long id,

                                              @AuthenticationPrincipal UserDetailsImpl userDetails){

        try {
            Optional<User> user= userService.findById(userDetails.getId());
            System.out.println(userDetails.getId());
            Design design= designService.getDesignById(id);

            System.out.println(userDetails.getId());
            System.out.println(id);

            if(design.getStatus()!= Status.APPROVED){
                throw  new RuntimeException("Design is not approved for purchase");
            }
            return orderService.createOrder(user.orElse(null),design);
        }catch (RuntimeException e){
            throw new RuntimeException("Error creating order"+ e.getMessage());
        }
    }*/

    /*@GetMapping("/my_orders")
    @PreAuthorize("hasROle('USER')")
    public Order getMyOrders(UserDetailsImpl userDetails){
        User user= userService.findById(userDetails.getId());
        return orderService.getOrderByUser(user);
    }*/

    /*@GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<Order>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        User user = userService.findById(userPrincipal.getId());
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderService.getOrdersByUser(user, pageable);

        return ResponseEntity.ok(orders);
    }*/
}
