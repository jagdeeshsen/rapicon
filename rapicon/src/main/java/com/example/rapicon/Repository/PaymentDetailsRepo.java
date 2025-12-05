package com.example.rapicon.Repository;

import com.example.rapicon.Models.PaymentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentDetailsRepo extends JpaRepository<PaymentDetails, Long> {

}
