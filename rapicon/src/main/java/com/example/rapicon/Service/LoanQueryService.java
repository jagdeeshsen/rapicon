package com.example.rapicon.Service;

import com.example.rapicon.Models.LoanForm;
import com.example.rapicon.Repository.LoanQueryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LoanQueryService {

    @Autowired
    private LoanQueryRepo loanQueryRepo;

    public LoanForm createLoanQuery(LoanForm form){
        form.setCreatedAt(LocalDateTime.now());
        form.setUpdatedAt(LocalDateTime.now());
        return loanQueryRepo.save(form);
    }
}
