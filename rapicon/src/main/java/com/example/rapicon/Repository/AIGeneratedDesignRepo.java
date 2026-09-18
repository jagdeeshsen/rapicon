package com.example.rapicon.Repository;

import com.example.rapicon.Models.AIGeneratedDesign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AIGeneratedDesignRepo extends JpaRepository<AIGeneratedDesign,Long> {
}
