package com.example.rapicon.Service;

import com.example.rapicon.Models.PaymentDetails;
import com.example.rapicon.Repository.OrderRepo;
import com.example.rapicon.Repository.PaymentDetailsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentDetailsService {

    @Autowired
    private PaymentDetailsRepo paymentDetailsRepo;

    @Autowired
    private OrderRepo orderRepo;

    public void createPayment(PaymentDetails paymentDetails){
        paymentDetailsRepo.save(paymentDetails);
    }

    public PaymentDetails updatePayment(PaymentDetails paymentDetails){
        return paymentDetailsRepo.save(paymentDetails);
    }

    public void deleteByUserId(Long userId){
        List<Long> orderIds = orderRepo.findIdsByUserId(userId);
        paymentDetailsRepo.deleteByOrderIds(orderIds);
    }
}
