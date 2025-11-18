package com.example.rapicon.Repository;

import com.example.rapicon.Models.LoanForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoanQueryRepo extends JpaRepository<LoanForm, Long> {

}
