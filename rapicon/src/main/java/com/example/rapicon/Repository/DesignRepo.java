package com.example.rapicon.Repository;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Models.Status;
import com.example.rapicon.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DesignRepo extends JpaRepository<Design,Long> {
    // Find designs by vendor
    List<Design> findByVendorId(Long vendorId);

    // Find designs by status
    List<Design> findByStatus(Status status);

    @Override
    Optional<Design> findById(Long aLong);
    Design getDesignById(Long id);
}
