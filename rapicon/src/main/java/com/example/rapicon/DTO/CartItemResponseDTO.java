package com.example.rapicon.DTO;

import com.example.rapicon.Models.Design;
import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Data
@RequiredArgsConstructor
public class CartItemResponseDTO {
    private Long id;

    private  Long userId;
    private Design design;
    private String packageName;
    private BigDecimal totalAmount;
    private int totalInstallments;

}
