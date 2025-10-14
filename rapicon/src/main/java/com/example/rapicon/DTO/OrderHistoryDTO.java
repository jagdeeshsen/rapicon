package com.example.rapicon.DTO;

import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.OrderItem;

import java.util.List;

public class OrderHistoryDTO {

    private List<Order> orderList;
    private List<OrderItem> orderItemList;

    public List<Order> getOrderList() {
        return orderList;
    }

    public void setOrderList(List<Order> orderList) {
        this.orderList = orderList;
    }

    public List<OrderItem> getOrderItemList() {
        return orderItemList;
    }

    public void setOrderItemList(List<OrderItem> orderItemList) {
        this.orderItemList = orderItemList;
    }
}
