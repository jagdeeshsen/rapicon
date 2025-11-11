package com.example.rapicon.Service;

import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {

    private final Map<String, String> otpStorage = new HashMap<>();

    public String generateOtp(String phone) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        otpStorage.put(phone, otp);
        return otp;
    }

    public boolean verifyOtp(String phone, String otp) {
        String storedOtp = otpStorage.get(phone);
        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(phone); // clear OTP after use
            return true;
        }
        return false;
    }

    public void sendOtpSms(String phone, String otp) {
        try {
            String apiKey = "614496334e56b";
            String senderId = "RAPICN";

            // ✅ Add country code if missing
            if (!phone.startsWith("91")) {
                phone = "91" + phone;
            }

            // ✅ EXACT template match - replace {#var#} with actual OTP
            String message = "Hello, Your OTP for login on rapiconinfra.com is " + otp +
                    ". please don't share it with other-RAPICON INFRASTRUCTURE";

            // ✅ Get your Template ID from SMSAlert dashboard
            String templateId = "1707164855052378697";  // Replace with actual template ID

            String url = "https://www.smsalert.co.in/api/push.json?"
                    + "apikey=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
                    + "&route=Transactional"
                    + "&sender=" + URLEncoder.encode(senderId, StandardCharsets.UTF_8)
                    + "&mobileno=" + phone
                    + "&text=" + URLEncoder.encode(message, StandardCharsets.UTF_8)
                    + "&template_id=" + templateId  // ✅ REQUIRED
                    + "&unicode=0";

            HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            int responseCode = connection.getResponseCode();

            InputStream inputStream = (responseCode >= 400)
                    ? connection.getErrorStream()
                    : connection.getInputStream();

            StringBuilder response = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
            }

            System.out.println("📬 Response: " + response);

            if (responseCode == 200) {
                JSONObject json = new JSONObject(response.toString());
                String status = json.optString("status", "error");

                if (status.equalsIgnoreCase("success")) {
                    System.out.println("✅ OTP sent successfully!");
                } else {
                    String description = json.optString("description", "Unknown error");
                    throw new RuntimeException("SMS failed: " + description);
                }
            } else {
                throw new RuntimeException("HTTP " + responseCode + ": " + response);
            }

        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP", e);
        }
    }

}
