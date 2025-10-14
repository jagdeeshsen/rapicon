package com.example.rapicon.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.Base64;

@Service
public class RazorpayService {

    @Value("${razorpay.key_id}")
    private  String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    public Order createRazorpayOrder(BigDecimal amount) throws RazorpayException {

        RazorpayClient razorpayClient= new RazorpayClient(keyId,keySecret);
        int amountInPaise= amount.multiply(new BigDecimal(100)).intValueExact();

        JSONObject orderRequest= new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("payment_capture",1);  // auto capture

        return razorpayClient.orders.create(orderRequest);
    }

    /*public String generateSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }*/

    public boolean verifySignature(String data, String razorpaySignature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(keySecret.getBytes("UTF-8"), "HmacSHA256");
            mac.init(secretKey);

            byte[] hash = mac.doFinal(data.getBytes("UTF-8"));

            // Convert to hex string
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b)); // lowercase hex
            }
            String generatedSignature = sb.toString();

            return generatedSignature.equals(razorpaySignature);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }



    public String getKeyId() {
        return keyId;
    }
}
