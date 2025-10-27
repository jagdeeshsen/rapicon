package com.example.rapicon.Repository;

import com.example.rapicon.Models.CustomerQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerQueryRepo extends JpaRepository<CustomerQuery, Integer> {

    List<CustomerQuery> findByQueryStatus(CustomerQuery.QueryStatus status);
    void deleteByQueryStatus(CustomerQuery.QueryStatus status);

}
