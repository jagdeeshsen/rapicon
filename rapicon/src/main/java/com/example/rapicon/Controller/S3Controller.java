package com.example.rapicon.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;

@RestController
@RequestMapping("/api/s3")
public class S3Controller {
    private final S3Presigner presigner;

    public S3Controller() {
        this.presigner = S3Presigner.builder()
                .region(Region.AP_SOUTH_1) // change to your region
                .serviceConfiguration(S3Configuration.builder().build())
                .build();
    }

    @GetMapping("/presigned-url")
    public String getPresignedUrl(@RequestParam String filename, @RequestParam String contentType) {
        String bucketName = "rapicon-vendor-designs";
        String key = "designs/" + System.currentTimeMillis() + "-" + filename;

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .build();

        PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(
                r -> r.signatureDuration(Duration.ofMinutes(10)).putObjectRequest(objectRequest)
        );

        return presignedRequest.url().toString();
    }

}
