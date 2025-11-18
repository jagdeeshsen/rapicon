package com.example.rapicon.DTO;

import com.example.rapicon.Models.CartItem;
import com.example.rapicon.Models.Design;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@RequiredArgsConstructor
public class OrderRequestDTO {

    private  Long userId;
    private BigDecimal totalAmount;
    private List<CartItem> cartList;
    private int totalInstallments;
    private BigDecimal installmentAmount;

    /*public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<Design> getDesignList() {
        return designList;
    }

    public void setDesignList(List<Design> designList) {
        this.designList = designList;
    }*/
}
