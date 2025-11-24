package com.example.rapicon.DTO;

import com.example.rapicon.Models.Floor;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Models.Vendor;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DesignRequestDTO {

    private String designType;
    private String designCategory;
    private double length;
    private double width;
    private BigDecimal totalArea;

    private String floorList;

    private String plotFacing;
    private String plotLocation;
    private String parking;
    private BigDecimal builtUpArea;

    private ArrayList<MultipartFile> elevationFiles;
    private ArrayList<MultipartFile> twoDPlanFiles;
}
