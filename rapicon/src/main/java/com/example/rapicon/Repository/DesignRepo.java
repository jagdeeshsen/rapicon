package com.example.rapicon.Repository;

import com.example.rapicon.Models.Design;
import com.example.rapicon.Enum.Status;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignRepo extends JpaRepository<Design,Long> {
    // Find designs by vendor
    List<Design> findByVendorId(Long vendorId);

    // Find designs by status
    Page<Design> findByStatus(Status status, Pageable pageable);

    @Modifying
    @Transactional
    @Query("""
    UPDATE Design d
    SET d.status = :status
    WHERE d.vendor.id = :vendorId""")
    void updateStatusByVendorId(@Param("vendorId") Long vendorId,
                                @Param("status") Status status);
}
