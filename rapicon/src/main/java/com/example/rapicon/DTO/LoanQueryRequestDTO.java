package com.example.rapicon.DTO;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Data
@RequiredArgsConstructor
public class LoanQueryRequestDTO {

    private String fullName;
    private String phone;
    private String email;
    private String employmentType;
    private BigDecimal salary;
    private BigDecimal loanAmount;
    private String address;
}
