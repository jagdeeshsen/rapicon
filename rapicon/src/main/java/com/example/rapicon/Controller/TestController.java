package com.example.rapicon.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @PostMapping("/upload")
    //@ResponseBody
    public Map<String, Object> testUpload( String title) {
        System.out.println("=== TEST CONTROLLER HIT ===");
        System.out.println("Title received: " + title);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Test successful");
        response.put("title", title);
        response.put("timestamp", System.currentTimeMillis());

        return response;
    }

    @GetMapping("/simple")
    public Map<String, Object> simpleTest() {
        System.out.println("=== SIMPLE GET TEST ===");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Simple test works");

        return response;
    }
}
