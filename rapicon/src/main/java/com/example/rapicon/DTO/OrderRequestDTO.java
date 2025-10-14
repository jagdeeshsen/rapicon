package com.example.rapicon.DTO;

import com.example.rapicon.Models.Design;

import java.math.BigDecimal;
import java.util.List;

public class OrderRequestDTO {

    private  Long userId;
    private BigDecimal totalAmount;
    private List<Design> designList;

    public Long getUserId() {
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
    }
}
