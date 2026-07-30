package com.example.rapicon.Service;

import com.example.rapicon.CustomExceptions.ResourceNotFoundException;
import com.example.rapicon.DTO.CustomerQueryRequest;
import com.example.rapicon.Models.CustomerQuery;
import com.example.rapicon.Repository.CustomerQueryRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class CustomerQueryService {

    final private CustomerQueryRepo queryRepo;

    public String createQuery(CustomerQueryRequest request){

        CustomerQuery query= new CustomerQuery();

        query.setFullName(request.getFullName());
        query.setPhone(request.getPhone());
        query.setEmail(request.getEmail());
        query.setQuery(request.getQuery());

        query.setCreatedAt(new Date(System.currentTimeMillis()));
        query.setQueryStatus(CustomerQuery.QueryStatus.NEW);

        queryRepo.save(query);
        return "Your Query has been submitted successfully!";
    }

    public Page<CustomerQuery> getAllQuery(Pageable pageable){
        return queryRepo.findAll(pageable);
    }

    public CustomerQuery updateQueryStatus(Long id, CustomerQuery.QueryStatus status){
        CustomerQuery query = queryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found with id: "+ id));

        query.setQueryStatus(status);
        return queryRepo.save(query);
    }

    public String deleteQuery(Long id){
        queryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found with id: "+ id));

        queryRepo.deleteById(id);
        return "Query deleted successfully!";
    }
}
