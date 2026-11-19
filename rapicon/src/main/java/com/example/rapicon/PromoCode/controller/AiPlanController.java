package com.example.rapicon.PromoCode.controller;

import com.example.rapicon.PromoCode.dto.AiPlanRequest;
import com.example.rapicon.PromoCode.entity.AiPlans;
import com.example.rapicon.PromoCode.service.AiPlanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiPlanController {

    private final AiPlanService aiPlanService;

    @PostMapping("/plan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAIPlan(@RequestBody @Valid AiPlanRequest request){
        String response = aiPlanService.createAIPlan(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/plans")
    public ResponseEntity<List<AiPlans>> getAllAIPlans(){
        List<AiPlans> response = aiPlanService.getAllPlans();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/plan/delete/{planId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAiPlans(@PathVariable Long planId){
        String response = aiPlanService.deleteAIPlans(planId);
        return ResponseEntity.ok(response);
    }
}
