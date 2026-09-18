package com.example.rapicon.Controller;

import com.example.rapicon.DTO.AIGeneratedDesignRequest;
import com.example.rapicon.Service.AIGeneratedDesignService;
import com.example.rapicon.Service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIGeneratedDesignController {

    private final AIGeneratedDesignService aiDesignService;
    private final S3Service s3Service;

    @PostMapping(value = "/design", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAIDesigns(@Valid @ModelAttribute AIGeneratedDesignRequest request){
        try{
            aiDesignService.uploadDesign(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "AI generated design uploaded successfully!"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
