package com.example.rapicon.PromoCode.repository;

import com.example.rapicon.PromoCode.entity.AiPlanOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiPlanOrderRepo extends JpaRepository<AiPlanOrder, Long> {

}
