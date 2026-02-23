package com.example.rapicon.Repository;

import com.example.rapicon.Models.Order;
import com.example.rapicon.Models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order,Long> {
    Optional<Order> findById(Long id);

    List<Order> findByUserId(Long userId);


    @Modifying
    void deleteByUserId(Long userId);

    @Query("SELECT o.id FROM Order o WHERE o.userId = :userId")
    List<Long> findIdsByUserId(@Param("userId") Long userId);
}
