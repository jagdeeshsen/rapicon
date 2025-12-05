package com.example.rapicon.Service;

import com.example.rapicon.DTO.*;
import com.example.rapicon.Security.PhonePeConfig;
import com.phonepe.sdk.pg.common.models.response.OrderStatusResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class PhonePeService {

    @Autowired
    private PhonePeConfig config;

    @Autowired
    private OrderService orderService;

    @Autowired
    private OAuthService oAuthService;

    private final RestTemplate restTemplate = new RestTemplate();

    public PaymentResponse createPayment(PaymentRequest request) {
        try {
            // Get access token
            String token = oAuthService.getAccessToken();

            // Build Request Body
            Map<String, Object> payload = new HashMap<>();
            payload.put("merchantOrderId", request.getMerchantOrderId());
            payload.put("amount", request.getAmount()); // paise value

            if (request.getExpireAfter() != null)
                payload.put("expireAfter", request.getExpireAfter());

            // ----------- paymentFlow block ---------------
            Map<String, Object> paymentFlow = new HashMap<>();
            paymentFlow.put("type", "PG_CHECKOUT");

            Map<String, Object> merchantUrls = new HashMap<>();
            merchantUrls.put("redirectUrl", config.getRedirectUrl());

            paymentFlow.put("merchantUrls", merchantUrls);
            payload.put("paymentFlow", paymentFlow);

            // ----------- metaInfo block (if provided) ----
            if (request.getMetaInfo() != null) {
                payload.put("metaInfo", request.getMetaInfo());
            }

            // ----------- headers --------------------------
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // VERY IMPORTANT
            headers.set("Authorization", "O-Bearer " + token);
            headers.set("Accept", "application/json");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            String apiUrl =  "https://api.phonepe.com/apis/pg/checkout/v2/pay";       //"https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay";

            ResponseEntity<Map> resp = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            if (resp.getBody() == null) {
                throw new RuntimeException("Empty response from PhonePe");
            }

            Map<String, Object> body = resp.getBody();

            PaymentResponse result = new PaymentResponse();
            result.setOrderId((String) body.get("orderId"));
            result.setState((String) body.get("state"));
            result.setExpireAt((Long) body.get("expireAt"));
            result.setRedirectUrl((String) body.get("redirectUrl"));

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Payment creation failed: " + e.getMessage(), e);
        }
    }

    public OrderStatusResponse checkOrderStatus(String merchantOrderId) {
        try {
            String token = oAuthService.getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "O-Bearer " + token);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String apiUrl = config.getApiUrl()
                    + "/checkout/v2/order/"
                    + merchantOrderId
                    + "/status";

            ResponseEntity<OrderStatusResponse> response =
                    restTemplate.exchange(apiUrl, HttpMethod.GET, entity, OrderStatusResponse.class);
            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Status API Failed: " + e.getMessage());
        }
    }

}
