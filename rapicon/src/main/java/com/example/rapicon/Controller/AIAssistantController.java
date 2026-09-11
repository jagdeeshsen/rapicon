package com.example.rapicon.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/chat")
public class AIAssistantController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${fast-api.chatbot.url}") // e.g. http://localhost:8000 or internal service URL
    private String fastApiUrl;

    @PostMapping(value = "/chatbot", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> proxyChat(
            @RequestParam(value = "session_id", required = false) String sessionId,
            @RequestParam(value = "message", defaultValue = "") String message,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        if (sessionId != null) {
            body.add("session_id", sessionId);
        }
        body.add("message", message); // FastAPI expects this field even if empty

        if (file != null && !file.isEmpty()) {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                fastApiUrl + "/chat",   // ✅ matches @app.post("/chat") exactly, no trailing slash
                requestEntity,
                String.class
        );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(response.getBody());
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<String> getSession(@PathVariable String sessionId) {
        String url = fastApiUrl + "/session/" + sessionId; // ✅ matches @app.get("/session/{session_id}")

        try {
            ResponseEntity<String> response =
                    restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.notFound().build();
        }
    }
}
