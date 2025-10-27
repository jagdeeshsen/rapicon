package com.example.rapicon.Controller;

import com.example.rapicon.Models.CustomerQuery;
import com.example.rapicon.Service.CustomerQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer-query")
@CrossOrigin(origins = "*")
public class CustomerQueryController {

    @Autowired
    private CustomerQueryService customerQueryService;

    @PostMapping("/create-query")
    public ResponseEntity<Map<String,String>> createQuery(@RequestBody Map<String, String> request){
        Map<String, String> response= new HashMap<>();
        try{
            CustomerQuery query= new CustomerQuery();
            query.setFullName(request.get("fullName"));
            query.setPhone(request.get("phone"));
            query.setEmail(request.get("email"));
            query.setQuery(request.get("query"));
            query.setQueryStatus(CustomerQuery.QueryStatus.NEW);
            query.setCreatedAt(new Date(System.currentTimeMillis()));

            String message= customerQueryService.createQuery(query);
            response.put("message", message);
            return ResponseEntity.ok(response);
        }catch (Exception e) {
            e.printStackTrace();
            response.put("message", "Failed to create query. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/fetch-query")
    public ResponseEntity<List<CustomerQuery>> getAllQuery(){
        List<CustomerQuery> queries= customerQueryService.getAllQuery();
        return ResponseEntity.ok(queries);
    }

    @DeleteMapping("/delete-query")
    public ResponseEntity<?> deleteQueryByStatus(@RequestParam String status){
        customerQueryService.deleteQueryByStatus(status);
        return ResponseEntity.ok("Query deleted successfully");
    }
}
