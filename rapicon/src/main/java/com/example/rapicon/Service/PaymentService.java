package com.example.rapicon.Service;

import com.example.rapicon.Models.Payment;
import com.example.rapicon.Repository.PaymentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepo paymentRepo;

    public void createPayment(Payment payment){
        paymentRepo.save(payment);
    }

    public Payment updatePayment(Payment payment){
        return paymentRepo.save(payment);
    }
}
