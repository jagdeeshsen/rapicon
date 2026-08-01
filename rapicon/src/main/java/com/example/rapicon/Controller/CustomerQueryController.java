package com.example.rapicon.Controller;

import com.example.rapicon.DTO.CustomerQueryRequest;
import com.example.rapicon.Models.CustomerQuery;
import com.example.rapicon.Service.CustomerQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/customer")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CustomerQueryController {

    private final CustomerQueryService queryService;

    @PostMapping("/query")
    public ResponseEntity<Map<String,String>> createQuery(@RequestBody @Valid CustomerQueryRequest request){
        Map<String, String> response= new HashMap<>();
        try{
            String message= queryService.createQuery(request);
            response.put("message", message);
            return ResponseEntity.ok(response);
        }catch (Exception e) {
            log.error("Failed to create query",e);
            response.put("message", "Failed to create query. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/queries")
    public ResponseEntity<Page<CustomerQuery>> findAll(@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)Pageable pageable){
        return ResponseEntity.ok(queryService.getAllQuery(pageable));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/query/{id}/status")
    public ResponseEntity<CustomerQuery> updateStatus(@PathVariable Long id,
                                                      @RequestParam CustomerQuery.QueryStatus status){
        return ResponseEntity.ok(queryService.updateQueryStatus(id, status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/query/{id}")
    public ResponseEntity<String> deleteQuery(@PathVariable Long id){
        return ResponseEntity.ok(queryService.deleteQuery(id));
    }

    @GetMapping("/queries/count/new")
    public ResponseEntity<?> newCount(){
        return ResponseEntity.ok(queryService.newCount());
    }
}
