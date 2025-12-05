package com.example.rapicon.Service;

import com.example.rapicon.DTO.OAuthTokenResponse;
import com.example.rapicon.Security.PhonePeConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Service
@Slf4j
public class OAuthService {

    @Autowired
    private PhonePeConfig config;

    private final RestTemplate restTemplate = new RestTemplate();

    private String cachedToken;
    private Instant tokenExpiry;

    /**
     * Generate or return cached token
     */
    public String getAccessToken() {

        // 1. Use cached token if valid
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            log.debug("Using cached access token");
            return cachedToken;
        }

        log.info("Fetching new OAuth access token...");

        try {
            // 2. Form data for token request
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "client_credentials");
            formData.add("client_id", config.getClientId());
            formData.add("client_secret", config.getClientSecret());
            formData.add("client_version", String.valueOf(config.getClientVersion()));

            // 3. Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(formData, headers);

            // 4. URL selection
            String url = "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"; //https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";
                    /*config.isProduction()
                    ? "https://api.phonepe.com/apis/identity-manager/v1/oauth/token"
                    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";*/

            log.debug("OAuth URL: {}", url);

            // 5. Make the API request
            ResponseEntity<OAuthTokenResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    OAuthTokenResponse.class
            );

            OAuthTokenResponse tokenResponse = response.getBody();

            // 6. Validate token
            if (tokenResponse != null && tokenResponse.getAccessToken() != null) {

                cachedToken = tokenResponse.getAccessToken();

                long expiresAt = tokenResponse.getExpiresAt();  // epoch seconds

                long currentEpoch = Instant.now().getEpochSecond();
                long validFor = expiresAt - currentEpoch;

                if (validFor < 120) { // must be > 2 minutes
                    throw new RuntimeException("Token validity is too low!");
                }

                // set token expiry (minus some buffer time)
                tokenExpiry = Instant.now().plusSeconds(validFor - 60);

                log.info("OAuth token fetched. Valid for {} seconds", validFor);

                return cachedToken;
            }

            throw new RuntimeException("Failed to obtain access token");

        } catch (Exception e) {
            log.error("Error obtaining OAuth token: ", e);
            throw new RuntimeException("OAuth authentication failed: " + e.getMessage());
        }
    }

    /** Clear cached token */
    public void clearToken() {
        cachedToken = null;
        tokenExpiry = null;
        log.info("OAuth token cleared");
    }
}
