package com.example.rapicon.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.time.Duration;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.s3.region:ap-south-1}")  // ADDED this line
    private String awsRegion;

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        String fileName = folder + "/" + System.currentTimeMillis() + "-" + file.getOriginalFilename();

        try {
            // CHANGED: Use builder pattern
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    //.acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            // CHANGED: New upload method
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // CHANGED: Manual URL construction
            return String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucketName, awsRegion, fileName);

        } catch (Exception e) {
            throw new IOException("Failed to upload file to S3: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);

            // CHANGED: Use builder pattern
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }
    }
}
