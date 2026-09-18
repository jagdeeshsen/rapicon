package com.example.rapicon.Service;

import com.example.rapicon.DTO.AIGeneratedDesignRequest;
import com.example.rapicon.Models.AIGeneratedDesign;
import com.example.rapicon.Repository.AIGeneratedDesignRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AIGeneratedDesignService {

    private final AIGeneratedDesignRepo aiDesignRepo;
    private final AIGeneratedDesignRepo repo;
    private final S3Service s3Service;

    public void uploadDesign(AIGeneratedDesignRequest request) throws IOException {

        AIGeneratedDesign design = new AIGeneratedDesign();

        design.setUserId(request.getUserId());
        design.setSessionId(request.getSessionId());

        List<String> fileUrls =  new ArrayList<>();

        // upload files on aws s3
        for(MultipartFile file : request.getFiles()){
            String url = s3Service.uploadAiGeneratedFile(file, "ai-generated-plans");
            fileUrls.add(url);
        }

        design.setFileUrls(fileUrls);
        design.setCreatedAt(LocalDateTime.now());
        repo.save(design);

    }
}
