package com.example.rapicon.Controller;

import com.example.rapicon.Enum.Status;
import com.example.rapicon.Models.*;
import com.example.rapicon.Service.DesignService;
import com.example.rapicon.Service.OrderService;
import com.example.rapicon.Service.UserService;
import com.example.rapicon.Service.VendorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final DesignService designService;
    private final UserService userService;
    private final OrderService orderService;
    private final VendorService vendorService;


    // -------------------------- Design Endpoints--------------------------------//

    @GetMapping("/pending")
    public ResponseEntity<List<Design>> getPendingDesigns(){
        List<Design> pendingDgn=designService.findDesignsByStatus(Status.PENDING);
        return ResponseEntity.ok(pendingDgn);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Design>> getApprovedDesigns(){
        List<Design> pendingDgn=designService.findDesignsByStatus(Status.APPROVED);
        return ResponseEntity.ok(pendingDgn);
    }

    @GetMapping("/rejected")
    public ResponseEntity<List<Design>> getRejectedDesigns(){
        List<Design> pendingDgn=designService.findDesignsByStatus(Status.REJECTED);
        return ResponseEntity.ok(pendingDgn);
    }

    @DeleteMapping("/delete")
    public String deleteDesignByAdmin(@RequestParam("id") Long id){
        designService.deleteDesign(id);
        return "Design deleted Successfully";
    }

    @GetMapping("/designs/get/all")
    public ResponseEntity<List<Design>> getAllDesigns(){
        List<Design> designs= designService.getAllDesigns();
        if(designs.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(designs);
    }

    @GetMapping("/fetch/{id}")
    public ResponseEntity<Design> getDesignById(@PathVariable Long id){
        try{
            Design design= designService.getDesignById(id);
            if(design == null){
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.status(HttpStatus.OK).body(design);
        }catch (RuntimeException e){
            log.error("Failed to fetch design by id",e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    //----------------------------- User Endpoints --------------------------------//

    @GetMapping("/users/get/all")
    public ResponseEntity<List<User>> getAllUser(){
        List<User> users= userService.getAllUser();
        if(users.isEmpty()){
            return ResponseEntity.noContent().build();
        }else {
            return ResponseEntity.ok(users);
        }
    }


    //----------------------------- Vendor Endpoints --------------------------------//

    @GetMapping("/vendors/get/all")
    public ResponseEntity<List<Vendor>> getAllVendors(){
        List<Vendor> vendors= vendorService.getAllVendors();
        if(vendors.isEmpty()){
            return ResponseEntity.noContent().build();
        }else {
            return ResponseEntity.ok(vendors);
        }
    }

    //----------------------- Order Endpoints -----------------------------------//
    @GetMapping("/orders/get/all")
    public ResponseEntity<List<Order>> getAllOrders(){
        List<Order> orders= orderService.getAllOrders();
        if(orders.isEmpty()){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.ok(orders);
        }
    }
}
