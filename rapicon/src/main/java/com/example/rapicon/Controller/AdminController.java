package com.example.rapicon.Controller;

import com.example.rapicon.Enum.Status;
import com.example.rapicon.Models.*;
import com.example.rapicon.Service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/admin", "/api/v1/admin"})
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final DesignService designService;
    private final UserService userService;
    private final OrderService orderService;
    private final VendorService vendorService;

    private final AdminService adminService;



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

    @GetMapping("designs")
    public ResponseEntity<Page<Design>> findAllDesigns(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size){
        return ResponseEntity.ok(designService.findAllPagination(page, size));
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

    @PutMapping("/update-status")
    public ResponseEntity<?> updateDesignStatus(@RequestParam("id") Long id,
                                                @RequestParam("status") String status) {

        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "status is required", "success", false));
        }

        Status newStatus;
        try {
            newStatus = Status.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "invalid status value: " + status, "success", false));
        }

        try {
            Design updated = designService.updateDesignStatus(id, newStatus);
            return ResponseEntity.ok(Map.of(
                    "design", updated,
                    "message", "design status updated to " + updated.getStatus(),
                    "status", updated.getStatus().name(),
                    "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "design not found", "success", false));
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

    @GetMapping("/users")
    public ResponseEntity<Page<User>> findAllUsers(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size){
        return ResponseEntity.ok(userService.findAllPagination(page, size));
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

    @GetMapping("/vendors")
    public ResponseEntity<Page<Vendor>> findAllVendors(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size){
        return ResponseEntity.ok(vendorService.findAllPagination(page, size));
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

    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> findAllOrders(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size){
        return ResponseEntity.ok( orderService.findAllPagination(page, size));
    }
}
