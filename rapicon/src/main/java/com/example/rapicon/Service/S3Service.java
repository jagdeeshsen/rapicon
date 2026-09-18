package com.example.rapicon.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Value("${aws.s3.ai-bucket.name}")
    private String aiBucketName;

    @Value("${aws.s3.region:ap-south-1}")
    private String awsRegion;


    public String uploadFile(MultipartFile file, String folder) throws IOException {
        return uploadFile(file, folder, bucketName);
    }

    // convenience method for the AI-generated files bucket
    public String uploadAiGeneratedFile(MultipartFile file, String folder) throws IOException {
        return uploadFile(file, folder, aiBucketName);
    }

    // core method now takes the target bucket explicitly
    public String uploadFile(MultipartFile file, String folder, String targetBucket) throws IOException {
        String fileName = folder + "/" + System.currentTimeMillis() + "-" + file.getOriginalFilename();

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(targetBucket)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    //.acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return String.format("https://%s.s3.%s.amazonaws.com/%s",
                    targetBucket, awsRegion, fileName);

        } catch (Exception e) {
            throw new IOException("Failed to upload file to S3: " + e.getMessage());
        }
    }

    // defaults to the primary bucket
    public void deleteFile(String fileUrl) {
        deleteFile(fileUrl, bucketName);
    }

    // delete from the AI-generated files bucket
    public void deleteAiGeneratedFile(String fileUrl) {
        deleteFile(fileUrl, aiBucketName);
    }

    // core delete method now takes the target bucket explicitly
    public void deleteFile(String fileUrl, String targetBucket) {
        try {
            // FIXED: extract the full key (folder/filename), not just the text after the last '/'
            String key = extractKeyFromUrl(fileUrl, targetBucket);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(targetBucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            System.err.println("Failed to delete file from S3: " + e.getMessage());
        }
    }

    // NEW: pulls everything after ".../<bucket>/" out of a full S3 URL,
    // so "folder/12345-name.jpg" is preserved instead of just "12345-name.jpg"
    private String extractKeyFromUrl(String fileUrl, String targetBucket) {
        String marker = ".amazonaws.com/";
        int idx = fileUrl.indexOf(marker);
        if (idx == -1) {
            // fallback to old behaviour if URL shape is unexpected
            return fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
        }
        return fileUrl.substring(idx + marker.length());
    }

    /* public String uploadFile(MultipartFile file, String folder) throws IOException {
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
    } */
}
