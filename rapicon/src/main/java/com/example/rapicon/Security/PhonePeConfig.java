package com.example.rapicon.Security;

import com.phonepe.sdk.pg.Env;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import lombok.Data;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class PhonePeConfig {

    @Value("${phonepe.client-id}")
    private String clientId;

    @Value("${phonepe.client-secret}")
    private String clientSecret;

    @Value("${phonepe.client-version}")
    private String clientVersion;


    @Value("${phonepe.environment}")
    private String environment;

    @Value("${phonepe.api.sandbox.url}")
    private String sandboxUrl;

    @Value("${phonepe.api.prod.url}")
    private String prodUrl;

    @Value("${phonepe.merchant.id}")
    private String merchantId;

    @Value("${phonepe.redirect.url}")
    private String redirectUrl;

    @Value("${phonepe.salt.key}")
    private String saltKey;

    @Value("${phonepe.salt.index}")
    private String saltIndex;


    public String getApiUrl() {
        return "SANDBOX".equalsIgnoreCase(environment) ? sandboxUrl : prodUrl;
    }

}
