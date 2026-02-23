package com.example.rapicon.Repository;

import com.example.rapicon.Models.PaymentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PaymentDetailsRepo extends JpaRepository<PaymentDetails, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM PaymentDetails p WHERE p.orderId IN :orderIds")
    void deleteByOrderIds(@Param("orderIds") List<Long> orderIds);

}
