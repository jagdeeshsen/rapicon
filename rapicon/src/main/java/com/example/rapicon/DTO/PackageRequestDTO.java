package com.example.rapicon.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PackageRequestDTO {

    @NotBlank
    private String name;
    @NotBlank
    private BigDecimal pkgAmount;
    @NotBlank
    private String description;
    @NotBlank
    private int noOfInstallments;
    @NotBlank
    private List<String> highlights= new ArrayList<>();

}
