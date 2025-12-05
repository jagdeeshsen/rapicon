package com.example.rapicon.Service;

import com.example.rapicon.Models.PaymentDetails;
import com.example.rapicon.Repository.PaymentDetailsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentDetailsService {

    @Autowired
    private PaymentDetailsRepo paymentDetailsRepo;

    public void createPayment(PaymentDetails paymentDetails){
        paymentDetailsRepo.save(paymentDetails);
    }

    public PaymentDetails updatePayment(PaymentDetails paymentDetails){
        return paymentDetailsRepo.save(paymentDetails);
    }
}
