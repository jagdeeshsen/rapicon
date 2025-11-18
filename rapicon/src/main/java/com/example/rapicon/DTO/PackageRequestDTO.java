package com.example.rapicon.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PackageRequestDTO {

    private String name;
    private BigDecimal pkgAmount;
    private String description;
    private int noOfInstallments;
    private List<String> highlights= new ArrayList<>();

}
