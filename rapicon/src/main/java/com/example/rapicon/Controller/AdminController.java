package com.example.rapicon.Controller;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Service.DesignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private DesignService service;

    @GetMapping("/pending")
    public ResponseEntity<List<Design>> getPendingDesigns(){
        List<Design> pendingDgn=service.findDesignsByStatus(Status.PENDING);
        return ResponseEntity.ok(pendingDgn);
    }

    @GetMapping("/approved")
    public ResponseEntity<List<Design>> getApprovedDesigns(){
        List<Design> pendingDgn=service.findDesignsByStatus(Status.APPROVED);
        return ResponseEntity.ok(pendingDgn);
    }

    @GetMapping("/rejected")
    public ResponseEntity<List<Design>> getRejectedDesigns(){
        List<Design> pendingDgn=service.findDesignsByStatus(Status.REJECTED);
        return ResponseEntity.ok(pendingDgn);
    }

    @DeleteMapping("/delete")
    public String deleteDesignByAdmin(@RequestParam("id") Long id){
        service.deleteDesign(id);
        return "Design deleted Successfully";
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Design> updateDesignStatus(@RequestParam("id") Long id,
                                                     @RequestParam("status") String status){

        // Validate status
        if (!status.equalsIgnoreCase("approved")
                && !status.equalsIgnoreCase("pending")
                && !status.equalsIgnoreCase("rejected")) {
            return ResponseEntity.badRequest().build();
        }

        try{
            Design updateDesign= service.updateDesignStatus(id, Status.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(updateDesign);
        }catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Design>> getDesignsByAdmin(){

        List<Design> designs= service.getAllDesigns();
        if(designs.isEmpty()){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(designs);
    }
}
