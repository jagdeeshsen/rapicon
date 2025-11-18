package com.example.rapicon.Controller;

import com.example.rapicon.DTO.LoanQueryRequestDTO;
import com.example.rapicon.Models.LoanForm;
import com.example.rapicon.Service.LoanQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/loan")
public class LoanQueryController {

    @Autowired
    private LoanQueryService loanQueryService;

    @PostMapping("/create-loan")
    public ResponseEntity<?> createLoanQuery(@RequestBody LoanQueryRequestDTO request){
        LoanForm form= new LoanForm();
        form.setFullName(request.getFullName());
        form.setPhone(request.getPhone());
        form.setEmail(request.getEmail());
        form.setEmploymentType(request.getEmploymentType());
        form.setSalary(request.getSalary());
        form.setRequiredLoanAmount(request.getLoanAmount());
        form.setAddress(request.getAddress());

        LoanForm savedLoan= loanQueryService.createLoanQuery(form);
        return ResponseEntity.ok(savedLoan);
    }
}
