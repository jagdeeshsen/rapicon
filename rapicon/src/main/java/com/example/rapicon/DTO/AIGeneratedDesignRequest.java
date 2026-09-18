package com.example.rapicon.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.*;
import java.util.ArrayList;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AIGeneratedDesignRequest {
    @NotNull
    @Positive
    private Long userId;
    @NotBlank
    private String sessionId;

    @NotEmpty(message = "At least one file is required")
    private ArrayList<MultipartFile> files;
}
