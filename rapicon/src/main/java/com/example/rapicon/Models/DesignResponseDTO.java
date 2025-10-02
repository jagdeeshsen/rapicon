package com.example.rapicon.Models;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DesignResponseDTO {
    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private String designType;

    private Double area;

    private Integer bathrooms;

    private Integer bedrooms;

    private Integer floors;

    private MultipartFile imageFile;

    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    private String vendorName;

    private Long vendorId;

}
