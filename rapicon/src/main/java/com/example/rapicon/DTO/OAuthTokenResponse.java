package com.example.rapicon.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OAuthTokenResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expires_at")
    private Long expiresAt;

    @JsonProperty("issued_at")
    private Long issuedAt;

    @JsonProperty("token_type")
    private String tokenType;
}
