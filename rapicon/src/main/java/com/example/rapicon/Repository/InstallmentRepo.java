package com.example.rapicon.Repository;

import com.example.rapicon.Models.Installments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentRepo extends JpaRepository<Installments, Long> {

}
