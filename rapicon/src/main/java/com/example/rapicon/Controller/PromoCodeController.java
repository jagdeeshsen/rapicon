package com.example.rapicon.Controller;

import com.example.rapicon.DTO.PromoCodeRequest;
import com.example.rapicon.Service.PromoCodeService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/promo")
@AllArgsConstructor
public class PromoCodeController {

    private final PromoCodeService promoCodeService;



    @PostMapping("/code")
    public ResponseEntity<?> createPromoCode(PromoCodeRequest request){
        try{
            String response = promoCodeService.createPromoCode(request);
            return ResponseEntity.ok(response);
        }catch (RuntimeException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create promo code."));
        }
    }

    @PostMapping("/redeem/{id}")
    public ResponseEntity<?> redeemCode(@PathVariable Long id, @RequestParam("code") String code){
        try{
            promoCodeService.redeem(id, code);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(Map.of("message", "Promo code redeem successfully"));
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}
