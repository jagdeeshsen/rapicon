package com.example.rapicon.Controller;

import com.example.rapicon.Enum.Status;
import com.example.rapicon.Models.*;
import com.example.rapicon.Service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final DesignService designService;



    // -------------------------- Design Endpoints--------------------------------//

    @GetMapping("/designs/approved")
    public ResponseEntity<Page<Design>> getApprovedDesigns(@RequestParam Status status,
                                                           @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)Pageable pageable){
        return ResponseEntity.ok(designService.findDesignsByStatus(status, pageable));
    }

    @DeleteMapping("/delete")
    public String deleteDesignByAdmin(@RequestParam("id") Long id){
        designService.deleteDesign(id);
        return "Design deleted Successfully";
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


}
