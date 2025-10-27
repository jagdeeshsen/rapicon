package com.example.rapicon.Service;

import com.example.rapicon.Models.CustomerQuery;
import com.example.rapicon.Repository.CustomerQueryRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.concurrent.Callable;

@Service
public class CustomerQueryService {

    @Autowired
    private CustomerQueryRepo customerQueryRepo;

    public String createQuery(CustomerQuery query){
        customerQueryRepo.save(query);
        return "Your Query has been submitted successfully!";
    }

    public List<CustomerQuery> getAllQuery(){
        return customerQueryRepo.findAll();
    }

    public List<CustomerQuery> getQueryByStatus(String status){
        CustomerQuery.QueryStatus queryStatus= CustomerQuery.QueryStatus.valueOf(status.trim().toUpperCase());
        return customerQueryRepo.findByQueryStatus(queryStatus);
    }

    @Transactional
    public String deleteQueryByStatus(String status){
        CustomerQuery.QueryStatus queryStatus= CustomerQuery.QueryStatus.valueOf(status.trim().toUpperCase());
        customerQueryRepo.deleteByQueryStatus(queryStatus);
        return "Queries deleted successfully";
    }

    public CustomerQuery updateQuery(CustomerQuery query){
        return customerQueryRepo.save(query);
    }
}
