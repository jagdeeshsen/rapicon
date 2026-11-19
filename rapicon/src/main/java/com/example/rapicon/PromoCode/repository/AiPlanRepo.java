package com.example.rapicon.PromoCode.repository;

import com.example.rapicon.PromoCode.entity.AiPlans;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiPlanRepo extends JpaRepository<AiPlans, Long> {

    boolean existsByName(String name);

    AiPlans findByName(String name);
}
