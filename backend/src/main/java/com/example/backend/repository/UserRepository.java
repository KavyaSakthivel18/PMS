package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findByRole(UserRole role);

    Optional<User> findByEmail(String email);

}