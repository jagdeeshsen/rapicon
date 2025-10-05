package com.example.rapicon.Repository;

import com.example.rapicon.Models.Role;
import com.example.rapicon.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface userRepo extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    // User findByUsername(String username);

    boolean existsById(Long id);
    Optional<User> findById(Long id);

    List<User> findByRole(Role role);
}
